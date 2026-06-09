import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, pattern = "dd MMM yyyy"): string {
  return format(new Date(date), pattern, { locale: fr });
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function formatActivityLabel(activity: {
  action: string;
  entity: string;
  project?: { name?: string } | null;
  details?: Record<string, unknown> | null;
}): string {
  const action = activity.action.toLowerCase();
  const entity = activity.entity;
  const name = activity.project?.name;
  const details = activity.details;
  const title = typeof details?.title === "string" ? details.title : undefined;
  const docName = typeof details?.name === "string" ? details.name : undefined;

  if (entity === "Task") {
    if (action === "completed" || action === "done") {
      return title ? `Tâche terminée · ${title}` : "Tâche terminée";
    }
    if (action === "created") return title ? `Tâche créée · ${title}` : "Tâche créée";
    if (action === "updated") return title ? `Tâche modifiée · ${title}` : "Tâche modifiée";
    if (action === "deleted") return "Tâche supprimée";
  }

  if (entity === "Project") {
    if (action === "create" || action === "created") {
      return name ? `Projet créé · ${name}` : "Projet créé";
    }
    if (action === "update" || action === "updated") {
      return name ? `Projet modifié · ${name}` : "Projet modifié";
    }
    if (action === "delete" || action === "deleted") {
      return name ? `Projet supprimé · ${name}` : "Projet supprimé";
    }
  }

  if (entity === "Devis") {
    if (action.includes("quote_created") || action === "created") return "Devis créé";
    if (action === "updated" || action === "update") return "Devis modifié";
    if (action === "sent") return "Devis envoyé";
    if (action === "accepted") return "Devis accepté";
  }

  if (entity === "Payment" || action === "payment_added") {
    return "Paiement reçu";
  }

  if (entity === "Document" || action === "document_added") {
    return docName ? `Document ajouté · ${docName}` : "Document ajouté";
  }

  if (entity === "Invoice") {
    if (action === "created") return "Facture créée";
    if (action === "updated") return "Facture modifiée";
  }

  if (action === "plan_added") return "Plan ajouté";
  if (action === "render_added") return "Rendu ajouté";

  return "Activité enregistrée";
}
