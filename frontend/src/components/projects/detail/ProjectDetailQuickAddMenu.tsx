"use client";

import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  CheckSquare,
  ChevronDown,
  FileUp,
  HardHat,
  ImagePlus,
  Plus,
  Users,
} from "lucide-react";
import type { ProjectQuickAddMode, ProjectUploadKind } from "./project-detail-types";
import { cn } from "@/lib/utils";
import {
  detailBtnPrimary,
  detailIconBtn,
  detailMenu,
  detailMenuItem,
} from "./project-detail-ui";

interface ProjectDetailQuickAddMenuProps {
  onQuickAdd: (mode: ProjectQuickAddMode) => void;
  onUpload: (kind: ProjectUploadKind) => void;
  iconOnly?: boolean;
}

export default function ProjectDetailQuickAddMenu({
  onQuickAdd,
  onUpload,
  iconOnly = false,
}: ProjectDetailQuickAddMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const items: {
    label: string;
    icon: typeof Plus;
    onClick: () => void;
  }[] = [
    { label: "Tâche", icon: CheckSquare, onClick: () => onQuickAdd("task") },
    { label: "Deadline", icon: Calendar, onClick: () => onQuickAdd("deadline") },
    { label: "Réunion", icon: Users, onClick: () => onQuickAdd("meeting") },
    { label: "Chantier", icon: HardHat, onClick: () => onQuickAdd("chantier") },
    { label: "Photo", icon: ImagePlus, onClick: () => onUpload("image") },
    { label: "Document", icon: FileUp, onClick: () => onUpload("document") },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={iconOnly ? detailIconBtn : cn(detailBtnPrimary, "pr-2.5")}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Ajouter"
        title="Ajouter"
      >
        <Plus className="h-3.5 w-3.5" />
        {!iconOnly && (
          <>
            Ajouter
            <ChevronDown
              className={cn("h-3.5 w-3.5 opacity-60 transition", open && "rotate-180")}
            />
          </>
        )}
      </button>
      {open && (
        <div role="menu" className={cn(detailMenu, "absolute right-0 z-30 mt-1 min-w-[168px]")}>
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={detailMenuItem}
            >
              <item.icon className="h-4 w-4 shrink-0 opacity-60" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
