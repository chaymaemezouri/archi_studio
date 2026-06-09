import type { BadgeVariant } from "@/components/ui/Badge";
import type { getTaskDeadlineBadge } from "@/lib/tasks-list";
import { cn } from "@/lib/utils";

export function taskDeadlineBadgeVariant(
  badge: ReturnType<typeof getTaskDeadlineBadge>
): BadgeVariant {
  switch (badge) {
    case "overdue":
      return "danger";
    case "today":
      return "warning";
    case "tomorrow":
    case "soon":
      return "studio";
    default:
      return "default";
  }
}

export const tasksShell = cn(
  "rounded-xl border border-[#8ba4c7]/[0.05] bg-white/[0.02]",
  "shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(139,164,199,0.03)]",
  "backdrop-blur-xl"
);

export const tasksListPage = "space-y-3 pb-2";

export const tasksListPanel = cn(tasksShell, "space-y-2.5 p-3");

export const tasksListTable = cn(tasksShell, "overflow-hidden");

export const tasksListFilterChip =
  "rounded-lg px-2.5 py-1 text-[11px] font-medium transition";

export const tasksListRow = cn(
  "grid grid-cols-1 gap-2 border-b border-[#8ba4c7]/[0.05] px-4 py-2.5 text-[13px] transition last:border-b-0",
  "hover:bg-[#8ba4c7]/[0.04]",
  "md:grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_0.6fr_0.7fr_2rem] md:items-center md:gap-3"
);

export const tasksListHeader =
  "hidden grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_0.6fr_0.7fr_2rem] gap-3 border-b border-[#8ba4c7]/[0.06] px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-[#8ba4c7]/40 md:grid";

export const tasksListLink =
  "text-[#8ba4c7]/85 transition hover:text-[#b8cfe8]/95 hover:underline";

export const tasksBoardColumn = cn(
  "rounded-xl border border-[#8ba4c7]/[0.05] bg-white/[0.015] p-3"
);

export const tasksBoardCard = cn(
  "w-full rounded-lg border-l-2 border-[#8ba4c7]/[0.12] bg-white/[0.02] p-3 text-left transition",
  "hover:border-[#8ba4c7]/[0.22] hover:bg-[#8ba4c7]/[0.04]"
);
