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
import {
  dropdownItem,
  dropdownItemInactive,
  glassBtnIcon,
  glassMenu,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

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

const menuItemClass = cn(
  dropdownItem,
  dropdownItemInactive,
  "flex w-full items-center gap-2.5 border-l-0 px-3 py-2.5 text-sm"
);

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
        className={cn(glassBtnIcon, "h-9 w-9 shadow-[var(--glass-shadow)]")}
      >
        <Plus className="h-4 w-4" />
      </button>

      {open && (
        <div role="menu" className={cn(glassMenu, "absolute right-0 top-full z-50 mt-2 w-52")}>
          {LINK_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={menuItemClass}
              >
                <Icon className="h-4 w-4 text-glass-muted" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
          <div className="my-1 h-px bg-[color:var(--color-border)]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onQuickAdd("task");
              setOpen(false);
            }}
            className={menuItemClass}
          >
            <ClipboardList className="h-4 w-4 text-glass-muted" strokeWidth={1.75} />
            Nouvelle tâche
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onQuickAdd("deadline");
              setOpen(false);
            }}
            className={menuItemClass}
          >
            <CalendarClock className="h-4 w-4 text-glass-muted" strokeWidth={1.75} />
            Nouvelle deadline
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onQuickAdd("meeting");
              setOpen(false);
            }}
            className={menuItemClass}
          >
            <Users className="h-4 w-4 text-glass-muted" strokeWidth={1.75} />
            Nouvelle réunion
          </button>
        </div>
      )}
    </div>
  );
}
