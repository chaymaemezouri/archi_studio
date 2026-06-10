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

export const dashboardPageStack = "flex flex-col gap-4 pb-1";

/** Groupe de panneaux dans une même zone thématique */
export const dashboardPageZone = "flex flex-col gap-2.5";

/** Bandeau alertes + prochaine échéance */
export const dashboardPriorityGrid =
  "grid grid-cols-1 gap-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] lg:items-start";

/** Colonne focus journée (tâches + réunions) */
export const dashboardDayColumn =
  "flex flex-col gap-2.5 xl:col-span-4 xl:sticky xl:top-4 xl:self-start";

/** Grille principale planning */
export const dashboardPlanningGrid =
  "grid grid-cols-1 gap-2.5 xl:grid-cols-12 xl:items-start";

/** Colonne calendrier + réunions / demain en dessous */
export const dashboardCalendarColumn =
  "flex min-w-0 flex-col gap-2.5 xl:col-span-8";

export const dashboardBelowCalendarGrid =
  "grid grid-cols-1 gap-2.5 md:grid-cols-2";

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

/** Mini pastille tâche (dashboard) — légère, sans bordure */
export const dashboardTaskChip = cn(
  "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5",
  "text-[9px] font-medium leading-none"
);

export const dashboardTaskRow = cn(
  "group relative flex items-start gap-2.5 rounded-xl px-2.5 py-2.5",
  "border border-transparent transition duration-200",
  "hover:border-app hover:bg-[color:var(--glass-bg-hover)]/40"
);

export const dashboardTaskAddZone = cn(
  "shrink-0 border-b border-app bg-gradient-to-b from-[color:var(--glass-bg)]/50 to-transparent px-3.5 py-3"
);

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
