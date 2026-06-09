"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  CalendarPlus,
  CheckSquare,
  ExternalLink,
  FileText,
  Image,
  Layers,
  MapPin,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { useDialog } from "@/components/providers/DialogProvider";
import { useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import { useAuthStore } from "@/store/authStore";
import {
  canAddProjectContent,
  canArchiveProject,
  canDeleteProject,
  canEditProject,
} from "@/lib/permissions";
import { glassBtnIcon, glassDropdownPlain } from "@/lib/glass-styles";
import { canShowProjectOnMap, getProjectMapsUrl } from "@/lib/project-location";
import type { Project } from "@/types";
import type { ProjectTabId } from "./detail/ProjectDetailTabs";
import { cn } from "@/lib/utils";

export type ProjectMenuQuickAdd = "task" | "deadline";

export type ProjectCardMenuVariant = "default" | "list";

interface ProjectCardMenuProps {
  project: Project;
  onEdit?: () => void;
  onQuickAdd?: (mode: ProjectMenuQuickAdd, project: Project) => void;
  className?: string;
  triggerClassName?: string;
  /** Vue liste : menu allégé + dropdown en portal (évite le clipping) */
  variant?: ProjectCardMenuVariant;
}

const MENU_WIDTH = 220;

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
    "flex w-full shrink-0 items-center gap-2 px-3 py-2 text-left text-[13px] leading-normal transition",
    danger
      ? "text-red-300 hover:bg-red-500/10"
      : "text-glass-secondary hover:bg-[color:var(--glass-bg-hover)]"
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

export default function ProjectCardMenu({
  project,
  onEdit,
  onQuickAdd,
  className,
  triggerClassName,
  variant = "default",
}: ProjectCardMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top: number;
    left: number;
    placement: "below" | "above";
  } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { confirm } = useDialog();
  const user = useAuthStore((s) => s.user);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const canEdit = canEditProject(user, project);
  const canArchive = canArchiveProject(user);
  const canDelete = canDeleteProject(user);
  const canAdd = canAddProjectContent(user);
  const isList = variant === "list";
  const usePortal = true;

  const updateMenuPosition = useCallback(() => {
    const trigger = ref.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const margin = 6;
    const menuHeight = menuRef.current?.offsetHeight ?? 280;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    const placement: "below" | "above" =
      spaceBelow >= menuHeight || spaceBelow >= spaceAbove ? "below" : "above";

    const top = placement === "below" ? rect.bottom + margin : rect.top - margin;
    let left = rect.right - MENU_WIDTH;

    left = Math.max(margin, Math.min(left, window.innerWidth - MENU_WIDTH - margin));

    setMenuPos({ top, left, placement });
  }, []);

  useLayoutEffect(() => {
    if (!open || !usePortal) return;
    updateMenuPosition();
  }, [open, usePortal, updateMenuPosition]);

  useEffect(() => {
    if (!open || !usePortal) return;
    const onReposition = () => updateMenuPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, usePortal, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const close = () => setOpen(false);

  const goTab = (tab: ProjectTabId) => {
    close();
    router.push(`/projects/${project.id}?tab=${tab}`);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateProject.mutate({ id: project.id, isFavorite: !project.isFavorite });
    close();
  };

  const archive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const archiving = project.status !== "ARCHIVED";
    if (
      archiving &&
      !(await confirm({
        title: "Archiver le projet",
        message: `Archiver le projet « ${project.name} » ? Il restera accessible dans Archivés.`,
        confirmLabel: "Archiver",
      }))
    ) {
      return;
    }
    updateProject.mutate({
      id: project.id,
      status: project.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED",
    });
    close();
  };

  const remove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !(await confirm({
        title: "Supprimer le projet",
        message: `Supprimer définitivement le projet « ${project.name} » ? Cette action est irréversible.`,
        confirmLabel: "Supprimer",
        variant: "danger",
      }))
    ) {
      return;
    }
    deleteProject.mutate(project.id);
    close();
  };

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const menuPanel =
    open && (!usePortal || menuPos) ? (
    <div
      ref={menuRef}
      role="menu"
      className={cn(
        glassDropdownPlain,
        "flex min-w-[220px] flex-col py-1",
        "max-h-[min(70vh,420px)] overflow-y-auto",
        usePortal ? "fixed z-[200]" : "absolute right-0 z-50 mb-1.5",
        !usePortal && "bottom-full"
      )}
      style={
        usePortal && menuPos
          ? {
              top: menuPos.top,
              left: menuPos.left,
              transform: menuPos.placement === "above" ? "translateY(-100%)" : undefined,
            }
          : undefined
      }
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {!isList && (
        <MenuItem
          href={`/projects/${project.id}`}
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
        >
          <ExternalLink className="h-4 w-4 text-glass-muted" />
          Ouvrir
        </MenuItem>
      )}

      {canShowProjectOnMap(project) && getProjectMapsUrl(project) && (
        <MenuItem
          onClick={(e) => {
            stop(e);
            window.open(getProjectMapsUrl(project)!, "_blank", "noopener,noreferrer");
            close();
          }}
        >
          <MapPin className="h-4 w-4 text-glass-muted" />
          Voir sur la carte
        </MenuItem>
      )}

      {!isList && canEdit && onEdit && (
        <MenuItem
          onClick={(e) => {
            stop(e);
            onEdit();
            close();
          }}
        >
          <Pencil className="h-4 w-4 text-glass-muted" />
          Modifier
        </MenuItem>
      )}

      {canAdd && onQuickAdd && !isList && (
        <MenuItem
          onClick={(e) => {
            stop(e);
            onQuickAdd("task", project);
            close();
          }}
        >
          <CheckSquare className="h-4 w-4 text-glass-muted" />
          Ajouter une tâche
        </MenuItem>
      )}

      {canAdd && onQuickAdd && (
        <MenuItem
          onClick={(e) => {
            stop(e);
            onQuickAdd("deadline", project);
            close();
          }}
        >
          <CalendarPlus className="h-4 w-4 text-glass-muted" />
          Ajouter une deadline
        </MenuItem>
      )}

      {canAdd && (
        <>
          {!isList && (
            <MenuItem
              onClick={(e) => {
                stop(e);
                goTab("documents");
              }}
            >
              <FileText className="h-4 w-4 text-glass-muted" />
              Ajouter un document
            </MenuItem>
          )}
          <MenuItem
            onClick={(e) => {
              stop(e);
              goTab("plans");
            }}
          >
            <Layers className="h-4 w-4 text-glass-muted" />
            {isList ? "Plans du projet" : "Ajouter un plan"}
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              stop(e);
              goTab("renders");
            }}
          >
            <Image className="h-4 w-4 text-glass-muted" />
            {isList ? "Rendus du projet" : "Ajouter un rendu"}
          </MenuItem>
        </>
      )}

      <div className="my-1 h-px bg-white/[0.08]" />

      <MenuItem onClick={toggleFavorite}>
        <Star
          className={cn(
            "h-4 w-4",
            project.isFavorite ? "fill-amber-400 text-amber-400" : "text-glass-muted"
          )}
        />
        {project.isFavorite ? "Retirer des favoris" : "Marquer comme favori"}
      </MenuItem>

      {canArchive && (
        <MenuItem onClick={archive}>
          {project.status === "ARCHIVED" ? (
            <>
              <ArchiveRestore className="h-4 w-4 text-glass-muted" />
              Restaurer
            </>
          ) : (
            <>
              <Archive className="h-4 w-4 text-glass-muted" />
              Archiver le projet
            </>
          )}
        </MenuItem>
      )}

      {canDelete && (
        <MenuItem onClick={remove} danger>
          <Trash2 className="h-4 w-4" />
          Supprimer
        </MenuItem>
      )}
    </div>
  ) : null;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (open) {
            setOpen(false);
            return;
          }
          if (usePortal) updateMenuPosition();
          setOpen(true);
        }}
        className={cn(triggerClassName ?? glassBtnIcon, triggerClassName ? "h-7 w-7" : "h-8 w-8")}
        aria-label="Options du projet"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>
      {!usePortal && menuPanel}
      {usePortal && menuPos && typeof document !== "undefined" && menuPanel
        ? createPortal(menuPanel, document.body)
        : null}
    </div>
  );
}
