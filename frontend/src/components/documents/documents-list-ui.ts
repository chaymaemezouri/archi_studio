import { cn } from "@/lib/utils";
import {
  listFilterLabel,
  listGridCard,
  listGridThumb,
  listHeaderBase,
  listLink,
  listPanel,
  listRowBase,
  listShell,
  pageStack,
} from "@/lib/theme-classes";

export const documentsShell = listShell;

export const documentsListPage = pageStack;

export const documentsListPanel = listPanel;

export const documentsListTable = cn(listShell, "overflow-hidden");

export const documentsFilterChip =
  "rounded-lg px-2.5 py-1 text-[11px] font-medium transition";

export const documentsFilterLabel = listFilterLabel;

export const documentsListRow = cn(
  listRowBase,
  "grid grid-cols-1 gap-2 px-4 py-2.5 text-[13px]",
  "md:grid-cols-[1.4fr_0.5fr_0.6fr_0.8fr_0.7fr_0.5fr_0.6fr_auto] md:items-center md:gap-3"
);

export const documentsListHeader = cn(
  listHeaderBase,
  "hidden grid-cols-[1.4fr_0.5fr_0.6fr_0.8fr_0.7fr_0.5fr_0.6fr_auto] gap-3 px-4 py-2 md:grid"
);

export const documentsListLink = listLink;

export const documentsGridCard = listGridCard;

export const documentsGridThumb = listGridThumb;
