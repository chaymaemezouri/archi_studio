"use client";

import { CalendarClock, ClipboardList, FileText, Image, Layers } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import { getProjectCounts } from "@/lib/project-counts";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectCountIndicatorsProps {
  project: Project;
  className?: string;
  compact?: boolean;
  showTooltips?: boolean;
  showHoverLabel?: boolean;
  /** Texte inline : Docs 2 · Plans 1 — ou naturel : 2 tâches · 1 deadline */
  variant?: "icons" | "inline" | "natural";
  /** Tooltips explicites : Documents, Plans… */
  tooltipStyle?: "named" | "detailed";
}

type CountKey = "docs" | "plans" | "rendus" | "tâches" | "deadlines";

const COUNT_META: Record<
  CountKey,
  { short: string; singular: string; plural: string }
> = {
  docs: { short: "doc", singular: "document", plural: "documents" },
  plans: { short: "plan", singular: "plan", plural: "plans" },
  rendus: { short: "rendu", singular: "rendu", plural: "rendus" },
  tâches: { short: "tâche", singular: "tâche ouverte", plural: "tâches ouvertes" },
  deadlines: { short: "deadline", singular: "deadline", plural: "deadlines" },
};

const NATURAL_LABELS: Record<CountKey, { one: string; many: string }> = {
  docs: { one: "1 document", many: "documents" },
  plans: { one: "1 plan", many: "plans" },
  rendus: { one: "1 rendu", many: "rendus" },
  tâches: { one: "1 tâche", many: "tâches" },
  deadlines: { one: "1 deadline", many: "deadlines" },
};

function formatNatural(count: number, key: CountKey): string {
  const labels = NATURAL_LABELS[key];
  return count === 1 ? labels.one : `${count} ${labels.many}`;
}

const NAMED_LABELS: Record<CountKey, { one: string; many: string }> = {
  docs: { one: "1 Document", many: "Documents" },
  plans: { one: "1 Plan", many: "Plans" },
  rendus: { one: "1 Rendu", many: "Rendus" },
  tâches: { one: "1 Tâche", many: "Tâches" },
  deadlines: { one: "1 Deadline", many: "Deadlines" },
};

function formatTooltip(count: number, key: CountKey, style?: "named" | "detailed"): string {
  if (style === "named") {
    const labels = NAMED_LABELS[key];
    return count === 1 ? labels.one : `${count} ${labels.many}`;
  }
  const meta = COUNT_META[key];
  if (key === "deadlines") {
    return count === 1 ? "1 date liée" : `${count} dates liées`;
  }
  return count === 1 ? `1 ${meta.singular}` : `${count} ${meta.plural}`;
}

function Item({
  icon: Icon,
  countKey,
  value,
  compact,
  showTooltips,
  showHoverLabel,
  tooltipStyle,
}: {
  icon: typeof FileText;
  countKey: CountKey;
  value: number;
  compact?: boolean;
  showTooltips?: boolean;
  showHoverLabel?: boolean;
  tooltipStyle?: "named" | "detailed";
}) {
  if (value <= 0) return null;

  const tooltipText = formatTooltip(value, countKey, tooltipStyle);
  const shortLabel = COUNT_META[countKey].short;

  const content = (
    <span
      className={cn(
        "group/count inline-flex cursor-default items-center gap-0.5 rounded px-0.5 text-white/48 transition hover:text-white/70",
        compact ? "text-[10px]" : "text-xs"
      )}
      title={showTooltips ? undefined : tooltipText}
      aria-label={tooltipText}
    >
      <Icon
        className={cn("text-studio-light/55", compact ? "h-3 w-3" : "h-3.5 w-3.5")}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="tabular-nums">{value}</span>
      {showHoverLabel && (
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-[9px] font-medium text-white/35 opacity-0 transition-all duration-200 group-hover/count:ml-0.5 group-hover/count:max-w-[3.5rem] group-hover/count:opacity-100">
          {shortLabel}
        </span>
      )}
      {!compact && !showHoverLabel && (
        <span className="hidden text-white/35 sm:inline">{shortLabel}</span>
      )}
    </span>
  );

  if (showTooltips) {
    return <Tooltip label={tooltipText}>{content}</Tooltip>;
  }

  return content;
}

export default function ProjectCountIndicators({
  project,
  className,
  compact,
  showTooltips,
  showHoverLabel,
  variant = "icons",
  tooltipStyle = "named",
}: ProjectCountIndicatorsProps) {
  const counts = getProjectCounts(project);

  if (variant === "inline" || variant === "natural") {
    const keys: CountKey[] = ["docs", "plans", "rendus", "tâches", "deadlines"];
    const values = [
      counts.documentsCount,
      counts.plansCount,
      counts.rendersCount,
      counts.openTasksCount,
      counts.upcomingDeadlinesCount,
    ];

    const inlineLabels: Record<CountKey, string> = {
      docs: "Docs",
      plans: "Plans",
      rendus: "Rendus",
      tâches: "Tâches",
      deadlines: "Deadlines",
    };

    const segments = keys
      .map((key, i) => ({
        key,
        value: values[i],
        text:
          variant === "natural"
            ? formatNatural(values[i], key)
            : `${inlineLabels[key]} ${values[i]}`,
        tooltip: formatTooltip(values[i], key, "named"),
      }))
      .filter((s) => s.value > 0);

    if (segments.length === 0) {
      return <span className={cn("text-[10px] text-white/25", className)}>—</span>;
    }

    return (
      <p className={cn("truncate text-[10px] leading-snug text-white/45", className)}>
        {segments.map((seg, i) => (
          <span key={seg.key}>
            {i > 0 && <span className="mx-1 text-white/20">·</span>}
            <Tooltip label={seg.tooltip}>
              <span className="cursor-default transition hover:text-white/70">{seg.text}</span>
            </Tooltip>
          </span>
        ))}
      </p>
    );
  }

  const hasAny =
    counts.documentsCount > 0 ||
    counts.plansCount > 0 ||
    counts.rendersCount > 0 ||
    counts.openTasksCount > 0 ||
    counts.upcomingDeadlinesCount > 0;

  if (!hasAny) return null;

  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-1", className)}>
      <Item
        icon={FileText}
        countKey="docs"
        value={counts.documentsCount}
        compact={compact}
        showTooltips={showTooltips}
        showHoverLabel={showHoverLabel}
        tooltipStyle={tooltipStyle}
      />
      <Item
        icon={Layers}
        countKey="plans"
        value={counts.plansCount}
        compact={compact}
        showTooltips={showTooltips}
        showHoverLabel={showHoverLabel}
        tooltipStyle={tooltipStyle}
      />
      <Item
        icon={Image}
        countKey="rendus"
        value={counts.rendersCount}
        compact={compact}
        showTooltips={showTooltips}
        showHoverLabel={showHoverLabel}
        tooltipStyle={tooltipStyle}
      />
      <Item
        icon={ClipboardList}
        countKey="tâches"
        value={counts.openTasksCount}
        compact={compact}
        showTooltips={showTooltips}
        showHoverLabel={showHoverLabel}
        tooltipStyle={tooltipStyle}
      />
      <Item
        icon={CalendarClock}
        countKey="deadlines"
        value={counts.upcomingDeadlinesCount}
        compact={compact}
        showTooltips={showTooltips}
        showHoverLabel={showHoverLabel}
        tooltipStyle={tooltipStyle}
      />
    </div>
  );
}
