"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { glassBtnIcon } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className={cn(
        glassBtnIcon,
        "h-10 w-10 border-0 text-glass-secondary",
        "hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-studio-border/35"
      )}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
