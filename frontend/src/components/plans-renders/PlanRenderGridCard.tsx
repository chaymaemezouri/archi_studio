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
  plansRendersGridCard,
  plansRendersGridThumb,
} from "./plans-renders-list-ui";
import { portalMenuStyle, usePortalRowMenu } from "@/hooks/usePortalRowMenu";
import { useDialog } from "@/components/providers/DialogProvider";
import {
  useDeletePlanRender,
  useSetMainImage,
  useToggleFavorite,
} from "@/hooks/usePlansRenders";
import {
  canPreviewPlanRender,
  categoryLabel,
} from "@/lib/plans-renders-list";
import { resolveMediaUrl } from "@/lib/assets";
import type { PlanRender } from "@/types";
import { PLAN_RENDER_KIND_LABELS } from "@/types";
import { glassBtnIcon, glassMenu } from "@/lib/glass-styles";
import { cn, formatDate } from "@/lib/utils";

const MENU_WIDTH = 208;

interface PlanRenderGridCardProps {
  asset: PlanRender;
  onEdit: (asset: PlanRender) => void;
  onPreview: (asset: PlanRender) => void;
}

export default function PlanRenderGridCard({
  asset,
  onEdit,
  onPreview,
}: PlanRenderGridCardProps) {
  const { ref, menuRef, menuOpen, menuPos, closeMenu, toggleMenu } = usePortalRowMenu(
    MENU_WIDTH,
    300
  );
  const { confirm } = useDialog();
  const deleteAsset = useDeletePlanRender();
  const setMain = useSetMainImage();
  const toggleFav = useToggleFavorite();
  const href = resolveMediaUrl(asset.url) ?? asset.url;
  const thumb = resolveMediaUrl(asset.thumbnailUrl ?? asset.url);
  const previewable = canPreviewPlanRender(asset);

  const handleDelete = async () => {
    if (
      !(await confirm({
        title: "Supprimer l'élément",
        message: `Supprimer « ${asset.name} » ?`,
        confirmLabel: "Supprimer",
        variant: "danger",
      }))
    ) {
      return;
    }
    deleteAsset.mutate(asset.id);
    closeMenu();
  };

  const menuPanel =
    menuOpen && menuPos ? (
      <div
        ref={menuRef}
        role="menu"
        className={cn(glassMenu, "fixed z-[200] w-52 py-1")}
        style={portalMenuStyle(menuPos)}
      >
        <MenuBtn onClick={() => { onEdit(asset); closeMenu(); }}>
          <Pencil className="h-4 w-4" /> Modifier
        </MenuBtn>
        <MenuBtn
          onClick={() => {
            toggleFav.mutate({ id: asset.id, isFavorite: !asset.isFavorite });
            closeMenu();
          }}
        >
          <Star className="h-4 w-4" /> {asset.isFavorite ? "Retirer favori" : "Favori"}
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
        {asset.projectId && (
          <Link
            href={`/projects/${asset.projectId}?tab=${asset.kind === "PLAN" ? "plans" : "renders"}`}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
            onClick={closeMenu}
          >
            Ouvrir projet
          </Link>
        )}
        <MenuBtn danger onClick={handleDelete}>
          <Trash2 className="h-4 w-4" /> Supprimer
        </MenuBtn>
      </div>
    ) : null;

  return (
    <div className={plansRendersGridCard}>
      <div className={plansRendersGridThumb}>
        {thumb && asset.mimeType.startsWith("image/") ? (
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <FileIcon mimeType={asset.mimeType} name={asset.name} className="h-12 w-12" />
        )}
        {asset.isFavorite && (
          <Star className="absolute left-2 top-2 h-4 w-4 fill-amber-400/90 text-amber-400" />
        )}
        {asset.isMainImage && (
          <span className="absolute bottom-2 left-2 rounded-md bg-[#8ba4c7]/25 px-1.5 py-0.5 text-[10px] text-[#b8cfe8]">
            Principale
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition group-hover:opacity-100">
          {previewable && (
            <button
              type="button"
              onClick={() => onPreview(asset)}
              className="rounded-lg bg-white/90 p-2 text-stone-800"
              aria-label="Aperçu"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <a
            href={href}
            download
            className="rounded-lg bg-white/90 p-2 text-stone-800"
            aria-label="Télécharger"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium text-glass">{asset.name}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="studio">{PLAN_RENDER_KIND_LABELS[asset.kind]}</Badge>
            {asset.version && <Badge variant="accent">{asset.version}</Badge>}
          </div>
          <p className="mt-1 text-[11px] text-glass-muted">{categoryLabel(asset)}</p>
          {(asset.projectName || asset.clientName) && (
            <p className="mt-1 line-clamp-1 text-[11px] text-glass-muted">
              {asset.projectName ?? asset.clientName}
            </p>
          )}
          <p className="mt-1 text-[10px] text-glass-muted">
            {formatDate(asset.uploadedAt ?? asset.createdAt)}
          </p>
        </div>

        <div ref={ref} className="relative shrink-0">
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
