import { redirect } from "next/navigation";

export default function DevisDetailPage({ params }: { params: { id: string } }) {
  redirect(`/finances/quotes-invoices?edit=devis&id=${params.id}`);
}
