import type { Notification } from "@/types";

export type NotifFilter = "all" | "unread" | "urgent";

/** Types considérés urgents (retard, aujourd'hui critique, facture). */
export const URGENT_NOTIF_TYPES = new Set([
  "TASK_OVERDUE",
  "TASK_URGENT",
  "DEADLINE_OVERDUE",
  "INVOICE_OVERDUE",
  "MEETING_SOON",
  "DEADLINE_TODAY",
  "TASK_TODAY",
  "MEETING_TODAY",
]);

const PRIORITY: Record<string, number> = {
  TASK_OVERDUE: 0,
  TASK_URGENT: 1,
  DEADLINE_OVERDUE: 2,
  INVOICE_OVERDUE: 3,
  MEETING_SOON: 4,
  DEADLINE_TODAY: 5,
  TASK_TODAY: 6,
  MEETING_TODAY: 7,
  TASK_HIGH: 8,
  DEADLINE_3D: 9,
  TASK_TOMORROW: 10,
  DEADLINE_7D: 11,
  INVOICE_DUE: 12,
  PAYMENT_RECEIVED: 13,
  DOCUMENT_ADDED: 14,
  PROJECT_UPDATED: 15,
};

export function isUrgentNotification(n: Pick<Notification, "type">): boolean {
  return URGENT_NOTIF_TYPES.has(n.type);
}

export function notificationPriority(type: string): number {
  return PRIORITY[type] ?? 50;
}

export function sortNotifications(list: Notification[]): Notification[] {
  return [...list].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    const pa = notificationPriority(a.type);
    const pb = notificationPriority(b.type);
    if (pa !== pb) return pa - pb;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function filterNotifications(
  list: Notification[],
  filter: NotifFilter
): Notification[] {
  let out = list;
  if (filter === "unread") out = out.filter((n) => !n.read);
  if (filter === "urgent") out = out.filter(isUrgentNotification);
  return sortNotifications(out);
}

export function countUrgentUnread(list: Notification[]): number {
  return list.filter((n) => !n.read && isUrgentNotification(n)).length;
}
