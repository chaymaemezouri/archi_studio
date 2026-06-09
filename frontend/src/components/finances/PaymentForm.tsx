"use client";

import { useMemo, useState } from "react";
import type { Payment, PaymentMethod } from "@/types";
import type { PaymentInput } from "@/hooks/usePayments";
import { cn, formatCurrency } from "@/lib/utils";
import { glassBtnPrimary, glassBtnSecondary } from "@/lib/glass-styles";
import {
  PaymentFieldLabel,
  PaymentFormSection,
  paymentFieldClass,
  paymentSelectClass,
} from "./payment-form-ui";

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "ESPECES", label: "Espèces" },
  { value: "VIREMENT", label: "Virement" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "CARTE", label: "Carte" },
  { value: "AUTRE", label: "Autre" },
];

type InvoiceOption = {
  id: string;
  number: string;
  totalTTC: number;
  paidAmount: number;
  clientId?: string | null;
  projectId?: string | null;
};

interface PaymentFormProps {
  payment?: Payment | null;
  invoices: InvoiceOption[];
  clients: { id: string; name: string }[];
  projects: { id: string; name: string; clientId?: string | null }[];
  onSubmit: (payload: PaymentInput) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function PaymentForm({
  payment,
  invoices,
  clients,
  projects,
  onSubmit,
  onCancel,
  loading,
}: PaymentFormProps) {
  const [invoiceId, setInvoiceId] = useState(payment?.invoiceId ?? "");
  const [clientId, setClientId] = useState(payment?.clientId ?? "");
  const [projectId, setProjectId] = useState(payment?.projectId ?? "");
  const [amount, setAmount] = useState(payment?.amount ?? 0);
  const [date, setDate] = useState(
    payment?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
  );
  const [method, setMethod] = useState<PaymentMethod>(payment?.method ?? "VIREMENT");
  const [reference, setReference] = useState(payment?.reference ?? "");
  const [notes, setNotes] = useState(payment?.notes ?? "");
  const [proofUrl, setProofUrl] = useState(payment?.proofUrl ?? "");

  const selectedInvoice = useMemo(
    () => invoices.find((inv) => inv.id === invoiceId),
    [invoices, invoiceId]
  );
  const remaining = selectedInvoice
    ? Math.max(0, selectedInvoice.totalTTC - selectedInvoice.paidAmount)
    : null;

  const filteredProjects = useMemo(() => {
    if (!clientId) return projects;
    return projects.filter((p) => !p.clientId || p.clientId === clientId);
  }, [projects, clientId]);

  const onInvoiceChange = (nextInvoiceId: string) => {
    setInvoiceId(nextInvoiceId);
    const inv = invoices.find((x) => x.id === nextInvoiceId);
    if (!inv) return;
    if (inv.clientId) setClientId(inv.clientId);
    if (inv.projectId) setProjectId(inv.projectId);
    setAmount(Math.max(0, inv.totalTTC - inv.paidAmount));
  };

  const amountExceeds = remaining !== null && amount > remaining + 0.001;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !date || !method || !(amount > 0) || amountExceeds) return;
    onSubmit({
      invoiceId: invoiceId || undefined,
      clientId,
      projectId: projectId || undefined,
      amount,
      date,
      method,
      reference: reference || undefined,
      notes: notes || undefined,
      proofUrl: proofUrl || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <PaymentFormSection title="Lien">
        <div>
          <PaymentFieldLabel>Facture liée</PaymentFieldLabel>
          <select
            className={cn(paymentSelectClass, !invoiceId && "text-white/35")}
            value={invoiceId}
            onChange={(e) => onInvoiceChange(e.target.value)}
          >
            <option value="" className="bg-[#101014]">
              Non lié à une facture
            </option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id} className="bg-[#101014]">
                {inv.number}
              </option>
            ))}
          </select>
          {remaining !== null && (
            <p className="mt-1.5 text-[11px] text-studio-light/65">
              Reste à payer : {formatCurrency(remaining)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <PaymentFieldLabel required>Client</PaymentFieldLabel>
            <select
              className={cn(paymentSelectClass, !clientId && "text-white/35")}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              <option value="" className="bg-[#101014]">
                Sélectionner…
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#101014]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <PaymentFieldLabel>Projet lié</PaymentFieldLabel>
            <select
              className={cn(paymentSelectClass, !projectId && "text-white/35")}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="" className="bg-[#101014]">
                Aucun
              </option>
              {filteredProjects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#101014]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PaymentFormSection>

      <PaymentFormSection title="Paiement">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <PaymentFieldLabel required>Montant payé</PaymentFieldLabel>
            <input
              type="number"
              min={0.01}
              step={0.01}
              required
              className={paymentFieldClass}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <PaymentFieldLabel required>Date du paiement</PaymentFieldLabel>
            <input
              type="date"
              required
              className={paymentFieldClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <PaymentFieldLabel required>Méthode</PaymentFieldLabel>
            <select
              className={paymentSelectClass}
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              required
            >
              {METHOD_OPTIONS.map((m) => (
                <option key={m.value} value={m.value} className="bg-[#101014]">
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <PaymentFieldLabel>Référence</PaymentFieldLabel>
            <input
              className={paymentFieldClass}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="N° chèque, virement…"
            />
          </div>
        </div>
      </PaymentFormSection>

      <PaymentFormSection title="Compléments">
        <div>
          <PaymentFieldLabel>Justificatif (URL)</PaymentFieldLabel>
          <input
            type="url"
            className={paymentFieldClass}
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
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

      {amountExceeds && (
        <p className="rounded-lg border border-rose-400/20 bg-rose-500/[0.08] px-3 py-2 text-[12px] text-rose-200/90">
          Le montant dépasse le reste à payer.
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] pt-4 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={onCancel}
          className={cn(glassBtnSecondary, "w-full sm:w-auto")}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading || !clientId || amountExceeds || !(amount > 0)}
          className={cn(glassBtnPrimary, "w-full sm:w-auto")}
        >
          {loading
            ? payment
              ? "Enregistrement…"
              : "Ajout…"
            : payment
              ? "Mettre à jour"
              : "Ajouter le paiement"}
        </button>
      </div>
    </form>
  );
}
