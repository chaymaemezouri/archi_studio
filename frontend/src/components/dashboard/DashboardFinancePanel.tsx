"use client";

import Link from "next/link";
import { ArrowUpRight, FileSpreadsheet, Receipt, Wallet } from "lucide-react";
import type { DashboardStats, Payment } from "@/types";
import { accentBar } from "@/lib/glass-styles";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { dashboardLink, dashboardPanel, dashboardPanelHeader, dashboardPanelTitle } from "./dashboard-ui";

interface DashboardFinancePanelProps {
  stats: DashboardStats;
  payments: Payment[];
  className?: string;
}

export default function DashboardFinancePanel({
  stats,
  payments,
  className,
}: DashboardFinancePanelProps) {
  const recent = payments.slice(0, 4);

  return (
    <section className={cn(dashboardPanel, className)}>
      <div className={dashboardPanelHeader}>
        <h3 className={dashboardPanelTitle}>
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Trésorerie
        </h3>
        <Link
          href="/payments"
          className={cn(dashboardLink, "inline-flex items-center gap-0.5 text-[10px]")}
        >
          Paiements
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-px border-b border-app bg-studio-muted/30">
        <Link
          href="/finances/quotes-invoices"
          className="flex items-center gap-2 bg-transparent px-3 py-2.5 transition hover:bg-studio-muted/40"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-studio-light/70" strokeWidth={1.75} />
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-glass-secondary">Devis</p>
            <p className="text-lg font-semibold tabular-nums text-app-primary">
              {stats.pendingDevis}
            </p>
          </div>
        </Link>
        <Link
          href="/finances/quotes-invoices"
          className="flex items-center gap-2 border-l border-app px-3 py-2.5 transition hover:bg-studio-muted/40"
        >
          <Receipt className="h-3.5 w-3.5 text-rose-600 dark:text-studio-light/70" strokeWidth={1.75} />
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-glass-secondary">Factures</p>
            <p className="text-lg font-semibold tabular-nums text-app-primary">
              {stats.pendingInvoices}
            </p>
          </div>
        </Link>
      </div>

      <div className="space-y-2 px-3 py-2.5">
        {stats.unpaidInvoicesAmount > 0 && (
          <div className="flex items-center justify-between rounded-md border border-[color:var(--badge-danger-ring)] bg-[color:var(--badge-danger-bg)] px-2.5 py-2">
            <span className="text-[11px] font-medium text-glass-secondary">Montant impayé</span>
            <span className="text-[12px] font-semibold tabular-nums text-[color:var(--badge-danger-text)]">
              {formatCurrency(stats.unpaidInvoicesAmount)}
            </span>
          </div>
        )}
        {stats.overdueInvoicesCount > 0 && (
          <p className="text-[11px] font-medium text-[color:var(--badge-danger-text)]">
            {stats.overdueInvoicesCount} facture{stats.overdueInvoicesCount > 1 ? "s" : ""} en
            retard
          </p>
        )}
        {stats.lastPaymentDate && (
          <div className="flex items-start gap-2 text-[11px] text-glass-secondary">
            <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0 text-studio-light" />
            <span>
              Dernier paiement{" "}
              <span className="text-glass">
                {formatCurrency(stats.lastPaymentAmount ?? 0)}
              </span>
              {stats.lastPaymentLabel && ` · ${stats.lastPaymentLabel}`}
              <span className="block text-[10px] text-glass-muted">
                {formatDate(stats.lastPaymentDate)}
              </span>
            </span>
          </div>
        )}
      </div>

      {recent.length > 0 && (
        <div className="border-t border-app px-3 py-2">
          <p className="mb-1.5 text-[9px] font-medium uppercase tracking-wide text-glass-muted">
            Encaissements récents
          </p>
          <ul className="space-y-1">
            {recent.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 text-[11px]"
              >
                <span className="min-w-0 truncate text-glass-secondary">
                  {p.invoice?.client?.name ?? p.invoice?.number ?? "Paiement"}
                </span>
                <span className="shrink-0 tabular-nums text-emerald-400/85">
                  {formatCurrency(p.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
