import { applyThemeToDocument, isThemeMode, type ThemeMode } from "@/lib/theme";

const PREFS_KEY = "architecture-studio-user-prefs";

export const USER_PREFS_CHANGED = "architecture-studio-prefs-changed";

export const VIEW_KEYS = {
  projects: "projects-list-view",
  tasks: "tasks-list-view",
  calendar: "calendar-view-mode",
  tasksShowDone: "tasks-show-done",
  calendarShowDone: "calendar-show-done",
} as const;

export interface UserAppPreferences {
  theme: ThemeMode;
  defaultProjectsView: "grid" | "list";
  defaultTasksView: "list" | "board";
  defaultCalendarView: "month" | "week" | "day" | "list";
  showDoneTasksByDefault: boolean;
  showDoneCalendarByDefault: boolean;
}

const DEFAULTS: UserAppPreferences = {
  theme: "dark",
  defaultProjectsView: "grid",
  defaultTasksView: "list",
  defaultCalendarView: "month",
  showDoneTasksByDefault: false,
  showDoneCalendarByDefault: false,
};

function emitPreferencesChanged(prefs: UserAppPreferences) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<UserAppPreferences>(USER_PREFS_CHANGED, { detail: prefs })
  );
}

export function loadUserPreferences(): UserAppPreferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<UserAppPreferences>;
    return {
      ...DEFAULTS,
      ...parsed,
      theme: isThemeMode(parsed.theme) ? parsed.theme : DEFAULTS.theme,
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveUserPreferences(prefs: UserAppPreferences) {
  if (typeof window === "undefined") return;
  const current = loadUserPreferences();
  if (JSON.stringify(current) === JSON.stringify(prefs)) return;

  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  localStorage.setItem(VIEW_KEYS.projects, prefs.defaultProjectsView);
  localStorage.setItem(VIEW_KEYS.tasks, prefs.defaultTasksView);
  localStorage.setItem(VIEW_KEYS.calendar, prefs.defaultCalendarView);
  localStorage.setItem(VIEW_KEYS.tasksShowDone, String(prefs.showDoneTasksByDefault));
  localStorage.setItem(
    VIEW_KEYS.calendarShowDone,
    String(prefs.showDoneCalendarByDefault)
  );
  applyThemeToDocument(prefs.theme);
  emitPreferencesChanged(prefs);
}

export function patchUserPreferences(
  patch: Partial<UserAppPreferences>
): UserAppPreferences {
  const next = { ...loadUserPreferences(), ...patch };
  saveUserPreferences(next);
  return next;
}

export function subscribeUserPreferences(
  listener: (prefs: UserAppPreferences) => void
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent<UserAppPreferences>).detail;
    listener(detail ?? loadUserPreferences());
  };

  const onStorage = (event: StorageEvent) => {
    if (
      event.key === PREFS_KEY ||
      (event.key && Object.values(VIEW_KEYS).includes(event.key as (typeof VIEW_KEYS)[keyof typeof VIEW_KEYS]))
    ) {
      listener(loadUserPreferences());
    }
  };

  window.addEventListener(USER_PREFS_CHANGED, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(USER_PREFS_CHANGED, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

export function getInitialProjectsView(): "grid" | "list" {
  if (typeof window === "undefined") return DEFAULTS.defaultProjectsView;
  return loadUserPreferences().defaultProjectsView;
}

export function getInitialTasksView(): "list" | "board" {
  if (typeof window === "undefined") return DEFAULTS.defaultTasksView;
  return loadUserPreferences().defaultTasksView;
}

export function getInitialCalendarView(): UserAppPreferences["defaultCalendarView"] {
  if (typeof window === "undefined") return DEFAULTS.defaultCalendarView;
  return loadUserPreferences().defaultCalendarView;
}

export function getInitialTasksShowDone(): boolean {
  if (typeof window === "undefined") return DEFAULTS.showDoneTasksByDefault;
  return loadUserPreferences().showDoneTasksByDefault;
}

export function getInitialCalendarShowDone(): boolean {
  if (typeof window === "undefined") return DEFAULTS.showDoneCalendarByDefault;
  return loadUserPreferences().showDoneCalendarByDefault;
}

export function persistProjectsView(view: "grid" | "list") {
  patchUserPreferences({ defaultProjectsView: view });
}

export function persistTasksView(view: "list" | "board") {
  patchUserPreferences({ defaultTasksView: view });
}

export function persistCalendarView(
  view: UserAppPreferences["defaultCalendarView"]
) {
  patchUserPreferences({ defaultCalendarView: view });
}

export function persistTasksShowDone(show: boolean) {
  patchUserPreferences({ showDoneTasksByDefault: show });
}

export function persistCalendarShowDone(show: boolean) {
  patchUserPreferences({ showDoneCalendarByDefault: show });
}

export function persistTheme(theme: ThemeMode) {
  patchUserPreferences({ theme });
}
