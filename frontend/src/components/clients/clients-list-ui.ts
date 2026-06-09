import { cn } from "@/lib/utils";
import {
  listCard,
  listCardBody,
  listCardFooter,
  listCardHeader,
  listGrid,
  listPanel,
  listTable,
  pageStack,
  textMeta,
  textMetaSm,
} from "@/lib/theme-classes";

export const clientsListPage = pageStack;

export const clientsListPanel = listPanel;

export const clientsListCard = listCard;

export const clientsListTable = listTable;

export const clientsListFilterDivider = "mx-0.5 w-px self-stretch bg-[color:var(--color-border)]";

export const clientsListFilterChip =
  "rounded-lg px-2.5 py-1 text-[11px] font-medium transition";

export const clientsListGrid = listGrid;

export const clientsListCardHeader = listCardHeader;

export const clientsListCardBody = listCardBody;

export const clientsListCardMeta = textMeta;

export const clientsListCardTag = cn(
  "inline-flex rounded-md bg-[color:var(--badge-default-bg)] px-1.5 py-0.5",
  "text-[10px] font-medium text-[color:var(--badge-default-text)] ring-1 ring-inset ring-[color:var(--status-neutral-ring)]"
);

export const clientsListCardStats = textMetaSm;

export const clientsListCardFooter = listCardFooter;

export const clientsListCardFinance =
  "text-[11px] font-medium text-[color:var(--finance-warning-text)]";

export const clientsListRowContactLink = cn(
  "truncate text-glass-secondary transition hover:text-studio-light"
);
