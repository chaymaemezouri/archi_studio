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
  "border border-[color:var(--pd-shell-border)]",
  "bg-[color:var(--pd-shell-bg)]",
  "shadow-[var(--pd-shell-shadow)]"
);

/** Zone principale — sidebar projet + contenu */
export const detailMainZone = cn(
  "flex flex-col gap-2 p-2 sm:p-2.5",
  "lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start lg:gap-3 lg:p-2.5"
);

export const detailSectionContent = cn(
  "min-w-0 flex-1 rounded-[10px]",
  "border border-[color:var(--pd-section-border)]",
  "bg-[color:var(--pd-section-bg)]",
  "shadow-[var(--pd-section-shadow)]",
  "p-2 sm:p-2.5"
);

export const detailSidebarShell = cn(
  "hidden lg:flex lg:flex-col lg:sticky lg:top-3 lg:self-start",
  "w-[200px] shrink-0",
  "max-h-[calc(100vh-6rem)] overflow-y-auto px-1 py-1 scrollbar-thin"
);

export const detailSidebarTitle =
  "mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--pd-text-label)]";

export const detailSidebarNav = "flex flex-col gap-0.5";

export const detailSidebarItem = cn(
  "grid w-full grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-x-2",
  "rounded-lg px-1.5 py-[6px] text-left transition duration-150",
  "text-[12px] font-normal text-[color:var(--pd-text-sidebar)]",
  "hover:bg-[color:var(--pd-accent-hover)] hover:text-[color:var(--pd-text-sidebar-hover)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pd-accent-ring)]"
);

export const detailSidebarItemActive = cn(
  "bg-[color:var(--pd-accent-soft)] font-medium text-[color:var(--pd-text-sidebar-active)]",
  "shadow-[inset_3px_0_0_0_var(--pd-sidebar-active-bar)]",
  "hover:bg-[color:var(--pd-accent-soft)] hover:text-[color:var(--pd-text-sidebar-active)]"
);

export const detailSidebarIconWrap =
  "flex h-[22px] w-[22px] items-center justify-center justify-self-center rounded-md transition-colors";

export const detailSidebarIconWrapActive = "bg-[color:var(--pd-accent-soft)]";

export const detailSidebarIcon = "h-3.5 w-3.5 shrink-0 text-[color:var(--pd-text-label)]";

export const detailSidebarIconActive = "text-[color:var(--pd-text-link)]";

export const detailSidebarLabel = "min-w-0 truncate leading-snug";

export const detailSidebarCount = cn(
  "shrink-0 min-w-[1.15rem] rounded-md px-1 py-0.5 text-center",
  "text-[8px] font-medium tabular-nums leading-none",
  "bg-[color:var(--pd-accent-soft)] text-[color:var(--pd-text-studio)]"
);

export const detailSidebarCountActive =
  "bg-[color:var(--pd-accent-soft)] text-[color:var(--pd-sidebar-count-active)]";

export const detailSidebarMobileBar = cn(
  "flex w-full items-center gap-2 rounded-lg px-1 py-2",
  "transition hover:opacity-90",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pd-accent-ring)]"
);

export const detailSidebarMobileOverlay =
  "fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden";

export const detailSidebarMobilePanel = cn(
  "fixed inset-x-0 bottom-0 z-50 max-h-[72vh] overflow-y-auto rounded-t-2xl",
  "border-t border-[color:var(--pd-shell-border)] bg-[color:var(--pd-mobile-panel-bg)] backdrop-blur-md",
  "p-4 pb-6 shadow-[0_-12px_40px_rgba(0,0,0,0.25)]",
  "lg:hidden"
);

export const detailSidebarMobileTitle =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--pd-text-label)]";

/** Section — style unifié des sous-pages projet */
export const detailSectionCard = cn(
  "flex flex-col rounded-[10px]",
  "border border-[color:var(--pd-section-border)]",
  "bg-[color:var(--pd-card-bg)]",
  "p-3 sm:p-3.5"
);

export const detailSectionHeaderRule =
  "mb-2 border-b border-[color:var(--pd-border)] pb-2";

const detailIconActionBase = cn(
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
  "transition duration-150",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
  "disabled:pointer-events-none disabled:opacity-35"
);

export const detailIconActionBtn = cn(
  detailIconActionBase,
  "bg-[color:var(--icon-default-bg)] text-[color:var(--icon-default-color)]",
  "hover:bg-[color:var(--icon-default-hover-bg)] hover:text-[color:var(--icon-default-hover-color)]",
  "focus-visible:ring-[color:var(--pd-accent-ring)]"
);

export const detailIconActionBtnView = cn(
  detailIconActionBase,
  "bg-[color:var(--icon-view-bg)] text-[color:var(--icon-view-color)]",
  "hover:bg-[color:var(--icon-view-hover-bg)] hover:text-[color:var(--icon-view-hover-color)]",
  "focus-visible:ring-[color:var(--pd-accent-ring)]"
);

export const detailIconActionBtnDownload = cn(
  detailIconActionBase,
  "bg-[color:var(--icon-download-bg)] text-[color:var(--icon-download-color)]",
  "hover:bg-[color:var(--icon-download-hover-bg)] hover:text-[color:var(--icon-download-hover-color)]",
  "focus-visible:ring-[color:var(--pd-accent-ring)]"
);

export const detailIconActionBtnUpload = cn(
  detailIconActionBase,
  "bg-[color:var(--icon-upload-bg)] text-[color:var(--icon-upload-color)]",
  "hover:bg-[color:var(--icon-upload-hover-bg)] hover:text-[color:var(--icon-upload-hover-color)]",
  "focus-visible:ring-amber-500/25"
);

export const detailIconActionBtnNotes = cn(
  detailIconActionBase,
  "bg-[color:var(--icon-notes-bg)] text-[color:var(--icon-notes-color)]",
  "hover:bg-[color:var(--icon-notes-hover-bg)] hover:text-[color:var(--icon-notes-hover-color)]",
  "focus-visible:ring-[color:var(--pd-accent-ring)]"
);

export const detailIconActionBtnSuccess = cn(
  detailIconActionBase,
  "bg-[color:var(--icon-success-bg)] text-[color:var(--icon-success-color)]",
  "hover:bg-[color:var(--icon-success-hover-bg)] hover:text-[color:var(--icon-success-hover-color)]",
  "focus-visible:ring-emerald-500/30"
);

export const detailIconActionBtnDanger = cn(
  detailIconActionBase,
  "bg-[color:var(--icon-danger-bg)] text-[color:var(--icon-danger-color)]",
  "hover:bg-[color:var(--icon-danger-hover-bg)] hover:text-[color:var(--icon-danger-hover-color)]",
  "focus-visible:ring-red-400/25"
);

/** Groupe d’actions — fond léger, icônes colorées */
export const detailIconActionGroup = cn(
  "flex shrink-0 items-center gap-1 rounded-md border border-[color:var(--icon-group-border)]",
  "bg-[color:var(--icon-group-bg)] px-0.5 py-0.5"
);

/** Séparateurs de liste — fin, bleu-gris, sans blanc */
export const detailListDivider = cn(
  "[&>li:not(:last-child)]:border-b",
  "[&>li:not(:last-child)]:border-[color:var(--pd-list-divider)]"
);

export const detailSectionList = cn(detailListDivider);

export const detailSectionListRow = cn(
  "flex items-center gap-2.5 py-2.5 sm:gap-3",
  "transition duration-150 hover:bg-[color:var(--pd-hover-row)]"
);

export const detailSectionEmpty = cn(
  "mt-2 flex flex-col items-center justify-center gap-2 rounded-[9px]",
  "border border-dashed border-[color:var(--pd-empty-border)]",
  "bg-[color:var(--pd-empty-bg)] px-3 py-4 text-center text-[11px] text-[color:var(--pd-text-empty)]"
);

export const detailSectionFilterRow = "mt-2.5 flex flex-wrap gap-1";

/** @deprecated utiliser detailSectionCard */
export const detailSection = cn(detailSectionCard, "min-h-0");

export const detailCard = detailSectionCard;

export const detailSectionTitle =
  "text-[13px] font-semibold tracking-tight text-[color:var(--pd-text-heading)]";

export const detailCardTitle = detailSectionTitle;

export const detailMuted =
  "text-[10px] font-medium uppercase tracking-wider text-[color:var(--pd-text-label)]";

export const detailCaption = "text-[11px] text-[color:var(--pd-text-muted)]";

export const detailText = "text-sm leading-relaxed text-[color:var(--pd-text-secondary)]";

export const detailTextStrong = "text-[14px] font-medium text-[color:var(--pd-text-heading)]/88";

export const detailRowTitle = "text-[13px] font-medium text-[color:var(--pd-text-heading)]/85";

export const detailRowTitleDone =
  "text-[13px] font-medium text-[color:var(--pd-text-faint)] line-through";

export const detailLink =
  "text-[12px] font-medium text-[color:var(--pd-text-link)] transition hover:text-[color:var(--pd-link-hover)]";

export const detailLinkHover = "hover:text-[color:var(--pd-link-hover)]";

export const detailDivider = detailListDivider;

export const detailSubDivider = "mt-4 border-t border-[color:var(--pd-border)] pt-4";

export const detailListItem = cn(
  "flex items-center gap-2.5 rounded-md px-1.5 py-1.5",
  "transition hover:bg-white/[0.025]"
);

export const detailEmptyCompact = cn(
  "flex flex-wrap items-center justify-between gap-3 rounded-lg",
  "border border-dashed border-white/[0.07] bg-[color:var(--pd-card-bg)] px-3.5 py-3"
);

export const detailEmpty = detailEmptyCompact;

export const detailEmptyBtn = cn(
  glassBtnPrimary,
  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
);

export const detailFilterChipActive =
  "rounded-md border border-[color:var(--pd-chip-active-border)] bg-[color:var(--pd-chip-active-bg)] px-2.5 py-0.5 text-[10px] font-medium text-[color:var(--pd-chip-active-text)]";

export const detailFilterChipInactive = cn(
  "rounded-md border border-transparent px-2.5 py-0.5 text-[10px] font-medium transition duration-200",
  "text-[color:var(--pd-chip-inactive-text)]",
  "hover:border-[color:var(--pd-chip-active-border)] hover:bg-[color:var(--pd-chip-active-bg)] hover:text-[color:var(--pd-chip-active-text)]"
);

export const detailFilterChipActiveMissing =
  "rounded-md border border-[color:var(--pd-badge-amber-border)] bg-[color:var(--pd-badge-amber-bg)] px-2.5 py-0.5 text-[10px] font-medium text-[color:var(--pd-badge-amber-text)]";

export const detailFilterChipActiveUploaded =
  "rounded-md border border-[color:var(--pd-chip-active-border)] bg-[color:var(--pd-chip-active-bg)] px-2.5 py-0.5 text-[10px] font-medium text-[color:var(--pd-chip-active-text)]";

export const detailFilterChipActiveValidated =
  "rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-[color:var(--pd-status-success)]";

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

export const detailInfoLabel = "text-[9px] font-medium uppercase tracking-wider text-[color:var(--pd-text-faint)]";

export const detailInfoValue =
  "mt-px truncate text-[12px] font-medium text-[color:var(--pd-text-body)]";

export const detailBackLink =
  "inline-flex items-center gap-1.5 text-[12px] text-[color:var(--pd-text-muted)] transition hover:text-[color:var(--pd-text-primary)]";

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
  "text-[color:var(--pd-text-muted)] transition hover:bg-[color:var(--pd-hover-row)] hover:text-[color:var(--pd-text-primary)]"
);

export const detailInput = glassInput;

export const detailNotesTextarea = cn(
  glassInput,
  "min-h-[320px] w-full resize-y text-[13px] leading-relaxed text-[color:var(--pd-text-body)] placeholder:text-[color:var(--pd-text-faint)]"
);

export const detailSelect = cn(
  glassSelect,
  "py-1.5 text-[12px] text-[color:var(--pd-control-text)]"
);

export const detailPilotageSelect = cn(
  detailSelect,
  "h-7 w-full min-w-0 appearance-none rounded-lg",
  "border border-[color:var(--pd-surface-border)] bg-[color:var(--pd-control-bg)] px-2.5 pr-7",
  "text-[12px] font-medium text-[color:var(--pd-control-text)]",
  "hover:bg-[color:var(--pd-hover-row)]",
  "focus:border-[color:var(--pd-accent)] focus:ring-1 focus:ring-[color:var(--pd-accent-ring)]"
);

export const detailMenu = glassMenu;

export const detailMenuItem =
  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[color:var(--pd-text-secondary)] transition hover:bg-[color:var(--pd-hover-row)] hover:text-[color:var(--pd-text-primary)]";

export const detailMenuItemActive =
  "bg-[color:var(--pd-accent-soft)] text-[color:var(--pd-text-primary)]";

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
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--pd-text-label)]";

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
  "cursor-pointer hover:border-white/[0.08] hover:bg-[color:var(--pd-progress-track)]";

export const detailStatusBarItemHead =
  "flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-wider text-[color:var(--pd-text-faint)]";

export const detailStatusBarIcon =
  "h-3 w-3 shrink-0 text-studio-light/40";

export const detailStatusBarValue =
  "truncate text-[12px] font-semibold text-[color:var(--pd-text-body)]";

export const detailStatusBarLabel =
  "text-[8px] font-medium uppercase tracking-wider text-[color:var(--pd-text-faint)]";

export const detailOverviewShell = cn(
  glassPanel,
  "border-white/[0.05] p-3 sm:p-3.5"
);

/** @deprecated utiliser detailOverviewShell compact */
export const detailOverviewSection = "p-4 sm:p-5";

export const detailOverviewSummaryText =
  "line-clamp-3 text-[13px] leading-snug text-[color:var(--pd-text-secondary)]";

/** Hero — en-tête hors card + corps dans card */
export const detailHeroHeader = "mb-2.5 space-y-2.5";

export const detailHeroShell = cn(
  "rounded-2xl border border-[color:var(--pd-hero-border)]",
  "bg-gradient-to-b from-[color:var(--pd-hero-from)] via-[color:var(--pd-hero-via)] to-[color:var(--pd-hero-to)]",
  "p-3 shadow-[var(--pd-hero-shadow)]",
  "sm:p-4"
);

export const detailHeroBody = cn(
  "relative z-[1] grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)] lg:items-stretch lg:gap-5"
);

export const detailHeroIntro = "space-y-1";

export const detailHeroIntroTop =
  "flex flex-wrap items-center justify-between gap-3";

export const detailHeroTitle =
  "text-[1.375rem] font-semibold leading-[1.12] tracking-[-0.025em] text-[color:var(--pd-text-primary)] sm:text-[1.625rem]";

export const detailHeroDescription =
  "line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-[color:var(--pd-text-muted)]";

export const detailHeroMetaBadges =
  "mt-2 flex flex-wrap items-center gap-1.5";

export const detailHeroMetaBadge = cn(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1",
  "text-[10px] font-medium leading-none backdrop-blur-sm"
);

export const detailHeroMetaBadgeNeutral = cn(
  detailHeroMetaBadge,
  "border-[color:var(--pd-badge-neutral-border)] bg-[color:var(--pd-badge-neutral-bg)] text-[color:var(--pd-badge-neutral-text)]"
);

export const detailHeroMetaBadgeAmber = cn(
  detailHeroMetaBadge,
  "border-[color:var(--pd-badge-amber-border)] bg-[color:var(--pd-badge-amber-bg)] text-[color:var(--pd-badge-amber-text)]"
);

export const detailHeroMetaBadgeDeadline = cn(
  detailHeroMetaBadge,
  "border-[color:var(--pd-badge-deadline-border)] bg-[color:var(--pd-badge-deadline-bg)] text-[color:var(--pd-text-secondary)]"
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
  "flex flex-col gap-3 rounded-[14px] border border-[color:var(--pd-hero-border)]",
  "bg-gradient-to-b from-[color:var(--pd-hero-from)] via-[color:var(--pd-hero-via)] to-[color:var(--pd-hero-to)]",
  "p-3 shadow-[var(--pd-pilotage-shadow)]",
  "sm:flex-row sm:items-stretch sm:gap-0 sm:px-4 sm:py-3"
);

export const detailPilotageCell = cn(
  "flex min-w-0 flex-col justify-center gap-1 py-0.5",
  "sm:flex-1 sm:justify-center sm:px-3.5 sm:first:pl-0"
);

export const detailPilotageLabel =
  "block text-[9px] font-medium uppercase tracking-[0.11em] text-[color:var(--pd-text-faint)]";

export const detailPilotageValue =
  "text-[13px] font-medium leading-tight text-[color:var(--pd-text-body)]";

export const detailPilotageProgressBlock = cn(
  "flex min-w-0 flex-col justify-center gap-1",
  "sm:w-[8.75rem] sm:shrink-0 sm:px-3.5 sm:last:pr-0"
);

export const detailPilotageProgressTrack =
  "h-[2px] overflow-hidden rounded-full bg-[color:var(--pd-progress-track)]";

export const detailPilotageProgressFill =
  "h-full rounded-full bg-gradient-to-r from-[color:var(--pd-progress-fill-from)] to-[color:var(--pd-progress-fill-to)] transition-all duration-700 ease-out";

export const detailPilotageProgressValue =
  "text-[11px] tabular-nums font-semibold tracking-wide text-[color:var(--pd-accent)]";

export const detailPilotageDeadlineValue =
  "text-[color:var(--pd-deadline-text)]";

export const detailPilotageDeadlineIcon =
  "text-[color:var(--pd-deadline-icon)]";

export const detailPilotageChevron =
  "text-[color:var(--pd-icon-muted)]";

export const detailSummaryCard = cn(
  "flex h-full w-full min-w-0 flex-col rounded-[14px] border border-[color:var(--pd-hero-border)]",
  "bg-gradient-to-b from-[color:var(--pd-card-from)] via-[color:var(--pd-card-via)] to-[color:var(--pd-card-to)]",
  "px-4 pt-3.5 pb-3",
  "shadow-[var(--pd-card-shadow)]"
);

export const detailSummaryCardTitle =
  "shrink-0 pb-2.5 text-[13px] font-semibold tracking-tight text-[color:var(--pd-text-studio)]";

export const detailSummaryFieldGrid = "flex flex-1 flex-col gap-1 pt-2.5";

export const detailSummaryFieldRow =
  "grid grid-cols-[6rem_1fr] items-start gap-x-3 py-1";

export const detailSummaryFieldLabel =
  "pt-0.5 text-[11px] font-normal leading-[1.4] text-[color:var(--pd-text-label)]";

export const detailSummaryFieldValueWrap =
  "flex min-w-0 items-start gap-2 pt-0.5";

export const detailSummaryFieldValue =
  "min-w-0 flex-1 text-[13px] font-medium leading-[1.4] text-[color:var(--pd-text-body)]";

export const detailSummaryFieldValueMuted =
  "text-[13px] font-normal leading-[1.4] text-[color:var(--pd-text-faint)]";

export const detailSummaryFieldLink = cn(
  detailLink,
  "inline-block max-w-full truncate text-[13px] font-medium leading-[1.4] text-[color:var(--pd-text-link)] underline-offset-2 hover:text-[color:var(--pd-text-primary)] hover:underline"
);

export const detailSummaryMapsIcon = cn(
  "inline-flex shrink-0 items-center justify-center rounded-md p-1",
  "text-[color:var(--pd-maps-icon)] transition",
  "hover:bg-[color:var(--pd-hover-row)] hover:text-[color:var(--pd-text-link)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pd-accent-ring)]"
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
  "text-[10px] font-medium text-[color:var(--pd-text-muted)] transition",
  "hover:bg-white/[0.06] hover:text-[color:var(--pd-text-secondary)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pd-accent-ring)]"
);

export const detailHeroGalleryCount =
  "text-[10px] font-medium tabular-nums text-[color:var(--pd-text-faint)]";

export const detailHeroThumbStack =
  "flex min-w-0 flex-1 flex-row items-center gap-1.5";

export const detailHeroThumbStackScroll =
  "overflow-x-auto pb-0.5 scrollbar-thin";

export const detailHeroMainImage = cn(
  "group/preview relative w-full shrink-0 overflow-hidden rounded-xl border-0",
  "h-[180px]",
  "shadow-[0_6px_24px_rgba(0,0,0,0.35)]",
  "transition",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pd-accent-ring)]",
  "sm:h-[220px] lg:h-[240px]"
);

export const detailHeroMainImageImg =
  "h-full w-full object-cover transition-opacity duration-300 ease-out";

export const detailHeroThumbBtn = cn(
  detailThumb,
  "h-12 w-12 shrink-0 overflow-hidden rounded-[10px] border-0 transition duration-200",
  "sm:h-14 sm:w-14 lg:h-[60px] lg:w-[60px]",
  "hover:brightness-[1.04]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pd-accent-ring)]",
  "active:scale-[0.98]"
);

export const detailHeroThumbActive = cn(
  "ring-2 ring-[color:var(--pd-accent-ring)]",
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
  "text-[color:var(--pd-text-faint)] hover:bg-white/[0.03] hover:text-[color:var(--pd-text-primary)]/62"
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
  "text-[color:var(--pd-text-faint)] transition hover:bg-white/[0.04] hover:text-[color:var(--pd-text-label)]",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--pd-accent-ring)]"
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

export const detailPhaseStepPercentCurrent = "text-[color:var(--pd-accent)]";

export const detailOverviewDeadlineCard = cn(
  "rounded-[9px] bg-white/[0.018] px-2.5 py-2"
);

export const detailOverviewEmptyInline = cn(
  "flex items-center justify-center gap-1.5 rounded-[9px]",
  "bg-[color:var(--pd-section-bg)] px-2.5 py-3 text-[11px] text-[color:var(--pd-text-faint)]"
);

export const detailChecklistStat =
  "text-base font-semibold tabular-nums tracking-tight text-[color:var(--pd-text-heading)]/85";

export const detailChecklistSub =
  "text-[10px] leading-none text-[color:var(--pd-text-muted)]";

export const detailChecklistMiniGrid = "mt-2 grid grid-cols-2 gap-1.5";

export const detailChecklistMiniStat = cn(
  "rounded-md bg-[color:var(--pd-empty-bg)] px-2 py-1.5 text-center"
);

export const detailChecklistMiniStatAdded = cn(
  detailChecklistMiniStat,
  "bg-[color:var(--pd-chip-active-bg)]"
);

export const detailChecklistMiniStatMissing = cn(
  detailChecklistMiniStat,
  "bg-[color:var(--pd-badge-amber-bg)]"
);

export const detailChecklistMiniStatValueAdded = "text-[color:var(--pd-status-accent)]";

export const detailChecklistMiniStatValueMissing = "text-[color:var(--pd-status-warning)]";

export const detailChecklistMiniStatValue =
  "text-[13px] font-medium tabular-nums";

export const detailChecklistMiniStatLabel =
  "mt-0.5 text-[8px] uppercase tracking-wide text-[color:var(--pd-text-label)]";

export const detailChecklistMeta =
  "mt-1.5 text-center text-[9px] text-[color:var(--pd-text-faint)]";

export const detailChecklistProgressTrack =
  "h-[3px] overflow-hidden rounded-full bg-black/40";

export const detailChecklistProgressFill =
  "h-full rounded-full bg-gradient-to-r from-[color:var(--pd-progress-fill-from)] via-[color:var(--pd-accent)] to-[color:var(--pd-progress-fill-to)] transition-all duration-500";

export const detailProgressBarTrack = detailChecklistProgressTrack;

export const detailProgressBarFill = detailChecklistProgressFill;

/** Onglet checklist — mise en page simple + accents bleu discrets */
export const detailChecklistSection = "flex min-w-0 flex-col";

export const detailChecklistHeader = cn(
  "flex flex-col gap-2 border-b border-[color:var(--pd-border)] pb-2",
  "sm:flex-row sm:items-center sm:justify-between"
);

/** Titre + filtres / recherche sur la même ligne */
export const detailSectionHeaderLead =
  "flex min-w-0 flex-1 flex-wrap items-center gap-2";

export const detailChecklistTitle = cn(
  "border-l-2 border-[color:var(--pd-accent)] pl-2.5",
  "text-[14px] font-medium text-[color:var(--pd-text-heading)]"
);

export const detailChecklistSubtitle =
  "text-[11px] text-[color:var(--pd-text-label)]";

export const detailChecklistRatio =
  "shrink-0 text-base font-semibold tabular-nums";

export const detailChecklistRatioAdded = "text-[color:var(--pd-accent)]";

export const detailChecklistRatioSep = "text-[color:var(--pd-text-faint)]";

export const detailChecklistRatioTotal = "text-[color:var(--pd-status-accent)]";

export const detailChecklistFilterRow =
  "mt-3 flex flex-wrap items-center gap-x-3 gap-y-1";

/** Barre recherche + Filtres (alignée listes globales) */
export const detailToolbarRow =
  "mt-3 flex flex-wrap items-center gap-2";

export const detailChecklistFilterBtn =
  "text-[11px] transition-colors duration-150";

export const detailChecklistFilterActive = "font-medium text-[color:var(--pd-chip-active-text)]";

export const detailChecklistFilterInactive =
  "text-[color:var(--pd-chip-inactive-text)] hover:text-[color:var(--pd-text-label)]";

export const detailChecklistFilterActiveMissing =
  "font-medium text-[color:var(--pd-status-warning)]";

export const detailChecklistFilterActiveUploaded =
  "font-medium text-[color:var(--pd-status-accent)]";

export const detailChecklistFilterActiveValidated =
  "font-medium text-[color:var(--pd-status-success)]";

export const detailChecklistList = cn("mt-3", detailListDivider);

export const detailChecklistItem = cn(
  "flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:gap-4",
  "transition-colors duration-150",
  "hover:bg-[color:var(--pd-hover-row)] sm:-mx-1 sm:rounded-md sm:px-1"
);

export const detailChecklistItemTitle =
  "text-[13px] font-medium text-[color:var(--pd-text-heading)]/92";

export const detailChecklistStatusBadge = "text-[10px] font-medium";

export const detailChecklistStatusMissing = "text-[color:var(--pd-status-warning)]";

export const detailChecklistStatusUploaded = "text-[color:var(--pd-status-accent)]";

export const detailChecklistStatusValidated = "text-[color:var(--pd-status-success)]";

export const detailChecklistDate = "mt-0.5 text-[10px] text-[color:var(--pd-text-label)]";

export const detailChecklistDateUploaded = "text-[color:var(--pd-status-accent)] opacity-70";

export const detailChecklistDateValidated = "text-[color:var(--pd-status-success)] opacity-70";

export const detailChecklistDateMissing = "text-[color:var(--pd-status-warning)] opacity-70";

export const detailChecklistNotes =
  "mt-0.5 text-[11px] text-[color:var(--pd-text-muted)]";

export const detailChecklistFooterNote =
  "mt-4 flex items-center gap-1.5 text-[10px] text-[color:var(--pd-text-muted)]";

export const detailChecklistEmpty = cn(
  "mt-4 rounded-lg border border-dashed border-[color:var(--pd-empty-border)]",
  "bg-[color:var(--pd-empty-bg)] px-4 py-8 text-center text-[12px] text-[color:var(--pd-text-empty)]"
);

export const detailMediaThumb = cn(
  "block h-12 w-16 shrink-0 overflow-hidden rounded-md bg-[color:var(--pd-accent-soft)]",
  "ring-1 ring-inset ring-[color:var(--pd-border)] transition hover:ring-[color:var(--pd-accent)]"
);

export const detailFinanceStatGrid =
  "mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3";

export const detailFinanceStatLabel =
  "text-[10px] font-medium uppercase tracking-wide text-[color:var(--pd-text-label)]";

export const detailFinanceStatValue =
  "mt-0.5 text-[15px] font-semibold tabular-nums text-[color:var(--pd-finance-value)]";

export const detailFinanceStatValueSuccess = "text-[color:var(--pd-finance-success)]";

export const detailFinanceStatValueWarning = "text-[color:var(--pd-finance-warning)]";

/** Notes projet — aligné checklist */
export const detailNotesSection = detailChecklistSection;

export const detailNotesHeader = detailChecklistHeader;

export const detailNotesTitle = detailChecklistTitle;

export const detailNotesHint = "text-[11px] text-[color:var(--pd-text-muted)]";

export const detailNotesComposer = "mt-3 space-y-2";

export const detailNotesTitleInput = cn(
  detailInput,
  "h-8 w-full text-[12px] text-[color:var(--pd-text-heading)]/90 placeholder:text-[color:var(--pd-text-faint)]"
);

export const detailNotesBodyInput = cn(
  detailInput,
  "min-h-[88px] w-full resize-y text-[13px] leading-relaxed text-[color:var(--pd-text-heading)]/88 placeholder:text-[color:var(--pd-text-faint)]"
);

export const detailNotesSearchInput = cn(
  detailInput,
  "h-8 w-full max-w-xs text-[12px] placeholder:text-[color:var(--pd-text-faint)]",
  "border-[color:var(--pd-border)] focus:border-[color:var(--pd-accent)] focus:ring-[color:var(--pd-accent-ring)]"
);

export const detailNotesItem = cn(
  detailChecklistItem,
  "items-start sm:items-start"
);

export const detailNotesItemTitle =
  "text-[13px] font-medium text-[color:var(--pd-text-heading)]/92";

export const detailNotesItemPreview =
  "mt-1 line-clamp-2 whitespace-pre-wrap text-[12px] leading-relaxed text-[color:var(--pd-text-secondary)]";

export const detailNotesItemMeta = "mt-1 text-[10px] text-[color:var(--pd-text-muted)]";

export const detailNotesPinnedLabel =
  "text-[9px] font-medium uppercase tracking-wide text-[color:var(--pd-status-warning)]";

export const detailVisualShell = cn(
  "relative overflow-hidden rounded-xl border border-white/[0.06]",
  "bg-white/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.28)]"
);

export const detailInfoGrid =
  "grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-2";
