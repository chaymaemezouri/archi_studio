"use client";

import type { LucideIcon } from "lucide-react";
import {
  detailSidebarCount,
  detailSidebarCountActive,
  detailSidebarIcon,
  detailSidebarIconActive,
  detailSidebarIconWrap,
  detailSidebarIconWrapActive,
  detailSidebarItem,
  detailSidebarItemActive,
  detailSidebarLabel,
} from "./project-detail-ui";
import type { ProjectTabId } from "./project-detail-nav";
import { cn } from "@/lib/utils";

interface ProjectDetailNavItemProps {
  sectionId: ProjectTabId;
  label: string;
  icon: LucideIcon;
  active: boolean;
  count: number | null;
  onSelect: (id: ProjectTabId) => void;
}

export default function ProjectDetailNavItem({
  sectionId,
  label,
  icon: Icon,
  active,
  count,
  onSelect,
}: ProjectDetailNavItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(sectionId)}
      className={cn(detailSidebarItem, active && detailSidebarItemActive)}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={cn(
          detailSidebarIconWrap,
          active && detailSidebarIconWrapActive
        )}
        aria-hidden
      >
        <Icon
          className={cn(detailSidebarIcon, active && detailSidebarIconActive)}
        />
      </span>
      <span className={detailSidebarLabel}>{label}</span>
      {count != null && count > 0 && (
        <span
          className={cn(detailSidebarCount, active && detailSidebarCountActive)}
          aria-label={`${count} éléments`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
