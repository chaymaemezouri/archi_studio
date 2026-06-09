import api from "@/lib/api";

export type FinancePdfType = "devis" | "invoices" | "payments";

export async function downloadFinancePdf(
  type: FinancePdfType,
  id: string,
  filename: string
): Promise<void> {
  const { data } = await api.get<ArrayBuffer>(`/pdf/${type}/${id}`, {
    responseType: "arraybuffer",
  });
  const blob = new Blob([data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadPaymentReceiptPdf(
  paymentId: string,
  filename?: string
): Promise<void> {
  await downloadFinancePdf(
    "payments",
    paymentId,
    filename ?? `recu-paiement-${paymentId.slice(0, 8)}.pdf`
  );
}
