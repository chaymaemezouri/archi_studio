const PREFS_KEY = "architecture-studio-user-prefs";

export const VIEW_KEYS = {
  projects: "projects-list-view",
  tasks: "tasks-list-view",
  calendar: "calendar-view-mode",
  tasksShowDone: "tasks-show-done",
  calendarShowDone: "calendar-show-done",
} as const;

export interface UserAppPreferences {
  defaultProjectsView: "grid" | "list";
  defaultTasksView: "list" | "board";
  defaultCalendarView: "month" | "week" | "day" | "list";
  showDoneTasksByDefault: boolean;
  showDoneCalendarByDefault: boolean;
}

const DEFAULTS: UserAppPreferences = {
  defaultProjectsView: "grid",
  defaultTasksView: "list",
  defaultCalendarView: "month",
  showDoneTasksByDefault: false,
  showDoneCalendarByDefault: false,
};

export function loadUserPreferences(): UserAppPreferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function saveUserPreferences(prefs: UserAppPreferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  localStorage.setItem(VIEW_KEYS.projects, prefs.defaultProjectsView);
  localStorage.setItem(VIEW_KEYS.tasks, prefs.defaultTasksView);
  localStorage.setItem(VIEW_KEYS.calendar, prefs.defaultCalendarView);
  localStorage.setItem(VIEW_KEYS.tasksShowDone, String(prefs.showDoneTasksByDefault));
  localStorage.setItem(VIEW_KEYS.calendarShowDone, String(prefs.showDoneCalendarByDefault));
}

export function getInitialProjectsView(): "grid" | "list" {
  const v = localStorage.getItem(VIEW_KEYS.projects);
  if (v === "grid" || v === "list") return v;
  return loadUserPreferences().defaultProjectsView;
}

export function getInitialTasksView(): "list" | "board" {
  const v = localStorage.getItem(VIEW_KEYS.tasks);
  if (v === "list" || v === "board") return v;
  return loadUserPreferences().defaultTasksView;
}

export function getInitialCalendarView(): UserAppPreferences["defaultCalendarView"] {
  const v = localStorage.getItem(VIEW_KEYS.calendar);
  if (v === "month" || v === "week" || v === "day" || v === "list") return v;
  return loadUserPreferences().defaultCalendarView;
}

export function getInitialTasksShowDone(): boolean {
  const v = localStorage.getItem(VIEW_KEYS.tasksShowDone);
  if (v === "true" || v === "false") return v === "true";
  return loadUserPreferences().showDoneTasksByDefault;
}

export function getInitialCalendarShowDone(): boolean {
  const v = localStorage.getItem(VIEW_KEYS.calendarShowDone);
  if (v === "true" || v === "false") return v === "true";
  return loadUserPreferences().showDoneCalendarByDefault;
}
