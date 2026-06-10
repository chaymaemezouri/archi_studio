import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  CheckSquare,
  FileText,
  FolderKanban,
  ReceiptText,
  Users,
  Wallet,
} from "lucide-react";

export type NotificationTypeKey =
  | "TASK_OVERDUE"
  | "TASK_TODAY"
  | "TASK_TOMORROW"
  | "TASK_URGENT"
  | "TASK_HIGH"
  | "MEETING_TODAY"
  | "MEETING_SOON"
  | "DEADLINE_OVERDUE"
  | "DEADLINE_TODAY"
  | "DEADLINE_3D"
  | "DEADLINE_7D"
  | "INVOICE_DUE"
  | "INVOICE_OVERDUE"
  | "PAYMENT_RECEIVED"
  | "DOCUMENT_ADDED"
  | "PROJECT_UPDATED";

export interface NotificationPreferences {
  enabled: boolean;
  types: Partial<Record<NotificationTypeKey, boolean>>;
  meetingSoonHours: number;
  deadlineHorizonDays: number;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  types: {},
  meetingSoonHours: 2,
  deadlineHorizonDays: 7,
};

export interface NotificationPrefGroup {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  types: { key: NotificationTypeKey; label: string }[];
}

export const NOTIFICATION_PREF_GROUPS: NotificationPrefGroup[] = [
  {
    id: "tasks",
    title: "Tâches",
    description: "Retards, échéances et priorités",
    icon: CheckSquare,
    types: [
      { key: "TASK_OVERDUE", label: "Tâches en retard" },
      { key: "TASK_TODAY", label: "Tâches du jour" },
      { key: "TASK_TOMORROW", label: "Tâches de demain" },
      { key: "TASK_URGENT", label: "Tâches urgentes" },
      { key: "TASK_HIGH", label: "Tâches prioritaires (sans date)" },
    ],
  },
  {
    id: "meetings",
    title: "Réunions",
    description: "Rappels du jour et alertes imminentes",
    icon: Users,
    types: [
      { key: "MEETING_TODAY", label: "Réunions aujourd'hui" },
      { key: "MEETING_SOON", label: "Réunion imminente" },
    ],
  },
  {
    id: "deadlines",
    title: "Deadlines",
    description: "Échéances projet et administratives",
    icon: CalendarClock,
    types: [
      { key: "DEADLINE_OVERDUE", label: "Deadlines dépassées" },
      { key: "DEADLINE_TODAY", label: "Deadlines aujourd'hui" },
      { key: "DEADLINE_3D", label: "Dans les 3 prochains jours" },
      { key: "DEADLINE_7D", label: "Cette semaine / à venir" },
    ],
  },
  {
    id: "finances",
    title: "Finances",
    description: "Factures et paiements",
    icon: ReceiptText,
    types: [
      { key: "INVOICE_DUE", label: "Factures à échéance" },
      { key: "INVOICE_OVERDUE", label: "Factures en retard" },
      { key: "PAYMENT_RECEIVED", label: "Paiements reçus" },
    ],
  },
  {
    id: "activity",
    title: "Activité",
    description: "Documents et mises à jour projet",
    icon: FolderKanban,
    types: [
      { key: "DOCUMENT_ADDED", label: "Nouveaux documents" },
      { key: "PROJECT_UPDATED", label: "Projets mis à jour" },
    ],
  },
];

export function isTypeEnabled(
  prefs: NotificationPreferences,
  key: NotificationTypeKey
): boolean {
  if (!prefs.enabled) return false;
  return prefs.types[key] !== false;
}

export function setTypeEnabled(
  prefs: NotificationPreferences,
  key: NotificationTypeKey,
  enabled: boolean
): NotificationPreferences {
  return {
    ...prefs,
    types: { ...prefs.types, [key]: enabled },
  };
}

export function setGroupEnabled(
  prefs: NotificationPreferences,
  group: NotificationPrefGroup,
  enabled: boolean
): NotificationPreferences {
  const types = { ...prefs.types };
  for (const { key } of group.types) {
    types[key] = enabled;
  }
  return { ...prefs, types };
}

export function isGroupFullyEnabled(
  prefs: NotificationPreferences,
  group: NotificationPrefGroup
): boolean {
  return group.types.every(({ key }) => isTypeEnabled(prefs, key));
}

export function isGroupPartiallyEnabled(
  prefs: NotificationPreferences,
  group: NotificationPrefGroup
): boolean {
  const enabledCount = group.types.filter(({ key }) =>
    isTypeEnabled(prefs, key)
  ).length;
  return enabledCount > 0 && enabledCount < group.types.length;
}

/** Icône secondaire pour le groupe finances / activité */
export const NOTIF_GROUP_ICONS: Record<string, LucideIcon> = {
  finances: Wallet,
  activity: FileText,
};
