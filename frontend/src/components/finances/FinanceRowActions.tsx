"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import IconActionButton from "@/components/projects/detail/IconActionButton";
import { quotesInvoicesIconActionGroup } from "./quotes-invoices-ui";
import { portalMenuStyle, usePortalRowMenu } from "@/hooks/usePortalRowMenu";
import { glassBtnIcon, glassMenu } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

const MENU_WIDTH = 200;

interface FinanceRowActionsProps {
  id: string;
  pdfLoading?: boolean;
  onEdit: () => void;
  onDownloadPdf?: () => void;
  onDelete?: () => void;
  extraIcons?: React.ReactNode;
  menuItems: React.ReactNode;
}

export function FinanceMenuLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center px-3 py-2 text-[13px] text-white/55 hover:bg-white/[0.06] hover:text-studio-light"
    >
      {children}
    </Link>
  );
}

export function FinanceMenuItem({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center px-3 py-2 text-left text-[13px]",
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-white/55 hover:bg-white/[0.06] hover:text-studio-light"
      )}
    >
      {label}
    </button>
  );
}

export default function FinanceRowActions({
  id,
  pdfLoading,
  onEdit,
  onDownloadPdf,
  onDelete,
  extraIcons,
  menuItems,
}: FinanceRowActionsProps) {
  const menuId = `finance-actions-${id}`;
  const { ref, menuRef, menuOpen, menuPos, closeMenu, toggleMenu } = usePortalRowMenu(
    MENU_WIDTH,
    120
  );

  const menuPanel =
    menuOpen && menuPos ? (
      <div
        ref={menuRef}
        role="menu"
        aria-labelledby={menuId}
        className={cn(glassMenu, "fixed z-[200] min-w-[200px] py-1")}
        style={portalMenuStyle(menuPos)}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("button[role='menuitem']")) closeMenu();
        }}
      >
        {menuItems}
      </div>
    ) : null;

  return (
    <div className="flex items-center justify-end gap-1">
      <div className={quotesInvoicesIconActionGroup}>
        <IconActionButton label="Modifier" icon={Pencil} tone="notes" onClick={onEdit} />
        {onDownloadPdf && (
          <IconActionButton
            label={pdfLoading ? "Génération PDF…" : "Télécharger PDF"}
            icon={Download}
            tone="download"
            onClick={onDownloadPdf}
            disabled={pdfLoading}
          />
        )}
        {extraIcons}
        {onDelete && (
          <IconActionButton label="Supprimer" icon={Trash2} tone="danger" onClick={onDelete} />
        )}
      </div>
      <div ref={ref} className="relative">
        <button
          type="button"
          id={menuId}
          onClick={toggleMenu}
          className={cn(
            glassBtnIcon,
            "h-10 w-10 border-0 md:h-8 md:w-8",
            menuOpen && "bg-studio-soft text-studio-light"
          )}
          aria-label="Plus d'actions"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {typeof document !== "undefined" &&
          menuPanel &&
          createPortal(menuPanel, document.body)}
      </div>
    </div>
  );
}
