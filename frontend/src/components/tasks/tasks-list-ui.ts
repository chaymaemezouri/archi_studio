import type { BadgeVariant } from "@/components/ui/Badge";
import type { getTaskDeadlineBadge } from "@/lib/tasks-list";
import { cn } from "@/lib/utils";
import {
  listHeaderBase,
  listLink,
  listPanel,
  listRowBase,
  listShell,
  pageStack,
} from "@/lib/theme-classes";
import { glassPanel } from "@/lib/glass-styles";

export function taskBoardDeadlineAccent(
  badge: ReturnType<typeof getTaskDeadlineBadge>
): string {
  switch (badge) {
    case "overdue":
      return "border-l-[color:var(--task-accent-overdue)]";
    case "today":
      return "border-l-[color:var(--task-accent-today)]";
    case "tomorrow":
      return "border-l-[color:var(--task-accent-tomorrow)]";
    case "soon":
      return "border-l-[color:var(--task-accent-soon)]";
    default:
      return "border-l-[color:var(--task-accent-default)]";
  }
}

export function taskDeadlineBadgeVariant(
  badge: ReturnType<typeof getTaskDeadlineBadge>
): BadgeVariant {
  switch (badge) {
    case "overdue":
      return "danger";
    case "today":
      return "warning";
    case "tomorrow":
      return "accent";
    case "soon":
      return "studio";
    default:
      return "default";
  }
}

export const tasksShell = listShell;

export const tasksListPage = pageStack;

export const tasksListPanel = listPanel;

export const tasksListTable = cn(glassPanel, "overflow-x-auto overflow-y-visible");

export const tasksListFilterChip =
  "rounded-lg px-2.5 py-1 text-[11px] font-medium transition";

export const tasksListRow = cn(
  listRowBase,
  "grid grid-cols-1 gap-2 px-4 py-2.5 text-[13px]",
  "md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.6fr)_minmax(0,0.7fr)_2.75rem] md:items-center md:gap-3"
);

export const tasksListHeader = cn(
  listHeaderBase,
  "hidden grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.6fr)_minmax(0,0.7fr)_2.75rem] gap-3 px-4 py-2 md:grid"
);

export const tasksListLink = listLink;

export const tasksBoardColumn = cn(
  "rounded-xl border border-glass bg-[color:var(--glass-bg)] p-3"
);

export const tasksBoardCard = cn(
  "w-full rounded-lg border border-glass border-l-[3px] bg-[color:var(--glass-bg)] p-3 text-left transition",
  "hover:bg-studio-muted/40"
);
