import { cn } from "@/lib/utils";
import { glassPanel } from "@/lib/glass-styles";

export const clientsListPage = "space-y-3 pb-2";

export const clientsListPanel = cn(glassPanel, "space-y-2.5 p-3");

export const clientsListCard = cn(
  "group/card flex h-full flex-col overflow-hidden rounded-xl",
  "border border-white/[0.08] bg-white/[0.035]",
  "shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)]",
  "backdrop-blur-xl transition duration-200",
  "hover:border-studio-light/25 hover:bg-white/[0.045]",
  "hover:shadow-[0_10px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05)]"
);

export const clientsListTable = cn(glassPanel, "overflow-hidden");

export const clientsListFilterDivider = "mx-0.5 w-px self-stretch bg-white/[0.08]";

export const clientsListFilterChip =
  "rounded-lg px-2.5 py-1 text-[11px] font-medium transition";

export const clientsListGrid = "grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3";

export const clientsListCardHeader =
  "flex items-start justify-between gap-2 border-b border-[#8ba4c7]/[0.06] px-3.5 py-2.5";

export const clientsListCardBody = "flex flex-1 flex-col gap-2.5 px-3.5 py-2.5";

export const clientsListCardMeta = "text-[10px] text-[#8ba4c7]/50";

export const clientsListCardStats =
  "flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#9aa3b0]/55";

export const clientsListCardFooter =
  "border-t border-[#8ba4c7]/[0.05] px-3.5 py-2 text-[10px] text-[#8ba4c7]/38";

export const clientsListCardFinance = "text-[11px] text-amber-400/85";

export const clientsListRowContactLink =
  "truncate text-[#9aa3b0]/65 transition hover:text-[#b8cfe8]/90";
