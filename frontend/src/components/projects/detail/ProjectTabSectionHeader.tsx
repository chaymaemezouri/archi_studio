"use client";

import type { LucideIcon } from "lucide-react";
import IconActionButton from "./IconActionButton";
import type { IconActionTone } from "./IconActionButton";
import {
  detailChecklistHeader,
  detailChecklistRatio,
  detailChecklistRatioAdded,
  detailChecklistTitle,
  detailIconActionGroup,
  detailSectionHeaderLead,
} from "./project-detail-ui";
import { cn } from "@/lib/utils";

interface ProjectTabSectionHeaderProps {
  title: string;
  /** Filtres / recherche alignés à côté du titre */
  toolbar?: React.ReactNode;
  count?: number;
  action?: {
    label: string;
    icon: LucideIcon;
    onClick?: () => void;
    href?: string;
    tone?: IconActionTone;
  };
}

export default function ProjectTabSectionHeader({
  title,
  toolbar,
  count,
  action,
}: ProjectTabSectionHeaderProps) {
  const showTrailing = (count != null && count > 0) || action;

  return (
    <div className={detailChecklistHeader}>
      <div className={detailSectionHeaderLead}>
        <h2 className={cn(detailChecklistTitle, "shrink-0")}>{title}</h2>
        {toolbar}
      </div>
      {showTrailing && (
        <div className={detailIconActionGroup}>
          {count != null && count > 0 && (
            <span
              className={cn(detailChecklistRatio, "pointer-events-none pr-0.5")}
              aria-hidden
            >
              <span className={detailChecklistRatioAdded}>{count}</span>
            </span>
          )}
          {action &&
            (action.href ? (
              <IconActionButton
                label={action.label}
                icon={action.icon}
                href={action.href}
                tone={action.tone ?? "upload"}
              />
            ) : (
              <IconActionButton
                label={action.label}
                icon={action.icon}
                onClick={action.onClick}
                tone={action.tone ?? "upload"}
              />
            ))}
        </div>
      )}
    </div>
  );
}
