import { cn } from "@/lib/utils";
import { glassDropdownPlain, glassBtnIcon } from "@/lib/glass-styles";

/** Barre navbar — sans panneau, alignée au contenu */
export const headerBar =
  "flex min-h-[52px] items-center gap-2.5 sm:gap-3";

export const headerSearchWrap =
  "relative flex min-w-0 flex-1 items-center max-w-full md:max-w-[420px] lg:max-w-[480px]";

export const headerSearchInput = cn(
  "h-10 w-full rounded-lg border-0 border-b border-glass bg-transparent pl-9 pr-16 text-[13px] text-glass",
  "placeholder:text-[color:var(--glass-placeholder)] transition",
  "focus:border-studio-border/50 focus:outline-none focus:ring-0"
);

export const headerSearchKbd =
  "pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 text-[10px] font-medium text-glass-muted md:inline";

export const headerActions = "flex shrink-0 items-center gap-2 sm:gap-2.5";

export const headerProfileBtn = cn(
  "flex items-center gap-2 rounded-lg px-2 py-1.5 transition",
  "text-glass-secondary hover:bg-[color:var(--glass-bg-hover)] hover:text-glass",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-studio-border/35"
);

export const headerProfileMenu = cn(
  glassDropdownPlain,
  "absolute right-0 z-50 mt-1.5 w-52 overflow-hidden py-1"
);

export const headerProfileMenuHead = "px-3 py-2.5";

export const headerMenuItem = cn(
  "mx-1 flex w-[calc(100%-8px)] items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] transition",
  "text-glass-secondary hover:bg-[color:var(--glass-bg-hover)] hover:text-glass"
);

export const headerMenuItemDanger = cn(
  headerMenuItem,
  "text-rose-500/85 hover:bg-rose-500/[0.06] hover:text-rose-600 dark:text-rose-300/85 dark:hover:text-rose-200/95"
);

export { glassBtnIcon };
