/**
 * Tokens partagés avec les pages détail projet — cohérence visuelle clients / projets.
 */
export {
  detailChecklistDate,
  detailChecklistEmpty,
  detailChecklistFilterActive,
  detailChecklistFilterBtn,
  detailChecklistFilterInactive,
  detailChecklistHeader,
  detailChecklistItem,
  detailChecklistItemTitle,
  detailChecklistList,
  detailChecklistNotes,
  detailChecklistRatioAdded,
  detailChecklistSection,
  detailChecklistStatusBadge,
  detailChecklistStatusMissing,
  detailChecklistStatusUploaded,
  detailChecklistStatusValidated,
  detailChecklistTitle,
  detailContentShell,
  detailFinanceStatGrid,
  detailFinanceStatLabel,
  detailFinanceStatValue,
  detailFinanceStatValueSuccess,
  detailFinanceStatValueWarning,
  detailIconActionGroup,
  detailListDivider,
  detailNotesBodyInput,
  detailNotesComposer,
  detailNotesSearchInput,
  detailNotesTitleInput,
} from "@/components/projects/detail/project-detail-ui";

import { cn } from "@/lib/utils";

export const detailClientPage = "space-y-4";

export const detailClientHero = cn(
  "rounded-[14px] border border-app",
  "bg-[color:var(--detail-shell-bg)] p-4 sm:p-5"
);

export const detailClientHeroTitle = "text-xl font-semibold text-app-primary sm:text-2xl";

export const detailClientHeroMeta = "mt-1 text-sm text-glass-muted";

export const detailClientHeroContact = "text-sm text-glass-secondary";

export const detailClientTabsNav = cn(
  "overflow-x-auto border-b border-[#8ba4c7]/[0.07]",
  "-mx-1 px-1"
);

export const detailClientTabBtn = cn(
  "relative shrink-0 px-3 py-2.5 text-[12px] font-medium transition-colors"
);

export const detailClientTabActive = "text-[#b8cfe8]/95";

export const detailClientTabInactive =
  "text-[#9aa3b0]/50 hover:text-glass-muted";

export const detailClientTabIndicator =
  "absolute inset-x-1 bottom-0 h-px rounded-full bg-studio-muted/505";

export const detailClientTabCount =
  "ml-1.5 rounded-md bg-studio-muted px-1 py-px text-[9px] tabular-nums text-[#8ba4c7]/75";

export const detailClientInfoLabel = "w-28 shrink-0 text-[11px] text-glass-muted sm:w-32";

export const detailClientInfoValue = "text-[12px] text-glass";

export const detailClientProfileGrid = cn(
  "mt-3 grid gap-4",
  "sm:grid-cols-2 lg:grid-cols-3"
);

export const detailClientProfileBlock = cn(
  "rounded-[10px] border border-app",
  "bg-[color:var(--glass-bg)] p-3"
);

export const detailClientProfileBlockTitle = cn(
  "mb-2.5 flex items-center gap-1.5",
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-glass-muted"
);

export const detailClientProfileMeta = "mt-2 text-[10px] text-glass-muted";

export const detailClientProfileAdmin = "mt-4 border-t border-app pt-4";

export const detailClientContactRow = "flex flex-col gap-1 sm:flex-row sm:gap-2";

export const detailClientContactLabel =
  "w-28 shrink-0 pt-0.5 text-[11px] text-glass-muted sm:w-32";

export const detailClientContactValue = cn(
  "text-[12px] text-glass",
  "hover:text-[#b8cfe8]/95 transition"
);

export const detailClientContactActions = "mt-1 flex flex-wrap gap-0.5";

export const detailClientHeroActions = "flex flex-wrap items-center gap-1";
