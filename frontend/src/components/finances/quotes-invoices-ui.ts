import { cn } from "@/lib/utils";

export const quotesInvoicesShell = cn(
  "rounded-xl border border-[#8ba4c7]/[0.05] bg-white/[0.02]",
  "shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(139,164,199,0.03)]",
  "backdrop-blur-xl"
);

export const quotesInvoicesListPage = "space-y-3 pb-2";

export const quotesInvoicesPanel = cn(quotesInvoicesShell, "space-y-2.5 p-3");

export const quotesInvoicesTableWrap = cn(quotesInvoicesShell, "overflow-x-auto");

export const quotesInvoicesTable = "w-full min-w-[900px] text-[13px]";

export const quotesInvoicesTableHead = cn(
  "border-b border-[#8ba4c7]/[0.06] text-left text-[10px] font-medium uppercase tracking-wide text-[#8ba4c7]/40"
);

export const quotesInvoicesTableRow = cn(
  "border-b border-[#8ba4c7]/[0.05] transition last:border-b-0",
  "hover:bg-[#8ba4c7]/[0.04]"
);

export const quotesInvoicesTabActive =
  "border-[#8ba4c7]/55 text-[#b8cfe8]";

export const quotesInvoicesTabInactive =
  "border-transparent text-[#8ba4c7]/45 hover:text-[#b8cfe8]/80";

export const quotesInvoicesIconActionGroup = cn(
  "flex shrink-0 items-center gap-0.5 rounded-md",
  "bg-[#8ba4c7]/5 px-0.5 py-0.5"
);
