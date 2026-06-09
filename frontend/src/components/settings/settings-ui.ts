import { cn } from "@/lib/utils";
import { glassPanel } from "@/lib/glass-styles";

export const settingsPage = "w-full min-w-0 space-y-4 pb-4";

export const settingsLayout =
  "flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6";

export const settingsNav =
  "flex shrink-0 flex-row gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:w-[180px] lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden";

export const settingsNavBtn = cn(
  "shrink-0 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium transition lg:w-full",
  "flex items-center gap-2"
);

export const settingsContent = "min-w-0 flex-1 space-y-4";

export const settingsGrid2 = "grid grid-cols-1 gap-3.5 lg:grid-cols-2";

export const settingsGrid3 = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3";

export const settingsGrid4 = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4";

export const settingsSubsectionTitle =
  "text-[12px] font-semibold uppercase tracking-wide text-glass-muted";

export const settingsDivider = "border-t border-app";

export const settingsCard = cn(glassPanel, "p-4 sm:p-5");

export const settingsProfileCard = cn(
  settingsCard,
  "flex flex-col gap-4 sm:flex-row sm:items-center"
);

export const settingsSectionTitle = cn(
  "mb-4 flex items-center gap-2 border-l-2 border-[color:var(--studio-border)] pl-2.5",
  "text-[14px] font-medium text-app-primary"
);

export const settingsSectionIcon = "h-4 w-4 shrink-0 text-studio-light";

export const settingsLabel =
  "block text-[11px] font-medium text-glass-muted";

export const settingsHint = "text-[11px] leading-relaxed text-glass-muted";

export const settingsCode = cn(
  "rounded-md bg-[color:var(--glass-bg-hover)] px-1.5 py-0.5 font-mono text-[10px] text-glass-secondary"
);

export const settingsField = "space-y-1.5";

export const settingsProfileName = "text-[15px] font-medium text-app-primary";

export const settingsProfileMeta = "text-[12px] text-glass-muted";

export const settingsProfileRole = "text-[10px] text-glass-muted";

export const settingsTabsRow = cn(
  "flex flex-wrap gap-1 rounded-lg border border-app bg-[color:var(--glass-bg)] p-0.5"
);

export const settingsTabBtn =
  "rounded-md px-3 py-1.5 text-[11px] font-medium transition";

export const settingsTabBtnActive = "bg-studio-soft text-studio-light";

export const settingsTabBtnInactive = cn(
  "text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-glass-secondary"
);

export const settingsInfoGrid = "grid grid-cols-1 gap-3 sm:grid-cols-2";

export const settingsInfoItem = cn(
  "rounded-lg border border-app bg-[color:var(--glass-bg)] px-3 py-2.5"
);

export const settingsInfoLabel = "text-[10px] font-medium text-glass-muted";

export const settingsInfoValue = "mt-0.5 text-[13px] text-glass";

export const settingsUploadZone = cn(
  "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed",
  "border-[color:var(--studio-border)] bg-[color:var(--glass-bg)] px-4 py-5 transition",
  "hover:border-[color:var(--studio-border)] hover:bg-studio-muted/30"
);

export const settingsNavBtnActive = cn(
  "bg-studio-muted text-studio-light"
);

export const settingsNavBtnInactive = cn(
  "text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-glass-secondary"
);
