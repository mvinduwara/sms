import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { useSendBulk } from "@/hooks/useMessages";
import { useTemplates } from "@/hooks/useTemplates";
import { parseCsv, countSmsSegments } from "@/lib/utils";
import type { BulkRecipient } from "@/types";
import {
  Upload,
  FileText,
  Trash2,
  SendHorizonal,
  AlertCircle,
  CheckCircle2,
  Users2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

const schema = z.object({
  body: z.string().min(1).max(1600),
  scheduled_at: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function BulkSendPage() {
  const send = useSendBulk();
  const { data: templates } = useTemplates();
  const [recipients, setRecipients] = useState<BulkRecipient[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

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

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCsv(text);
      const valid: BulkRecipient[] = [];
      const errs: string[] = [];
      rows.forEach((row, i) => {
        const phone = row["phone"] ?? row["number"] ?? row["mobile"];
        if (!phone || phone.length < 7) {
          errs.push(`Row ${i + 2}: missing or invalid phone number`);
        } else {
          valid.push({ phone, name: row["name"] ?? row["first_name"], ...row });
        }
      });
      setRecipients(valid);
      setParseErrors(errs);
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  async function onSubmit(data: FormData) {
    if (!recipients.length) return;
    await send.mutateAsync({
      recipients: recipients.map((r) => ({ phone: r.phone, name: r.name })),
      body: data.body,
      ...(data.scheduled_at ? { scheduled_at: data.scheduled_at } : {}),
    });
    setRecipients([]);
    setParseErrors([]);
    reset();
  }

  return (
    <div className="flex flex-col page-enter">
      <Topbar
        title="Bulk Send"
        subtitle="Upload a CSV and send to thousands"
      />
      <div className="p-6 flex flex-col gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Recipients
              </span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div
              {...getRootProps()}
              className={`
                rounded-[var(--radius-lg)] border-2 border-dashed px-8 py-12 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200
                ${isDragActive
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-glow)]"
                  : "border-[var(--color-border-2)] hover:border-[var(--color-border)]"
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] flex items-center justify-center">
                <Upload className="w-6 h-6 text-[var(--color-text-muted)]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {isDragActive ? "Drop your CSV here" : "Drag & drop a CSV file"}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Required column: <code className="text-[var(--color-accent)]">phone</code> — optional:{" "}
                  <code className="text-[var(--color-text-secondary)]">name</code>
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm">
                Browse File
              </Button>
            </div>

            {parseErrors.length > 0 && (
              <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-danger-glow)] border border-[rgba(239,68,68,0.2)] px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-[var(--color-danger)]" />
                  <span className="text-xs font-medium text-[var(--color-danger)]">
                    {parseErrors.length} parse error(s)
                  </span>
                </div>
                {parseErrors.slice(0, 5).map((e) => (
                  <p key={e} className="text-xs text-[var(--color-danger)] opacity-80">
                    {e}
                  </p>
                ))}
              </div>
            )}

            {recipients.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
                    <span className="text-sm font-medium text-[var(--color-success)]">
                      {recipients.length} valid recipients
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 />}
                    onClick={() => {
                      setRecipients([]);
                      setParseErrors([]);
                    }}
                    className="text-[var(--color-danger)]"
                  >
                    Clear
                  </Button>
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden max-h-52 overflow-y-auto">
                  <Table>
                    <Thead>
                      <tr>
                        <Th>#</Th>
                        <Th>Phone</Th>
                        <Th>Name</Th>
                      </tr>
                    </Thead>
                    <Tbody>
                      {recipients.slice(0, 50).map((r, i) => (
                        <Tr key={i}>
                          <Td className="text-[var(--color-text-muted)]">
                            {i + 1}
                          </Td>
                          <Td>{r.phone}</Td>
                          <Td>{r.name ?? "—"}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  {recipients.length > 50 && (
                    <p className="text-xs text-center text-[var(--color-text-muted)] py-2 border-t border-[var(--color-border)]">
                      … and {recipients.length - 50} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Message
              </span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--color-text-secondary)] tracking-wide uppercase">
                    Body
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
                      {body.length} chars · {segments} seg
                    </span>
                  </div>
                </div>
                <Textarea
                  placeholder="Use {{name}} for personalization…"
                  rows={5}
                  error={errors.body?.message}
                  {...register("body")}
                />
                <p className="text-xs text-[var(--color-text-muted)]">
                  Use <code className="text-[var(--color-accent)]">{"{{name}}"}</code> to
                  insert the recipient's name dynamically.
                </p>
              </div>

              <Input
                label="Schedule (optional)"
                type="datetime-local"
                {...register("scheduled_at")}
              />

              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Users2 className="w-4 h-4" />
                  <span className="text-sm">
                    {recipients.length} recipient
                    {recipients.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <Button
                  type="submit"
                  loading={send.isPending}
                  icon={<SendHorizonal />}
                  disabled={!recipients.length}
                >
                  Send to {recipients.length} recipients
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
      >
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {templates?.length ? (
            templates.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setValue("body", t.body);
                  setShowTemplates(false);
                }}
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
    </div>
  );
}