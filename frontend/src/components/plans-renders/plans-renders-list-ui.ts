import { cn } from "@/lib/utils";
import {
  listGridCard,
  listGridThumb,
  listHeaderBase,
  listLink,
  listPanel,
  listRowBase,
  listShell,
  pageStack,
} from "@/lib/theme-classes";

export const plansRendersShell = listShell;

export const plansRendersListPage = pageStack;

export const plansRendersListPanel = listPanel;

export const plansRendersListTable = cn(listShell, "overflow-hidden");

export const plansRendersListRow = cn(
  listRowBase,
  "grid grid-cols-1 gap-2 px-4 py-2.5 text-[13px]",
  "md:grid-cols-[2rem_1.2fr_0.5fr_0.6fr_0.7fr_0.7fr_0.4fr_0.5fr_0.5fr_minmax(0,7.5rem)] md:items-center md:gap-3"
);

export const plansRendersListHeader = cn(
  listHeaderBase,
  "hidden grid-cols-[2rem_1.2fr_0.5fr_0.6fr_0.7fr_0.7fr_0.4fr_0.5fr_0.5fr_minmax(0,7.5rem)] gap-3 px-4 py-2 md:grid"
);

export const plansRendersListLink = listLink;

export const plansRendersGridCard = listGridCard;

export const plansRendersGridThumb = listGridThumb;
