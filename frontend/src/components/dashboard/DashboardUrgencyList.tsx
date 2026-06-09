"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Briefcase,
  CalendarClock,
  ListTodo,
  Receipt,
} from "lucide-react";
import type { DashboardUrgencyItem, UrgencyStatusTone } from "@/lib/dashboard-urgency";
import { cn } from "@/lib/utils";
import { accentBar } from "@/lib/glass-styles";

const TYPE_ICONS = {
  project: Briefcase,
  task: ListTodo,
  deadline: CalendarClock,
  finance: Receipt,
} as const;

const TONE_BADGE: Record<UrgencyStatusTone, string> = {
  red: "border-red-400/25 bg-red-500/10 text-red-200/90",
  orange: "border-orange-400/25 bg-orange-500/10 text-orange-200/90",
  amber: "border-amber-400/22 bg-amber-500/10 text-amber-100/85",
  blue: "border-studio-light/20 bg-studio-light/10 text-studio-light/85",
  neutral: "border-glass bg-[color:var(--glass-bg-hover)] text-glass-muted",
};

interface DashboardUrgencyListProps {
  items: DashboardUrgencyItem[];
  className?: string;
}

export default function DashboardUrgencyList({ items, className }: DashboardUrgencyListProps) {
  return (
    <section className={cn("rounded-xl border border-glass bg-[color:var(--glass-bg)] shadow-[var(--card-shadow),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl", className)}>
      <div className="flex items-center justify-between border-b border-app px-3.5 py-2.5">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-glass">
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Priorités du jour
        </h2>
        {items.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-300/80">
            <AlertTriangle className="h-3 w-3" strokeWidth={1.75} />
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="px-3.5 py-6 text-center text-[12px] text-glass-muted">
          Aucune urgence aujourd&apos;hui.
        </p>
      ) : (
        <ul className="divide-y divide-white/[0.05]">
          {items.map((item) => {
            const Icon = TYPE_ICONS[item.type];
            return (
              <li key={item.id}>
                <div className="group flex items-center gap-2.5 px-3.5 py-2 transition hover:bg-[color:var(--glass-bg)]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-studio-light/12 bg-studio-light/[0.06]">
                    <Icon className="h-3.5 w-3.5 text-studio-light/75" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0 text-[9px] font-medium uppercase tracking-wide text-glass-muted">
                        {item.typeLabel}
                      </span>
                      {item.dateLabel && (
                        <span className="truncate text-[10px] text-glass-muted">{item.dateLabel}</span>
                      )}
                    </div>
                    <p className="truncate text-[12px] font-medium text-glass">{item.title}</p>
                    {item.subtitle && (
                      <p className="truncate text-[10px] text-glass-muted">{item.subtitle}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "hidden shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-medium sm:inline",
                      TONE_BADGE[item.statusTone]
                    )}
                  >
                    {item.statusLabel}
                  </span>
                  <Link
                    href={item.href}
                    className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-glass bg-[color:var(--glass-bg)] px-2 py-1 text-[10px] font-medium text-glass-muted transition hover:border-studio-light/25 hover:text-studio-light"
                  >
                    Ouvrir
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
