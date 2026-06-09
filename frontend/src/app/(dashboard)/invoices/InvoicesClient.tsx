"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Receipt, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import InvoiceStats from "@/components/invoices/InvoiceStats";
import { useInvoices, useInvoiceStats, useCreateInvoice } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: stats } = useInvoiceStats();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createInvoice = useCreateInvoice();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") setModalOpen(true);
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Factures</h1>
          <p className="mt-1 text-text-secondary">Gestion de la facturation</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      <InvoiceStats stats={stats} />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aucune facture"
          description="Créez votre première facture."
          actionLabel="Nouvelle facture"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <Table
          data={invoices}
          keyExtractor={(i) => i.id}
          onRowClick={(i) => router.push(`/invoices/${i.id}`)}
          columns={[
            { key: "number", header: "Numéro" },
            { key: "client", header: "Client", render: (i) => i.client?.name || "—" },
            {
              key: "totalTTC",
              header: "Total TTC",
              render: (i) => formatCurrency(i.totalTTC),
            },
            {
              key: "status",
              header: "Statut",
              render: (i) => (
                <Badge className={INVOICE_STATUS_COLORS[i.status]}>
                  {INVOICE_STATUS_LABELS[i.status]}
                </Badge>
              ),
            },
            {
              key: "dueDate",
              header: "Deadline",
              render: (i) => (i.dueDate ? formatDate(i.dueDate) : "—"),
            },
          ]}
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle facture" size="xl">
        <InvoiceForm
          clients={clients}
          projects={projects}
          loading={createInvoice.isPending}
          onSubmit={(data) => {
            createInvoice.mutate(
              {
                clientId: data.clientId || undefined,
                projectId: data.projectId || undefined,
                object: data.object,
                status: data.status,
                tva: data.tva,
                issueDate: data.issueDate,
                paymentMethod: data.paymentMethod || undefined,
                bankTransferBy: data.bankTransferBy || undefined,
                notes: data.notes || undefined,
                items: data.items.map(({ description, quantity, unitPrice, order }) => ({
                  description: description ?? "",
                  quantity: quantity ?? 1,
                  unitPrice: unitPrice ?? 0,
                  order: order ?? 0,
                })),
              },
              { onSuccess: () => setModalOpen(false) }
            );
          }}
        />
      </Modal>
    </div>
  );
}
