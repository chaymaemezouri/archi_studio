import { cn } from "@/lib/utils";
import { listLink, listShell, pageStack } from "@/lib/theme-classes";

export const calendarShell = listShell;

export const calendarPage = pageStack;

export const calendarPanel = cn(calendarShell, "p-3");

export const calendarToolbar =
  "flex items-center gap-1.5 sm:gap-2 lg:gap-3";

export const calendarGridShell = cn(calendarShell, "overflow-hidden p-2 sm:p-3");

export const calendarWeekDayHeader =
  "py-2 text-center text-[10px] font-medium uppercase tracking-wide text-glass-muted";

export const calendarDayCellBase = cn(
  "min-h-[88px] rounded-lg border p-1 text-left transition",
  "border-glass bg-[color:var(--glass-bg)]",
  "hover:border-studio-border/30 hover:bg-studio-muted/30"
);

export const calendarDayCellOutOfMonth =
  "border-transparent bg-transparent opacity-40";

export const calendarDayCellToday = "border-studio-border/40";

export const calendarDayCellSelected = cn(
  "border-studio-border/50 bg-studio-muted/50",
  "ring-1 ring-inset ring-studio-border/30"
);

export const calendarDayNumberToday = cn(
  "inline-flex h-6 w-6 items-center justify-center rounded-full",
  "bg-studio-muted text-xs font-semibold text-app-primary"
);

export const calendarDayNumber =
  "inline-flex h-6 w-6 items-center justify-center text-xs text-glass-muted";

export const calendarWeekColumn = cn(
  "rounded-lg border border-glass bg-[color:var(--glass-bg)] p-2"
);

export const calendarDayViewShell = cn(calendarShell, "p-3 sm:p-4");

export const calendarDayDetailPanel = cn(calendarShell, "p-3");

export const calendarEventChipBase = cn(
  "w-full rounded px-1.5 py-0.5 text-left text-[10px] transition",
  "ring-1 ring-inset ring-studio-border/20",
  "hover:ring-studio-border/35 hover:brightness-110"
);

export const calendarListRow = cn(
  "flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition",
  "border-l-2 border-studio-border/30 bg-[color:var(--glass-bg)]",
  "hover:border-studio-border/50 hover:bg-studio-muted/40"
);

export const calendarFilterChip = "rounded-lg px-2.5 py-1 text-[11px] font-medium transition";

export const calendarLink = listLink;

export const calendarModalLabel = "w-24 shrink-0 text-[11px] text-glass-muted";

export const calendarModalValue = "text-[12px] text-glass";

export const calendarModalTypeBadge = cn(
  "inline-block rounded px-2 py-0.5 text-xs font-medium",
  "ring-1 ring-inset ring-studio-border/25"
);
