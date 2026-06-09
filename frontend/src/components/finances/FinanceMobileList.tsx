"use client";

import Badge from "@/components/ui/Badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Devis, Invoice, Payment } from "@/types";
import {
  DEVIS_STATUS_COLORS,
  DEVIS_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
} from "@/types";
import { quotesInvoicesShell } from "./quotes-invoices-ui";

export const financeMobileList = "space-y-2 md:hidden";
export const financeDesktopTable = "hidden md:block";

export const financeMobileCard = cn(
  quotesInvoicesShell,
  "space-y-2.5 p-3"
);

function MobileField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[10px] text-glass-muted">{label}</p>
      <div className="text-[13px] text-[#9aa3b0]/75">{children}</div>
    </div>
  );
}

export function DevisMobileCard({
  devis,
  actions,
}: {
  devis: Devis;
  actions: React.ReactNode;
}) {
  return (
    <article className={financeMobileCard}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-glass">{devis.number}</p>
          <p className="mt-0.5 truncate text-[11px] text-glass-muted">
            {devis.client?.name ?? "—"}
            {devis.project?.name ? ` · ${devis.project.name}` : ""}
          </p>
        </div>
        <Badge className={DEVIS_STATUS_COLORS[devis.status]}>
          {DEVIS_STATUS_LABELS[devis.status]}
        </Badge>
      </div>

      {devis.object ? (
        <p className="line-clamp-2 text-[12px] text-[#9aa3b0]/60">{devis.object}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <MobileField label="HT">{formatCurrency(devis.totalHT)}</MobileField>
        <MobileField label="TTC">{formatCurrency(devis.totalTTC)}</MobileField>
        <MobileField label="Créé" className="col-span-2">
          {formatDate(devis.createdAt)}
        </MobileField>
      </div>

      <div className="border-t border-app pt-2">{actions}</div>
    </article>
  );
}

export function InvoiceMobileCard({
  invoice,
  remaining,
  actions,
}: {
  invoice: Invoice;
  remaining: number;
  actions: React.ReactNode;
}) {
  return (
    <article className={financeMobileCard}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-glass">{invoice.number}</p>
          <p className="mt-0.5 truncate text-[11px] text-glass-muted">
            {invoice.client?.name ?? "—"}
            {invoice.project?.name ? ` · ${invoice.project.name}` : ""}
          </p>
        </div>
        <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
          {INVOICE_STATUS_LABELS[invoice.status]}
        </Badge>
      </div>

      {invoice.object ? (
        <p className="line-clamp-2 text-[12px] text-[#9aa3b0]/60">{invoice.object}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <MobileField label="TTC">{formatCurrency(invoice.totalTTC)}</MobileField>
        <MobileField label="Payé">
          <span className="text-emerald-400/85">{formatCurrency(invoice.paidAmount ?? 0)}</span>
        </MobileField>
        <MobileField label="Reste">{formatCurrency(remaining)}</MobileField>
      </div>

      <div className="border-t border-app pt-2">{actions}</div>
    </article>
  );
}

export function PaymentMobileCard({
  payment,
  client,
  project,
  invoice,
  methodLabel,
  invoiceStatus,
  actions,
}: {
  payment: Payment;
  client: string;
  project: string;
  invoice: string;
  methodLabel: string;
  invoiceStatus: string;
  actions: React.ReactNode;
}) {
  return (
    <article className={financeMobileCard}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium tabular-nums text-glass">
            {formatCurrency(payment.amount)}
          </p>
          <p className="mt-0.5 text-[11px] text-glass-muted">
            {payment.reference ?? "Sans référence"}
          </p>
        </div>
        <span className="shrink-0 text-[11px] text-glass-muted">
          {formatDate(payment.date)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MobileField label="Client">{client}</MobileField>
        <MobileField label="Projet">{project}</MobileField>
        <MobileField label="Facture">{invoice}</MobileField>
        <MobileField label="Méthode">{methodLabel}</MobileField>
        <MobileField label="Statut facture" className="col-span-2">
          {invoiceStatus}
        </MobileField>
      </div>

      <div className="border-t border-app pt-2">{actions}</div>
    </article>
  );
}
