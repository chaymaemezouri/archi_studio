import { cn } from "@/lib/utils";
import {
  listHeaderBase,
  listPanel,
  listRowBase,
  listShell,
  pageStack,
} from "@/lib/theme-classes";

export const paymentsShell = listShell;

export const paymentsListPage = pageStack;

export const paymentsListPanel = listPanel;

export const paymentsStatCard = cn(listShell, "p-3");

export const paymentsTableWrap = cn(listShell, "overflow-x-auto");

export const paymentsTable = "w-full min-w-[1100px] text-[13px]";

export const paymentsTableHead = listHeaderBase;

export const paymentsTableRow = listRowBase;
