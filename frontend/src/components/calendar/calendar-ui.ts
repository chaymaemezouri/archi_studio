import { cn } from "@/lib/utils";

/** Panneaux calendrier — bordures bleu-gris, pas de blanc */
export const calendarShell = cn(
  "rounded-xl border border-[#8ba4c7]/[0.05] bg-white/[0.02]",
  "shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(139,164,199,0.03)]",
  "backdrop-blur-xl"
);

export const calendarPage = "space-y-3 pb-2";

export const calendarPanel = cn(calendarShell, "p-3");

/** Barre outils : une ligne mobile, répartition desktop */
export const calendarToolbar =
  "flex items-center gap-1.5 sm:gap-2 lg:gap-3";

export const calendarGridShell = cn(calendarShell, "overflow-hidden p-2 sm:p-3");

export const calendarWeekDayHeader =
  "py-2 text-center text-[10px] font-medium uppercase tracking-wide text-[#8ba4c7]/45";

export const calendarDayCellBase = cn(
  "min-h-[88px] rounded-lg border p-1 text-left transition",
  "border-[#8ba4c7]/[0.05] bg-white/[0.015]",
  "hover:border-[#8ba4c7]/[0.09] hover:bg-[#8ba4c7]/[0.03]"
);

export const calendarDayCellOutOfMonth =
  "border-transparent bg-transparent opacity-40";

export const calendarDayCellToday = "border-[#8ba4c7]/[0.12]";

export const calendarDayCellSelected = cn(
  "border-[#8ba4c7]/[0.14] bg-[#8ba4c7]/[0.05]",
  "ring-1 ring-inset ring-[#8ba4c7]/[0.12]"
);

export const calendarDayNumberToday =
  "inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#8ba4c7]/20 text-xs font-semibold text-[#e8edf4]";

export const calendarDayNumber =
  "inline-flex h-6 w-6 items-center justify-center text-xs text-[#9aa3b0]/55";

export const calendarWeekColumn = cn(
  "rounded-lg border border-[#8ba4c7]/[0.05] bg-white/[0.015] p-2"
);

export const calendarDayViewShell = cn(calendarShell, "p-3 sm:p-4");

export const calendarDayDetailPanel = cn(calendarShell, "p-3");

/** Puces mois/semaine — fond teinté, contour très discret (ring, pas border blanc) */
export const calendarEventChipBase = cn(
  "w-full rounded px-1.5 py-0.5 text-left text-[10px] transition",
  "ring-1 ring-inset ring-[#8ba4c7]/[0.08]",
  "hover:ring-[#8ba4c7]/[0.14] hover:brightness-110"
);

/** Lignes détail jour / liste — accent gauche, sans cadre blanc */
export const calendarListRow = cn(
  "flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition",
  "border-l-2 border-[#8ba4c7]/[0.12] bg-white/[0.012]",
  "hover:border-[#8ba4c7]/[0.22] hover:bg-[#8ba4c7]/[0.04]"
);

export const calendarFilterChip = "rounded-lg px-2.5 py-1 text-[11px] font-medium transition";

export const calendarLink =
  "text-[#8ba4c7]/85 transition hover:text-[#b8cfe8]/95 hover:underline";

export const calendarModalLabel = "w-24 shrink-0 text-[11px] text-[#8ba4c7]/42";

export const calendarModalValue = "text-[12px] text-[#e8edf4]/88";

export const calendarModalTypeBadge = cn(
  "inline-block rounded px-2 py-0.5 text-xs font-medium",
  "ring-1 ring-inset ring-[#8ba4c7]/[0.1]"
);
