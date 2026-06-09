"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import {
  Download,
  Eye,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { FileIcon } from "@/components/projects/detail/FileTypeIcon";
import Badge from "@/components/ui/Badge";
import {
  plansRendersListHeader,
  plansRendersListLink,
  plansRendersListRow,
} from "./plans-renders-list-ui";
import { portalMenuStyle, usePortalRowMenu } from "@/hooks/usePortalRowMenu";
import {
  useDeletePlanRender,
  useSetMainImage,
  useToggleFavorite,
} from "@/hooks/usePlansRenders";
import {
  canPreviewPlanRender,
  categoryLabel,
  formatPlanRenderSize,
} from "@/lib/plans-renders-list";
import { resolveMediaUrl } from "@/lib/assets";
import type { PlanRender } from "@/types";
import { PLAN_RENDER_KIND_LABELS } from "@/types";
import { glassBtnIcon, glassMenu } from "@/lib/glass-styles";
import { cn, formatDate } from "@/lib/utils";

const MENU_WIDTH = 192;

interface PlanRenderRowProps {
  asset: PlanRender;
  onEdit: (asset: PlanRender) => void;
  onPreview: (asset: PlanRender) => void;
}

export function PlanRenderListHeader() {
  return (
    <div className={plansRendersListHeader}>
      <span />
      <span>Nom</span>
      <span>Type</span>
      <span>Catégorie</span>
      <span>Projet</span>
      <span>Client</span>
      <span>Ver.</span>
      <span>Taille</span>
      <span>Ajouté</span>
      <span />
    </div>
  );
}

export default function PlanRenderRow({ asset, onEdit, onPreview }: PlanRenderRowProps) {
  const { ref, menuRef, menuOpen, menuPos, closeMenu, toggleMenu } = usePortalRowMenu(
    MENU_WIDTH,
    280
  );
  const deleteAsset = useDeletePlanRender();
  const setMain = useSetMainImage();
  const toggleFav = useToggleFavorite();
  const href = resolveMediaUrl(asset.url) ?? asset.url;
  const thumb = resolveMediaUrl(asset.thumbnailUrl ?? asset.url);

  const handleDelete = () => {
    if (!window.confirm(`Supprimer « ${asset.name} » ?`)) return;
    deleteAsset.mutate(asset.id);
    closeMenu();
  };

  const menuPanel =
    menuOpen && menuPos ? (
      <div
        ref={menuRef}
        role="menu"
        className={cn(glassMenu, "fixed z-[200] w-48 py-1")}
        style={portalMenuStyle(menuPos)}
      >
        {canPreviewPlanRender(asset) && (
          <MenuBtn onClick={() => { onPreview(asset); closeMenu(); }}>
            <Eye className="h-4 w-4" /> Aperçu
          </MenuBtn>
        )}
        <a
          href={href}
          download
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
          onClick={closeMenu}
        >
          <Download className="h-4 w-4" /> Télécharger
        </a>
        <MenuBtn onClick={() => { onEdit(asset); closeMenu(); }}>
          <Pencil className="h-4 w-4" /> Modifier
        </MenuBtn>
        {asset.kind === "RENDER" && asset.projectId && (
          <MenuBtn
            onClick={() => {
              setMain.mutate(asset.id);
              closeMenu();
            }}
          >
            <Star className="h-4 w-4" /> Image principale
          </MenuBtn>
        )}
        <MenuBtn
          onClick={() => {
            toggleFav.mutate({ id: asset.id, isFavorite: !asset.isFavorite });
            closeMenu();
          }}
        >
          <Star className="h-4 w-4" /> {asset.isFavorite ? "Retirer favori" : "Favori"}
        </MenuBtn>
        <MenuBtn danger onClick={handleDelete}>
          <Trash2 className="h-4 w-4" /> Supprimer
        </MenuBtn>
      </div>
    ) : null;

  return (
    <div className={plansRendersListRow}>
      <div className="hidden h-10 w-10 overflow-hidden rounded-lg border border-app md:block">
        {thumb && asset.mimeType.startsWith("image/") ? (
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[color:var(--glass-bg)]">
            <FileIcon mimeType={asset.mimeType} name={asset.name} className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="flex items-center gap-1 font-medium text-glass">
          {asset.isFavorite && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400/90 text-amber-400" />
          )}
          <span className="truncate">{asset.name}</span>
        </p>
      </div>

      <span>
        <Badge variant="studio">{PLAN_RENDER_KIND_LABELS[asset.kind]}</Badge>
      </span>

      <span className="text-glass-secondary">{categoryLabel(asset)}</span>

      <span className="text-glass-secondary">
        {asset.projectId && asset.projectName ? (
          <Link
            href={`/projects/${asset.projectId}?tab=plans`}
            className={plansRendersListLink}
          >
            {asset.projectName}
          </Link>
        ) : (
          "—"
        )}
      </span>

      <span className="text-glass-secondary">
        {asset.clientId && asset.clientName ? (
          <Link href={`/clients/${asset.clientId}`} className={plansRendersListLink}>
            {asset.clientName}
          </Link>
        ) : (
          "—"
        )}
      </span>

      <span className="text-glass-secondary">{asset.version ?? "—"}</span>
      <span className="text-glass-secondary">{formatPlanRenderSize(asset.size)}</span>
      <span className="text-glass-secondary">
        {formatDate(asset.uploadedAt ?? asset.createdAt)}
      </span>

      <div ref={ref} className="relative justify-self-end">
        <button
          type="button"
          onClick={toggleMenu}
          className={cn(
            glassBtnIcon,
            "h-8 w-8 border-0",
            menuOpen && "bg-studio-soft text-studio-light"
          )}
          aria-label="Actions"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {typeof document !== "undefined" &&
          menuPanel &&
          createPortal(menuPanel, document.body)}
      </div>
    </div>
  );
}

function MenuBtn({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-sm",
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
      )}
    >
      {children}
    </button>
  );
}
