"use client";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from "@/types";
import type { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getFinanceClientLabel,
  getFinanceProjectLabel,
} from "@/lib/finance-entity-utils";

interface InvoicePreviewProps {
  invoice: Invoice;
}

export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
  return (
    <Card className="max-w-3xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Facture</h2>
          <p className="mt-1 text-text-secondary">{invoice.number}</p>
        </div>
        <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
          {INVOICE_STATUS_LABELS[invoice.status]}
        </Badge>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase text-text-muted">Client</p>
          <p className="mt-1 text-text-primary">{getFinanceClientLabel(invoice)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-text-muted">Projet</p>
          <p className="mt-1 text-text-primary">{getFinanceProjectLabel(invoice)}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase text-text-muted">Date d&apos;émission</p>
          <p className="mt-1 text-text-primary">{formatDate(invoice.issueDate)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-text-muted">Date deadline</p>
          <p className="mt-1 text-text-primary">
            {invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
          </p>
        </div>
      </div>

      <table className="mb-8 w-full">
        <thead>
          <tr className="border-b border-dark-border text-left text-xs uppercase text-text-muted">
            <th className="pb-3">Description</th>
            <th className="pb-3 text-right">Qté</th>
            <th className="pb-3 text-right">Prix HT</th>
            <th className="pb-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {(invoice.items || []).map((item) => (
            <tr key={item.id} className="border-b border-dark-border">
              <td className="py-3 text-text-primary">{item.description}</td>
              <td className="py-3 text-right text-text-secondary">{item.quantity}</td>
              <td className="py-3 text-right text-text-secondary">{formatCurrency(item.unitPrice)}</td>
              <td className="py-3 text-right text-text-primary">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col items-end gap-1 border-t border-dark-border pt-4">
        <p className="text-sm text-text-secondary">Total HT : {formatCurrency(invoice.totalHT)}</p>
        <p className="text-sm text-text-secondary">TVA ({invoice.tva}%) incluse</p>
        <p className="text-xl font-bold text-text-primary">Total TTC : {formatCurrency(invoice.totalTTC)}</p>
        {invoice.paidAmount > 0 && (
          <p className="text-sm text-emerald-400">Payé : {formatCurrency(invoice.paidAmount)}</p>
        )}
      </div>

      {invoice.notes && (
        <div className="mt-6 rounded-xl bg-dark-elevated p-4">
          <p className="text-xs uppercase text-text-muted">Notes</p>
          <p className="mt-1 text-sm text-text-secondary">{invoice.notes}</p>
        </div>
      )}
    </Card>
  );
}

