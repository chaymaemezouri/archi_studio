import { cn } from "@/lib/utils";
import { glassPanel } from "@/lib/glass-styles";

/** Layout liste / page */
export const pageStack = "space-y-3 pb-2";

export const listPanel = cn(glassPanel, "space-y-2.5 p-3");

export const listTable = cn(glassPanel, "overflow-hidden");

export const listGrid = "grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3";

/** Carte liste (clients, projets…) */
export const listCard = cn(
  "group/card flex h-full flex-col overflow-hidden rounded-xl",
  "border border-[color:var(--list-card-border)] bg-[color:var(--glass-bg)]",
  "shadow-[var(--glass-shadow)] backdrop-blur-xl transition duration-200",
  "hover:border-studio-border hover:bg-[color:var(--glass-bg-hover)]"
);

export const listCardHeader = cn(
  "flex items-start justify-between gap-2 border-b border-app px-3.5 py-2.5"
);

export const listCardBody = "flex flex-1 flex-col gap-2.5 px-3.5 py-2.5";

export const listCardFooter = cn(
  "border-t border-app px-3.5 py-2 text-[10px] text-glass-muted"
);

/** Typographie sémantique */
export const textHeading = "text-app-primary";
export const textHeadingSm = "text-[13px] font-semibold text-app-primary";
export const textBody = "text-glass";
export const textBodySm = "text-[13px] text-glass-secondary";
export const textMeta = "text-[10px] text-app-secondary";
export const textMetaSm = "text-[11px] text-glass-secondary";
export const textMuted = "text-glass-muted";
export const textLabel = "text-[11px] font-medium text-glass-muted";

/** Bordures & séparateurs */
export const borderSubtle = "border-app";
export const borderGlass = "border-glass";
export const dividerY = "border-b border-app";

/** Panneaux dashboard */
export const appPanel = cn(
  "rounded-xl border border-glass bg-[color:var(--glass-bg)]",
  "shadow-[var(--glass-shadow)] backdrop-blur-xl"
);

export const appPanelHeader = cn(
  "flex items-center justify-between border-b border-app px-3.5 py-2.5"
);

export const appPanelTitle = "flex items-center gap-2 text-[13px] font-semibold text-app-primary";

export const appLink =
  "text-[11px] font-medium text-glass-muted transition hover:text-studio-light";

export const appEmpty = "py-6 text-center text-[12px] text-glass-muted";

export const appIconBox = cn(
  "flex items-center justify-center rounded-lg border border-glass",
  "bg-[color:var(--icon-box-bg,var(--glass-input-bg))]",
  "text-[color:var(--icon-box-color,var(--glass-text-secondary))]"
);

export const appActionBtn = cn(
  "inline-flex items-center justify-center gap-1.5 rounded-lg",
  "border border-glass bg-[color:var(--glass-bg)] text-[11px] font-medium text-glass-secondary transition",
  "hover:border-studio-border/40 hover:bg-[color:var(--glass-bg-hover)] disabled:opacity-50"
);

export const formSection = cn(
  "space-y-3 rounded-xl border border-glass bg-[color:var(--glass-bg)] p-3.5"
);

export const formSectionTitle =
  "text-[10px] font-semibold uppercase tracking-wide text-glass-muted";

export const modalOverlay = "bg-[color:var(--overlay-scrim)] backdrop-blur-sm";

/** Coque liste / tableau (tâches, documents, calendrier…) */
export const listShell = glassPanel;

export const listRowHover = "hover:bg-studio-muted/40";

export const listRowBase = cn(
  "border-b border-app transition last:border-b-0",
  listRowHover
);

export const listHeaderBase = cn(
  "border-b border-app text-[10px] font-medium uppercase tracking-wide text-glass-muted"
);

export const listLink =
  "text-studio-light/85 transition hover:text-studio-light hover:underline";

export const listFilterLabel = "self-center text-[10px] text-glass-muted";

export const listGridCard = cn(
  "group flex flex-col rounded-xl border border-glass bg-[color:var(--glass-bg)] p-3 transition",
  "hover:border-studio-border/40 hover:bg-studio-muted/30"
);

export const listGridThumb = cn(
  "relative mb-2.5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg",
  "border border-glass bg-[color:var(--glass-bg)]"
);
