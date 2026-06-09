"use client";

import ProjectCardCompact from "@/components/projects/ProjectCardCompact";
import type { Project } from "@/types";

interface DashboardProjectCardProps {
  project: Project;
}

export default function DashboardProjectCard({ project }: DashboardProjectCardProps) {
  return <ProjectCardCompact project={project} />;
}
