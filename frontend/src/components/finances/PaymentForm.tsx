"use client";

import { useEffect, useMemo, useState } from "react";
import type { Payment, PaymentMethod } from "@/types";
import type { PaymentInput } from "@/hooks/usePayments";
import { cn, formatCurrency } from "@/lib/utils";
import {
  getProjectGlobalAmount,
  getProjectRemainingToCollect,
  sumPaymentsForProject,
} from "@/lib/project-finance";
import { glassBtnPrimary, glassBtnSecondary } from "@/lib/glass-styles";
import PaymentProofUpload from "./PaymentProofUpload";
import {
  FinanceEntityPicker,
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
  client?: { id: string; name: string } | null;
  project?: {
    id: string;
    name: string;
    clientId?: string | null;
    client?: { id: string; name: string } | null;
  } | null;
};

type ProjectOption = {
  id: string;
  name: string;
  clientId?: string | null;
  client?: { id: string; name: string } | null;
  totalProjectAmount?: number | null;
  contractArchitectFees?: number | null;
  actualFeesToCollect?: number | null;
  budget?: number | null;
};

function resolveClientId(
  invoice: InvoiceOption | undefined,
  projectId: string,
  projects: ProjectOption[]
): string {
  if (invoice?.clientId) return invoice.clientId;
  if (invoice?.client?.id) return invoice.client.id;

  if (invoice?.project?.clientId) return invoice.project.clientId;
  if (invoice?.project?.client?.id) return invoice.project.client.id;

  const linkedProjectId = invoice?.projectId ?? projectId;
  if (linkedProjectId) {
    const project = projects.find((p) => p.id === linkedProjectId);
    if (project?.clientId) return project.clientId;
    if (project?.client?.id) return project.client.id;
  }

  return "";
}

interface PaymentFormProps {
  payment?: Payment | null;
  invoices: InvoiceOption[];
  clients: { id: string; name: string }[];
  projects: ProjectOption[];
  allPayments?: Array<{
    amount: number;
    projectId?: string | null;
    invoice?: { projectId?: string | null } | null;
  }>;
  onSubmit: (payload: PaymentInput) => void;
  onCancel: () => void;
  loading: boolean;
  defaultClientId?: string;
  defaultProjectId?: string;
}

export default function PaymentForm({
  payment,
  invoices,
  clients,
  projects,
  allPayments = [],
  onSubmit,
  onCancel,
  loading,
  defaultClientId,
  defaultProjectId,
}: PaymentFormProps) {
  const [invoiceId, setInvoiceId] = useState(payment?.invoiceId ?? "");
  const [invoiceName, setInvoiceName] = useState(payment?.invoiceName ?? "");
  const [clientId, setClientId] = useState(payment?.clientId ?? defaultClientId ?? "");
  const [clientName, setClientName] = useState(payment?.clientName ?? "");
  const [projectId, setProjectId] = useState(payment?.projectId ?? defaultProjectId ?? "");
  const [projectName, setProjectName] = useState(payment?.projectName ?? "");
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
  const remaining = useMemo(() => {
    if (!selectedInvoice) return null;
    let max = Math.max(0, selectedInvoice.totalTTC - selectedInvoice.paidAmount);
    if (payment?.invoiceId && payment.invoiceId === invoiceId) {
      max += payment.amount ?? 0;
    }
    return max;
  }, [selectedInvoice, payment, invoiceId]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );

  const projectPaid = useMemo(() => {
    if (!projectId) return 0;
    return sumPaymentsForProject(projectId, allPayments);
  }, [projectId, allPayments]);

  const projectRemaining = useMemo(() => {
    if (!selectedProject) return null;
    return getProjectRemainingToCollect(selectedProject, projectPaid);
  }, [selectedProject, projectPaid]);

  const filteredProjects = useMemo(() => {
    if (!clientId) return projects;
    return projects.filter((p) => !p.clientId || p.clientId === clientId);
  }, [projects, clientId]);

  const onInvoiceIdChange = (nextInvoiceId: string) => {
    setInvoiceId(nextInvoiceId);
    if (!nextInvoiceId) return;
    setInvoiceName("");
    const inv = invoices.find((x) => x.id === nextInvoiceId);
    if (!inv) return;
    const nextProjectId = inv.projectId ?? "";
    setProjectId(nextProjectId);
    setProjectName("");
    setClientId(resolveClientId(inv, nextProjectId, projects));
    setClientName("");
    setAmount(Math.max(0, inv.totalTTC - inv.paidAmount));
  };

  const onProjectIdChange = (nextProjectId: string) => {
    setProjectId(nextProjectId);
    if (!nextProjectId) return;
    setProjectName("");
    const project = projects.find((p) => p.id === nextProjectId);
    if (project?.clientId) {
      setClientId(project.clientId);
      setClientName("");
    }
  };

  useEffect(() => {
    if (clientId) return;
    const inv = invoiceId ? invoices.find((x) => x.id === invoiceId) : undefined;
    const resolved = resolveClientId(inv, projectId, projects);
    if (resolved) setClientId(resolved);
  }, [invoiceId, clientId, projectId, invoices, projects]);

  const hasLink =
    !!invoiceId ||
    !!invoiceName.trim() ||
    !!clientId ||
    !!clientName.trim();
  const amountExceeds = remaining !== null && amount > remaining + 0.001;
  const canSubmit = hasLink && date && method && amount > 0 && !amountExceeds;

  const projectFinanceSummary = selectedProject ? (
    <div className="rounded-lg border border-studio-border/30 bg-studio-muted/20 px-3 py-3">
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wide text-studio-light/80">
        Informations projet
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <p className="text-[10px] text-glass-muted">Montant global du projet</p>
          <p className="text-[13px] font-semibold tabular-nums text-glass">
            {(() => {
              const global = getProjectGlobalAmount(selectedProject);
              return global != null ? formatCurrency(global) : "—";
            })()}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-glass-muted">Honoraires déclarés (contrat)</p>
          <p className="text-[13px] font-semibold tabular-nums text-glass">
            {selectedProject.contractArchitectFees != null
              ? formatCurrency(selectedProject.contractArchitectFees)
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-glass-muted">Honoraires réels à encaisser</p>
          <p className="text-[13px] font-semibold tabular-nums text-glass">
            {selectedProject.actualFeesToCollect != null
              ? formatCurrency(selectedProject.actualFeesToCollect)
              : "—"}
          </p>
        </div>
        <div className="rounded-md border border-amber-500/20 bg-amber-500/[0.06] px-2.5 py-2">
          <p className="text-[10px] text-amber-200/70">Reste à encaisser</p>
          <p className="text-[14px] font-bold tabular-nums text-amber-100">
            {projectRemaining != null && selectedProject.actualFeesToCollect != null
              ? formatCurrency(projectRemaining)
              : "—"}
          </p>
          <p className="mt-0.5 text-[9px] text-glass-muted">Calculé automatiquement</p>
        </div>
      </div>
    </div>
  ) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      ...(invoiceId
        ? { invoiceId }
        : invoiceName.trim()
          ? { invoiceName: invoiceName.trim() }
          : {}),
      ...(clientId
        ? { clientId }
        : clientName.trim()
          ? { clientName: clientName.trim() }
          : {}),
      ...(projectId
        ? { projectId }
        : projectName.trim()
          ? { projectName: projectName.trim() }
          : {}),
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
      {projectFinanceSummary}

      <PaymentFormSection title="Lien">
        <div>
          <FinanceEntityPicker
            label="Facture liée"
            placeholder="Non lié à une facture"
            manualLabel="Autre facture — saisir la référence"
            manualPlaceholder="N° ou nom de facture"
            options={invoices.map((inv) => ({ id: inv.id, name: inv.number }))}
            entityId={invoiceId}
            entityName={invoiceName}
            onEntityIdChange={onInvoiceIdChange}
            onEntityNameChange={setInvoiceName}
          />
          {remaining !== null && (
            <p className="mt-1.5 text-[11px] text-studio-light/65">
              {payment?.invoiceId === invoiceId
                ? `Montant modifiable jusqu'à ${formatCurrency(remaining)}`
                : `Reste à payer facture : ${formatCurrency(remaining)}`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FinanceEntityPicker
            label="Client"
            required={!invoiceId && !invoiceName.trim()}
            placeholder="Choisir un client…"
            manualLabel="Autre client — saisir le nom"
            manualPlaceholder="Nom du client"
            options={clients.map((c) => ({ id: c.id, name: c.name }))}
            entityId={clientId}
            entityName={clientName}
            onEntityIdChange={(id) => {
              setClientId(id);
              if (id) setClientName("");
            }}
            onEntityNameChange={setClientName}
          />
          <FinanceEntityPicker
            label="Projet lié"
            placeholder="Aucun"
            manualLabel="Autre projet — saisir le nom"
            manualPlaceholder="Nom du projet"
            options={filteredProjects.map((p) => ({ id: p.id, name: p.name }))}
            entityId={projectId}
            entityName={projectName}
            onEntityIdChange={onProjectIdChange}
            onEntityNameChange={setProjectName}
          />
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
                <option key={m.value} value={m.value}>
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
          <PaymentFieldLabel>Justificatif</PaymentFieldLabel>
          <PaymentProofUpload proofUrl={proofUrl} onProofUrlChange={setProofUrl} />
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

      <div className="flex flex-col-reverse gap-2 border-t border-app pt-4 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={onCancel}
          className={cn(glassBtnSecondary, "w-full sm:w-auto")}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading || !canSubmit}
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
