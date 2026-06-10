"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardTaskCheckboxProps {
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export default function DashboardTaskCheckbox({
  checked,
  disabled,
  onToggle,
}: DashboardTaskCheckboxProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition sm:h-[14px] sm:w-[14px] sm:rounded-[3px]",
        checked
          ? "border-emerald-500 bg-emerald-100 dark:border-emerald-500/45 dark:bg-emerald-500/15"
          : "border-glass bg-[color:var(--glass-bg)] hover:border-studio-border",
        "disabled:opacity-40"
      )}
      aria-label={checked ? "Tâche terminée" : "Marquer terminée"}
    >
      {checked && (
        <Check className="h-2.5 w-2.5 text-emerald-700 dark:text-emerald-400" strokeWidth={3} />
      )}
    </button>
  );
}
