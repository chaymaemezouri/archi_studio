import { cn } from "@/lib/utils";
import { glassBtnIcon } from "@/lib/glass-styles";
import {
  appActionBtn,
  appEmpty,
  appLink,
  appPanel,
  appPanelHeader,
  appPanelTitle,
  textHeading,
} from "@/lib/theme-classes";

/** Panneau glass principal (dashboard) */
export const dashboardPanel = appPanel;

export const dashboardPanelHeader = appPanelHeader;

export const dashboardPanelTitle = appPanelTitle;

export const dashboardStatLabel =
  "text-[9px] font-semibold uppercase tracking-wide text-[color:var(--dash-stat-label)]";

export const dashboardSectionLabel =
  "text-[10px] font-semibold uppercase tracking-wide text-[color:var(--dash-section-label)]";

export const dashboardCard = cn(
  dashboardPanel,
  "transition hover:border-studio-border/40"
);

export const dashboardCardBase = cn(
  "rounded-xl border border-glass bg-[color:var(--glass-bg)] backdrop-blur-xl"
);

export const dashboardBottomCard = dashboardCard;

export const dashboardSection = "space-y-3";

export const dashboardCardTitle = textHeading;

export const accentText = "text-studio-light";

export const dashboardLink = appLink;

export const dashboardEmptyCompact = appEmpty;

export const dashboardEmptyIconSm = cn(
  "mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full",
  "border border-glass bg-[color:var(--glass-bg)] text-glass-muted"
);

export const dashboardIconBtn = cn(glassBtnIcon, "h-8 w-8");

export const dashboardIconBtnAccent = cn(
  glassBtnIcon,
  "h-8 w-8 border-studio-border/40 text-studio-light"
);

export const dashboardViewToggle = cn(
  "inline-flex rounded-lg border border-glass bg-[color:var(--glass-bg)] p-0.5"
);

export function dashboardViewBtn(active?: boolean) {
  return cn(
    "rounded-md p-1.5 text-glass-muted transition hover:text-glass-secondary",
    active && "bg-[color:var(--glass-bg-hover)] text-studio-light"
  );
}

export const dashboardSkeleton =
  "animate-pulse rounded-lg bg-[color:var(--glass-bg-hover)]";

export const dashboardPageStack = "flex flex-col gap-2.5 pb-1";

export const dashboardMobileScrollRow = cn(
  "flex gap-0 overflow-x-auto snap-x snap-mandatory",
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "md:grid md:overflow-visible md:snap-none"
);

export const dashboardMobileScrollItem = cn(
  "min-w-[44%] shrink-0 snap-start border-r border-app last:border-r-0",
  "sm:min-w-[32%] md:min-w-0"
);

export const dashboardChartsMobileRow = cn(
  "flex gap-0 overflow-x-auto snap-x snap-mandatory divide-y-0",
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "sm:grid sm:grid-cols-3 sm:overflow-visible sm:snap-none sm:divide-x sm:divide-y-0 sm:divide-app"
);

export const dashboardChartMobileSlide = cn(
  "min-w-[92%] shrink-0 snap-center border-b border-app last:border-b-0",
  "sm:min-w-0 sm:snap-align-none sm:border-b-0"
);

export const dashboardActionBtn = appActionBtn;

/** Pastilles événements — couleurs via variables CSS (.light / .dark) */
export const dashboardEventChipTask = cn(
  "bg-[color:var(--dash-chip-task-bg)] text-[color:var(--dash-chip-task-text)]",
  "ring-[color:var(--dash-chip-task-ring)]"
);

export const dashboardEventChipMeeting = cn(
  "bg-[color:var(--dash-chip-meeting-bg)] text-[color:var(--dash-chip-meeting-text)]",
  "ring-[color:var(--dash-chip-meeting-ring)]"
);

export const dashboardEventChipDeadline = cn(
  "bg-[color:var(--dash-chip-deadline-bg)] text-[color:var(--dash-chip-deadline-text)]",
  "ring-[color:var(--dash-chip-deadline-ring)]"
);

export const dashboardMeetingCard = cn(
  "border border-[color:var(--dash-meeting-card-border)] border-l-[3px]",
  "bg-[color:var(--dash-meeting-card-bg)] text-[color:var(--dash-meeting-card-text)]",
  "transition hover:brightness-95 dark:hover:brightness-110"
);
