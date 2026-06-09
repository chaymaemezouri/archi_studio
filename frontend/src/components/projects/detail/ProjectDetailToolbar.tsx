"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  dropdownItem,
  dropdownItemActive,
  dropdownItemInactive,
  dropdownSectionLabel,
  glassBtnIcon,
  glassDropdownPlain,
  glassInput,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";
import { detailToolbarRow } from "./project-detail-ui";

export type ProjectDetailFilterSection = {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  /** Valeur considérée comme « aucun filtre » (défaut : all) */
  defaultValue?: string;
};

export interface ProjectDetailToolbarProps {
  /** row = barre sous le titre ; inline = à côté du titre */
  layout?: "row" | "inline";
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    ariaLabel?: string;
  };
  sections?: ProjectDetailFilterSection[];
  className?: string;
  trailing?: React.ReactNode;
}

export default function ProjectDetailToolbar({
  layout = "row",
  search,
  sections = [],
  className,
  trailing,
}: ProjectDetailToolbarProps) {
  const isInline = layout === "inline";
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = useMemo(
    () =>
      sections.some((s) => {
        const def = s.defaultValue ?? "all";
        return s.value !== def;
      }),
    [sections]
  );

  useEffect(() => {
    if (!filterOpen) return;
    const close = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [filterOpen]);

  const showFilters = sections.length > 0;
  if (!search && !showFilters && !trailing) return null;

  return (
    <div
      className={cn(
        isInline
          ? "flex shrink-0 flex-wrap items-center gap-2"
          : detailToolbarRow,
        filterOpen && showFilters && "relative z-40",
        className
      )}
    >
      {search && (
        <div
          className={cn(
            "relative min-w-0",
            isInline ? "w-[min(100%,200px)] sm:w-[220px]" : "flex-1 sm:max-w-md"
          )}
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa3b0]/40"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder ?? "Rechercher…"}
            className={cn(glassInput, "h-8 w-full py-0 pl-9 pr-3 text-[12px]")}
            aria-label={search.ariaLabel ?? "Rechercher"}
          />
        </div>
      )}

      {showFilters && (
        <div ref={filterRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className={cn(
              glassBtnIcon,
              "relative h-8 gap-1.5 px-3 sm:w-auto",
              (filterOpen || hasActiveFilters) &&
                "border-studio-border/40 bg-studio-soft text-studio-light"
            )}
            aria-label="Filtrer"
            aria-expanded={filterOpen}
            aria-haspopup="dialog"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span className="text-[11px] font-medium sm:text-xs">Filtres</span>
            {hasActiveFilters && (
              <span
                className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-studio-light"
                aria-hidden
              />
            )}
          </button>

          {filterOpen && (
            <div
              role="dialog"
              aria-label="Filtres"
              className={cn(
                glassDropdownPlain,
                "absolute right-0 top-full z-50 mt-1.5 w-[min(220px,calc(100vw-2rem))] max-h-[min(60vh,360px)] overflow-y-auto"
              )}
            >
              {sections.map((section, idx) => (
                <div key={section.label}>
                  <p className={cn(dropdownSectionLabel, idx > 0 && "mt-1")}>
                    {section.label}
                  </p>
                  {section.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        section.onChange(opt.id);
                        setFilterOpen(false);
                      }}
                      className={cn(
                        dropdownItem,
                        section.value === opt.id
                          ? dropdownItemActive
                          : dropdownItemInactive
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {trailing}
    </div>
  );
}
