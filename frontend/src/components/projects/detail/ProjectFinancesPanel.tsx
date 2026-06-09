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
import { useProjectDetailMutations } from "@/hooks/useProjectDetail";
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
  const { updateInvoice } = useProjectDetailMutations(project.id);
  const devis = project.devis ?? [];
  const invoices = project.invoices ?? [];
  const payments = invoices.flatMap((inv) =>
    (inv.payments ?? []).map((p) => ({ ...p, invoiceNumber: inv.number }))
  );

  const totalInvoiced = invoices.reduce((s, i) => s + (i.totalTTC ?? 0), 0);
  const totalPaid = invoices.reduce((s, i) => s + (i.paidAmount ?? 0), 0);
  const remaining = Math.max(0, totalInvoiced - totalPaid);

  const markPaid = (invoiceId: string) => {
    if (!window.confirm("Marquer cette facture comme payée ?")) return;
    updateInvoice.mutate({ id: invoiceId, status: "PAID" });
  };

  const quotesUrl = `/finances/quotes-invoices?projectId=${project.id}&new=devis`;
  const invoiceUrl = `/finances/quotes-invoices?projectId=${project.id}&new=invoice`;

  return (
    <div className="space-y-6">
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader title="Finances" />
        <div className={detailFinanceStatGrid}>
          <div>
            <p className={detailFinanceStatLabel}>Total facturé</p>
            <p className={detailFinanceStatValue}>{formatCurrency(totalInvoiced)}</p>
          </div>
          <div>
            <p className={detailFinanceStatLabel}>Total payé</p>
            <p className={cn(detailFinanceStatValue, detailFinanceStatValueSuccess)}>
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div>
            <p className={detailFinanceStatLabel}>Reste à payer</p>
            <p className={cn(detailFinanceStatValue, detailFinanceStatValueWarning)}>
              {formatCurrency(remaining)}
            </p>
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
                    href={`/invoices/${inv.id}`}
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
        <ProjectTabSectionHeader title="Paiements" count={payments.length} />
        {payments.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucun paiement enregistré.</p>
        ) : (
          <ul className={detailChecklistList}>
            {payments.map((p) => (
              <li key={p.id} className={detailChecklistItem}>
                <div className="min-w-0 flex-1">
                  <p className={detailChecklistItemTitle}>
                    {formatCurrency(p.amount)}
                  </p>
                  <p className={detailChecklistDate}>
                    Facture {p.invoiceNumber} · {formatDate(p.date)}
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
