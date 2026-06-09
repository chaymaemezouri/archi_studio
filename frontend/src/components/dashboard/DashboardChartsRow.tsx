"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardOverview } from "@/types";
import {
  activityWeekTotal,
  buildAgendaWeek,
  buildTaskCounts,
  fallbackActivityFromLogs,
  fallbackRevenueFromPayments,
  revenueMonthTrend,
} from "@/lib/dashboard-charts";
import { accentBar } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";
import { dashboardChartMobileSlide, dashboardChartsMobileRow, dashboardPanel } from "./dashboard-ui";
import {
  AGENDA_CHART_COLORS,
  AgendaChartLegend,
  agendaChartMargin,
  CHART_COLORS,
  chartAxisTick,
  chartMargin,
  ChartTooltip,
  EmptyChart,
  RevenueTooltip,
  TrendBadge,
} from "./dashboard-recharts";

interface DashboardChartsRowProps {
  data: DashboardOverview;
}

function ChartSection({
  title,
  href,
  hint,
  children,
}: {
  title: string;
  href?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 px-3 py-2.5 sm:px-4">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-[11px] font-medium text-white/55">{title}</h4>
          {hint && <div className="mt-0.5">{hint}</div>}
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-white/30 transition hover:text-studio-light/80"
          >
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export default function DashboardChartsRow({ data }: DashboardChartsRowProps) {
  const taskCounts = useMemo(() => buildTaskCounts(data), [data]);
  const agendaData = useMemo(() => buildAgendaWeek(data), [data]);

  const activityData = useMemo(
    () =>
      data.charts?.activityByDay ??
      fallbackActivityFromLogs(data.recentActivity ?? []),
    [data.charts?.activityByDay, data.recentActivity]
  );

  const revenueData = useMemo(
    () =>
      data.charts?.revenueByMonth ??
      fallbackRevenueFromPayments(data.recentPayments ?? []),
    [data.charts?.revenueByMonth, data.recentPayments]
  );

  const activityTotal = useMemo(
    () => activityWeekTotal(activityData),
    [activityData]
  );
  const revenueTrend = useMemo(
    () => revenueMonthTrend(revenueData),
    [revenueData]
  );

  const hasActivity = activityData.some((d) => d.value > 0);
  const hasRevenue = revenueData.some((d) => d.value > 0);
  const hasAgenda = agendaData.some(
    (d) => d.tasks + d.deadlines + d.meetings > 0
  );

  return (
    <section className={dashboardPanel}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-white/[0.06] px-3.5 py-2">
        <h3 className="flex items-center gap-2 text-[13px] font-semibold text-white/88">
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Aperçu
        </h3>
        <p className="text-[10px] text-white/38">
          <span className="hidden sm:inline">
            Tâches :{" "}
            <span className="text-white/60">{taskCounts.todo} à faire</span>
            {taskCounts.inProgress > 0 && (
              <span className="text-studio-light/70">
                {" "}
                · {taskCounts.inProgress} en cours
              </span>
            )}
          </span>
          <span className="sm:hidden text-white/45">Glisser pour voir les graphiques →</span>
        </p>
      </div>

      <div className={dashboardChartsMobileRow}>
        <div className={dashboardChartMobileSlide}>
        <ChartSection
          title="Activité studio"
          href="/projects"
          hint={
            <span className="text-[10px] text-white/32">
              {activityTotal} action{activityTotal !== 1 ? "s" : ""} · 14 j
            </span>
          }
        >
          {!hasActivity ? (
            <EmptyChart message="Peu d'activité récente" />
          ) : (
            <ResponsiveContainer width="100%" height={132}>
              <AreaChart data={activityData} margin={chartMargin}>
                <defs>
                  <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.activity} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_COLORS.activity} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_COLORS.grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={chartAxisTick}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: "rgba(255,255,255,0.12)" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Actions"
                  stroke={CHART_COLORS.activity}
                  strokeWidth={2}
                  fill="url(#activityFill)"
                  dot={false}
                  activeDot={{ r: 3, fill: CHART_COLORS.activity }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartSection>
        </div>

        <div className={dashboardChartMobileSlide}>
        <ChartSection
          title="Encaissements"
          href="/payments"
          hint={<TrendBadge pct={revenueTrend} />}
        >
          {!hasRevenue ? (
            <EmptyChart message="Aucun paiement sur la période" />
          ) : (
            <ResponsiveContainer width="100%" height={132}>
              <BarChart data={revenueData} margin={chartMargin}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_COLORS.grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={chartAxisTick}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<RevenueTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar
                  dataKey="value"
                  name="Encaissé"
                  fill={CHART_COLORS.revenue}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartSection>
        </div>

        <div className={dashboardChartMobileSlide}>
        <ChartSection title="Agenda · 7 jours" href="/calendar">
          {!hasAgenda ? (
            <EmptyChart message="Semaine calme" />
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={118}>
                <BarChart data={agendaData} margin={agendaChartMargin} barCategoryGap="18%">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={CHART_COLORS.grid}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={chartAxisTick}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: AGENDA_CHART_COLORS.cursor }}
                  />
                  <Bar
                    dataKey="tasks"
                    name="Tâches"
                    stackId="agenda"
                    fill={AGENDA_CHART_COLORS.tasks}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={1}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="deadlines"
                    name="Deadlines"
                    stackId="agenda"
                    fill={AGENDA_CHART_COLORS.deadlines}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={1}
                  />
                  <Bar
                    dataKey="meetings"
                    name="Réunions"
                    stackId="agenda"
                    fill={AGENDA_CHART_COLORS.meetings}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={1}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <AgendaChartLegend />
            </div>
          )}
        </ChartSection>
        </div>
      </div>
    </section>
  );
}
