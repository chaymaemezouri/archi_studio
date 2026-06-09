import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { fr } from 'date-fns/locale';

export function buildActivityByDay(
  logs: { createdAt: Date }[],
  anchor: Date,
) {
  const start = startOfDay(addDays(anchor, -13));
  return Array.from({ length: 14 }, (_, i) => {
    const day = addDays(start, i);
    const value = logs.filter((l) =>
      isSameDay(new Date(l.createdAt), day),
    ).length;
    return {
      label: format(day, 'EEE', { locale: fr }),
      value,
    };
  });
}

export function buildRevenueByMonth(
  payments: { date: Date; amount: number | { toNumber?: () => number } }[],
  anchor: Date,
) {
  const start = startOfMonth(addMonths(anchor, -5));
  return Array.from({ length: 6 }, (_, i) => {
    const month = addMonths(start, i);
    const value = payments
      .filter((p) => isSameMonth(new Date(p.date), month))
      .reduce((sum, p) => {
        const amt =
          typeof p.amount === 'number'
            ? p.amount
            : Number(p.amount);
        return sum + amt;
      }, 0);
    return {
      label: format(month, 'MMM', { locale: fr }),
      value: Math.round(value),
    };
  });
}
