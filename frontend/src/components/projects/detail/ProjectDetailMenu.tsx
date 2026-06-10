"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  CopyPlus,
  ExternalLink,
  MoreVertical,
  Pencil,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDialog } from "@/components/providers/DialogProvider";
import { useCreateProject, useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import { useAuthStore } from "@/store/authStore";
import { canDeleteProject } from "@/lib/permissions";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import {
  detailIconBtn,
  detailMenu,
  detailMenuItem,
  detailMenuItemDanger,
} from "./project-detail-ui";

interface ProjectDetailMenuProps {
  project: Project;
  onEdit: () => void;
}

export default function ProjectDetailMenu({ project, onEdit }: ProjectDetailMenuProps) {
  const { confirm } = useDialog();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createProject = useCreateProject();
  const canDelete = canDeleteProject(user, project);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const toggleFavorite = () => {
    updateProject.mutate({ id: project.id, isFavorite: !project.isFavorite });
    setOpen(false);
  };

  const archive = async () => {
    const archiving = project.status !== "ARCHIVED";
    if (archiving) {
      const ok = await confirm({
        title: "Archiver le projet",
        message: `Archiver le projet « ${project.name} » ?`,
        confirmLabel: "Archiver",
      });
      if (!ok) return;
    }
    updateProject.mutate({
      id: project.id,
      status: project.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED",
    });
    setOpen(false);
  };

  const duplicate = () => {
    createProject.mutate(
      {
        name: `${project.name} (copie)`,
        type: project.type ?? undefined,
        phase: project.phase,
        address: project.address ?? undefined,
        city: project.city ?? undefined,
        country: project.country ?? undefined,
        url: project.url ?? undefined,
        deadline: project.deadline ?? undefined,
        budget: project.budget ?? undefined,
        surface: project.surface ?? undefined,
        description: project.description ?? undefined,
        clientId: project.clientId ?? undefined,
        progress: project.progress,
      },
      {
        onSuccess: (created) => {
          toast.success("Projet dupliqué");
          router.push(`/projects/${created.id}`);
        },
      }
    );
    setOpen(false);
  };

  const remove = async () => {
    const ok = await confirm({
      title: "Supprimer le projet",
      message: `Supprimer définitivement « ${project.name} » ? Cette action est irréversible.`,
      variant: "danger",
      confirmLabel: "Supprimer",
    });
    if (!ok) return;
    deleteProject.mutate(project.id, {
      onSuccess: () => router.push("/projects"),
    });
    setOpen(false);
  };

  const openUrl = () => {
    if (project.url) window.open(project.url, "_blank", "noopener,noreferrer");
    else toast.error("Aucune URL définie");
    setOpen(false);
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: project.name, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Lien copié");
      }
    } catch {
      toast.error("Partage annulé");
    }
    setOpen(false);
  };

  const edit = () => {
    onEdit();
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={detailIconBtn}
        aria-label="Plus d'options"
        aria-expanded={open}
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {open && (
        <div role="menu" className={cn(detailMenu, "absolute right-0 z-30 mt-1 min-w-[200px]")}>
          <button type="button" role="menuitem" onClick={edit} className={detailMenuItem}>
            <Pencil className="h-4 w-4" />
            Modifier le projet
          </button>
          <button type="button" role="menuitem" onClick={share} className={detailMenuItem}>
            <Share2 className="h-4 w-4" />
            Partager
          </button>
          <button type="button" role="menuitem" onClick={toggleFavorite} className={detailMenuItem}>
            <Star
              className={cn(
                "h-4 w-4",
                project.isFavorite ? "fill-amber-400 text-amber-400" : ""
              )}
            />
            {project.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          </button>
          {project.url && (
            <button type="button" role="menuitem" onClick={openUrl} className={detailMenuItem}>
              <ExternalLink className="h-4 w-4" />
              Ouvrir l&apos;URL du projet
            </button>
          )}
          <button type="button" role="menuitem" onClick={archive} className={detailMenuItem}>
            {project.status === "ARCHIVED" ? (
              <>
                <ArchiveRestore className="h-4 w-4" />
                Restaurer le projet
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                Archiver le projet
              </>
            )}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={duplicate}
            disabled={createProject.isPending}
            className={cn(detailMenuItem, "disabled:opacity-50")}
          >
            <CopyPlus className="h-4 w-4" />
            Dupliquer le projet
          </button>
          {canDelete && (
            <button type="button" role="menuitem" onClick={remove} className={detailMenuItemDanger}>
              <Trash2 className="h-4 w-4" />
              Supprimer le projet
            </button>
          )}
        </div>
      )}
    </div>
  );
}
