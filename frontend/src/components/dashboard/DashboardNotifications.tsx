"use client";

import Link from "next/link";
import { AlertTriangle, Bell, X } from "lucide-react";
import { useState } from "react";
import type { DashboardStats, Notification } from "@/types";

interface DashboardNotificationsProps {
  stats?: DashboardStats;
  notifications?: Notification[];
}

export default function DashboardNotifications({
  stats,
  notifications = [],
}: DashboardNotificationsProps) {
  const [dismissed, setDismissed] = useState(false);

  const overdue = stats?.overdueInvoicesCount ?? 0;
  const unread = notifications.length;
  const unpaid = stats?.unpaidInvoicesAmount ?? 0;

  if (dismissed || (overdue === 0 && unread === 0)) return null;

  return (
    <div className="relative rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 rounded p-1 text-amber-700 hover:bg-amber-100"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
        <div className="space-y-2 text-sm text-amber-900">
          {overdue > 0 && (
            <p>
              <strong>{overdue}</strong> facture{overdue > 1 ? "s" : ""} en retard
              {unpaid > 0 && (
                <>
                  {" "}
                  — encours impayé :{" "}
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(unpaid)}
                </>
              )}
              .{" "}
              <Link href="/invoices" className="font-medium underline">
                Voir les factures
              </Link>
            </p>
          )}
          {unread > 0 && (
            <p className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              <strong>{unread}</strong> notification{unread > 1 ? "s" : ""} non lue
              {unread > 1 ? "s" : ""}.{" "}
              <Link href="/notifications" className="font-medium underline">
                Consulter
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
