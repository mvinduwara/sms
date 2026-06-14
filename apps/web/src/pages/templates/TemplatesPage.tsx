import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "@/hooks/useTemplates";
import { formatRelative } from "@/lib/utils";
import type { Template } from "@/types";
import { Plus, FileText, Pencil, Trash2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  body: z.string().min(1, "Body required").max(1600),
});
type FormData = z.infer<typeof schema>;

export default function TemplatesPage() {
  const { data: templates, isLoading } = useTemplates();
  const create = useCreateTemplate();
  const update = useUpdateTemplate();
  const del = useDeleteTemplate();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState<Template | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const bodyVal = watch("body") ?? "";

  function openCreate() {
    setEditing(null);
    reset({ name: "", body: "" });
    setShowForm(true);
  }

  function openEdit(t: Template) {
    setEditing(t);
    reset({ name: t.name, body: t.body });
    setShowForm(true);
  }

  async function onSubmit(data: FormData) {
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...data });
    } else {
      await create.mutateAsync(data);
    }
    setShowForm(false);
    reset();
  }

  return (
    <div className="flex flex-col page-enter">
      <Topbar
        title="Templates"
        subtitle="Reusable message templates"
        actions={
          <Button size="sm" icon={<Plus />} onClick={openCreate}>
            New Template
          </Button>
        }
      />

      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface-2)] to-[var(--color-surface)] bg-[length:200%_100%]"
              />
            ))}
          </div>
        ) : templates?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((t) => (
              <Card key={t.id} className="group relative">
                <CardHeader>
                  <CardTitle className="text-sm truncate pr-16">{t.name}</CardTitle>
                  <div className="absolute top-3 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(t)}
                      className="w-7 h-7 p-0"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(t)}
                      className="w-7 h-7 p-0 text-[var(--color-danger)]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="pt-3">
                  <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">
                    {t.body}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-3">
                    Updated {formatRelative(t.updated_at)}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<FileText />}
              title="No templates yet"
              description="Create reusable templates to speed up your messaging workflow."
              action={
                <Button size="sm" icon={<Plus />} onClick={openCreate}>
                  New Template
                </Button>
              }
            />
          </Card>
        )}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Edit Template" : "New Template"}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Template Name"
            placeholder="e.g. Welcome Message"
            error={errors.name?.message}
            {...register("name")}
          />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--color-text-secondary)] tracking-wide uppercase">
                Body
              </label>
              <span className="text-xs text-[var(--color-text-muted)] font-mono">
                {bodyVal.length} / 1600
              </span>
            </div>
            <Textarea
              placeholder="Hello {{name}}, your order is ready…"
              rows={6}
              error={errors.body?.message}
              {...register("body")}
            />
            <p className="text-xs text-[var(--color-text-muted)]">
              Use <code className="text-[var(--color-accent)]">{"{{name}}"}</code>,{" "}
              <code className="text-[var(--color-accent)]">{"{{company}}"}</code>, etc. as
              dynamic placeholders.
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={create.isPending || update.isPending}
            >
              {editing ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) {
            await del.mutateAsync(deleting.id);
            setDeleting(null);
          }
        }}
        title="Delete Template"
        description={`Delete "${deleting?.name}"? This cannot be undone.`}
        loading={del.isPending}
      />
    </div>
  );
}