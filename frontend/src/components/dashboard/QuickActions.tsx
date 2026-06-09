"use client";

import Link from "next/link";
import { FolderKanban, Receipt, FileSpreadsheet, Users } from "lucide-react";
import Card from "@/components/ui/Card";

const actions = [
  { href: "/projects", label: "Nouveau projet", icon: FolderKanban, color: "bg-blue-500/20 text-blue-400" },
  { href: "/finances/quotes-invoices?new=invoice", label: "Nouvelle facture", icon: Receipt, color: "bg-emerald-500/20 text-emerald-400" },
  { href: "/finances/quotes-invoices?new=devis", label: "Nouveau devis", icon: FileSpreadsheet, color: "bg-purple-500/20 text-purple-400" },
  { href: "/clients", label: "Nouveau client", icon: Users, color: "bg-amber-500/20 text-amber-400" },
];

export default function QuickActions() {
  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-text-primary">Actions rapides</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-xl border border-dark-border bg-dark-elevated p-3 transition-colors hover:border-accent/30 hover:bg-white/5"
            >
              <div className={`rounded-lg p-2 ${action.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-text-primary">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

