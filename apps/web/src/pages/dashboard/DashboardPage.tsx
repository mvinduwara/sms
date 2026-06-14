import { useStats, useAnalytics } from "@/hooks/useAnalytics";
import { useMessages } from "@/hooks/useMessages";
import { Topbar } from "@/components/layout/Topbar";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { SkeletonRow } from "@/components/ui/Skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { MessageSquare, Send, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { formatRelative, truncate } from "@/lib/utils";
import { format, parseISO } from "date-fns";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] px-4 py-3 text-xs font-mono shadow-xl">
      <p className="text-[var(--color-text-muted)] mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-[var(--color-text-secondary)] capitalize">
            {p.dataKey}:
          </span>
          <span className="text-[var(--color-text-primary)] font-medium">
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: analytics } = useAnalytics(14);
  const { data: messages, isLoading: msgsLoading } = useMessages({
    limit: 8,
    page: 1,
  });

  const chartData =
    analytics?.daily.map((d) => ({
      ...d,
      date: format(parseISO(d.date), "MMM d"),
    })) ?? [];

  return (
    <div className="flex flex-col page-enter">
      <Topbar title="Dashboard" subtitle="Live overview of your SMS activity" />

      <div className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            label="Total Sent"
            value={stats?.total ?? 0}
            icon={<MessageSquare />}
            accent="blue"
            loading={statsLoading}
            delay={0}
          />
          <StatsCard
            label="Delivered"
            value={stats?.delivered ?? 0}
            sub={
              stats ? `${stats.delivery_rate.toFixed(1)}% rate` : undefined
            }
            icon={<CheckCircle2 />}
            accent="green"
            loading={statsLoading}
            delay={60}
          />
          <StatsCard
            label="Queued"
            value={stats?.queued ?? 0}
            icon={<Clock3 />}
            accent="yellow"
            loading={statsLoading}
            delay={120}
          />
          <StatsCard
            label="Failed"
            value={stats?.failed ?? 0}
            icon={<XCircle />}
            accent="red"
            loading={statsLoading}
            delay={180}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Message Volume — 14 days</CardTitle>
            </CardHeader>
            <CardBody className="pt-2">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "var(--color-text-muted)", fontSize: 11, fontFamily: "DM Mono" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--color-text-muted)", fontSize: 11, fontFamily: "DM Mono" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="delivered"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#gDelivered)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="sent"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#gSent)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    fill="url(#gFailed)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-5 mt-3">
                {[
                  { color: "#10b981", label: "Delivered" },
                  { color: "#3b82f6", label: "Sent" },
                  { color: "#ef4444", label: "Failed" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-0.5 rounded-full"
                      style={{ background: l.color }}
                    />
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {l.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Rate</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col items-center gap-5 py-4">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="var(--color-border-2)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - (stats?.delivery_rate ?? 0) / 100)}`}
                      style={{ transition: "stroke-dashoffset 1s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display font-bold text-2xl text-[var(--color-text-primary)]">
                      {stats?.delivery_rate.toFixed(0) ?? 0}%
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                      delivered
                    </span>
                  </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                  {[
                    { label: "Delivered", value: stats?.delivered ?? 0, color: "#10b981" },
                    { label: "Sent", value: stats?.sent ?? 0, color: "#3b82f6" },
                    { label: "Failed", value: stats?.failed ?? 0, color: "#ef4444" },
                    { label: "Queued", value: stats?.queued ?? 0, color: "#f59e0b" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: item.color }}
                        />
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[var(--color-text-primary)] font-mono">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <div>
            {msgsLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : messages?.data.length ? (
              messages.data.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center gap-4 px-6 py-3.5 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                    <Send className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {msg.contact_name ?? msg.to}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] truncate">
                      {truncate(msg.body, 60)}
                    </span>
                  </div>
                  <StatusBadge status={msg.status} />
                  <span className="text-xs text-[var(--color-text-muted)] shrink-0 w-28 text-right">
                    {formatRelative(msg.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-[var(--color-text-muted)] py-10">
                No messages yet.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}