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
  "rounded-[14px] border border-[#8ba4c7]/[0.06]",
  "bg-[#08080b] p-4 sm:p-5"
);

export const detailClientHeroTitle = "text-xl font-semibold text-[#e8edf4] sm:text-2xl";

export const detailClientHeroMeta = "mt-1 text-sm text-[#8ba4c7]/50";

export const detailClientHeroContact = "text-sm text-[#9aa3b0]/65";

export const detailClientTabsNav = cn(
  "overflow-x-auto border-b border-[#8ba4c7]/[0.07]",
  "-mx-1 px-1"
);

export const detailClientTabBtn = cn(
  "relative shrink-0 px-3 py-2.5 text-[12px] font-medium transition-colors"
);

export const detailClientTabActive = "text-[#b8cfe8]/95";

export const detailClientTabInactive =
  "text-[#9aa3b0]/50 hover:text-[#8ba4c7]/70";

export const detailClientTabIndicator =
  "absolute inset-x-1 bottom-0 h-px rounded-full bg-[#8ba4c7]/55";

export const detailClientTabCount =
  "ml-1.5 rounded-md bg-[#8ba4c7]/12 px-1 py-px text-[9px] tabular-nums text-[#8ba4c7]/75";

export const detailClientInfoLabel = "w-28 shrink-0 text-[11px] text-[#8ba4c7]/42 sm:w-32";

export const detailClientInfoValue = "text-[12px] text-[#e8edf4]/88";

export const detailClientProfileGrid = cn(
  "mt-3 grid gap-4",
  "sm:grid-cols-2 lg:grid-cols-3"
);

export const detailClientProfileBlock = cn(
  "rounded-[10px] border border-[#8ba4c7]/[0.05]",
  "bg-white/[0.012] p-3"
);

export const detailClientProfileBlockTitle = cn(
  "mb-2.5 flex items-center gap-1.5",
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8ba4c7]/65"
);

export const detailClientProfileMeta = "mt-2 text-[10px] text-[#8ba4c7]/40";

export const detailClientProfileAdmin = "mt-4 border-t border-[#8ba4c7]/[0.06] pt-4";

export const detailClientContactRow = "flex flex-col gap-1 sm:flex-row sm:gap-2";

export const detailClientContactLabel =
  "w-28 shrink-0 pt-0.5 text-[11px] text-[#8ba4c7]/42 sm:w-32";

export const detailClientContactValue = cn(
  "text-[12px] text-[#e8edf4]/88",
  "hover:text-[#b8cfe8]/95 transition"
);

export const detailClientContactActions = "mt-1 flex flex-wrap gap-0.5";

export const detailClientHeroActions = "flex flex-wrap items-center gap-1";
