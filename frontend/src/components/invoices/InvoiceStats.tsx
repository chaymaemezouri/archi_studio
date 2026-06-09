"use client";

import { Receipt, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { formatCurrency } from "@/lib/utils";

interface InvoiceStatsProps {
  stats?: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  };
}

export default function InvoiceStats({ stats }: InvoiceStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total factures" value={stats?.total ?? 0} icon={Receipt} />
      <StatCard label="Payées" value={formatCurrency(stats?.paid ?? 0)} icon={CheckCircle} />
      <StatCard label="En attente" value={formatCurrency(stats?.pending ?? 0)} icon={Clock} />
      <StatCard label="En retard" value={formatCurrency(stats?.overdue ?? 0)} icon={AlertTriangle} />
    </div>
  );
}
