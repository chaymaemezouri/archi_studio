"use client";

import type { LucideIcon } from "lucide-react";
import IconActionButton from "./IconActionButton";
import {
  detailIconActionGroup,
  detailSectionHeaderRule,
  detailSectionTitle,
} from "./project-detail-ui";
import { cn } from "@/lib/utils";

interface Action {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "success" | "danger";
}

interface ProjectSectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  actions?: Action[];
  className?: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
}

export default function ProjectSectionHeader({
  title,
  icon: Icon,
  actions = [],
  className,
  subtitle,
  trailing,
}: ProjectSectionHeaderProps) {
  return (
    <div className={cn(detailSectionHeaderRule, className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className={cn(detailSectionTitle, "mb-0 flex items-center gap-2")}>
            {Icon && (
              <Icon className="h-3.5 w-3.5 shrink-0 text-glass-muted" strokeWidth={1.75} />
            )}
            {title}
          </h2>
          {subtitle}
        </div>
        {(actions.length > 0 || trailing) && (
          <div className={detailIconActionGroup}>
            {trailing}
            {actions.map((action) => (
              <IconActionButton
                key={action.label}
                label={action.label}
                icon={action.icon}
                onClick={action.onClick}
                variant={action.variant ?? "default"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
