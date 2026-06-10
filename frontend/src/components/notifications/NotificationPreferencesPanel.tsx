"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  isGroupFullyEnabled,
  isGroupPartiallyEnabled,
  isTypeEnabled,
  NOTIFICATION_PREF_GROUPS,
  setGroupEnabled,
  setTypeEnabled,
  type NotificationPreferences,
} from "@/lib/notification-preferences";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/useNotificationPreferences";
import {
  accentBar,
  glassBtnPrimary,
  glassInput,
  glassPanel,
  glassSelect,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

const checkboxClass =
  "h-4 w-4 shrink-0 rounded border-white/20 bg-[color:var(--glass-bg-hover)] accent-studio-light";

export default function NotificationPreferencesPanel() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const [draft, setDraft] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data) {
      setDraft(data);
      setDirty(false);
    }
  }, [data]);

  const patchDraft = (next: NotificationPreferences) => {
    setDraft(next);
    setDirty(true);
  };

  const handleSave = () => {
    updatePrefs.mutate(draft, {
      onSuccess: () => {
        toast.success("Préférences enregistrées");
        setDirty(false);
      },
      onError: () => toast.error("Impossible d'enregistrer les préférences"),
    });
  };

  const handleReset = () => {
    patchDraft(DEFAULT_NOTIFICATION_PREFERENCES);
  };

  return (
    <div className={cn(glassPanel, "overflow-hidden")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-[color:var(--glass-bg-hover)]"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={accentBar} aria-hidden />
          <Settings2 className="h-4 w-4 shrink-0 text-studio-light/80" strokeWidth={1.75} />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-app-primary">
              Personnaliser les alertes
            </p>
            <p className="truncate text-[11px] text-glass-muted">
              Choisissez quoi notifier et quand (tâches, réunions, deadlines…)
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-glass-muted transition",
            open && "rotate-180"
          )}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div className="border-t border-glass px-4 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-[color:var(--glass-bg-hover)]"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-glass bg-[color:var(--glass-bg-hover)]/40 px-3 py-3">
                <input
                  type="checkbox"
                  checked={draft.enabled}
                  onChange={(e) =>
                    patchDraft({ ...draft, enabled: e.target.checked })
                  }
                  className={cn(checkboxClass, "mt-0.5")}
                />
                <div>
                  <p className="text-[13px] font-medium text-app-primary">
                    Alertes intelligentes activées
                  </p>
                  <p className="mt-0.5 text-[11px] text-glass-muted">
                    Désactivez pour ne plus recevoir de rappels automatiques.
                  </p>
                </div>
              </label>

              <div
                className={cn(
                  "grid gap-4 sm:grid-cols-2",
                  !draft.enabled && "pointer-events-none opacity-45"
                )}
              >
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-glass-secondary">
                    Réunion imminente
                  </label>
                  <select
                    value={draft.meetingSoonHours}
                    onChange={(e) =>
                      patchDraft({
                        ...draft,
                        meetingSoonHours: Number(e.target.value),
                      })
                    }
                    className={glassSelect}
                  >
                    <option value={1}>1 heure avant</option>
                    <option value={2}>2 heures avant</option>
                    <option value={3}>3 heures avant</option>
                    <option value={4}>4 heures avant</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-glass-secondary">
                    Horizon deadlines
                  </label>
                  <select
                    value={draft.deadlineHorizonDays}
                    onChange={(e) =>
                      patchDraft({
                        ...draft,
                        deadlineHorizonDays: Number(e.target.value),
                      })
                    }
                    className={glassSelect}
                  >
                    <option value={3}>3 jours à l&apos;avance</option>
                    <option value={7}>7 jours à l&apos;avance</option>
                    <option value={14}>14 jours à l&apos;avance</option>
                  </select>
                </div>
              </div>

              <div
                className={cn(
                  "space-y-3",
                  !draft.enabled && "pointer-events-none opacity-45"
                )}
              >
                {NOTIFICATION_PREF_GROUPS.map((group) => {
                  const Icon = group.icon;
                  const allOn = isGroupFullyEnabled(draft, group);
                  const partial = isGroupPartiallyEnabled(draft, group);

                  return (
                    <div
                      key={group.id}
                      className="rounded-lg border border-glass bg-[color:var(--glass-bg-hover)]/30 p-3"
                    >
                      <div className="mb-2.5 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <Icon
                            className="mt-0.5 h-4 w-4 shrink-0 text-studio-light/75"
                            strokeWidth={1.75}
                          />
                          <div>
                            <p className="text-[12px] font-semibold text-app-primary">
                              {group.title}
                            </p>
                            <p className="text-[11px] text-glass-muted">
                              {group.description}
                            </p>
                          </div>
                        </div>
                        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px] text-glass-muted">
                          <input
                            type="checkbox"
                            checked={allOn}
                            ref={(el) => {
                              if (el) el.indeterminate = partial;
                            }}
                            onChange={(e) =>
                              patchDraft(
                                setGroupEnabled(draft, group, e.target.checked)
                              )
                            }
                            className={checkboxClass}
                          />
                          Tout
                        </label>
                      </div>
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {group.types.map(({ key, label }) => (
                          <label
                            key={key}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-glass-secondary hover:bg-[color:var(--glass-bg-hover)]"
                          >
                            <input
                              type="checkbox"
                              checked={isTypeEnabled(draft, key)}
                              onChange={(e) =>
                                patchDraft(
                                  setTypeEnabled(draft, key, e.target.checked)
                                )
                              }
                              className={checkboxClass}
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-glass pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={updatePrefs.isPending}
                  className={cn(glassInput, "w-auto px-4 py-2 text-[12px] font-medium")}
                >
                  Réinitialiser
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!dirty || updatePrefs.isPending}
                  className={cn(glassBtnPrimary, "px-4 py-2 text-[12px]")}
                >
                  {updatePrefs.isPending ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
