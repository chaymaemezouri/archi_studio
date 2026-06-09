"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  ClipboardList,
  CreditCard,
  FileSpreadsheet,
  FolderKanban,
  Plus,
  Users,
} from "lucide-react";

export type QuickAddAction = "task" | "deadline" | "meeting";

interface DashboardAddMenuProps {
  onQuickAdd: (action: QuickAddAction) => void;
  disabled?: boolean;
}

const LINK_ITEMS = [
  { href: "/projects?new=1", label: "Nouveau projet", icon: FolderKanban },
  { href: "/payments", label: "Nouveau paiement", icon: CreditCard },
  { href: "/finances/quotes-invoices?new=devis", label: "Nouveau devis", icon: FileSpreadsheet },
] as const;

export default function DashboardAddMenu({ onQuickAdd, disabled }: DashboardAddMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Ajouter"
        title="Ajouter"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/65 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:bg-white/[0.06] hover:text-studio-light disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border border-white/10 bg-[#101014]/95 py-1 shadow-xl backdrop-blur-xl"
        >
          {LINK_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
              >
                  <Icon className="h-4 w-4 text-white/45" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
          <div className="my-1 h-px bg-white/[0.08]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onQuickAdd("task");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
          >
            <ClipboardList className="h-4 w-4 text-white/45" strokeWidth={1.75} />
            Nouvelle tâche
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onQuickAdd("deadline");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
          >
            <CalendarClock className="h-4 w-4 text-white/45" strokeWidth={1.75} />
            Nouvelle deadline
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onQuickAdd("meeting");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
          >
            <Users className="h-4 w-4 text-white/45" strokeWidth={1.75} />
            Nouvelle réunion
          </button>
        </div>
      )}
    </div>
  );
}
