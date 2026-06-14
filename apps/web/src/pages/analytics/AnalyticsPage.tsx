import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { StatsCard } from "@/components/shared/StatsCard";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock3,
  TrendingUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";

const DAYS_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
];

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] px-4 py-3 text-xs font-mono shadow-xl">
      <p className="text-[var(--color-text-muted)] mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[var(--color-text-secondary)] capitalize">{p.name}:</span>
          <span className="text-[var(--color-text-primary)] font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(14);
  const { data, isLoading } = useAnalytics(days);

  const chartData =
    data?.daily.map((d) => ({
      ...d,
      date: format(parseISO(d.date), "MMM d"),
    })) ?? [];

  const hourlyData = data?.hourly ?? [];
  const maxHour = Math.max(...hourlyData.map((h) => h.count), 1);

  return (
    <div className="flex flex-col page-enter">
      <Topbar
        title="Analytics"
        subtitle="Delivery insights and volume trends"
        actions={
          <Select
            options={DAYS_OPTIONS}
            value={String(days)}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-40"
          />
        }
      />

      <div className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            label="Total"
            value={data?.overview.total ?? 0}
            icon={<MessageSquare />}
            accent="blue"
            loading={isLoading}
            delay={0}
          />
          <StatsCard
            label="Delivered"
            value={data?.overview.delivered ?? 0}
            sub={
              data
                ? `${data.overview.delivery_rate.toFixed(1)}% rate`
                : undefined
            }
            icon={<CheckCircle2 />}
            accent="green"
            loading={isLoading}
            delay={60}
          />
          <StatsCard
            label="Failed"
            value={data?.overview.failed ?? 0}
            icon={<XCircle />}
            accent="red"
            loading={isLoading}
            delay={120}
          />
          <StatsCard
            label="Queued"
            value={data?.overview.queued ?? 0}
            icon={<Clock3 />}
            accent="yellow"
            loading={isLoading}
            delay={180}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Daily Volume — {days} days
              </span>
            </CardTitle>
          </CardHeader>
          <CardBody className="pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
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
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2} fill="url(#gD)" dot={false} name="Delivered" />
                <Area type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} fill="none" dot={false} name="Sent" />
                <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={1.5} fill="url(#gF)" dot={false} name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Volume by Hour of Day</CardTitle>
            </CardHeader>
            <CardBody className="pt-2">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourlyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(h) => `${h}h`}
                    tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "DM Mono" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "DM Mono" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="count" name="Messages" radius={[4, 4, 0, 0]}>
                    {hourlyData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.count === maxHour
                            ? "#3b82f6"
                            : "var(--color-surface-2)"
                        }
                        stroke={
                          entry.count === maxHour
                            ? "rgba(59,130,246,0.5)"
                            : "var(--color-border)"
                        }
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-4 py-2">
                {data &&
                  [
                    {
                      label: "Delivered",
                      value: data.overview.delivered,
                      total: data.overview.total,
                      color: "#10b981",
                    },
                    {
                      label: "Sent (unconfirmed)",
                      value: data.overview.sent,
                      total: data.overview.total,
                      color: "#3b82f6",
                    },
                    {
                      label: "Failed",
                      value: data.overview.failed,
                      total: data.overview.total,
                      color: "#ef4444",
                    },
                    {
                      label: "Queued",
                      value: data.overview.queued,
                      total: data.overview.total,
                      color: "#f59e0b",
                    },
                  ].map((item) => {
                    const pct = data.overview.total
                      ? ((item.value / data.overview.total) * 100).toFixed(1)
                      : "0";
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ background: item.color }}
                            />
                            <span className="text-xs text-[var(--color-text-secondary)]">
                              {item.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-[var(--color-text-muted)]">
                              {pct}%
                            </span>
                            <span className="text-xs font-medium text-[var(--color-text-primary)] font-mono w-10 text-right">
                              {item.value.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: item.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}