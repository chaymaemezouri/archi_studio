import { cn } from "@/lib/utils";

/** Styles glass partagés — s'adaptent au thème via variables CSS */
export const glassPanel = cn(
  "rounded-xl border border-glass bg-[color:var(--glass-bg)]",
  "shadow-[var(--glass-shadow-lg)] backdrop-blur-xl"
);

export const glassCard = cn(
  "rounded-xl border border-glass bg-[color:var(--glass-bg)]",
  "shadow-[var(--glass-shadow)] backdrop-blur-xl transition",
  "hover:border-[color:var(--glass-border-hover)]"
);

export const accentBar = "h-4 w-0.5 shrink-0 rounded-full bg-studio-light";

export const glassInput = cn(
  "w-full rounded-lg border border-[color:var(--glass-input-border)] bg-[color:var(--glass-input-bg)] py-2.5 text-sm",
  "text-glass placeholder:text-[color:var(--glass-placeholder)]",
  "shadow-[var(--glass-input-shadow)]",
  "focus:border-studio-border focus:outline-none focus:ring-2 focus:ring-studio-border/30"
);

export const glassSelect = cn(
  "rounded-lg border border-[color:var(--glass-input-border)] bg-[color:var(--glass-input-bg)] px-3 py-2 text-sm",
  "text-glass-secondary shadow-[var(--glass-input-shadow)]",
  "focus:border-studio-border focus:outline-none focus:ring-2 focus:ring-studio-border/30"
);

export const formFieldLabel = "text-[11px] font-medium text-glass-secondary";

export const filterChipActive =
  "bg-studio-muted text-studio-light border border-studio-border/60";

export const filterChipInactive = cn(
  "border border-[color:var(--glass-input-border)] bg-[color:var(--glass-bg)] text-glass-muted",
  "hover:border-studio-border hover:bg-[color:var(--glass-bg-hover)] hover:text-glass-secondary"
);

/** Ligne de menu dropdown (tri, filtres…) — sans fond, accent barre gauche */
export const dropdownItem =
  "w-full border-l-2 py-1.5 pl-3 pr-3 text-left text-[13px] transition";

export const dropdownItemActive = "border-studio-light text-studio-light";

export const dropdownItemInactive = cn(
  "border-transparent text-glass-muted hover:text-glass-secondary"
);

export const dropdownSectionLabel = cn(
  "px-3 pt-2 pb-0.5 text-[11px] text-glass-muted"
);

/** Menu flottant — bordure visible light / dark */
export const glassDropdownPlain = cn(
  "rounded-xl border border-glass bg-[color:var(--glass-dropdown-bg)] py-1",
  "shadow-[var(--glass-dropdown-shadow,var(--glass-shadow-lg))] backdrop-blur-xl"
);

export const glassBtnIcon = cn(
  "inline-flex items-center justify-center rounded-lg border border-glass",
  "bg-[color:var(--glass-bg)] text-glass-secondary transition",
  "hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
);

export const glassBtnPrimary = cn(
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition disabled:opacity-50",
  "border border-[color:var(--btn-primary-border)] bg-[color:var(--btn-primary-bg)]",
  "text-[color:var(--btn-primary-text)] hover:brightness-95"
);

export const glassBtnSecondary = cn(
  "inline-flex items-center justify-center rounded-lg border border-glass",
  "bg-[color:var(--glass-bg)] px-5 py-2.5 text-sm font-medium text-glass-secondary transition",
  "hover:bg-[color:var(--glass-bg-hover)] hover:text-glass"
);

export const glassMenu = cn(
  "overflow-hidden rounded-xl border border-glass bg-[color:var(--glass-menu-bg)] py-1",
  "shadow-[var(--glass-dropdown-shadow,var(--glass-shadow-lg))] backdrop-blur-xl"
);

/** Panneau dropdown — fond opaque, au-dessus du contenu de la page */
export const glassDropdown = cn(
  "rounded-xl border border-glass bg-[color:var(--glass-dropdown-bg)]",
  "shadow-[var(--glass-dropdown-shadow,var(--glass-shadow-lg))] backdrop-blur-xl"
);
