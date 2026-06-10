"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { headerMenuItem } from "@/components/layout/header-ui";
import { glassBtnIcon } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "icon" | "menu";
  onToggle?: () => void;
  className?: string;
}

export default function ThemeToggle({
  variant = "icon",
  onToggle,
  className,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Mode clair" : "Mode sombre";

  const handleClick = () => {
    toggleTheme();
    onToggle?.();
  };

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(headerMenuItem, className)}
        role="menuitem"
      >
        {isDark ? (
          <Sun className="h-3.5 w-3.5 opacity-50" strokeWidth={1.75} aria-hidden />
        ) : (
          <Moon className="h-3.5 w-3.5 opacity-50" strokeWidth={1.75} aria-hidden />
        )}
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className={cn(
        glassBtnIcon,
        "h-10 w-10 border-0 text-glass-secondary",
        "hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-studio-border/35",
        className
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
