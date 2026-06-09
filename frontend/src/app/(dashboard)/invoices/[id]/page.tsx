"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import InvoicePreview from "@/components/invoices/InvoicePreview";
import { useInvoice } from "@/hooks/useInvoices";

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: invoice, isLoading } = useInvoice(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center">
        <p className="text-text-secondary">Facture introuvable</p>
        <Link href="/invoices" className="mt-4 inline-block text-accent">
          Retour aux factures
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux factures
      </Link>
      <InvoicePreview invoice={invoice} />
    </div>
  );
}
