import { cn } from "@/lib/utils";
import { glassBtnIcon } from "@/lib/glass-styles";

/** Panneau glass principal (dashboard actuel) */
export const dashboardPanel = cn(
  "rounded-xl border border-white/[0.08] bg-white/[0.035]",
  "shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)]",
  "backdrop-blur-xl"
);

export const dashboardPanelHeader = cn(
  "flex items-center justify-between border-b border-white/[0.06] px-3.5 py-2.5"
);

export const dashboardPanelTitle =
  "flex items-center gap-2 text-[13px] font-semibold text-white/90";

/** Legacy — widgets / sections secondaires */
export const dashboardCard = cn(
  dashboardPanel,
  "transition hover:border-white/[0.1]"
);

export const dashboardCardBase = cn(
  "rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl"
);

export const dashboardBottomCard = dashboardCard;

export const dashboardSection = "space-y-3";

export const dashboardCardTitle =
  "text-[13px] font-semibold tracking-tight text-white/88";

export const accentText = "text-studio-light";

export const dashboardLink =
  "text-[11px] font-medium text-white/45 transition hover:text-studio-light";

export const dashboardEmptyCompact = "py-6 text-center text-[12px] text-white/38";

export const dashboardEmptyIconSm =
  "mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/30";

export const dashboardIconBtn = cn(glassBtnIcon, "h-8 w-8");

export const dashboardIconBtnAccent = cn(
  glassBtnIcon,
  "h-8 w-8 border-studio-border/40 text-studio-light"
);

export const dashboardViewToggle =
  "inline-flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5";

export function dashboardViewBtn(active?: boolean) {
  return cn(
    "rounded-md p-1.5 text-white/45 transition hover:text-white/70",
    active && "bg-white/[0.08] text-studio-light"
  );
}

export const dashboardSkeleton = "animate-pulse rounded-lg bg-white/[0.05]";

/** Conteneur principal dashboard — ordre mobile vs desktop */
export const dashboardPageStack = "flex flex-col gap-2.5 pb-1";

/** Stats / carrousels horizontaux mobile */
export const dashboardMobileScrollRow = cn(
  "flex gap-0 overflow-x-auto snap-x snap-mandatory",
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "md:grid md:overflow-visible md:snap-none"
);

export const dashboardMobileScrollItem = cn(
  "min-w-[44%] shrink-0 snap-start border-r border-studio-light/[0.08] last:border-r-0",
  "sm:min-w-[32%] md:min-w-0"
);

/** Carrousel graphiques mobile */
export const dashboardChartsMobileRow = cn(
  "flex gap-0 overflow-x-auto snap-x snap-mandatory divide-y-0",
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "sm:grid sm:grid-cols-3 sm:overflow-visible sm:snap-none sm:divide-x sm:divide-y-0"
);

export const dashboardChartMobileSlide = cn(
  "min-w-[92%] shrink-0 snap-center border-b border-white/[0.06] last:border-b-0",
  "sm:min-w-0 sm:snap-align-none sm:border-b-0"
);
