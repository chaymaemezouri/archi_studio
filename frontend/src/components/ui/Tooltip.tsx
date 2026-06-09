"use client";

import { cn } from "@/lib/utils";

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom";
}

export default function Tooltip({
  label,
  children,
  className,
  side = "top",
}: TooltipProps) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-glass bg-[color:var(--glass-dropdown-bg)] px-2 py-1 text-[10px] font-medium text-glass opacity-0 shadow-[var(--glass-shadow)] backdrop-blur-xl transition-opacity duration-150",
          "group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
        )}
      >
        {label}
      </span>
    </span>
  );
}
