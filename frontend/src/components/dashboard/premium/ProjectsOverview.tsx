"use client";

import ProjectsInProgress from "../ProjectsInProgress";
import { sectionLabel } from "./styles";
import type { Project } from "@/types";

interface ProjectsOverviewProps {
  projects?: Project[];
}

export default function ProjectsOverview({ projects }: ProjectsOverviewProps) {
  return (
    <section>
      <p className={sectionLabel}>Projets</p>
      <h2 className="mt-1 text-xl font-light text-slate-900">Projets en cours</h2>
      <div className="mt-6">
        <ProjectsInProgress projects={projects} />
      </div>
    </section>
  );
}
