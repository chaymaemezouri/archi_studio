import { detailIconActionGroup } from "@/components/projects/detail/project-detail-ui";
import { cn } from "@/lib/utils";

export const projectCardShell = cn(
  "group/card relative flex h-full flex-col overflow-hidden rounded-xl",
  "border border-card bg-card shadow-card backdrop-blur-xl",
  "ring-1 ring-[color:var(--studio-soft)]",
  "transition duration-200 ease-out",
  "hover:-translate-y-0.5 hover:border-[color:var(--studio-border)]",
  "hover:shadow-[var(--card-shadow-hover)]",
  "hover:ring-[color:var(--studio-border)]",
  "before:pointer-events-none before:absolute before:inset-y-3 before:left-0 before:z-[1] before:w-px",
  "before:bg-gradient-to-b before:from-transparent before:via-[color:var(--studio-border)] before:to-transparent"
);

export const projectCardBody = cn(
  "relative flex flex-1 flex-col",
  "bg-gradient-to-b from-[color:var(--studio-soft)] via-transparent to-transparent",
  "px-2.5 pb-1.5 pt-1.5"
);

export const projectCardBodyCompact = cn(
  "relative bg-gradient-to-b from-[color:var(--studio-soft)] to-transparent px-3.5 py-2.5"
);

export const projectCardFooter = cn(
  "mt-auto flex items-center justify-between gap-1.5",
  "border-t border-app bg-[color:var(--studio-soft)] px-2.5 py-1"
);

export const projectCardActionBtn = cn(
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
  "border border-[color:var(--studio-border)] bg-[color:var(--glass-bg)] text-glass-secondary backdrop-blur-md",
  "opacity-[var(--pc-action-opacity)] transition duration-200",
  "hover:border-[color:var(--studio-border)] hover:bg-studio-muted hover:text-studio-light",
  "group-hover/card:opacity-100",
  "dark:bg-black/50 dark:text-glass-secondary"
);

export const projectCardImageActionGroup = cn(
  detailIconActionGroup,
  "bg-[color:var(--pc-action-bg)] backdrop-blur-md",
  "dark:bg-black/45"
);

export const projectCardImageOverlayTop =
  "pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/28 to-transparent";

export const projectCardImageOverlayBottom =
  "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/42 via-black/5 to-transparent";

export const projectCardImageFadeIntoContent = cn(
  "pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t to-transparent",
  "from-[color:var(--card-bg)] via-[color:var(--card-bg)]/40",
  "dark:from-[#0a0c12]/98 dark:via-[#0c0c10]/40"
);

export const dashboardProjectCardShell = cn(
  "group/card relative flex h-full flex-col overflow-hidden rounded-2xl",
  "border border-glass bg-[color:var(--glass-bg)] shadow-[var(--glass-shadow-lg)]",
  "backdrop-blur-2xl transition duration-300 ease-out",
  "hover:-translate-y-0.5 hover:border-[color:var(--glass-border-hover)]",
  "hover:shadow-[var(--card-shadow-hover)]"
);

export const dashboardProjectCardBody = cn(
  "relative flex flex-1 flex-col px-3.5 pb-3.5 pt-3",
  "bg-gradient-to-b from-[color:var(--studio-soft)] to-transparent"
);

export const dashboardGlassCardShell = cn(
  "group/card relative block overflow-hidden rounded-xl",
  "border border-glass shadow-[var(--glass-shadow-lg)]",
  "transition duration-300 ease-out",
  "hover:-translate-y-0.5 hover:border-[color:var(--glass-border-hover)]",
  "hover:shadow-[var(--card-shadow-hover)]"
);

export const dashboardGlassCardFooter = cn(
  "absolute inset-x-0 bottom-0 z-[2]",
  "border-t border-glass px-2.5 pb-2.5 pt-2 backdrop-blur-xl",
  "bg-[color:var(--dash-card-footer-bg)]/95 text-glass",
  "dark:border-glass"
);

export const dashboardProjectCardImageOverlayTop =
  "pointer-events-none absolute inset-x-0 top-0 z-[1] h-12 bg-gradient-to-b from-black/45 to-transparent";

export const dashboardProjectCardImageOverlayBottom =
  "pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-14 bg-gradient-to-t from-black/55 via-black/15 to-transparent";

export const dashboardProjectCardImageOverlay =
  dashboardProjectCardImageOverlayBottom;

export const projectListRowShell = cn(
  "group/row overflow-visible rounded-xl border border-card bg-card shadow-card backdrop-blur-xl",
  "transition duration-200 ease-out",
  "hover:border-[color:var(--glass-border-hover)] hover:shadow-[var(--card-shadow-hover)]"
);

export const projectListGrid = cn(
  "grid items-center gap-x-5 px-3 py-2.5 sm:px-4 sm:py-2.5",
  "grid-cols-[minmax(0,2.35fr)_0fr_0fr_72px_100px_128px_0fr_120px]",
  "lg:grid-cols-[minmax(0,2.35fr)_minmax(100px,1fr)_0fr_72px_100px_128px_minmax(120px,1fr)_120px]",
  "xl:grid-cols-[minmax(0,2.1fr)_minmax(100px,1fr)_minmax(88px,0.9fr)_72px_100px_128px_minmax(120px,1fr)_120px]"
);

const listColCell = "min-w-0 overflow-hidden";

export const projectListColProjet = cn(
  "col-start-1 flex w-full items-center justify-start",
  listColCell
);
export const projectListColClient = cn(
  "col-start-2 flex w-full items-center justify-start",
  listColCell,
  "max-lg:invisible max-lg:pointer-events-none"
);
export const projectListColVille = cn(
  "col-start-3 flex w-full items-center justify-start",
  listColCell,
  "max-xl:invisible max-xl:pointer-events-none"
);
export const projectListColPhase = cn(
  "col-start-4 flex w-full items-center justify-start",
  listColCell
);
export const projectListColProgress = cn(
  "col-start-5 flex w-full items-center justify-center",
  listColCell
);
export const projectListColDeadline = cn(
  "col-start-6 flex w-full items-center justify-start",
  listColCell
);
export const projectListColContenus = cn(
  "col-start-7 flex w-full items-center justify-start",
  listColCell,
  "max-lg:invisible max-lg:pointer-events-none"
);
export const projectListColActions = cn(
  "col-start-8 flex w-full items-center justify-end",
  "relative z-[2] min-w-0 overflow-visible"
);

export const projectListTableInner = "space-y-2 lg:min-w-[760px]";
export const projectListTableWrap = "min-w-0 lg:overflow-x-auto";

export const projectListAlignProgress = projectListColProgress;
export const projectListAlignActions = projectListColActions;
