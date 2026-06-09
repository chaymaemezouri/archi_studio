"use client";

import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import ProjectDetailNavItem from "./ProjectDetailNavItem";
import {
  detailSidebarMobileBar,
  detailSidebarMobileOverlay,
  detailSidebarMobilePanel,
  detailSidebarMobileTitle,
  detailSidebarNav,
  detailSidebarShell,
  detailSidebarTitle,
} from "./project-detail-ui";
import {
  getProjectSectionById,
  getProjectSectionCount,
  PROJECT_SECTIONS,
  type ProjectTabId,
} from "./project-detail-nav";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectDetailSidebarProps {
  active: ProjectTabId;
  onChange: (tab: ProjectTabId) => void;
  project: Project;
}

function SidebarNav({
  active,
  project,
  onSelect,
}: {
  active: ProjectTabId;
  project: Project;
  onSelect: (id: ProjectTabId) => void;
}) {
  return (
    <nav className={detailSidebarNav} aria-label="Sections du projet">
      {PROJECT_SECTIONS.map((section) => (
        <ProjectDetailNavItem
          key={section.id}
          sectionId={section.id}
          label={section.label}
          icon={section.icon}
          active={active === section.id}
          count={getProjectSectionCount(project, section.id)}
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
}

export default function ProjectDetailSidebar({
  active,
  onChange,
  project,
}: ProjectDetailSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = getProjectSectionById(active);
  const ActiveIcon = activeSection.icon;

  const selectSection = (id: ProjectTabId) => {
    onChange(id);
    setMobileOpen(false);
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className={cn(detailSidebarMobileBar, "lg:hidden")}
        aria-expanded={mobileOpen}
        aria-haspopup="dialog"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#8ba4c7]/18">
          <ActiveIcon className="h-3.5 w-3.5 text-[#b8cfe8]" />
        </span>
        <span className="min-w-0 flex-1 truncate text-left text-[12px] font-medium text-[#eef2f7]">
          {activeSection.label}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#8ba4c7]/50" />
      </button>

      {mobileOpen && (
        <>
          <button
            type="button"
            className={detailSidebarMobileOverlay}
            aria-label="Fermer le menu des sections"
            onClick={() => setMobileOpen(false)}
          />
          <div
            role="dialog"
            aria-modal
            aria-label="Sections du projet"
            className={detailSidebarMobilePanel}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className={detailSidebarMobileTitle}>Sections</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-[#b4bcc8]/70 transition hover:bg-[#8ba4c7]/12 hover:text-[#eef2f7]"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarNav active={active} project={project} onSelect={selectSection} />
          </div>
        </>
      )}

      <aside className={detailSidebarShell}>
        <p className={detailSidebarTitle}>Projet</p>
        <SidebarNav active={active} project={project} onSelect={selectSection} />
      </aside>
    </>
  );
}
