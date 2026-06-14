import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useSendMessage } from "@/hooks/useMessages";
import { useTemplates } from "@/hooks/useTemplates";
import { useContacts } from "@/hooks/useContacts";
import { countSmsSegments } from "@/lib/utils";
import {
  Phone,
  FileText,
  Users2,
  CalendarClock,
  SendHorizonal,
} from "lucide-react";

const schema = z.object({
  to: z.string().min(7, "Enter a valid phone number"),
  body: z.string().min(1, "Message body is required").max(1600),
  scheduled_at: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ComposePage() {
  const send = useSendMessage();
  const { data: templates } = useTemplates();
  const { data: contacts } = useContacts({ limit: 100 });
  const [showTemplates, setShowTemplates] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const body = watch("body") ?? "";
  const segments = countSmsSegments(body);
  const charLimit = /[^\x00-\x7F]/.test(body) ? 67 : 160;
  const totalLimit = segments * charLimit;

  function applyTemplate(tmplBody: string) {
    setValue("body", tmplBody);
    setShowTemplates(false);
  }

  function selectContact(phone: string) {
    setValue("to", phone);
    setShowContacts(false);
  }

  async function onSubmit(data: FormData) {
    await send.mutateAsync({
      to: data.to,
      body: data.body,
      ...(data.scheduled_at ? { scheduled_at: data.scheduled_at } : {}),
    });
    reset();
  }

  return (
    <div className="flex flex-col page-enter">
      <Topbar title="Compose" subtitle="Send a single SMS message" />
      <div className="p-6 max-w-2xl">
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Input
                    label="Recipient"
                    placeholder="+1 (555) 000-0000"
                    prefix={<Phone />}
                    error={errors.to?.message}
                    {...register("to")}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  icon={<Users2 />}
                  onClick={() => setShowContacts(true)}
                >
                  Contacts
                </Button>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--color-text-secondary)] tracking-wide uppercase">
                    Message
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={<FileText />}
                      onClick={() => setShowTemplates(true)}
                    >
                      Template
                    </Button>
                    <span className="text-xs text-[var(--color-text-muted)] font-mono">
                      {body.length}/{totalLimit} · {segments}{" "}
                      {segments === 1 ? "segment" : "segments"}
                    </span>
                  </div>
                </div>
                <Textarea
                  placeholder="Type your message here…"
                  rows={6}
                  error={errors.body?.message}
                  {...register("body")}
                  ref={(el) => {
                    register("body").ref(el);
                    (bodyRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
                  }}
                />
              </div>

              <div className="border-t border-[var(--color-border)] pt-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <CalendarClock className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-xs font-medium text-[var(--color-text-secondary)] tracking-wide uppercase">
                    Schedule (optional)
                  </span>
                </div>
                <Input
                  type="datetime-local"
                  {...register("scheduled_at")}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-[var(--color-text-muted)]">
                  {body.length === 0
                    ? "GSM-7 encoding · 160 chars/segment"
                    : /[^\x00-\x7F]/.test(body)
                      ? "Unicode encoding · 67 chars/segment"
                      : "GSM-7 encoding · 160 chars/segment"}
                </p>
                <Button
                  type="submit"
                  size="lg"
                  loading={send.isPending}
                  icon={<SendHorizonal />}
                >
                  {watch("scheduled_at") ? "Schedule" : "Send Now"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

      <Modal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        title="Choose a Template"
        size="md"
      >
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {templates?.length ? (
            templates.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.body)}
                className="text-left px-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors cursor-pointer"
              >
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {t.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">
                  {t.body}
                </p>
              </button>
            ))
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-6">
              No templates yet.
            </p>
          )}
        </div>
      </Modal>

      <Modal
        open={showContacts}
        onClose={() => setShowContacts(false)}
        title="Select a Contact"
        size="md"
      >
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {contacts?.data.length ? (
            contacts.data.map((c) => (
              <button
                key={c.id}
                onClick={() => selectContact(c.phone)}
                className="text-left px-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {c.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {c.phone}
                  </p>
                </div>
                {c.group_name && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-accent-glow)] text-[var(--color-accent)] border border-[rgba(59,130,246,0.2)]">
                    {c.group_name}
                  </span>
                )}
              </button>
            ))
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-6">
              No contacts found.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}