import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckSquare,
  ClipboardList,
  FileText,
  FolderKanban,
  ReceiptText,
  Users,
  Wallet,
} from "lucide-react";

export interface NotificationMeta {
  icon: LucideIcon;
  label: string;
  tone: "urgent" | "today" | "soon" | "info";
}

const META: Record<string, NotificationMeta> = {
  TASK_OVERDUE: { icon: CheckSquare, label: "Tâche en retard", tone: "urgent" },
  TASK_TODAY: { icon: CheckSquare, label: "Tâche du jour", tone: "today" },
  TASK_TOMORROW: { icon: CheckSquare, label: "Tâche demain", tone: "soon" },
  MEETING_TODAY: { icon: Users, label: "Réunion", tone: "today" },
  MEETING_SOON: { icon: Users, label: "Réunion imminente", tone: "urgent" },
  DEADLINE_OVERDUE: { icon: CalendarClock, label: "Deadline dépassée", tone: "urgent" },
  DEADLINE_TODAY: { icon: CalendarClock, label: "Deadline aujourd'hui", tone: "today" },
  DEADLINE_3D: { icon: CalendarClock, label: "Deadline 3 j", tone: "soon" },
  DEADLINE_7D: { icon: CalendarClock, label: "Deadline semaine", tone: "soon" },
  INVOICE_DUE: { icon: ReceiptText, label: "Facture à échéance", tone: "soon" },
  INVOICE_OVERDUE: { icon: ReceiptText, label: "Facture en retard", tone: "urgent" },
  PAYMENT_RECEIVED: { icon: Wallet, label: "Paiement reçu", tone: "info" },
  DOCUMENT_ADDED: { icon: FileText, label: "Document", tone: "info" },
  PROJECT_UPDATED: { icon: FolderKanban, label: "Projet", tone: "info" },
};

export function getNotificationMeta(type: string): NotificationMeta {
  return (
    META[type] ?? {
      icon: Bell,
      label: "Notification",
      tone: "info",
    }
  );
}

export const NOTIF_TONE_STYLES = {
  urgent: {
    icon: "text-rose-300/90 bg-rose-500/12 border-rose-400/20",
    badge: "text-rose-300/90 bg-rose-500/10",
  },
  today: {
    icon: "text-amber-200/90 bg-amber-500/12 border-amber-400/20",
    badge: "text-amber-200/85 bg-amber-500/10",
  },
  soon: {
    icon: "text-studio-light/90 bg-studio-muted/40 border-studio-border/30",
    badge: "text-studio-light/80 bg-studio-muted/30",
  },
  info: {
    icon: "text-white/55 bg-white/[0.04] border-white/[0.08]",
    badge: "text-white/45 bg-white/[0.04]",
  },
} as const;
