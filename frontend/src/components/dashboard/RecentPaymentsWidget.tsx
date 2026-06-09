"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import DashboardCard from "./DashboardCard";
import type { Payment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  dashboardBottomCard,
  dashboardCardTitle,
  dashboardEmptyCompact,
  dashboardEmptyIconSm,
  dashboardLink,
} from "./dashboard-ui";

interface RecentPaymentsWidgetProps {
  payments?: Payment[];
  limit?: number;
}

export default function RecentPaymentsWidget({
  payments = [],
  limit = 3,
}: RecentPaymentsWidgetProps) {
  const items = payments.slice(0, limit);
  const isEmpty = items.length === 0;

  return (
    <DashboardCard className={cn(dashboardBottomCard, isEmpty && "!min-h-0")}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className={dashboardCardTitle}>Paiements récents</h2>
        {!isEmpty && (
          <Link href="/payments" className={dashboardLink}>
            Voir tout
          </Link>
        )}
      </div>

      {isEmpty ? (
        <div className={cn(dashboardEmptyCompact, "gap-0.5")}>
          <div className={dashboardEmptyIconSm}>
            <CreditCard className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <p className="text-[11px] text-stone-500">Aucun paiement récent</p>
          <Link
            href="/payments"
            className="text-[10px] font-medium text-[#B85C15] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Voir finances
          </Link>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {items.map((payment) => (
            <li
              key={payment.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-stone-100/90 bg-stone-50/30 px-2.5 py-2 transition hover:bg-stone-50/60"
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-stone-800">
                  {payment.invoice?.client?.name || payment.invoice?.number || "Paiement"}
                </p>
                <p className="text-[10px] text-stone-500">{formatDate(payment.date)}</p>
              </div>
              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-emerald-700/90">
                {formatCurrency(payment.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
