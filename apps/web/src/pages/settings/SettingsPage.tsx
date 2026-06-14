import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { ProviderConfig, ApiKey } from "@/types";
import { toast } from "sonner";
import {
  Save,
  KeyRound,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Webhook,
  Server,
} from "lucide-react";
import { formatRelative } from "@/lib/utils";

export default function SettingsPage() {
  const qc = useQueryClient();
  const [showSecret, setShowSecret] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [freshKey, setFreshKey] = useState<string | null>(null);

  const { data: config, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await api.get<ProviderConfig>("/settings");
      return data;
    },
  });

  const { data: apiKeys } = useQuery({
    queryKey: ["apikeys"],
    queryFn: async () => {
      const { data } = await api.get<ApiKey[]>("/settings/api-keys");
      return data;
    },
  });

  const [form, setForm] = useState<Partial<ProviderConfig>>({});
  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  const saveConfig = useMutation({
    mutationFn: async (payload: Partial<ProviderConfig>) => {
      await api.put("/settings", payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved.");
    },
    onError: () => toast.error("Failed to save settings."),
  });

  const createKey = useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post<{ key: string; apiKey: ApiKey }>(
        "/settings/api-keys",
        { name }
      );
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["apikeys"] });
      setFreshKey(data.key);
      setNewKeyName("");
      toast.success("API key created. Copy it now — it won't be shown again.");
    },
  });

  const deleteKey = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/settings/api-keys/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["apikeys"] }),
  });

  function field(key: keyof ProviderConfig) {
    return {
      value: (form[key] as string) ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  return (
    <div className="flex flex-col page-enter">
      <Topbar title="Settings" subtitle="Provider configuration and API access" />

      <div className="p-6 flex flex-col gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                SMS Provider
              </span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4">
              <Select
                label="Provider"
                options={[
                  { value: "mock", label: "Mock (Testing)" },
                  { value: "twilio", label: "Twilio" },
                ]}
                {...field("provider")}
              />
              {form.provider === "twilio" && (
                <>
                  <Input
                    label="Account SID"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    {...field("twilio_account_sid")}
                  />
                  <div className="relative">
                    <Input
                      label="Auth Token"
                      type={showSecret ? "text" : "password"}
                      placeholder="••••••••••••••••••••••••••••••••"
                      {...field("twilio_auth_token")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret((s) => !s)}
                      className="absolute right-3 bottom-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                    >
                      {showSecret ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Input
                    label="From Number"
                    placeholder="+1xxxxxxxxxx"
                    {...field("twilio_from_number")}
                  />
                </>
              )}
              <Input
                label="Default Sender ID"
                placeholder="MySMSApp"
                {...field("default_sender_id")}
              />
              <Input
                label="Rate Limit (msgs/sec)"
                type="number"
                placeholder="10"
                {...field("rate_limit_per_second")}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Webhook className="w-4 h-4" />
                Webhooks
              </span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Input
              label="Delivery Webhook URL"
              placeholder="https://your.app/webhooks/sms"
              hint="POST requests will be sent here when message statuses update."
              {...field("webhook_url")}
            />
          </CardBody>
        </Card>

        <Button
          icon={<Save />}
          loading={saveConfig.isPending}
          onClick={() => saveConfig.mutate(form)}
          className="self-start"
        >
          Save Settings
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                API Keys
              </span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            {freshKey && (
              <div className="mb-5 rounded-[var(--radius-md)] bg-[var(--color-success-glow)] border border-[rgba(16,185,129,0.25)] px-4 py-3">
                <p className="text-xs font-medium text-[var(--color-success)] mb-2">
                  Your new API key (copy it now, it won't be shown again):
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-[var(--color-text-primary)] font-mono break-all">
                    {freshKey}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(freshKey);
                      toast.success("Copied!");
                    }}
                    className="shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mb-5">
              {apiKeys?.length ? (
                apiKeys.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {k.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
                        {k.key_prefix}••••••••••••••••
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        Created {formatRelative(k.created_at)}
                        {k.last_used_at
                          ? ` · Last used ${formatRelative(k.last_used_at)}`
                          : " · Never used"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteKey.mutate(k.id)}
                      className="w-8 h-8 p-0 text-[var(--color-danger)]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                  No API keys yet.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border)]">
              <Input
                placeholder="Key name, e.g. Production"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  newKeyName &&
                  createKey.mutate(newKeyName)
                }
                className="flex-1"
              />
              <Button
                icon={<Plus />}
                loading={createKey.isPending}
                disabled={!newKeyName}
                onClick={() => createKey.mutate(newKeyName)}
              >
                Create Key
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}