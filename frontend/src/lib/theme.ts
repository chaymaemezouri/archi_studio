export type ThemeMode = "dark" | "light";

export const THEME_CLASSES: ThemeMode[] = ["dark", "light"];

export function applyThemeToDocument(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme === "light" ? "light" : "dark";
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "dark" || value === "light";
}
