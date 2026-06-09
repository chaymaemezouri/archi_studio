import {
  differenceInCalendarDays,
  format,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";

/** Date locale pour les champs HTML date (évite le décalage UTC). */
export function toLocalDateInput(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function dateKey(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date.split("T")[0]) : date;
  return format(startOfDay(d), "yyyy-MM-dd");
}

export function isSameLocalDay(a: string | Date, b: string | Date): boolean {
  return isSameDay(new Date(a), new Date(b));
}

export function isWithin48Hours(date: string | Date): boolean {
  const d = new Date(date);
  const diff = d.getTime() - Date.now();
  return diff > 0 && diff < 48 * 60 * 60 * 1000;
}

export function isUrgentDeadline(date: string | Date, done?: boolean): boolean {
  if (done) return false;
  const d = new Date(date);
  if (d < startOfDay(new Date())) return true;
  return isWithin48Hours(date);
}

export function isOverdueDeadline(date: string | Date, done?: boolean): boolean {
  if (done) return false;
  return startOfDay(new Date(date)) < startOfDay(new Date());
}

export function isDeadlineToday(date: string | Date, done?: boolean): boolean {
  if (done) return false;
  return isSameLocalDay(date, new Date());
}

/** Dans les 7 prochains jours (pas aujourd'hui, pas en retard) */
export function isDeadlineSoon(date: string | Date, done?: boolean): boolean {
  if (done || isOverdueDeadline(date, done) || isDeadlineToday(date, done)) return false;
  const days = differenceInCalendarDays(startOfDay(new Date(date)), startOfDay(new Date()));
  return days > 0 && days <= 7;
}

export type DeadlineUrgency = "overdue" | "today" | "soon" | "normal";

export function getDeadlineUrgency(date: string | Date, done?: boolean): DeadlineUrgency {
  if (done) return "normal";
  if (isOverdueDeadline(date, done)) return "overdue";
  if (isDeadlineToday(date, done)) return "today";
  if (isDeadlineSoon(date, done)) return "soon";
  return "normal";
}

/** Libellés Aperçu : Aujourd'hui, Demain, Bientôt, En retard */
export type DeadlineDisplayUrgency = "overdue" | "today" | "tomorrow" | "soon";

export function getDeadlineDisplayUrgency(
  date: string | Date,
  done?: boolean
): DeadlineDisplayUrgency | null {
  if (done) return null;
  if (isOverdueDeadline(date, done)) return "overdue";
  if (isDeadlineToday(date, done)) return "today";
  const days = differenceInCalendarDays(
    startOfDay(new Date(date)),
    startOfDay(new Date())
  );
  if (days === 1) return "tomorrow";
  if (days > 1 && days <= 7) return "soon";
  return null;
}

export const DEADLINE_DISPLAY_LABELS: Record<DeadlineDisplayUrgency, string> = {
  overdue: "En retard",
  today: "Aujourd'hui",
  tomorrow: "Demain",
  soon: "Bientôt",
};

export const DEADLINE_DISPLAY_STYLES: Record<DeadlineDisplayUrgency, string> = {
  overdue: "bg-red-500/15 text-red-300 ring-red-400/25",
  today: "bg-rose-500/12 text-rose-300 ring-rose-400/20",
  tomorrow: "bg-violet-500/12 text-violet-300 ring-violet-400/20",
  soon: "bg-amber-500/12 text-amber-300 ring-amber-400/20",
};

export function formatOverdueDays(date: string | Date): string {
  const days = differenceInCalendarDays(startOfDay(new Date()), startOfDay(new Date(date)));
  if (days <= 0) return "En retard";
  if (days === 1) return "En retard de 1 jour";
  return `En retard de ${days} jours`;
}
