import { cn } from "@/lib/utils";

export const paymentsShell = cn(
  "rounded-xl border border-[#8ba4c7]/[0.05] bg-white/[0.02]",
  "shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(139,164,199,0.03)]",
  "backdrop-blur-xl"
);

export const paymentsListPage = "space-y-3 pb-2";

export const paymentsListPanel = cn(paymentsShell, "space-y-2.5 p-3");

export const paymentsStatCard = cn(paymentsShell, "p-3");

export const paymentsTableWrap = cn(paymentsShell, "overflow-x-auto");

export const paymentsTable = "w-full min-w-[1100px] text-[13px]";

export const paymentsTableHead = cn(
  "border-b border-[#8ba4c7]/[0.06] text-left text-[10px] font-medium uppercase tracking-wide text-[#8ba4c7]/40"
);

export const paymentsTableRow = cn(
  "border-b border-[#8ba4c7]/[0.05] transition last:border-b-0",
  "hover:bg-[#8ba4c7]/[0.04]"
);
