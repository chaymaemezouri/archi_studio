"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { glassCard, glassCardHover } from "./styles";

interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
  href: string;
  icon: LucideIcon;
  iconClassName?: string;
  compact?: boolean;
}

export default function StatCard({
  label,
  value,
  description,
  href,
  icon: Icon,
  iconClassName,
  compact,
}: StatCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "block",
        glassCard,
        glassCardHover,
        compact ? "p-4" : "p-5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p
            className={cn(
              "font-light tracking-tight text-slate-900",
              compact ? "mt-1 text-2xl text-slate-400" : "mt-2 text-3xl"
            )}
          >
            {value}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{description}</p>
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl bg-slate-100/80",
            compact ? "h-8 w-8" : "h-10 w-10"
          )}
        >
          <Icon className={cn("h-4 w-4", iconClassName ?? "text-slate-600")} />
        </div>
      </div>
    </Link>
  );
}
