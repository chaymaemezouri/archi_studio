import { cn } from "@/lib/utils";

export const activityShell = cn(
  "rounded-xl border border-[#8ba4c7]/[0.05] bg-white/[0.02]",
  "shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(139,164,199,0.03)]",
  "backdrop-blur-xl"
);

export const activityListPage = "space-y-3 pb-2";

export const activityListPanel = cn(activityShell, "space-y-2.5 p-3");

export const activityListWrap = cn(activityShell, "overflow-hidden");

export const activityListItem = cn(
  "flex gap-3 border-b border-[#8ba4c7]/[0.05] px-4 py-3 transition last:border-b-0",
  "hover:bg-[#8ba4c7]/[0.04]"
);

export const activityIconActionGroup = cn(
  "flex shrink-0 items-center gap-0.5 rounded-md",
  "bg-[#8ba4c7]/5 px-0.5 py-0.5"
);
