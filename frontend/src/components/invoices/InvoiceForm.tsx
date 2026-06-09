"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  financeChipBtn,
  financeFieldClass,
  financeSelectClass,
  FinanceFieldLabel,
  FinanceFormSection,
} from "@/components/finances/finance-form-ui";
import { amountToFrenchWords } from "@/lib/amount-words";
import { glassBtnPrimary, glassBtnSecondary } from "@/lib/glass-styles";
import type { Client, Invoice, InvoiceItem, InvoiceStatus, PaymentMethod, Project } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";

export interface InvoiceFormValues {
  clientId: string;
  projectId: string;
  object: string;
  status: InvoiceStatus;
  tva: number;
  issueDate: string;
  paymentMethod: PaymentMethod | "";
  bankTransferBy: string;
  notes: string;
  items: Partial<InvoiceItem>[];
}

interface InvoiceFormProps {
  initialData?: Partial<Invoice>;
  clients: Client[];
  projects: Project[];
  defaultClientId?: string;
  defaultProjectId?: string;
  onSubmit: (data: InvoiceFormValues) => void;
  loading?: boolean;
  submitLabel?: string;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "VIREMENT", label: "Virement" },
  { value: "ESPECES", label: "Espèces" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "CARTE", label: "Carte" },
  { value: "AUTRE", label: "Autre" },
];

function lineAmount(item: Partial<InvoiceItem>): number {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  if (qty > 0 && price > 0) return qty * price;
  return Number(item.total) || price || 0;
}

export default function InvoiceForm({
  initialData,
  clients,
  projects,
  defaultClientId,
  defaultProjectId,
  onSubmit,
  loading,
  submitLabel = "Enregistrer brouillon",
}: InvoiceFormProps) {
  const [clientId, setClientId] = useState(
    initialData?.clientId ?? defaultClientId ?? ""
  );
  const [projectId, setProjectId] = useState(
    initialData?.projectId ?? defaultProjectId ?? ""
  );
  const [object, setObject] = useState(initialData?.object ?? "");
  const [status, setStatus] = useState<InvoiceStatus>(initialData?.status ?? "DRAFT");
  const [tva, setTva] = useState(initialData?.tva ?? 20);
  const [issueDate, setIssueDate] = useState(
    initialData?.issueDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(
    initialData?.paymentMethod ?? ""
  );
  const [bankTransferBy, setBankTransferBy] = useState(initialData?.bankTransferBy ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [items, setItems] = useState<Partial<InvoiceItem>[]>(
    initialData?.items?.length
      ? initialData.items
      : [{ description: "", quantity: 1, unitPrice: 0, total: 0, order: 0 }]
  );

  const filteredProjects = useMemo(() => {
    if (!clientId) return projects;
    return projects.filter((p) => p.clientId === clientId || !p.clientId);
  }, [projects, clientId]);

  const totalHT = items.reduce((sum, item) => sum + lineAmount(item), 0);
  const tvaAmount = Math.round(totalHT * (tva / 100) * 100) / 100;
  const totalTTC = Math.round((totalHT + tvaAmount) * 100) / 100;
  const totalInWords = amountToFrenchWords(totalTTC);

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        const qty = Number(next[index].quantity) || 0;
        const price = Number(next[index].unitPrice) || 0;
        next[index].total = qty * price;
      }
      if (field === "total") {
        next[index].unitPrice = Number(value) || 0;
        next[index].quantity = 1;
      }
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0, total: 0, order: prev.length },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent, nextStatus?: InvoiceStatus) => {
    e.preventDefault();
    onSubmit({
      clientId,
      projectId,
      object,
      status: nextStatus ?? status,
      tva,
      issueDate,
      paymentMethod,
      bankTransferBy,
      notes,
      items: items.map((item, order) => {
        const amount = lineAmount(item);
        return {
          description: item.description ?? "",
          quantity: item.quantity ?? 1,
          unitPrice: amount / (Number(item.quantity) || 1),
          total: amount,
          order,
        };
      }),
    });
  };

  return (
    <form className="space-y-3.5">
      <FinanceFormSection title="Informations">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <FinanceFieldLabel required>Client</FinanceFieldLabel>
            <select
              className={cn(financeSelectClass, !clientId && "text-glass-muted")}
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
            <FinanceFieldLabel>Projet lié</FinanceFieldLabel>
            <select
              className={cn(financeSelectClass, !projectId && "text-glass-muted")}
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
          <div>
            <FinanceFieldLabel required>Objet</FinanceFieldLabel>
            <input
              className={financeFieldClass}
              value={object}
              onChange={(e) => setObject(e.target.value)}
              required
            />
          </div>
          <div>
            <FinanceFieldLabel required>Date</FinanceFieldLabel>
            <input
              type="date"
              className={financeFieldClass}
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
            />
          </div>
          <div>
            <FinanceFieldLabel>Mode de paiement</FinanceFieldLabel>
            <select
              className={cn(financeSelectClass, !paymentMethod && "text-glass-muted")}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="" className="bg-[#101014]">
                —
              </option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value} className="bg-[#101014]">
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          {paymentMethod === "VIREMENT" && (
            <div>
              <FinanceFieldLabel>Virement émis par</FinanceFieldLabel>
              <input
                className={financeFieldClass}
                value={bankTransferBy}
                onChange={(e) => setBankTransferBy(e.target.value)}
              />
            </div>
          )}
          {initialData?.number && (
            <div>
              <FinanceFieldLabel>Numéro</FinanceFieldLabel>
              <input
                className={cn(financeFieldClass, "opacity-60")}
                value={initialData.number}
                disabled
              />
            </div>
          )}
        </div>
      </FinanceFormSection>

      <FinanceFormSection
        title="Prestations"
        action={
          <button
            type="button"
            onClick={addItem}
            className={cn(financeChipBtn, "inline-flex items-center gap-1")}
          >
            <Plus className="h-3 w-3" />
            Ligne
          </button>
        }
      >
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-2 rounded-lg border border-app bg-[color:var(--glass-bg)] p-2 sm:grid-cols-12"
            >
              <div className="sm:col-span-5">
                <input
                  className={financeFieldClass}
                  placeholder="Désignation *"
                  value={item.description || ""}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:col-span-6">
                <input
                  type="number"
                  className={financeFieldClass}
                  placeholder="Qté"
                  value={item.quantity ?? ""}
                  onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                />
                <input
                  type="number"
                  className={financeFieldClass}
                  placeholder="P.U. HT"
                  value={item.unitPrice ?? ""}
                  onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                />
                <input
                  type="number"
                  className={financeFieldClass}
                  placeholder="Montant HT"
                  value={lineAmount(item) || ""}
                  onChange={(e) => updateItem(index, "total", Number(e.target.value))}
                />
              </div>
              <div className="flex justify-end sm:col-span-1 sm:items-center sm:justify-center">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-lg p-2 text-rose-300/70 transition hover:bg-rose-500/10 hover:text-rose-200"
                  aria-label="Supprimer la ligne"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </FinanceFormSection>

      <FinanceFormSection title="Totaux">
        <div>
          <FinanceFieldLabel>TVA (%)</FinanceFieldLabel>
          <input
            type="number"
            className={cn(financeFieldClass, "max-w-[120px]")}
            value={tva}
            onChange={(e) => setTva(Number(e.target.value))}
          />
        </div>

        <div className="rounded-lg border border-app bg-[color:var(--glass-bg)] px-3.5 py-3 space-y-1">
          <p className="text-[12px] text-glass-muted">Total HT : {formatCurrency(totalHT)}</p>
          <p className="text-[12px] text-glass-muted">
            TVA ({tva}%) : {formatCurrency(tvaAmount)}
          </p>
          <p className="text-base font-semibold text-glass">
            Total TTC : {formatCurrency(totalTTC)}
          </p>
          <p className="text-[11px] italic text-glass-muted">{totalInWords}</p>
        </div>
      </FinanceFormSection>

      <div className="flex flex-col-reverse gap-2 border-t border-app pt-4 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={(e) => handleSubmit(e, "SENT")}
          className={cn(glassBtnSecondary, "w-full sm:w-auto")}
        >
          Marquer comme envoyée
        </button>
        <button
          type="button"
          disabled={loading || !clientId || !object.trim()}
          onClick={(e) => handleSubmit(e, "DRAFT")}
          className={cn(glassBtnPrimary, "w-full sm:w-auto")}
        >
          {loading ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
