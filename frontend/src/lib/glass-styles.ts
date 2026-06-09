import { cn } from "@/lib/utils";

/** Styles glass partagés (dashboard + projets) */
export const glassPanel = cn(
  "rounded-xl border border-white/[0.07] bg-white/[0.03]",
  "shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]",
  "backdrop-blur-xl"
);

export const glassCard = cn(
  "rounded-xl border border-white/[0.07] bg-white/[0.03]",
  "shadow-[0_10px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl transition",
  "hover:border-white/[0.10] hover:shadow-[0_14px_40px_rgba(0,0,0,0.52)]"
);

export const accentBar = "h-4 w-0.5 shrink-0 rounded-full bg-studio-light";

export const glassInput =
  "w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2.5 text-sm text-white/90 placeholder:text-white/35 focus:border-studio-border focus:outline-none focus:ring-1 focus:ring-studio-border/40";

export const glassSelect =
  "rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white/75 focus:border-studio-border focus:outline-none focus:ring-1 focus:ring-studio-border/40";

export const filterChipActive =
  "bg-studio-muted text-studio-light border border-studio-border/60";

export const filterChipInactive =
  "border border-transparent bg-white/[0.04] text-white/50 hover:bg-white/[0.06] hover:text-white/70";

/** Ligne de menu dropdown (tri, filtres…) — sans fond, accent barre gauche */
export const dropdownItem =
  "w-full border-l-2 py-1.5 pl-3 pr-3 text-left text-[13px] transition";

export const dropdownItemActive = "border-studio-light text-studio-light";

export const dropdownItemInactive =
  "border-transparent text-white/50 hover:text-white/72";

export const dropdownSectionLabel = "px-3 pt-2 pb-0.5 text-[11px] text-white/30";

/** Menu flottant sans bordure — léger */
export const glassDropdownPlain =
  "rounded-lg bg-[#101014]/90 py-1 shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-xl";

export const glassBtnIcon =
  "inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/65 transition hover:bg-white/[0.06] hover:text-studio-light";

export const glassBtnPrimary =
  "inline-flex items-center justify-center rounded-lg border border-studio-border/50 bg-studio-muted px-5 py-2.5 text-sm font-medium text-studio-light transition hover:bg-studio-muted/80 hover:text-white disabled:opacity-50";

export const glassBtnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.06] hover:text-white/90";

export const glassMenu =
  "overflow-hidden rounded-lg border border-white/10 bg-[#101014]/95 py-1 shadow-xl backdrop-blur-xl";

/** Panneau dropdown — fond opaque, au-dessus du contenu de la page */
export const glassDropdown =
  "rounded-xl border border-white/12 bg-[#14141c] shadow-[0_18px_40px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-xl";
