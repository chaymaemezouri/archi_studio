"use client";

import { formatCurrency } from "@/lib/utils";

type ChartTooltipEntry = {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  color?: string;
};

type ChartTooltipPayload = {
  active?: boolean;
  label?: string;
  payload?: ChartTooltipEntry[];
};

/** Palette dashboard (activité / finance) */
export const CHART_COLORS = {
  activity: "#60a5fa",
  activityFill: "rgba(96, 165, 250, 0.22)",
  revenue: "#34d399",
  revenueMuted: "rgba(52, 211, 153, 0.35)",
  grid: "rgba(255,255,255,0.06)",
  axis: "rgba(255,255,255,0.32)",
} as const;

/** Agenda 7j — couleurs studio (tailwind `studio` + calendrier) */
export const AGENDA_CHART_COLORS = {
  tasks: "#8BA4C7",
  deadlines: "#5D6B7A",
  meetings: "#B8CFE8",
  cursor: "rgba(139, 164, 199, 0.08)",
} as const;

export const AGENDA_LEGEND_ITEMS = [
  { key: "tasks", label: "Tâches", color: AGENDA_CHART_COLORS.tasks },
  { key: "deadlines", label: "Deadlines", color: AGENDA_CHART_COLORS.deadlines },
  { key: "meetings", label: "Réunions", color: AGENDA_CHART_COLORS.meetings },
] as const;

export const agendaChartMargin = { top: 6, right: 4, left: -22, bottom: 2 };

export function AgendaChartLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-2">
      {AGENDA_LEGEND_ITEMS.map((item) => (
        <span
          key={item.key}
          className="inline-flex items-center gap-1.5 text-[9px] text-white/42"
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export const chartAxisTick = { fill: CHART_COLORS.axis, fontSize: 10 };
export const chartMargin = { top: 8, right: 4, left: -22, bottom: 0 };

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: ChartTooltipPayload & {
  valueFormatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#14141c]/95 px-2.5 py-1.5 shadow-lg backdrop-blur-md">
      <p className="mb-1 text-[10px] capitalize text-white/45">{label}</p>
      {payload.map((entry: ChartTooltipEntry) => (
        <p
          key={String(entry.dataKey)}
          className="text-[11px] font-medium tabular-nums"
          style={{ color: entry.color ?? "#fff" }}
        >
          {entry.name}:{" "}
          {valueFormatter
            ? valueFormatter(Number(entry.value))
            : entry.value}
        </p>
      ))}
    </div>
  );
}

export function RevenueTooltip(props: ChartTooltipPayload) {
  return (
    <ChartTooltip
      {...props}
      valueFormatter={(v) => formatCurrency(v)}
    />
  );
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[132px] items-center justify-center">
      <p className="text-[11px] text-white/35">{message}</p>
    </div>
  );
}

export function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const up = pct >= 0;
  return (
    <span
      className={
        up
          ? "text-[10px] font-medium text-emerald-400/90"
          : "text-[10px] font-medium text-rose-400/80"
      }
    >
      {up ? "+" : ""}
      {pct}% vs mois préc.
    </span>
  );
}
