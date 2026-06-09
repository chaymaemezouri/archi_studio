"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckSquare,
  ChevronDown,
  CreditCard,
  FileSpreadsheet,
  FolderKanban,
  Plus,
  Receipt,
  Upload,
  Users,
} from "lucide-react";
import { glassDropdown } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";
import QuickAddModal, { type QuickAddMode } from "@/components/dashboard/QuickAddModal";
import { useProjects } from "@/hooks/useProjects";

const LINK_ITEMS = [
  { href: "/projects?new=1", label: "Nouveau projet", icon: FolderKanban },
  { href: "/clients?new=1", label: "Nouveau client", icon: Users },
  { href: "/finances/quotes-invoices?new=devis", label: "Nouveau devis", icon: FileSpreadsheet },
  { href: "/finances/quotes-invoices?new=invoice", label: "Nouvelle facture", icon: Receipt },
  { href: "/payments", label: "Nouveau paiement", icon: CreditCard },
  { href: "/documents?new=1", label: "Ajouter document", icon: Upload },
] as const;

export default function GlobalAddMenu() {
  const [open, setOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState<QuickAddMode>("task");
  const ref = useRef<HTMLDivElement>(null);
  const { data: projects = [] } = useProjects();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const openQuickAdd = (mode: QuickAddMode) => {
    setQuickAddMode(mode);
    setQuickAddOpen(true);
    setOpen(false);
  };

  return (
    <>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Ajouter"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] px-3 py-1.5 text-[12px] font-medium text-white shadow-[0_8px_20px_rgba(217,119,6,0.35)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
        >
          <Plus className="h-3 w-3" />
          <span className="hidden sm:inline">Ajouter</span>
          <ChevronDown
            className={cn("h-2.5 w-2.5 opacity-80 transition", open && "rotate-180")}
          />
        </button>

        {open && (
          <div
            role="menu"
            className={cn(glassDropdown, "absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden py-1.5")}
          >
            {LINK_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-glass-secondary transition hover:bg-[color:var(--glass-bg-hover)] hover:text-app-primary focus-visible:outline-none focus-visible:bg-[color:var(--glass-bg-hover)]"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-glass-muted" />
                  {item.label}
                </Link>
              );
            })}
            <div className="my-1 border-t border-glass" />
            <button
              type="button"
              role="menuitem"
              onClick={() => openQuickAdd("task")}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-glass-secondary transition hover:bg-[color:var(--glass-bg-hover)] hover:text-app-primary focus-visible:outline-none focus-visible:bg-[color:var(--glass-bg-hover)]"
            >
              <CheckSquare className="h-3.5 w-3.5 shrink-0 text-glass-muted" />
              Nouvelle tâche
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => openQuickAdd("deadline")}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-glass-secondary transition hover:bg-[color:var(--glass-bg-hover)] hover:text-app-primary focus-visible:outline-none focus-visible:bg-[color:var(--glass-bg-hover)]"
            >
              <Calendar className="h-3.5 w-3.5 shrink-0 text-glass-muted" />
              Nouvelle deadline
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => openQuickAdd("meeting")}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-glass-secondary transition hover:bg-[color:var(--glass-bg-hover)] hover:text-app-primary focus-visible:outline-none focus-visible:bg-[color:var(--glass-bg-hover)]"
            >
              <Users className="h-3.5 w-3.5 shrink-0 text-glass-muted" />
              Nouvelle réunion
            </button>
          </div>
        )}
      </div>

      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultDate={new Date()}
        projects={projects}
        initialMode={quickAddMode}
      />
    </>
  );
}
