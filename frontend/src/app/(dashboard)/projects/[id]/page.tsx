"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import EmptyState from "@/components/ui/EmptyState";
import CreateProjectDrawer from "@/components/projects/CreateProjectDrawer";
import ProjectDetailHero from "@/components/projects/detail/ProjectDetailHero";
import ProjectDetailSidebar from "@/components/projects/detail/ProjectDetailSidebar";
import {
  PROJECT_SECTIONS,
  type ProjectTabId,
} from "@/components/projects/detail/project-detail-nav";
import ProjectChecklistTab from "@/components/projects/detail/ProjectChecklistTab";
import ProjectNotesTab from "@/components/projects/detail/ProjectNotesTab";
import ProjectOverviewTab from "@/components/projects/detail/ProjectOverviewTab";
import ProjectQuickAddSheet from "@/components/projects/detail/ProjectQuickAddSheet";
import ProjectTabPanels from "@/components/projects/detail/ProjectTabPanels";
import type {
  ProjectQuickAddMode,
  ProjectUploadKind,
} from "@/components/projects/detail/project-detail-types";
import { detailContentShell, detailMainZone, detailPage, detailSectionContent } from "@/components/projects/detail/project-detail-ui";
import { useProject } from "@/hooks/useProjects";
import { useProjectDetailMutations } from "@/hooks/useProjectDetail";
import { cn } from "@/lib/utils";

const UPLOAD_ACCEPT: Record<ProjectUploadKind, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  document: "*/*",
  plan: "image/*,.pdf,.dwg",
  render: "image/jpeg,image/png,image/webp",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { data: project, isLoading, isError, error, refetch } = useProject(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<ProjectTabId>("overview");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const normalized = tabParam === "cps" ? "documents" : tabParam;
    const valid = PROJECT_SECTIONS.some((t) => t.id === normalized);
    if (normalized && valid) {
      setTab(normalized as ProjectTabId);
    }
  }, [searchParams]);

  const setTabWithUrl = (next: ProjectTabId) => {
    setTab(next);
    router.replace(`/projects/${id}?tab=${next}`, { scroll: false });
  };

  const [editOpen, setEditOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState<ProjectQuickAddMode>("task");
  const [uploadKind, setUploadKind] = useState<ProjectUploadKind>("document");

  const mutations = useProjectDetailMutations(id);

  const openQuickAdd = (mode: ProjectQuickAddMode) => {
    setQuickAddMode(mode);
    setQuickAddOpen(true);
  };

  const triggerUpload = (kind: ProjectUploadKind) => {
    setUploadKind(kind);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const config: Record<
      ProjectUploadKind,
      { folder: "images" | "documents" | "plans"; fileType: string; setAsCover?: boolean }
    > = {
      image: { folder: "images", fileType: "IMAGE", setAsCover: true },
      render: { folder: "images", fileType: "RENDER" },
      document: { folder: "documents", fileType: "DOCUMENT" },
      plan: { folder: "plans", fileType: "PLAN" },
    };

    const cfg = config[uploadKind];
    if (uploadKind === "document") {
      mutations.uploadDocument.mutate(file);
      return;
    }
    if (uploadKind === "plan") {
      mutations.uploadPlanRender.mutate({ file, kind: "PLAN" });
      return;
    }
    if (uploadKind === "render") {
      mutations.uploadPlanRender.mutate({ file, kind: "RENDER" });
      return;
    }
    mutations.uploadFile.mutate({
      file,
      folder: cfg.folder,
      fileType: cfg.fileType,
      setAsCover: cfg.setAsCover,
    });
  };

  if (isLoading) {
    return (
      <div className={detailPage}>
        <div className="h-32 animate-pulse rounded-xl bg-white/[0.03]" />
        <div className="h-14 animate-pulse rounded-xl bg-white/[0.025]" />
        <div className="h-48 animate-pulse rounded-xl bg-white/[0.02]" />
      </div>
    );
  }

  const isForbidden = isAxiosError(error) && error.response?.status === 403;
  const isNotFound = isAxiosError(error) && error.response?.status === 404;

  if (isError || !project) {
    return (
      <EmptyState
        icon={MapPin}
        title={isForbidden ? "Accès refusé" : "Projet introuvable"}
        description={
          isForbidden
            ? "Ce projet n'appartient pas à votre studio ou vous n'avez pas accès."
            : isNotFound
              ? "Ce projet n'existe pas ou a été supprimé."
              : "Impossible de charger le projet."
        }
        actionLabel={isError && !isNotFound ? "Réessayer" : "Retour aux projets"}
        onAction={() => (isError && !isNotFound ? refetch() : router.push("/projects"))}
      />
    );
  }

  return (
    <div className={cn(detailPage, "pb-3")}>
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept={UPLOAD_ACCEPT[uploadKind]}
        onChange={handleFileChange}
      />

      <ProjectDetailHero
        project={project}
        onEdit={() => setEditOpen(true)}
        onQuickAdd={openQuickAdd}
        onUpload={triggerUpload}
        onTabChange={setTabWithUrl}
      />

      <div className={detailContentShell}>
        <div className={detailMainZone}>
          <ProjectDetailSidebar
            active={tab}
            onChange={setTabWithUrl}
            project={project}
          />

          <div className={detailSectionContent}>
            {tab === "overview" ? (
              <ProjectOverviewTab
                project={project}
                onTabChange={setTabWithUrl}
                onQuickAdd={openQuickAdd}
              />
            ) : tab === "checklist" ? (
              <ProjectChecklistTab project={project} />
            ) : tab === "notes" ? (
              <ProjectNotesTab project={project} />
            ) : (
              <ProjectTabPanels
                project={project}
                tab={tab}
                onTabChange={setTabWithUrl}
                onQuickAdd={openQuickAdd}
                onUpload={triggerUpload}
              />
            )}
          </div>
        </div>
      </div>

      <CreateProjectDrawer
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        project={project}
      />

      <ProjectQuickAddSheet
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        projectId={project.id}
        mode={quickAddMode}
      />
    </div>
  );
}
