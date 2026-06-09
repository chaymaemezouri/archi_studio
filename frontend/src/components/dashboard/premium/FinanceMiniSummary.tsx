"use client";

import Link from "next/link";
import { FileSpreadsheet, Receipt } from "lucide-react";
import DashboardCard from "../DashboardCard";
import type { DashboardStats, Payment } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface FinanceMiniSummaryProps {
  stats?: DashboardStats;
  payments?: Payment[];
}

export default function FinanceMiniSummary({ stats, payments = [] }: FinanceMiniSummaryProps) {
  const devis = stats?.pendingDevis ?? 0;
  const invoices = stats?.pendingInvoices ?? 0;
  const unpaid = stats?.unpaidInvoicesAmount ?? 0;
  const recent = payments.slice(0, 3);

  return (
    <DashboardCard variant="glass">
      <h2 className="mb-4 text-base font-medium text-slate-800">Finance</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {devis > 0 && (
          <Link
            href="/finances/quotes-invoices"
            className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/50 px-4 py-3 transition hover:bg-white/80"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-xs text-slate-500">Devis en attente</p>
              <p className="text-lg font-light text-slate-900">{devis}</p>
            </div>
          </Link>
        )}
        {invoices > 0 && (
          <Link
            href="/finances/quotes-invoices?tab=invoices"
            className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/50 px-4 py-3 transition hover:bg-white/80"
          >
            <Receipt className="h-4 w-4 text-rose-600" />
            <div>
              <p className="text-xs text-slate-500">Factures à payer</p>
              <p className="text-lg font-light text-slate-900">
                {invoices}
                {unpaid > 0 && (
                  <span className="ml-1 text-xs text-slate-500">({formatCurrency(unpaid)})</span>
                )}
              </p>
            </div>
          </Link>
        )}
        {recent.length > 0 && (
          <div className="rounded-2xl border border-slate-200/60 bg-white/50 px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-slate-500">Paiements récents</p>
              <Link href="/payments" className="text-[10px] font-medium text-slate-600 hover:text-slate-900">
                Voir tout
              </Link>
            </div>
            <ul className="space-y-1.5">
              {recent.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-slate-700">
                    {p.invoice?.client?.name || p.invoice?.number || "Paiement"}
                  </span>
                  <span className="shrink-0 font-medium text-emerald-700">
                    {formatCurrency(p.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
