import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { useMessages } from "@/hooks/useMessages";
import { formatDate, truncate, downloadCsv } from "@/lib/utils";
import {
  Search,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import type { MessageStatus } from "@/types";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "queued", label: "Queued" },
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
  { value: "failed", label: "Failed" },
];

const LIMIT = 20;

export default function MessagesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useMessages({
    page,
    limit: LIMIT,
    status: status || undefined,
    search: search || undefined,
  });

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  function handleExport() {
    if (!data?.data.length) return;
    const header = "id,to,body,status,created_at,sent_at";
    const rows = data.data.map(
      (m) =>
        `${m.id},${m.to},"${m.body.replace(/"/g, '""')}",${m.status},${m.created_at},${m.sent_at ?? ""}`
    );
    downloadCsv([header, ...rows].join("\n"), "messages.csv");
  }

  return (
    <div className="flex flex-col page-enter">
      <Topbar
        title="Messages"
        subtitle="Full send history and status log"
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<Download />}
            onClick={handleExport}
          >
            Export
          </Button>
        }
      />

      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by number or message…"
            prefix={<Search />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="max-w-sm"
          />
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-40"
          />
        </div>

        <Card>
          <Table>
            <Thead>
              <tr>
                <Th>Recipient</Th>
                <Th>Message</Th>
                <Th>Status</Th>
                <Th>Sent At</Th>
                <Th>Created</Th>
              </tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : data?.data.length ? (
                data.data.map((msg) => (
                  <Tr key={msg.id}>
                    <Td>
                      <div className="flex flex-col">
                        {msg.contact_name && (
                          <span className="font-medium text-[var(--color-text-primary)]">
                            {msg.contact_name}
                          </span>
                        )}
                        <span className="text-xs text-[var(--color-text-muted)] font-mono">
                          {msg.to}
                        </span>
                      </div>
                    </Td>
                    <Td className="max-w-xs">
                      <span className="text-[var(--color-text-secondary)]">
                        {truncate(msg.body, 70)}
                      </span>
                    </Td>
                    <Td>
                      <StatusBadge status={msg.status as MessageStatus} />
                    </Td>
                    <Td>{formatDate(msg.sent_at)}</Td>
                    <Td>{formatDate(msg.created_at)}</Td>
                  </Tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<MessageSquare />}
                      title="No messages found"
                      description="Send your first message from the Compose page."
                    />
                  </td>
                </tr>
              )}
            </Tbody>
          </Table>

          {data && data.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
              <span className="text-xs text-[var(--color-text-muted)]">
                Showing {(page - 1) * LIMIT + 1}–
                {Math.min(page * LIMIT, data.total)} of {data.total}
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
    </div>
  );
}