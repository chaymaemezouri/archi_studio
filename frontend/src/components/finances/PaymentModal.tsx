"use client";

import { useState } from "react";
import type { Invoice, PaymentMethod } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { glassBtnPrimary, glassBtnSecondary } from "@/lib/glass-styles";
import {
  PaymentFieldLabel,
  PaymentFormSection,
  paymentFieldClass,
  paymentSelectClass,
} from "./payment-form-ui";

interface PaymentModalProps {
  invoice: Invoice;
  onSubmit: (data: {
    invoiceId: string;
    amount: number;
    date: string;
    method: PaymentMethod;
    notes?: string;
  }) => void;
  onClose: () => void;
  loading?: boolean;
}

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "ESPECES", label: "Espèces" },
  { value: "VIREMENT", label: "Virement" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "CARTE", label: "Carte" },
  { value: "AUTRE", label: "Autre" },
];

export default function PaymentModal({
  invoice,
  onSubmit,
  onClose,
  loading,
}: PaymentModalProps) {
  const remaining = Math.max(0, invoice.totalTTC - (invoice.paidAmount ?? 0));
  const [amount, setAmount] = useState(remaining);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<PaymentMethod>("VIREMENT");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      invoiceId: invoice.id,
      amount,
      date,
      method,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="rounded-xl border border-studio-border/25 bg-studio-muted/40 px-3 py-2.5">
        <p className="text-[11px] text-glass-muted">Facture</p>
        <p className="mt-0.5 text-[13px] font-medium text-glass">{invoice.number}</p>
        <p className="mt-1 text-[11px] text-studio-light/70">
          Reste à payer : {formatCurrency(remaining)}
        </p>
      </div>

      <PaymentFormSection title="Paiement">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <PaymentFieldLabel required>Montant</PaymentFieldLabel>
            <input
              type="number"
              min={0}
              step={0.01}
              required
              className={paymentFieldClass}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <PaymentFieldLabel required>Date</PaymentFieldLabel>
            <input
              type="date"
              required
              className={paymentFieldClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <PaymentFieldLabel required>Méthode</PaymentFieldLabel>
          <select
            className={paymentSelectClass}
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          >
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </PaymentFormSection>

      <PaymentFormSection title="Complément">
        <div>
          <PaymentFieldLabel>Note</PaymentFieldLabel>
          <textarea
            className={cn(paymentFieldClass, "min-h-[72px] resize-y")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      </PaymentFormSection>

      <div className="flex flex-col-reverse gap-2 border-t border-app pt-4 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={onClose}
          className={cn(glassBtnSecondary, "w-full sm:w-auto")}
        >
          Annuler
        </button>
        <button type="submit" disabled={loading} className={cn(glassBtnPrimary, "w-full sm:w-auto")}>
          {loading ? "Enregistrement…" : "Enregistrer le paiement"}
        </button>
      </div>
    </form>
  );
}
