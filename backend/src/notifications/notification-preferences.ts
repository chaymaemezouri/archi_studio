import { NotifType } from '@prisma/client';

export type NotificationTypeKey = keyof typeof NotifType;

export interface NotificationPreferences {
  /** Interrupteur global — désactive toute génération d'alertes. */
  enabled: boolean;
  /** Par type : absent ou true = activé, false = désactivé. */
  types: Partial<Record<NotificationTypeKey, boolean>>;
  /** Alerte « réunion imminente » : heures avant le début (1–4). */
  meetingSoonHours: number;
  /** Horizon des rappels deadline en jours (3, 7 ou 14). */
  deadlineHorizonDays: number;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  types: {},
  meetingSoonHours: 2,
  deadlineHorizonDays: 7,
};

const ALL_TYPES = Object.values(NotifType) as NotificationTypeKey[];

export function mergeNotificationPreferences(
  raw: unknown,
): NotificationPreferences {
  const input =
    raw && typeof raw === 'object' ? (raw as Partial<NotificationPreferences>) : {};

  const meetingSoonHours = clamp(
    Number(input.meetingSoonHours ?? DEFAULT_NOTIFICATION_PREFERENCES.meetingSoonHours),
    1,
    4,
  );
  const deadlineHorizonDays = [3, 7, 14].includes(
    Number(input.deadlineHorizonDays),
  )
    ? Number(input.deadlineHorizonDays)
    : DEFAULT_NOTIFICATION_PREFERENCES.deadlineHorizonDays;

  const types: Partial<Record<NotificationTypeKey, boolean>> = {};
  if (input.types && typeof input.types === 'object') {
    for (const type of ALL_TYPES) {
      const value = (input.types as Record<string, unknown>)[type];
      if (typeof value === 'boolean') types[type] = value;
    }
  }

  return {
    enabled:
      typeof input.enabled === 'boolean'
        ? input.enabled
        : DEFAULT_NOTIFICATION_PREFERENCES.enabled,
    types,
    meetingSoonHours,
    deadlineHorizonDays,
  };
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function isNotificationTypeEnabled(
  prefs: NotificationPreferences,
  type: NotifType,
): boolean {
  if (!prefs.enabled) return false;
  return prefs.types[type as NotificationTypeKey] !== false;
}

export function getDisabledNotificationTypes(
  prefs: NotificationPreferences,
): NotifType[] {
  if (!prefs.enabled) return [...ALL_TYPES];
  return ALL_TYPES.filter(
    (type) => prefs.types[type] === false,
  ) as NotifType[];
}
