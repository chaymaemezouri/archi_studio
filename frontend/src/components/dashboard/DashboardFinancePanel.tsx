"use client";

import Link from "next/link";
import { ArrowUpRight, FileSpreadsheet, Receipt, Wallet } from "lucide-react";
import type { DashboardStats, Payment } from "@/types";
import { accentBar } from "@/lib/glass-styles";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { dashboardPanel, dashboardPanelHeader, dashboardPanelTitle } from "./dashboard-ui";

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
          className="inline-flex items-center gap-0.5 text-[10px] font-medium text-white/40 transition hover:text-studio-light"
        >
          Paiements
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-px border-b border-white/[0.06] bg-white/[0.04]">
        <Link
          href="/finances/quotes-invoices"
          className="flex items-center gap-2 bg-transparent px-3 py-2.5 transition hover:bg-white/[0.04]"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-studio-light/70" strokeWidth={1.75} />
          <div>
            <p className="text-[9px] uppercase tracking-wide text-white/38">Devis</p>
            <p className="text-lg font-semibold tabular-nums text-white/90">
              {stats.pendingDevis}
            </p>
          </div>
        </Link>
        <Link
          href="/finances/quotes-invoices"
          className="flex items-center gap-2 border-l border-white/[0.06] px-3 py-2.5 transition hover:bg-white/[0.04]"
        >
          <Receipt className="h-3.5 w-3.5 text-studio-light/70" strokeWidth={1.75} />
          <div>
            <p className="text-[9px] uppercase tracking-wide text-white/38">Factures</p>
            <p className="text-lg font-semibold tabular-nums text-white/90">
              {stats.pendingInvoices}
            </p>
          </div>
        </Link>
      </div>

      <div className="space-y-2 px-3 py-2.5">
        {stats.unpaidInvoicesAmount > 0 && (
          <div className="flex items-center justify-between rounded-md border border-rose-500/15 bg-rose-500/[0.06] px-2.5 py-2">
            <span className="text-[11px] text-white/55">Montant impayé</span>
            <span className="text-[12px] font-semibold tabular-nums text-rose-300/90">
              {formatCurrency(stats.unpaidInvoicesAmount)}
            </span>
          </div>
        )}
        {stats.overdueInvoicesCount > 0 && (
          <p className="text-[11px] text-rose-300/75">
            {stats.overdueInvoicesCount} facture{stats.overdueInvoicesCount > 1 ? "s" : ""} en
            retard
          </p>
        )}
        {stats.lastPaymentDate && (
          <div className="flex items-start gap-2 text-[11px] text-white/50">
            <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0 text-studio-light/60" />
            <span>
              Dernier paiement{" "}
              <span className="text-white/75">
                {formatCurrency(stats.lastPaymentAmount ?? 0)}
              </span>
              {stats.lastPaymentLabel && ` · ${stats.lastPaymentLabel}`}
              <span className="block text-[10px] text-white/35">
                {formatDate(stats.lastPaymentDate)}
              </span>
            </span>
          </div>
        )}
      </div>

      {recent.length > 0 && (
        <div className="border-t border-white/[0.06] px-3 py-2">
          <p className="mb-1.5 text-[9px] font-medium uppercase tracking-wide text-white/35">
            Encaissements récents
          </p>
          <ul className="space-y-1">
            {recent.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 text-[11px]"
              >
                <span className="min-w-0 truncate text-white/65">
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
