import { cn } from "@/lib/utils";

export const projectCardShell = cn(
  "group/card relative flex h-full flex-col overflow-hidden rounded-xl",
  "border border-white/[0.07] bg-[#0c0c10]/80",
  "shadow-[0_6px_22px_rgba(0,0,0,0.34)] backdrop-blur-xl",
  "ring-1 ring-studio-light/[0.05]",
  "transition duration-200 ease-out",
  "hover:-translate-y-0.5 hover:border-studio-border/30",
  "hover:shadow-[0_10px_30px_rgba(0,0,0,0.42),0_0_20px_rgba(139,164,199,0.07)]",
  "hover:ring-studio-light/15",
  "before:pointer-events-none before:absolute before:inset-y-3 before:left-0 before:z-[1] before:w-px",
  "before:bg-gradient-to-b before:from-transparent before:via-studio-light/35 before:to-transparent"
);

export const projectCardBody = cn(
  "relative flex flex-1 flex-col",
  "bg-gradient-to-b from-studio-light/[0.045] via-white/[0.015] to-transparent",
  "px-2.5 pb-1.5 pt-1.5"
);

export const projectCardBodyCompact = cn(
  "relative bg-gradient-to-b from-studio-light/[0.04] via-white/[0.02] to-transparent px-3.5 py-2.5"
);

export const projectCardFooter = cn(
  "mt-auto flex items-center justify-between gap-1.5",
  "border-t border-studio-light/[0.1] bg-studio-light/[0.025] px-2.5 py-1"
);

export const projectCardActionBtn = cn(
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
  "border border-studio-light/20 bg-black/50 text-white/55 backdrop-blur-md",
  "opacity-75 transition duration-200",
  "hover:border-studio-border/45 hover:bg-studio-muted/40 hover:text-studio-light",
  "group-hover/card:opacity-100"
);

/** Overlay image — lisibilité badges/actions */
export const projectCardImageOverlayTop =
  "pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/28 to-transparent";

/** Overlay bas image — profondeur légère */
export const projectCardImageOverlayBottom =
  "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/42 via-black/5 to-transparent";

/** Fondu image → contenu (teinte bleue légère) */
export const projectCardImageFadeIntoContent =
  "pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0a0c12]/98 via-[#0c0c10]/40 to-transparent";

/** Shell card dashboard — glass premium, léger */
export const dashboardProjectCardShell = cn(
  "group/card relative flex h-full flex-col overflow-hidden rounded-2xl",
  "border border-white/[0.09] bg-white/[0.035]",
  "shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.06)]",
  "backdrop-blur-2xl",
  "transition duration-300 ease-out",
  "hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.045]",
  "hover:shadow-[0_16px_44px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)]"
);

export const dashboardProjectCardBody = cn(
  "relative flex flex-1 flex-col px-3.5 pb-3.5 pt-3",
  "bg-gradient-to-b from-white/[0.04] via-white/[0.02] to-transparent"
);

/** Card projet dashboard — image + footer glass sur l'image */
export const dashboardGlassCardShell = cn(
  "group/card relative block overflow-hidden rounded-xl",
  "border border-white/[0.08]",
  "shadow-[0_6px_24px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.04)]",
  "transition duration-300 ease-out",
  "hover:-translate-y-0.5 hover:border-white/[0.14]",
  "hover:shadow-[0_12px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]"
);

export const dashboardGlassCardFooter = cn(
  "absolute inset-x-0 bottom-0 z-[2]",
  "border-t border-white/10 bg-black/40 backdrop-blur-xl",
  "px-2.5 pb-2.5 pt-2",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
);

/** Overlays image dashboard — lisibilité badge + profondeur */
export const dashboardProjectCardImageOverlayTop =
  "pointer-events-none absolute inset-x-0 top-0 z-[1] h-12 bg-gradient-to-b from-black/45 to-transparent";

export const dashboardProjectCardImageOverlayBottom =
  "pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-14 bg-gradient-to-t from-black/55 via-black/15 to-transparent";

/** @deprecated use dashboardProjectCardImageOverlayTop + Bottom */
export const dashboardProjectCardImageOverlay =
  dashboardProjectCardImageOverlayBottom;

/** Ligne liste projets — alignée sur les cards */
export const projectListRowShell = cn(
  "group/row rounded-xl border border-white/[0.07] bg-[#0c0c10]/80 backdrop-blur-xl",
  "transition duration-200 ease-out",
  "hover:border-white/[0.11] hover:bg-white/[0.025]",
  "hover:shadow-[0_4px_22px_rgba(0,0,0,0.38)]",
  "overflow-visible"
);

/** 8 colonnes fixes — Projet · Client · Ville · Phase · Progression · Deadline · Contenus · Actions */
export const projectListGrid = cn(
  "grid items-center gap-x-5 px-3 py-2.5 sm:px-4 sm:py-2.5",
  "grid-cols-[minmax(0,2.35fr)_0fr_0fr_72px_100px_128px_0fr_120px]",
  "lg:grid-cols-[minmax(0,2.35fr)_minmax(100px,1fr)_0fr_72px_100px_128px_minmax(120px,1fr)_120px]",
  "xl:grid-cols-[minmax(0,2.1fr)_minmax(100px,1fr)_minmax(88px,0.9fr)_72px_100px_128px_minmax(120px,1fr)_120px]"
);

/** Colonne grid — overflow hidden pour éviter chevauchement des headers */
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

/** Conteneur liste — largeur min pour garder colonnes alignées header/lignes */
export const projectListTableInner = "space-y-2 lg:min-w-[760px]";
export const projectListTableWrap = "min-w-0 lg:overflow-x-auto";

/** @deprecated use projectListColProgress */
export const projectListAlignProgress = projectListColProgress;
/** @deprecated use projectListColActions */
export const projectListAlignActions = projectListColActions;
