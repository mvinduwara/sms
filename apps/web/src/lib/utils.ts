import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "MMM d, yyyy HH:mm");
  } catch {
    return "—";
  }
}

export function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return "—";
  }
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "…";
}

export function countSmsSegments(body: string): number {
  const isUnicode = /[^\x00-\x7F]/.test(body);
  const segmentLength = isUnicode ? 67 : 160;
  if (body.length === 0) return 1;
  return Math.ceil(body.length / segmentLength);
}

export function downloadCsv(data: string, filename: string) {
  const blob = new Blob([data], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return headers.reduce(
      (obj, header, i) => {
        obj[header] = values[i] ?? "";
        return obj;
      },
      {} as Record<string, string>
    );
  });
}