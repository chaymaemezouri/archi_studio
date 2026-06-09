"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

interface ProjectsPaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function ProjectsPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  className,
}: ProjectsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);
  const visibleCount = totalItems === 0 ? 0 : end - start + 1;

  if (totalItems <= pageSize) {
    return (
      <p className={cn("text-center text-xs text-white/35", className)}>
        {totalItems} projet{totalItems !== 1 ? "s" : ""} affiché
        {totalItems !== 1 ? "s" : ""}
      </p>
    );
  }

  const pages = getVisiblePages(safePage, totalPages);

  return (
    <nav
      className={cn("flex flex-col items-center gap-3 sm:flex-row sm:justify-between", className)}
      aria-label="Pagination des projets"
    >
      <p className="text-xs text-white/40 tabular-nums">
        {visibleCount} projet{visibleCount !== 1 ? "s" : ""} affiché
        {visibleCount !== 1 ? "s" : ""} sur {totalItems}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-lg border border-white/[0.08] px-2.5 text-xs font-medium transition",
            safePage <= 1
              ? "cursor-not-allowed text-white/25"
              : "text-white/60 hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white/85"
          )}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        <div className="flex items-center gap-0.5 px-0.5">
          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`e-${i}`} className="px-1.5 text-xs text-white/30" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  "flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-medium tabular-nums transition",
                  p === safePage
                    ? "border border-studio-border/50 bg-studio-muted text-studio-light"
                    : "border border-transparent text-white/50 hover:bg-white/[0.04] hover:text-white/75"
                )}
                aria-label={`Page ${p}`}
                aria-current={p === safePage ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-lg border border-white/[0.08] px-2.5 text-xs font-medium transition",
            safePage >= totalPages
              ? "cursor-not-allowed text-white/25"
              : "text-white/60 hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white/85"
          )}
          aria-label="Page suivante"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </nav>
  );
}
