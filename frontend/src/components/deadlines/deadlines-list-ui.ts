import { cn } from "@/lib/utils";
import {
  listHeaderBase,
  listLink,
  listPanel,
  listRowBase,
  listShell,
  pageStack,
} from "@/lib/theme-classes";
import { glassPanel } from "@/lib/glass-styles";

export const deadlinesListPage = pageStack;
export const deadlinesListPanel = listPanel;
export const deadlinesShell = listShell;
export const deadlinesListTable = cn(glassPanel, "overflow-x-auto overflow-y-visible");

export const deadlinesListRow = cn(
  listRowBase,
  "grid grid-cols-1 gap-2 px-4 py-2.5 text-[13px]",
  "md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.6fr)_minmax(0,5.5rem)] md:items-center md:gap-3"
);

export const deadlinesListHeader = cn(
  listHeaderBase,
  "hidden grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.6fr)_minmax(0,5.5rem)] gap-3 px-4 py-2 md:grid"
);

export const deadlinesListLink = listLink;
