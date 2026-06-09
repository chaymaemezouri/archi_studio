"use client";

import { FolderKanban } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/types";

interface ProjectGridProps {
  projects?: Project[];
  onCreateClick?: () => void;
}

export default function ProjectGrid({ projects = [], onCreateClick }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Aucun projet"
        description="Commencez par créer votre premier projet architectural."
        actionLabel="Créer un projet"
        onAction={onCreateClick}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
