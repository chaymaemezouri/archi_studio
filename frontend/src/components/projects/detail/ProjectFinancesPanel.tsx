"use client";

import Link from "next/link";
import { CheckCircle2, Plus } from "lucide-react";
import IconActionButton from "./IconActionButton";
import ProjectTabSectionHeader from "./ProjectTabSectionHeader";
import {
  detailChecklistDate,
  detailChecklistEmpty,
  detailChecklistItem,
  detailChecklistItemTitle,
  detailChecklistList,
  detailChecklistSection,
  detailChecklistStatusBadge,
  detailChecklistStatusUploaded,
  detailChecklistStatusValidated,
  detailFinanceStatGrid,
  detailFinanceStatLabel,
  detailFinanceStatValue,
  detailFinanceStatValueSuccess,
  detailFinanceStatValueWarning,
  detailIconActionGroup,
  detailLinkHover,
} from "./project-detail-ui";
import { useDialog } from "@/components/providers/DialogProvider";
import { usePayments } from "@/hooks/usePayments";
import { useProjectDetailMutations } from "@/hooks/useProjectDetail";
import { getInvoiceFinanceHref } from "@/lib/payment-utils";
import {
  getProjectGlobalAmount,
  getProjectRemainingToCollect,
  sumPaymentsForProject,
} from "@/lib/project-finance";
import {
  DEVIS_STATUS_LABELS,
  INVOICE_STATUS_LABELS,
  type Project,
} from "@/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface ProjectFinancesPanelProps {
  project: Project;
}

export default function ProjectFinancesPanel({ project }: ProjectFinancesPanelProps) {
  const { confirm } = useDialog();
  const { updateInvoice } = useProjectDetailMutations(project.id);
  const devis = project.devis ?? [];
  const invoices = project.invoices ?? [];
  const { data: projectPayments = [] } = usePayments({ projectId: project.id });
  const totalPaidOnProject = sumPaymentsForProject(project.id, projectPayments);
  const globalAmount = getProjectGlobalAmount(project);
  const remainingToCollect = getProjectRemainingToCollect(project, totalPaidOnProject);

  const totalInvoiced = invoices.reduce((s, i) => s + (i.totalTTC ?? 0), 0);
  const totalPaidInvoices = invoices.reduce((s, i) => s + (i.paidAmount ?? 0), 0);
  const remainingInvoices = Math.max(0, totalInvoiced - totalPaidInvoices);

  const markPaid = async (invoiceId: string) => {
    const ok = await confirm({
      title: "Facture payée",
      message: "Marquer cette facture comme payée ?",
      confirmLabel: "Marquer payée",
    });
    if (!ok) return;
    updateInvoice.mutate({ id: invoiceId, status: "PAID" });
  };

  const quotesUrl = `/finances/quotes-invoices?projectId=${project.id}&new=devis`;
  const invoiceUrl = `/finances/quotes-invoices?projectId=${project.id}&new=invoice`;
  const paymentParams = new URLSearchParams({
    new: "payment",
    projectId: project.id,
  });
  if (project.clientId) paymentParams.set("clientId", project.clientId);
  const paymentsUrl = `/payments?${paymentParams.toString()}`;

  return (
    <div className="space-y-6">
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader title="Finances" />
        <div className={detailFinanceStatGrid}>
          <div>
            <p className={detailFinanceStatLabel}>Montant global du projet</p>
            <p className={detailFinanceStatValue}>
              {globalAmount != null ? formatCurrency(globalAmount) : "—"}
            </p>
          </div>
          <div>
            <p className={detailFinanceStatLabel}>Honoraires déclarés (contrat)</p>
            <p className={detailFinanceStatValue}>
              {project.contractArchitectFees != null
                ? formatCurrency(project.contractArchitectFees)
                : "—"}
            </p>
          </div>
          <div>
            <p className={detailFinanceStatLabel}>Honoraires réels à encaisser</p>
            <p className={detailFinanceStatValue}>
              {project.actualFeesToCollect != null
                ? formatCurrency(project.actualFeesToCollect)
                : "—"}
            </p>
          </div>
          <div>
            <p className={detailFinanceStatLabel}>Total encaissé</p>
            <p className={cn(detailFinanceStatValue, detailFinanceStatValueSuccess)}>
              {formatCurrency(totalPaidOnProject)}
            </p>
          </div>
          <div>
            <p className={detailFinanceStatLabel}>Reste à encaisser</p>
            <p className={cn(detailFinanceStatValue, detailFinanceStatValueWarning)}>
              {project.actualFeesToCollect != null
                ? formatCurrency(remainingToCollect)
                : formatCurrency(remainingInvoices)}
            </p>
          </div>
          <div>
            <p className={detailFinanceStatLabel}>Total facturé</p>
            <p className={detailFinanceStatValue}>{formatCurrency(totalInvoiced)}</p>
          </div>
        </div>
      </section>

      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Devis"
          count={devis.length}
          action={{ label: "Nouveau devis", icon: Plus, href: quotesUrl }}
        />
        {devis.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucun devis pour ce projet.</p>
        ) : (
          <ul className={detailChecklistList}>
            {devis.map((d) => (
              <li key={d.id} className={detailChecklistItem}>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/finances/quotes-invoices?edit=devis&id=${d.id}`}
                    className={cn(detailChecklistItemTitle, detailLinkHover)}
                  >
                    Devis {d.number}
                  </Link>
                </div>
                <span
                  className={cn(
                    detailChecklistStatusBadge,
                    detailChecklistStatusUploaded
                  )}
                >
                  {DEVIS_STATUS_LABELS[d.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Factures"
          count={invoices.length}
          action={{ label: "Nouvelle facture", icon: Plus, href: invoiceUrl }}
        />
        {invoices.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucune facture pour ce projet.</p>
        ) : (
          <ul className={detailChecklistList}>
            {invoices.map((inv) => (
              <li key={inv.id} className={detailChecklistItem}>
                <div className="min-w-0 flex-1">
                  <Link
                    href={getInvoiceFinanceHref(inv.id)}
                    className={cn(detailChecklistItemTitle, detailLinkHover)}
                  >
                    {inv.number}
                  </Link>
                  <p className={detailChecklistDate}>
                    {formatCurrency(inv.totalTTC)}
                    {inv.dueDate ? ` · ${formatDate(inv.dueDate)}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    detailChecklistStatusBadge,
                    inv.status === "PAID"
                      ? detailChecklistStatusValidated
                      : detailChecklistStatusUploaded
                  )}
                >
                  {INVOICE_STATUS_LABELS[inv.status]}
                </span>
                {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                  <div className={detailIconActionGroup}>
                    <IconActionButton
                      label="Marquer payée"
                      icon={CheckCircle2}
                      tone="success"
                      onClick={() => markPaid(inv.id)}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Paiements"
          count={projectPayments.length}
          action={{
            label: "Ajouter un paiement",
            icon: Plus,
            href: paymentsUrl,
          }}
        />
        {projectPayments.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucun paiement enregistré.</p>
        ) : (
          <ul className={detailChecklistList}>
            {projectPayments.map((p) => (
              <li key={p.id} className={detailChecklistItem}>
                <div className="min-w-0 flex-1">
                  <p className={detailChecklistItemTitle}>
                    {formatCurrency(p.amount)}
                  </p>
                  <p className={detailChecklistDate}>
                    {p.invoice?.number
                      ? `Facture ${p.invoice.number} · ${formatDate(p.date)}`
                      : formatDate(p.date)}
                  </p>
                </div>
                <span
                  className={cn(
                    detailChecklistStatusBadge,
                    detailChecklistStatusValidated
                  )}
                >
                  {p.method}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
