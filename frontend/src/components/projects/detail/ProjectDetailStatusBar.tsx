"use client";

import { CheckSquare, Wallet } from "lucide-react";
import {
  detailStatusBar,
  detailStatusBarIcon,
  detailStatusBarItem,
  detailStatusBarItemHead,
  detailStatusBarItemInteractive,
  detailStatusBarValue,
} from "./project-detail-ui";
import {
  getChecklistStats,
  getFinanceFollowUpCount,
} from "@/lib/project-detail";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import type { ProjectTabId } from "./ProjectDetailTabs";
import type { LucideIcon } from "lucide-react";

interface ProjectDetailStatusBarProps {
  project: Project;
  onTabChange: (tab: ProjectTabId) => void;
}

function StatusCell({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <div className={detailStatusBarItemHead}>
        <Icon className={detailStatusBarIcon} />
        {label}
      </div>
      <span className={detailStatusBarValue}>{value}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(detailStatusBarItem, detailStatusBarItemInteractive, "text-left")}
      >
        {inner}
      </button>
    );
  }

  return <div className={detailStatusBarItem}>{inner}</div>;
}

export default function ProjectDetailStatusBar({
  project,
  onTabChange,
}: ProjectDetailStatusBarProps) {
  const checklist = getChecklistStats(project);
  const financeCount = getFinanceFollowUpCount(project);

  return (
    <div className={detailStatusBar} role="status" aria-label="Suivi transversal">
      <StatusCell
        icon={CheckSquare}
        label="Checklist"
        value={
          checklist.total > 0
            ? `${checklist.added}/${checklist.total} documents`
            : "—"
        }
        onClick={() => onTabChange("checklist")}
      />
      <StatusCell
        icon={Wallet}
        label="Finance"
        value={
          financeCount > 0
            ? `${financeCount} facture${financeCount > 1 ? "s" : ""} à suivre`
            : "À jour"
        }
        onClick={() => onTabChange("finances")}
      />
    </div>
  );
}
