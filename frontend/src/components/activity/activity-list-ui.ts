import { cn } from "@/lib/utils";
import { listPanel, listRowBase, listShell, pageStack } from "@/lib/theme-classes";

export const activityShell = listShell;

export const activityListPage = pageStack;

export const activityListPanel = listPanel;

export const activityListWrap = cn(listShell, "overflow-hidden");

export const activityListItem = cn(
  listRowBase,
  "flex gap-3 px-4 py-3"
);

export const activityIconActionGroup = cn(
  "flex shrink-0 items-center gap-0.5 rounded-md bg-studio-muted/50 px-0.5 py-0.5"
);
