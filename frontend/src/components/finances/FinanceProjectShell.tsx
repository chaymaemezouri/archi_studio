"use client";

import Link from "next/link";
import { accentBar } from "@/lib/glass-styles";
import { listShell } from "@/lib/theme-classes";
import { cn, formatCurrency } from "@/lib/utils";

interface FinanceProjectShellProps {
  projectId: string | null;
  projectName: string;
  count: number;
  countLabel: string;
  totalAmount?: number;
  children: React.ReactNode;
  className?: string;
}

export default function FinanceProjectShell({
  projectId,
  projectName,
  count,
  countLabel,
  totalAmount,
  children,
  className,
}: FinanceProjectShellProps) {
  const href = projectId ? `/projects/${projectId}?tab=finances` : undefined;

  return (
    <section className={cn(listShell, "space-y-3 p-3 sm:p-4", className)}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-app pb-2.5">
        <div className="min-w-0">
          {href ? (
            <Link
              href={href}
              className="flex items-center gap-2 text-[15px] font-semibold text-app-primary transition hover:text-studio-light"
            >
              <span className={cn(accentBar, "h-3.5")} aria-hidden />
              <span className="truncate">{projectName}</span>
            </Link>
          ) : (
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-app-primary">
              <span className={cn(accentBar, "h-3.5")} aria-hidden />
              <span className="truncate">{projectName}</span>
            </h2>
          )}
          <p className="mt-0.5 pl-3 text-[11px] text-glass-muted">
            {count} {countLabel}
            {totalAmount != null && totalAmount > 0 && (
              <span> · {formatCurrency(totalAmount)}</span>
            )}
          </p>
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-[11px] font-medium text-glass-muted transition hover:text-studio-light"
          >
            Voir le projet →
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}
