import { InvoiceStatus } from '@prisma/client';

export function computeInvoiceStatus(invoice: {
  status: InvoiceStatus;
  totalTTC: number;
  paidAmount: number;
  dueDate: Date | null;
}): InvoiceStatus {
  if (
    invoice.status === InvoiceStatus.DRAFT ||
    invoice.status === InvoiceStatus.CANCELLED
  ) {
    return invoice.status;
  }

  const { paidAmount, totalTTC, dueDate } = invoice;

  if (totalTTC > 0 && paidAmount >= totalTTC) {
    return InvoiceStatus.PAID;
  }

  if (paidAmount > 0) {
    return InvoiceStatus.PARTIAL;
  }

  if (dueDate && new Date() > new Date(dueDate)) {
    return InvoiceStatus.OVERDUE;
  }

  if (invoice.status === InvoiceStatus.SENT) {
    return InvoiceStatus.UNPAID;
  }

  return invoice.status;
}
