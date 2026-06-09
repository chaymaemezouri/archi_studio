"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  CreditCard,
  ExternalLink,
  FileSpreadsheet,
  FolderKanban,
  MoreVertical,
  Pencil,
  Receipt,
  Trash2,
} from "lucide-react";
import { useDialog } from "@/components/providers/DialogProvider";
import {
  useArchiveClient,
  useDeleteClient,
} from "@/hooks/useClients";
import { portalMenuStyle, usePortalRowMenu } from "@/hooks/usePortalRowMenu";
import type { Client } from "@/types";
import { glassBtnIcon, glassMenu } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

const MENU_WIDTH = 208;
const MENU_ESTIMATED_HEIGHT = 320;

interface ClientCardMenuProps {
  client: Client;
  onEdit?: () => void;
  className?: string;
}

function MenuItem({
  children,
  onClick,
  href,
  danger,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  danger?: boolean;
}) {
  const cls = cn(
    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
    danger
      ? "text-red-400 hover:bg-red-500/10"
      : "text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
  );
  if (href) {
    return (
      <Link href={href} role="menuitem" className={cls} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" role="menuitem" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export default function ClientCardMenu({ client, onEdit, className }: ClientCardMenuProps) {
  const { ref, menuRef, menuOpen, menuPos, closeMenu, toggleMenu } = usePortalRowMenu(
    MENU_WIDTH,
    MENU_ESTIMATED_HEIGHT
  );
  const router = useRouter();
  const { confirm } = useDialog();
  const archiveClient = useArchiveClient();
  const deleteClient = useDeleteClient();

  const handleArchive = async () => {
    if (
      !(await confirm({
        title: "Archiver le client",
        message: `Archiver le client « ${client.name} » ?`,
        confirmLabel: "Archiver",
      }))
    ) {
      return;
    }
    archiveClient.mutate(client.id, { onSuccess: closeMenu });
  };

  const handleDelete = async () => {
    if (
      !(await confirm({
        title: "Supprimer le client",
        message: `Supprimer définitivement « ${client.name} » ? Cette action est irréversible.`,
        confirmLabel: "Supprimer",
        variant: "danger",
      }))
    ) {
      return;
    }
    deleteClient.mutate(client.id, {
      onSuccess: () => {
        closeMenu();
        router.push("/clients");
      },
    });
  };

  const q = `?clientId=${client.id}`;

  const menuPanel =
    menuOpen && menuPos ? (
      <div
        ref={menuRef}
        role="menu"
        className={cn(glassMenu, "fixed z-[200] w-52")}
        style={portalMenuStyle(menuPos)}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem href={`/clients/${client.id}`} onClick={closeMenu}>
          <ExternalLink className="h-4 w-4" /> Ouvrir
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.preventDefault();
            closeMenu();
            onEdit?.();
          }}
        >
          <Pencil className="h-4 w-4" /> Modifier
        </MenuItem>
        <MenuItem href={`/projects?new=1&clientId=${client.id}`} onClick={closeMenu}>
          <FolderKanban className="h-4 w-4" /> Ajouter projet
        </MenuItem>
        <MenuItem href={`/finances/quotes-invoices?new=devis&clientId=${client.id}`} onClick={closeMenu}>
          <FileSpreadsheet className="h-4 w-4" /> Ajouter devis
        </MenuItem>
        <MenuItem href={`/finances/quotes-invoices?new=invoice&clientId=${client.id}`} onClick={closeMenu}>
          <Receipt className="h-4 w-4" /> Ajouter facture
        </MenuItem>
        <MenuItem href={`/payments${q}`} onClick={closeMenu}>
          <CreditCard className="h-4 w-4" /> Ajouter paiement
        </MenuItem>
        {client.status !== "ARCHIVED" && (
          <MenuItem onClick={handleArchive}>
            <Archive className="h-4 w-4" /> Archiver
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} danger>
          <Trash2 className="h-4 w-4" /> Supprimer
        </MenuItem>
      </div>
    ) : null;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleMenu();
        }}
        aria-label="Actions client"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className={cn(
          glassBtnIcon,
          "h-8 w-8 border-0",
          menuOpen && "bg-studio-soft text-studio-light"
        )}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {typeof document !== "undefined" &&
        menuPanel &&
        createPortal(menuPanel, document.body)}
    </div>
  );
}
