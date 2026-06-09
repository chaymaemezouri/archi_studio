"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

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

const SERIES_COLORS = {
  activity: "#60a5fa",
  activityFill: "rgba(96, 165, 250, 0.22)",
  revenue: "#34d399",
  revenueMuted: "rgba(52, 211, 153, 0.35)",
} as const;

/** Agenda 7j — couleurs studio */
export const AGENDA_CHART_COLORS = {
  tasks: "#8BA4C7",
  deadlines: "#5D6B7A",
  meetings: "#B8CFE8",
} as const;

export function useChartTheme() {
  const { theme } = useTheme();

  return useMemo(() => {
    const root =
      typeof document !== "undefined"
        ? document.documentElement
        : null;

    const read = (name: string, fallback: string) => {
      if (!root) return fallback;
      const value = getComputedStyle(root).getPropertyValue(name).trim();
      return value || fallback;
    };

    return {
      theme,
      grid: read("--chart-grid", "rgba(255,255,255,0.06)"),
      axis: read("--chart-axis", "rgba(255,255,255,0.32)"),
      cursor: read("--chart-cursor", "rgba(139, 164, 199, 0.08)"),
      agendaTasks: read("--dash-agenda-tasks", AGENDA_CHART_COLORS.tasks),
      agendaDeadlines: read("--dash-agenda-deadlines", AGENDA_CHART_COLORS.deadlines),
      agendaMeetings: read("--dash-agenda-meetings", AGENDA_CHART_COLORS.meetings),
      barStroke:
        theme === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.06)",
      ...SERIES_COLORS,
    };
  }, [theme]);
}

/** @deprecated use useChartTheme() in client components */
export const CHART_COLORS = {
  ...SERIES_COLORS,
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
} as const;

export const AGENDA_LEGEND_ITEMS = [
  { key: "tasks", label: "Tâches", color: AGENDA_CHART_COLORS.tasks },
  { key: "deadlines", label: "Deadlines", color: AGENDA_CHART_COLORS.deadlines },
  { key: "meetings", label: "Réunions", color: AGENDA_CHART_COLORS.meetings },
] as const;

export const agendaChartMargin = { top: 6, right: 4, left: -22, bottom: 2 };

export function AgendaChartLegend({
  colors,
}: {
  colors?: { tasks: string; deadlines: string; meetings: string };
}) {
  const items = colors
    ? [
        { key: "tasks", label: "Tâches", color: colors.tasks },
        { key: "deadlines", label: "Deadlines", color: colors.deadlines },
        { key: "meetings", label: "Réunions", color: colors.meetings },
      ]
    : AGENDA_LEGEND_ITEMS;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-2">
      {items.map((item) => (
        <span
          key={item.key}
          className="inline-flex items-center gap-1.5 text-[9px] font-medium text-glass-secondary"
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
    <div
      className="rounded-lg border px-2.5 py-1.5 shadow-lg backdrop-blur-md"
      style={{
        backgroundColor: "var(--chart-tooltip-bg)",
        borderColor: "var(--chart-tooltip-border)",
      }}
    >
      <p className="mb-1 text-[10px] capitalize text-glass-muted">{label}</p>
      {payload.map((entry: ChartTooltipEntry) => (
        <p
          key={String(entry.dataKey)}
          className="text-[11px] font-medium tabular-nums text-app-primary"
          style={{ color: entry.color }}
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
      <p className="text-[11px] text-glass-muted">{message}</p>
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
          ? "text-[10px] font-medium text-emerald-700 dark:text-emerald-400/90"
          : "text-[10px] font-medium text-rose-700 dark:text-rose-400/80"
      }
    >
      {up ? "+" : ""}
      {pct}% vs mois préc.
    </span>
  );
}
