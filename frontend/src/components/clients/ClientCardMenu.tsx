"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  useArchiveClient,
  useDeleteClient,
} from "@/hooks/useClients";
import type { Client } from "@/types";
import { glassBtnIcon, glassMenu } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const archiveClient = useArchiveClient();
  const deleteClient = useDeleteClient();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const close = () => setOpen(false);

  const handleArchive = () => {
    if (!window.confirm(`Archiver le client « ${client.name} » ?`)) return;
    archiveClient.mutate(client.id, { onSuccess: close });
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        `Supprimer définitivement « ${client.name} » ? Cette action est irréversible.`
      )
    ) {
      return;
    }
    deleteClient.mutate(client.id, {
      onSuccess: () => {
        close();
        router.push("/clients");
      },
    });
  };

  const q = `?clientId=${client.id}`;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        aria-label="Actions client"
        className={cn(glassBtnIcon, "h-8 w-8 border-0")}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(glassMenu, "absolute right-0 top-full z-20 mt-1 w-52")}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem href={`/clients/${client.id}`} onClick={close}>
            <ExternalLink className="h-4 w-4" /> Ouvrir
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              e.preventDefault();
              close();
              onEdit?.();
            }}
          >
            <Pencil className="h-4 w-4" /> Modifier
          </MenuItem>
          <MenuItem href={`/projects?new=1&clientId=${client.id}`} onClick={close}>
            <FolderKanban className="h-4 w-4" /> Ajouter projet
          </MenuItem>
          <MenuItem href={`/finances/quotes-invoices?new=devis&clientId=${client.id}`} onClick={close}>
            <FileSpreadsheet className="h-4 w-4" /> Ajouter devis
          </MenuItem>
          <MenuItem href={`/finances/quotes-invoices?new=invoice&clientId=${client.id}`} onClick={close}>
            <Receipt className="h-4 w-4" /> Ajouter facture
          </MenuItem>
          <MenuItem href={`/payments${q}`} onClick={close}>
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
      )}
    </div>
  );
}
