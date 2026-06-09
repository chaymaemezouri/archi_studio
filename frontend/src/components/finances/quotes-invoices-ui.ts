import { cn } from "@/lib/utils";
import {
  listHeaderBase,
  listPanel,
  listRowBase,
  listShell,
  pageStack,
} from "@/lib/theme-classes";

export const quotesInvoicesShell = listShell;

export const quotesInvoicesListPage = pageStack;

export const quotesInvoicesPanel = listPanel;

export const quotesInvoicesTableWrap = cn(listShell, "overflow-x-auto");

export const quotesInvoicesTable = "w-full min-w-[900px] text-[13px]";

export const quotesInvoicesTableHead = listHeaderBase;

export const quotesInvoicesTableRow = listRowBase;

export const quotesInvoicesTabActive =
  "border-studio-border/55 text-studio-light";

export const quotesInvoicesTabInactive = cn(
  "border-transparent text-glass-muted hover:text-studio-light/80"
);

export const quotesInvoicesIconActionGroup = cn(
  "flex shrink-0 items-center gap-0.5 rounded-md bg-studio-muted/50 px-0.5 py-0.5"
);
