"use client";

import { ListChecks } from "lucide-react";
import IconActionButton from "./IconActionButton";
import {
  detailChecklistMiniGrid,
  detailChecklistMiniStatAdded,
  detailChecklistMiniStatMissing,
  detailChecklistMiniStatValue,
  detailChecklistMiniStatValueAdded,
  detailChecklistMiniStatValueMissing,
  detailChecklistMiniStatLabel,
  detailChecklistStat,
  detailChecklistSub,
  detailOverviewBlockTitle,
  detailOverviewCard,
  detailOverviewCardFooter,
  detailOverviewCardHeader,
  detailProgressBarFill,
  detailProgressBarTrack,
} from "./project-detail-ui";
import { getChecklistStats } from "@/lib/project-detail";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import type { ProjectTabId } from "./ProjectDetailTabs";

interface ProjectOverviewChecklistProps {
  project: Project;
  onTabChange: (tab: ProjectTabId) => void;
}

export default function ProjectOverviewChecklist({
  project,
  onTabChange,
}: ProjectOverviewChecklistProps) {
  const stats = getChecklistStats(project);
  const missing =
    stats.missing > 0 ? stats.missing : Math.max(0, stats.total - stats.added);
  const progressPct =
    stats.total > 0 ? Math.round((stats.added / stats.total) * 100) : 0;

  return (
    <div className={detailOverviewCard}>
      <div className={detailOverviewCardHeader}>
        <h3 className={detailOverviewBlockTitle}>Checklist admin.</h3>
      </div>

      {stats.total === 0 ? (
        <p className="py-2 text-center text-[11px] text-[#9aa3b0]/42">
          Checklist en cours de création…
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className={detailChecklistStat}>
                {stats.added}
                <span className="text-[#9aa3b0]/35">/</span>
                {stats.total}
              </p>
              <p className={cn(detailChecklistSub, "mt-0.5")}>documents</p>
            </div>
            <span className="text-[10px] tabular-nums text-[#9aa3b0]/45">{progressPct}%</span>
          </div>

          <div className={detailProgressBarTrack}>
            <div
              className={detailProgressBarFill}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className={detailChecklistMiniGrid}>
            <div className={detailChecklistMiniStatAdded}>
              <p className={cn(detailChecklistMiniStatValue, detailChecklistMiniStatValueAdded)}>
                {stats.added}
              </p>
              <p className={detailChecklistMiniStatLabel}>Ajoutés</p>
            </div>
            <div className={detailChecklistMiniStatMissing}>
              <p className={cn(detailChecklistMiniStatValue, detailChecklistMiniStatValueMissing)}>
                {missing}
              </p>
              <p className={detailChecklistMiniStatLabel}>Manquants</p>
            </div>
          </div>
        </div>
      )}

      <div className={detailOverviewCardFooter}>
        <div className="flex justify-center">
          <IconActionButton
            label="Gérer la checklist"
            icon={ListChecks}
            tone="view"
            onClick={() => onTabChange("checklist")}
          />
        </div>
      </div>
    </div>
  );
}
