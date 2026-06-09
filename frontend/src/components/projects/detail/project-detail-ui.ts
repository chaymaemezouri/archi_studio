import { cn } from "@/lib/utils";
import {
  glassBtnIcon,
  glassBtnPrimary,
  glassBtnSecondary,
  glassInput,
  glassMenu,
  glassPanel,
  glassSelect,
} from "@/lib/glass-styles";

export const detailPage = "space-y-3";

export const detailContentShell = cn(
  "overflow-hidden rounded-[14px]",
  "border border-[#8ba4c7]/[0.06]",
  "bg-[#08080b]",
  "shadow-[0_6px_28px_rgba(0,0,0,0.38)]"
);

/** Zone principale — sidebar projet + contenu */
export const detailMainZone = cn(
  "flex flex-col gap-2 p-2 sm:p-2.5",
  "lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start lg:gap-3 lg:p-2.5"
);

export const detailSectionContent = cn(
  "min-w-0 flex-1 rounded-[10px]",
  "border border-[#8ba4c7]/[0.05]",
  "bg-white/[0.012]",
  "p-2 sm:p-2.5"
);

export const detailSidebarShell = cn(
  "hidden lg:flex lg:flex-col lg:sticky lg:top-3 lg:self-start",
  "w-[200px] shrink-0",
  "max-h-[calc(100vh-6rem)] overflow-y-auto px-1 py-1 scrollbar-thin"
);

export const detailSidebarTitle =
  "mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8ba4c7]/70";

export const detailSidebarNav = "flex flex-col gap-0.5";

export const detailSidebarItem = cn(
  "grid w-full grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-x-2",
  "rounded-lg px-1.5 py-[6px] text-left transition duration-150",
  "text-[12px] font-normal text-[#c2cad6]/88",
  "hover:bg-[#8ba4c7]/12 hover:text-[#eef2f7]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ba4c7]/25"
);

export const detailSidebarItemActive = cn(
  "bg-[#8ba4c7]/14 font-medium text-[#f0f4fa]",
  "shadow-[inset_2px_0_0_0_rgba(139,164,199,0.55)]",
  "hover:bg-[#8ba4c7]/18 hover:text-[#f0f4fa]"
);

export const detailSidebarIconWrap =
  "flex h-[22px] w-[22px] items-center justify-center justify-self-center rounded-md transition-colors";

export const detailSidebarIconWrapActive = "bg-[#8ba4c7]/22";

export const detailSidebarIcon = "h-3.5 w-3.5 shrink-0 text-[#8ba4c7]/62";

export const detailSidebarIconActive = "text-[#c5d8ee]";

export const detailSidebarLabel = "min-w-0 truncate leading-snug";

export const detailSidebarCount = cn(
  "shrink-0 min-w-[1.15rem] rounded-md px-1 py-0.5 text-center",
  "text-[8px] font-medium tabular-nums leading-none",
  "bg-[#8ba4c7]/14 text-[#a8bdd4]/90"
);

export const detailSidebarCountActive =
  "bg-[#8ba4c7]/30 text-[#e8f0fa]";

export const detailSidebarMobileBar = cn(
  "flex w-full items-center gap-2 rounded-lg px-1 py-2",
  "transition hover:opacity-90",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ba4c7]/25"
);

export const detailSidebarMobileOverlay =
  "fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden";

export const detailSidebarMobilePanel = cn(
  "fixed inset-x-0 bottom-0 z-50 max-h-[72vh] overflow-y-auto rounded-t-2xl",
  "bg-[#12161e]/95 backdrop-blur-md",
  "p-4 pb-6 shadow-[0_-12px_40px_rgba(0,0,0,0.55)]",
  "lg:hidden"
);

export const detailSidebarMobileTitle =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8ba4c7]/65";

/** Section — style unifié des sous-pages projet */
export const detailSectionCard = cn(
  "flex flex-col rounded-[10px]",
  "border border-[#8ba4c7]/[0.05]",
  "bg-white/[0.015]",
  "p-3 sm:p-3.5"
);

export const detailSectionHeaderRule =
  "mb-2 border-b border-[#8ba4c7]/[0.08] pb-2";

const detailIconActionBase = cn(
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
  "transition duration-150",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
  "disabled:pointer-events-none disabled:opacity-35"
);

export const detailIconActionBtn = cn(
  detailIconActionBase,
  "text-[#9aa3b0]/70 hover:bg-[#8ba4c7]/10 hover:text-[#c2cad6]",
  "focus-visible:ring-[#8ba4c7]/25"
);

export const detailIconActionBtnView = cn(
  detailIconActionBase,
  "text-[#8ba4c7]/85 hover:bg-[#8ba4c7]/12 hover:text-[#b8d4f0]",
  "focus-visible:ring-[#8ba4c7]/30"
);

export const detailIconActionBtnDownload = cn(
  detailIconActionBase,
  "text-[#6eb0e8]/90 hover:bg-[#8ba4c7]/12 hover:text-[#9ec8f0]",
  "focus-visible:ring-[#8ba4c7]/30"
);

export const detailIconActionBtnUpload = cn(
  detailIconActionBase,
  "text-amber-400/90 hover:bg-amber-500/12 hover:text-amber-300",
  "focus-visible:ring-amber-500/25"
);

export const detailIconActionBtnNotes = cn(
  detailIconActionBase,
  "text-[#9aa3b0]/75 hover:bg-[#8ba4c7]/10 hover:text-[#c2cad6]/90",
  "focus-visible:ring-[#8ba4c7]/20"
);

export const detailIconActionBtnSuccess = cn(
  detailIconActionBase,
  "text-emerald-400/90 hover:bg-emerald-500/12 hover:text-emerald-300",
  "focus-visible:ring-emerald-500/30"
);

export const detailIconActionBtnDanger = cn(
  detailIconActionBase,
  "text-red-400/85 hover:bg-red-500/12 hover:text-red-300",
  "focus-visible:ring-red-400/25"
);

/** Groupe d’actions — léger fond bleu */
export const detailIconActionGroup = cn(
  "flex shrink-0 items-center gap-1 rounded-md",
  "bg-[#8ba4c7]/5 px-0.5 py-0.5"
);

/** Séparateurs de liste — fin, bleu-gris, sans blanc */
export const detailListDivider = cn(
  "[&>li:not(:last-child)]:border-b",
  "[&>li:not(:last-child)]:border-[#8ba4c7]/[0.055]"
);

export const detailSectionList = cn(detailListDivider);

export const detailSectionListRow = cn(
  "flex items-center gap-2.5 py-2.5 sm:gap-3",
  "transition duration-150 hover:bg-[#8ba4c7]/[0.03]"
);

export const detailSectionEmpty = cn(
  "mt-2 flex flex-col items-center justify-center gap-2 rounded-[9px]",
  "bg-black/15 px-3 py-4 text-center text-[11px] text-[#9aa3b0]/42"
);

export const detailSectionFilterRow = "mt-2.5 flex flex-wrap gap-1";

/** @deprecated utiliser detailSectionCard */
export const detailSection = cn(detailSectionCard, "min-h-0");

export const detailCard = detailSectionCard;

export const detailSectionTitle =
  "text-[13px] font-medium tracking-tight text-[#e8edf4]/88";

export const detailCardTitle = detailSectionTitle;

export const detailMuted =
  "text-[10px] font-medium uppercase tracking-wider text-[#9aa3b0]/42";

export const detailCaption = "text-[11px] text-[#9aa3b0]/48";

export const detailText = "text-sm leading-relaxed text-[#b8c0cc]/58";

export const detailTextStrong = "text-[14px] font-medium text-[#e8edf4]/88";

export const detailRowTitle = "text-[13px] font-medium text-[#e8edf4]/85";

export const detailRowTitleDone =
  "text-[13px] font-medium text-[#9aa3b0]/38 line-through";

export const detailLink =
  "text-[12px] font-medium text-[#b8c9dc]/62 transition hover:text-[#e8edf4]/88";

export const detailDivider = detailListDivider;

export const detailSubDivider = "mt-4 border-t border-[#8ba4c7]/[0.06] pt-4";

export const detailListItem = cn(
  "flex items-center gap-2.5 rounded-md px-1.5 py-1.5",
  "transition hover:bg-white/[0.025]"
);

export const detailEmptyCompact = cn(
  "flex flex-wrap items-center justify-between gap-3 rounded-lg",
  "border border-dashed border-white/[0.07] bg-white/[0.015] px-3.5 py-3"
);

export const detailEmpty = detailEmptyCompact;

export const detailEmptyBtn = cn(
  glassBtnPrimary,
  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
);

export const detailFilterChipActive =
  "rounded-md border border-[#8ba4c7]/12 bg-[#8ba4c7]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#b8c9dc]/85";

export const detailFilterChipInactive = cn(
  "rounded-md border border-transparent px-2.5 py-0.5 text-[10px] font-medium transition duration-200",
  "text-[#9aa3b0]/45",
  "hover:border-[#8ba4c7]/8 hover:bg-[#8ba4c7]/5 hover:text-[#b8c0cc]/60"
);

export const detailFilterChipActiveMissing =
  "rounded-md border border-amber-500/15 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-400/80";

export const detailFilterChipActiveUploaded =
  "rounded-md border border-[#8ba4c7]/15 bg-[#8ba4c7]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#a8bdd4]/85";

export const detailFilterChipActiveValidated =
  "rounded-md border border-emerald-500/15 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400/80";

export const detailThumb =
  "overflow-hidden rounded-md bg-white/[0.02]";

export const detailPhaseTrack = "h-[3px] overflow-hidden rounded-full bg-white/[0.05]";

export const detailStatBox =
  "rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2";

export const detailStatBoxSuccess =
  "rounded-lg border border-emerald-500/12 bg-emerald-500/[0.05] px-3 py-2";

export const detailStatBoxWarning =
  "rounded-lg border border-amber-500/12 bg-amber-500/[0.05] px-3 py-2";

/** Barre d'infos — ultra compacte */
export const detailInfoBar = cn(
  "rounded-xl border border-white/[0.05] bg-white/[0.02]",
  "grid grid-cols-2 gap-x-4 gap-y-2 px-3.5 py-2.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9"
);

export const detailInfoItem = "min-w-0";

export const detailInfoLabel = "text-[9px] font-medium uppercase tracking-wider text-white/28";

export const detailInfoValue = "mt-px truncate text-[12px] font-medium text-white/82";

export const detailBackLink =
  "inline-flex items-center gap-1.5 text-[12px] text-white/42 transition hover:text-white/75";

export const detailIconBtn = cn(
  glassBtnIcon,
  "h-8 w-8 shrink-0 border-transparent bg-white/[0.03] p-0",
  "hover:bg-white/[0.05]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-light/30"
);

export const detailBtnPrimary = cn(glassBtnPrimary, "h-8 gap-1.5 px-3.5 text-[12px]");

export const detailBtnSecondary = cn(
  glassBtnSecondary,
  "h-8 gap-1.5 border-transparent bg-white/[0.03] px-3 text-[12px]",
  "hover:bg-white/[0.05]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-light/25"
);

export const detailHeroActionBtn = cn(
  detailBtnSecondary,
  "px-2 sm:px-2.5"
);

export const detailHeroActionLabel = "hidden sm:inline";

export const detailBtnGhost = cn(
  "inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium",
  "text-white/42 transition hover:bg-white/[0.04] hover:text-white/72"
);

export const detailInput = glassInput;

export const detailNotesTextarea = cn(
  glassInput,
  "min-h-[320px] w-full resize-y text-[13px] leading-relaxed text-white/75 placeholder:text-white/28"
);

export const detailSelect = cn(
  glassSelect,
  "py-1.5 text-[12px] text-white/85"
);

export const detailPilotageSelect = cn(
  detailSelect,
  "h-7 w-full min-w-0 appearance-none rounded-lg",
  "border-transparent bg-white/[0.025] px-2.5 pr-7",
  "text-[12px] font-medium text-white/90",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
  "hover:bg-white/[0.04]",
  "focus:border-transparent focus:ring-1 focus:ring-[#8ba4c7]/10"
);

export const detailMenu = glassMenu;

export const detailMenuItem =
  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-white/90";

export const detailMenuItemDanger =
  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400/90 transition hover:bg-red-500/10";

/** Grille principale — galerie ~34% / fiche projet ~66% */
export const detailTopGrid =
  "grid grid-cols-1 gap-4 md:gap-4 lg:grid-cols-[minmax(0,34%)_minmax(0,66%)] lg:items-start";

export const detailTopVisualCol = "min-w-0";

export const detailTopInfoCol = "min-w-0";

export const detailHeaderBar = "flex items-center";

export const detailInfoPanel = cn(
  glassPanel,
  "flex h-full min-h-0 flex-col border-white/[0.05] p-4 sm:p-5"
);

export const detailInfoPanelToolbar = cn(
  "mb-4 flex flex-col gap-3 border-b border-white/[0.05] pb-4 sm:flex-row sm:items-start sm:justify-between"
);

export const detailInfoGroup = "space-y-2";

export const detailInfoGroupTitle =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-white/32";

export const detailInfoGroupGrid = "grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2";

export const detailInfoGroupRow = "min-w-0";

export const detailGroupDivider = "my-3.5 border-t border-white/[0.05]";

export const detailStatusBar = cn(
  "flex flex-col gap-1.5 sm:flex-row sm:gap-2"
);

export const detailStatusBarItem = cn(
  "flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg",
  "border border-white/[0.05] bg-white/[0.02] px-2.5 py-2 transition sm:px-3"
);

export const detailStatusBarItemInteractive =
  "cursor-pointer hover:border-white/[0.08] hover:bg-white/[0.035]";

export const detailStatusBarItemHead =
  "flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-wider text-white/28";

export const detailStatusBarIcon =
  "h-3 w-3 shrink-0 text-studio-light/40";

export const detailStatusBarValue =
  "truncate text-[12px] font-semibold text-white/86";

export const detailStatusBarLabel =
  "text-[8px] font-medium uppercase tracking-wider text-white/26";

export const detailOverviewShell = cn(
  glassPanel,
  "border-white/[0.05] p-3 sm:p-3.5"
);

/** @deprecated utiliser detailOverviewShell compact */
export const detailOverviewSection = "p-4 sm:p-5";

export const detailOverviewSummaryText =
  "line-clamp-3 text-[13px] leading-snug text-white/52";

/** Hero — en-tête hors card + corps dans card */
export const detailHeroHeader = "mb-2.5 space-y-2.5";

export const detailHeroShell = cn(
  "rounded-2xl border-0",
  "bg-gradient-to-b from-white/[0.03] via-[#0c0c10] to-[#09090c]",
  "p-3 shadow-[0_8px_32px_rgba(0,0,0,0.22)]",
  "sm:p-4"
);

export const detailHeroBody = cn(
  "relative z-[1] grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)] lg:items-stretch lg:gap-5"
);

export const detailHeroIntro = "space-y-1";

export const detailHeroIntroTop =
  "flex flex-wrap items-center justify-between gap-3";

export const detailHeroTitle =
  "text-[1.375rem] font-semibold leading-[1.12] tracking-[-0.025em] text-white/98 sm:text-[1.625rem]";

export const detailHeroDescription =
  "line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-white/45";

export const detailHeroMetaBadges =
  "mt-2 flex flex-wrap items-center gap-1.5";

export const detailHeroMetaBadge = cn(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1",
  "text-[10px] font-medium leading-none backdrop-blur-sm"
);

export const detailHeroMetaBadgeNeutral = cn(
  detailHeroMetaBadge,
  "border-[#8ba4c7]/16 bg-[#8ba4c7]/[0.07] text-[#b8cae4]/92"
);

export const detailHeroMetaBadgeAmber = cn(
  detailHeroMetaBadge,
  "border-amber-400/22 bg-amber-500/10 text-amber-300/90"
);

export const detailHeroMetaBadgeDeadline = cn(
  detailHeroMetaBadge,
  "border-white/[0.08] bg-white/[0.04] text-white/55"
);

export const detailHeroMainCol =
  "flex min-h-0 min-w-0 flex-col lg:h-full lg:justify-start";

export const detailHeroTitleBlock = "min-w-0 flex-1 space-y-1.5";

export const detailHeroActions =
  "flex shrink-0 flex-wrap items-center gap-2";

export const detailSummaryCardGrid =
  "grid h-full min-h-0 flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2 sm:items-stretch sm:gap-3";

/** Bandeau pilotage — résumé opérationnel premium */
export const detailPilotageStrip = cn(
  "flex flex-col gap-3 rounded-[14px] border-0",
  "bg-gradient-to-b from-white/[0.03] via-[#0c0c10] to-[#09090c]",
  "p-3 shadow-[0_6px_22px_rgba(0,0,0,0.18)]",
  "sm:flex-row sm:items-stretch sm:gap-0 sm:px-4 sm:py-3"
);

export const detailPilotageCell = cn(
  "flex min-w-0 flex-col justify-center gap-1 py-0.5",
  "sm:flex-1 sm:justify-center sm:px-3.5 sm:first:pl-0"
);

export const detailPilotageLabel =
  "block text-[9px] font-medium uppercase tracking-[0.11em] text-white/28";

export const detailPilotageValue =
  "text-[13px] font-medium leading-tight text-white/[0.93]";

export const detailPilotageProgressBlock = cn(
  "flex min-w-0 flex-col justify-center gap-1",
  "sm:w-[8.75rem] sm:shrink-0 sm:px-3.5 sm:last:pr-0"
);

export const detailPilotageProgressTrack =
  "h-[2px] overflow-hidden rounded-full bg-white/[0.035]";

export const detailPilotageProgressFill =
  "h-full rounded-full bg-gradient-to-r from-[#8ba4c7]/65 to-[#8ba4c7]/90 shadow-[0_0_10px_rgba(139,164,199,0.14)] transition-all duration-700 ease-out";

export const detailPilotageProgressValue =
  "text-[11px] tabular-nums font-semibold tracking-wide text-[#8ba4c7]/88";

export const detailSummaryCard = cn(
  "flex h-full w-full min-w-0 flex-col rounded-[14px] border-0",
  "bg-gradient-to-b from-white/[0.03] via-[#0e1014] to-[#0a0a0d]",
  "px-4 pt-3.5 pb-3",
  "shadow-[0_4px_18px_rgba(0,0,0,0.15)]"
);

export const detailSummaryCardTitle =
  "shrink-0 pb-2.5 text-[13px] font-semibold tracking-tight text-[#b8cae4]/90";

export const detailSummaryFieldGrid = "flex flex-1 flex-col gap-1 pt-2.5";

export const detailSummaryFieldRow =
  "grid grid-cols-[6rem_1fr] items-start gap-x-3 py-1";

export const detailSummaryFieldLabel =
  "pt-0.5 text-[11px] font-normal leading-[1.4] text-[#8ba4c7]/48";

export const detailSummaryFieldValueWrap =
  "flex min-w-0 items-start gap-2 pt-0.5";

export const detailSummaryFieldValue =
  "min-w-0 flex-1 text-[13px] font-medium leading-[1.4] text-white/[0.92]";

export const detailSummaryFieldValueMuted =
  "text-[13px] font-normal leading-[1.4] text-white/28";

export const detailSummaryFieldLink = cn(
  detailLink,
  "inline-block max-w-full truncate text-[13px] font-medium leading-[1.4] text-[#c5d4ea] underline-offset-2 hover:text-white hover:underline"
);

export const detailSummaryMapsIcon = cn(
  "inline-flex shrink-0 items-center justify-center rounded-md p-1",
  "text-[#9eb3d4]/70 transition",
  "hover:bg-white/[0.04] hover:text-[#c5d4ea]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ba4c7]/25"
);

export const detailHeroGalleryCol =
  "relative flex h-full min-w-0 flex-col items-stretch lg:h-full";

export const detailHeroGalleryHead = "relative mb-2.5 min-w-0 space-y-1";

export const detailHeroGalleryStack = "relative flex w-full min-w-0 flex-col gap-2";

export const detailHeroGalleryThumbRow =
  "flex min-w-0 items-end justify-between gap-2";

export const detailHeroGalleryFooter = "flex items-center justify-between pt-0.5";

export const detailHeroGalleryLink = cn(
  "inline-flex shrink-0 items-center justify-center gap-1 rounded-md border-0",
  "bg-white/[0.04] px-2 py-1",
  "text-[10px] font-medium text-white/50 transition",
  "hover:bg-white/[0.06] hover:text-white/70",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ba4c7]/20"
);

export const detailHeroGalleryCount =
  "text-[10px] font-medium tabular-nums text-white/30";

export const detailHeroThumbStack =
  "flex min-w-0 flex-1 flex-row items-center gap-1.5";

export const detailHeroThumbStackScroll =
  "overflow-x-auto pb-0.5 scrollbar-thin";

export const detailHeroMainImage = cn(
  "group/preview relative w-full shrink-0 overflow-hidden rounded-xl border-0",
  "h-[180px]",
  "shadow-[0_6px_24px_rgba(0,0,0,0.35)]",
  "transition",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ba4c7]/25",
  "sm:h-[220px] lg:h-[240px]"
);

export const detailHeroMainImageImg =
  "h-full w-full object-cover transition-opacity duration-300 ease-out";

export const detailHeroThumbBtn = cn(
  detailThumb,
  "h-12 w-12 shrink-0 overflow-hidden rounded-[10px] border-0 transition duration-200",
  "sm:h-14 sm:w-14 lg:h-[60px] lg:w-[60px]",
  "hover:brightness-[1.04]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ba4c7]/22",
  "active:scale-[0.98]"
);

export const detailHeroThumbActive = cn(
  "ring-2 ring-[#9eb3d4]/30",
  "shadow-[0_2px_10px_rgba(0,0,0,0.22)]",
  "brightness-[1.03]"
);

export const detailHeroProgressTrack = "h-[3px] overflow-hidden rounded-full bg-white/[0.06]";

export const detailTabsShell = cn(
  detailContentShell,
  "px-2 pt-1.5 sm:px-2.5"
);

export const detailTabsTrack =
  "flex min-w-max items-center gap-0.5 overflow-x-auto pb-1.5 scrollbar-none";

export const detailTabBtn = cn(
  "relative flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition",
  "text-white/38 hover:bg-white/[0.03] hover:text-white/62"
);

export const detailTabBtnActive = cn(
  "bg-studio-muted/30 text-studio-light/95 shadow-[inset_0_1px_0_rgba(139,164,199,0.1)]",
  "ring-1 ring-studio-light/12 hover:bg-studio-muted/35 hover:text-studio-light"
);

export const detailTabCount =
  "min-w-[0.95rem] rounded px-0.5 text-center text-[8px] tabular-nums leading-none text-white/22";

export const detailTabCountActive = "bg-studio-light/8 text-studio-light/50";

export const detailTabContent = "p-2.5 sm:p-3";

export const detailOverviewGrid =
  "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 lg:items-start";

export const detailOverviewCard = detailSectionCard;

export const detailOverviewCardHeader =
  "mb-2 flex items-center justify-between gap-2";

export const detailOverviewBlockTitle =
  "text-[10px] font-medium uppercase tracking-[0.11em] text-white/42";

export const detailOverviewCardFooter =
  "mt-2 border-t border-black/20 pt-2";

export const detailOverviewAddBtn = cn(
  "inline-flex shrink-0 items-center justify-center rounded-[6px] p-0.5",
  "text-white/28 transition hover:bg-white/[0.04] hover:text-[#8ba4c7]/65",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8ba4c7]/12"
);

export const detailPhaseStepRow =
  "flex gap-2 rounded-[7px] py-[3px] transition";

export const detailPhaseStepCurrent = cn(
  "-mx-1 bg-gradient-to-r from-[#8ba4c7]/6 to-transparent px-1.5"
);

export const detailPhaseStepConnector =
  "w-px min-h-[6px] flex-1 bg-gradient-to-b from-white/[0.05] to-transparent";

export const detailPhaseStepPercent =
  "w-7 shrink-0 text-right text-[9px] tabular-nums text-white/22";

export const detailPhaseStepPercentCurrent = "text-[#8ba4c7]/58";

export const detailOverviewDeadlineCard = cn(
  "rounded-[9px] bg-white/[0.018] px-2.5 py-2"
);

export const detailOverviewEmptyInline = cn(
  "flex items-center justify-center gap-1.5 rounded-[9px]",
  "bg-white/[0.012] px-2.5 py-3 text-[11px] text-white/30"
);

export const detailChecklistStat =
  "text-base font-semibold tabular-nums tracking-tight text-[#e8edf4]/85";

export const detailChecklistSub =
  "text-[10px] leading-none text-[#9aa3b0]/48";

export const detailChecklistMiniGrid = "mt-2 grid grid-cols-2 gap-1.5";

export const detailChecklistMiniStat = cn(
  "rounded-md bg-black/15 px-2 py-1.5 text-center"
);

export const detailChecklistMiniStatAdded = cn(
  detailChecklistMiniStat,
  "bg-[#8ba4c7]/8"
);

export const detailChecklistMiniStatMissing = cn(
  detailChecklistMiniStat,
  "bg-amber-500/8"
);

export const detailChecklistMiniStatValueAdded = "text-[#8ba4c7]/75";

export const detailChecklistMiniStatValueMissing = "text-amber-400/65";

export const detailChecklistMiniStatValue =
  "text-[13px] font-medium tabular-nums";

export const detailChecklistMiniStatLabel =
  "mt-0.5 text-[8px] uppercase tracking-wide text-[#9aa3b0]/42";

export const detailChecklistMeta =
  "mt-1.5 text-center text-[9px] text-white/28";

export const detailChecklistProgressTrack =
  "h-[3px] overflow-hidden rounded-full bg-black/40";

export const detailChecklistProgressFill =
  "h-full rounded-full bg-gradient-to-r from-[#8ba4c7]/35 via-[#8ba4c7]/55 to-[#8ba4c7]/45 transition-all duration-500";

export const detailProgressBarTrack = detailChecklistProgressTrack;

export const detailProgressBarFill = detailChecklistProgressFill;

/** Onglet checklist — mise en page simple + accents bleu discrets */
export const detailChecklistSection = "flex min-w-0 flex-col";

export const detailChecklistHeader = cn(
  "flex flex-col gap-2 border-b border-[#8ba4c7]/10 pb-2",
  "sm:flex-row sm:items-center sm:justify-between"
);

/** Titre + filtres / recherche sur la même ligne */
export const detailSectionHeaderLead =
  "flex min-w-0 flex-1 flex-wrap items-center gap-2";

export const detailChecklistTitle = cn(
  "border-l-2 border-[#8ba4c7]/45 pl-2.5",
  "text-[14px] font-medium text-[#e8edf4]"
);

export const detailChecklistSubtitle =
  "text-[11px] text-[#8ba4c7]/42";

export const detailChecklistRatio =
  "shrink-0 text-base font-semibold tabular-nums";

export const detailChecklistRatioAdded = "text-[#8ba4c7]";

export const detailChecklistRatioSep = "text-[#8ba4c7]/35";

export const detailChecklistRatioTotal = "text-[#8ba4c7]/75";

export const detailChecklistFilterRow =
  "mt-3 flex flex-wrap items-center gap-x-3 gap-y-1";

/** Barre recherche + Filtres (alignée listes globales) */
export const detailToolbarRow =
  "mt-3 flex flex-wrap items-center gap-2";

export const detailChecklistFilterBtn =
  "text-[11px] transition-colors duration-150";

export const detailChecklistFilterActive = "font-medium text-[#b8cfe8]/95";

export const detailChecklistFilterInactive =
  "text-[#9aa3b0]/50 hover:text-[#8ba4c7]/70";

export const detailChecklistFilterActiveMissing = "font-medium text-amber-400/90";

export const detailChecklistFilterActiveUploaded = "font-medium text-[#a8bdd4]/95";

export const detailChecklistFilterActiveValidated = "font-medium text-emerald-400/90";

export const detailChecklistList = cn("mt-3", detailListDivider);

export const detailChecklistItem = cn(
  "flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:gap-4",
  "transition-colors duration-150",
  "hover:bg-[#8ba4c7]/[0.035] sm:-mx-1 sm:rounded-md sm:px-1"
);

export const detailChecklistItemTitle =
  "text-[13px] font-medium text-[#e8edf4]/92";

export const detailChecklistStatusBadge = "text-[10px] font-medium";

export const detailChecklistStatusMissing = "text-amber-400/85";

export const detailChecklistStatusUploaded = "text-[#8ba4c7]/85";

export const detailChecklistStatusValidated = "text-emerald-400/85";

export const detailChecklistDate = "mt-0.5 text-[10px] text-[#8ba4c7]/40";

export const detailChecklistDateUploaded = "text-[#8ba4c7]/50";

export const detailChecklistDateValidated = "text-emerald-400/50";

export const detailChecklistDateMissing = "text-amber-400/45";

export const detailChecklistNotes =
  "mt-0.5 text-[11px] text-[#9aa3b0]/40";

export const detailChecklistFooterNote =
  "mt-4 flex items-center gap-1.5 text-[10px] text-[#9aa3b0]/40";

export const detailChecklistEmpty =
  "mt-4 py-6 text-center text-[11px] text-[#8ba4c7]/38";

export const detailMediaThumb = cn(
  "block h-12 w-16 shrink-0 overflow-hidden rounded-md bg-[#8ba4c7]/8",
  "ring-1 ring-inset ring-[#8ba4c7]/10 transition hover:ring-[#8ba4c7]/22"
);

export const detailFinanceStatGrid =
  "mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3";

export const detailFinanceStatLabel = "text-[10px] text-[#8ba4c7]/45";

export const detailFinanceStatValue =
  "mt-0.5 text-[15px] font-semibold tabular-nums text-[#c5d4e8]/92";

export const detailFinanceStatValueSuccess = "text-emerald-400/85";

export const detailFinanceStatValueWarning = "text-amber-400/85";

/** Notes projet — aligné checklist */
export const detailNotesSection = detailChecklistSection;

export const detailNotesHeader = detailChecklistHeader;

export const detailNotesTitle = detailChecklistTitle;

export const detailNotesHint = "text-[11px] text-[#9aa3b0]/50";

export const detailNotesComposer = "mt-3 space-y-2";

export const detailNotesTitleInput = cn(
  detailInput,
  "h-8 w-full text-[12px] text-[#e8edf4]/90 placeholder:text-[#9aa3b0]/40"
);

export const detailNotesBodyInput = cn(
  detailInput,
  "min-h-[88px] w-full resize-y text-[13px] leading-relaxed text-[#e8edf4]/88 placeholder:text-[#9aa3b0]/38"
);

export const detailNotesSearchInput = cn(
  detailInput,
  "h-8 w-full max-w-xs text-[12px] placeholder:text-[#9aa3b0]/40",
  "border-[#8ba4c7]/12 focus:border-[#8ba4c7]/25 focus:ring-[#8ba4c7]/15"
);

export const detailNotesItem = cn(
  detailChecklistItem,
  "items-start sm:items-start"
);

export const detailNotesItemTitle =
  "text-[13px] font-medium text-[#e8edf4]/92";

export const detailNotesItemPreview =
  "mt-1 line-clamp-2 whitespace-pre-wrap text-[12px] leading-relaxed text-[#9aa3b0]/55";

export const detailNotesItemMeta = "mt-1 text-[10px] text-[#9aa3b0]/42";

export const detailNotesPinnedLabel =
  "text-[9px] font-medium uppercase tracking-wide text-amber-400/75";

export const detailVisualShell = cn(
  "relative overflow-hidden rounded-xl border border-white/[0.06]",
  "bg-white/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.28)]"
);

export const detailInfoGrid =
  "grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-2";
