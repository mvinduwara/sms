import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SkeletonRow } from "@/components/ui/Skeleton";
import {
  useContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from "@/hooks/useContacts";
import { formatDate } from "@/lib/utils";
import type { Contact } from "@/types";
import {
  Plus,
  Search,
  Users2,
  Pencil,
  Trash2,
  Phone,
  User,
  Tag,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().min(7),
  group_name: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const LIMIT = 20;

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState<Contact | null>(null);

  const { data, isLoading } = useContacts({ page, limit: LIMIT, search });
  const create = useCreateContact();
  const update = useUpdateContact();
  const del = useDeleteContact();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function openCreate() {
    setEditing(null);
    reset({ name: "", phone: "", group_name: "", notes: "" });
    setShowForm(true);
  }

  function openEdit(c: Contact) {
    setEditing(c);
    reset({
      name: c.name,
      phone: c.phone,
      group_name: c.group_name ?? "",
      notes: c.notes ?? "",
    });
    setShowForm(true);
  }

  async function onSubmit(data: FormData) {
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...data });
    } else {
      await create.mutateAsync({
        name: data.name,
        phone: data.phone,
        group_name: data.group_name ?? null,
        notes: data.notes ?? null,
      });
    }
    setShowForm(false);
    reset();
  }

  return (
    <div className="flex flex-col page-enter">
      <Topbar
        title="Contacts"
        subtitle="Manage your contact book"
        actions={
          <Button size="sm" icon={<Plus />} onClick={openCreate}>
            New Contact
          </Button>
        }
      />

      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search contacts…"
            prefix={<Search />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearch(searchInput);
                setPage(1);
              }
            }}
            className="max-w-sm"
          />
        </div>

        <Card>
          <Table>
            <Thead>
              <tr>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th>Group</Th>
                <Th>Added</Th>
                <Th />
              </tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : data?.data.length ? (
                data.data.map((c) => (
                  <Tr key={c.id}>
                    <Td>
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {c.name}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs">{c.phone}</span>
                    </Td>
                    <Td>
                      {c.group_name ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[var(--color-text-secondary)]">
                          {c.group_name}
                        </span>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">—</span>
                      )}
                    </Td>
                    <Td>{formatDate(c.created_at)}</Td>
                    <Td>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(c)}
                          className="w-8 h-8 p-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleting(c)}
                          className="w-8 h-8 p-0 text-[var(--color-danger)] hover:bg-[var(--color-danger-glow)]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<Users2 />}
                      title="No contacts yet"
                      description="Add your first contact to get started."
                      action={
                        <Button size="sm" icon={<Plus />} onClick={openCreate}>
                          New Contact
                        </Button>
                      }
                    />
                  </td>
                </tr>
              )}
            </Tbody>
          </Table>
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
              <span className="text-xs text-[var(--color-text-muted)]">
                {data.total} contacts
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  icon={<ChevronLeft />}
                />
                <span className="text-xs text-[var(--color-text-secondary)] font-mono px-2">
                  {page} / {data.pages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === data.pages}
                  icon={<ChevronRight />}
                />
              </div>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Edit Contact" : "New Contact"}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Name"
            placeholder="Jane Doe"
            prefix={<User />}
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Phone"
            placeholder="+1 555 000 0000"
            prefix={<Phone />}
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Group (optional)"
            placeholder="VIP, Customers…"
            prefix={<Tag />}
            {...register("group_name")}
          />
          <Input
            label="Notes (optional)"
            placeholder="Any notes…"
            prefix={<FileText />}
            {...register("notes")}
          />
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
              {editing ? "Save Changes" : "Create"}
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
        title="Delete Contact"
        description={`Are you sure you want to delete ${deleting?.name}? This cannot be undone.`}
        loading={del.isPending}
      />
    </div>
  );
}