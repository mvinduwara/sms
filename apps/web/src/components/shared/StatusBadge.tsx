import { Badge } from "@/components/ui/Badge";
import type { MessageStatus } from "@/types";

const map: Record<
  MessageStatus,
  { variant: "success" | "warning" | "danger" | "info" | "muted"; label: string }
> = {
  delivered: { variant: "success", label: "Delivered" },
  sent: { variant: "info", label: "Sent" },
  queued: { variant: "warning", label: "Queued" },
  failed: { variant: "danger", label: "Failed" },
};

export function StatusBadge({ status }: { status: MessageStatus }) {
  const { variant, label } = map[status] ?? {
    variant: "muted",
    label: status,
  };
  return <Badge variant={variant}>{label}</Badge>;
}