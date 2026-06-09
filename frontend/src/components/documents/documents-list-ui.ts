import { cn } from "@/lib/utils";

export const documentsShell = cn(
  "rounded-xl border border-[#8ba4c7]/[0.05] bg-white/[0.02]",
  "shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(139,164,199,0.03)]",
  "backdrop-blur-xl"
);

export const documentsListPage = "space-y-3 pb-2";

export const documentsListPanel = cn(documentsShell, "space-y-2.5 p-3");

export const documentsListTable = cn(documentsShell, "overflow-hidden");

export const documentsFilterChip =
  "rounded-lg px-2.5 py-1 text-[11px] font-medium transition";

export const documentsFilterLabel = "self-center text-[10px] text-[#8ba4c7]/42";

export const documentsListRow = cn(
  "grid grid-cols-1 gap-2 border-b border-[#8ba4c7]/[0.05] px-4 py-2.5 text-[13px] transition last:border-b-0",
  "hover:bg-[#8ba4c7]/[0.04]",
  "md:grid-cols-[1.4fr_0.5fr_0.6fr_0.8fr_0.7fr_0.5fr_0.6fr_2rem] md:items-center md:gap-3"
);

export const documentsListHeader = cn(
  "hidden grid-cols-[1.4fr_0.5fr_0.6fr_0.8fr_0.7fr_0.5fr_0.6fr_2rem] gap-3",
  "border-b border-[#8ba4c7]/[0.06] px-4 py-2",
  "text-[10px] font-medium uppercase tracking-wide text-[#8ba4c7]/40 md:grid"
);

export const documentsListLink =
  "text-[#8ba4c7]/85 transition hover:text-[#b8cfe8]/95 hover:underline";

export const documentsGridCard = cn(
  "group flex flex-col rounded-xl border border-[#8ba4c7]/[0.06] bg-white/[0.02] p-3 transition",
  "hover:border-[#8ba4c7]/[0.14] hover:bg-[#8ba4c7]/[0.03]"
);

export const documentsGridThumb = cn(
  "relative mb-2.5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg",
  "border border-[#8ba4c7]/[0.05] bg-white/[0.02]"
);
