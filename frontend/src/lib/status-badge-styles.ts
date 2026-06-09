import { cn } from "@/lib/utils";
import type { DevisStatus, InvoiceStatus } from "@/types";

const statusBadgeBase =
  "inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset";

export const statusBadgeNeutral = cn(
  statusBadgeBase,
  "bg-[color:var(--status-neutral-bg)] text-[color:var(--status-neutral-text)] ring-[color:var(--status-neutral-ring)]"
);

export const statusBadgeInfo = cn(
  statusBadgeBase,
  "bg-[color:var(--status-info-bg)] text-[color:var(--status-info-text)] ring-[color:var(--status-info-ring)]"
);

export const statusBadgeSuccess = cn(
  statusBadgeBase,
  "bg-[color:var(--status-success-bg)] text-[color:var(--status-success-text)] ring-[color:var(--status-success-ring)]"
);

export const statusBadgeWarning = cn(
  statusBadgeBase,
  "bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning-text)] ring-[color:var(--status-warning-ring)]"
);

export const statusBadgeDanger = cn(
  statusBadgeBase,
  "bg-[color:var(--status-danger-bg)] text-[color:var(--status-danger-text)] ring-[color:var(--status-danger-ring)]"
);

export const statusBadgeOrange = cn(
  statusBadgeBase,
  "bg-[color:var(--status-orange-bg)] text-[color:var(--status-orange-text)] ring-[color:var(--status-orange-ring)]"
);

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  DRAFT: statusBadgeNeutral,
  SENT: statusBadgeInfo,
  UNPAID: statusBadgeWarning,
  PARTIAL: statusBadgeOrange,
  PAID: statusBadgeSuccess,
  OVERDUE: statusBadgeDanger,
  CANCELLED: statusBadgeNeutral,
};

export const DEVIS_STATUS_COLORS: Record<DevisStatus, string> = {
  DRAFT: statusBadgeNeutral,
  SENT: statusBadgeInfo,
  ACCEPTED: statusBadgeSuccess,
  REFUSED: statusBadgeDanger,
  EXPIRED: statusBadgeWarning,
};
