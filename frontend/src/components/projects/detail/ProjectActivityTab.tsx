"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronsDown } from "lucide-react";
import IconActionButton from "./IconActionButton";
import ProjectTabSectionHeader from "./ProjectTabSectionHeader";
import UserAvatar from "./UserAvatar";
import {
  detailChecklistDate,
  detailChecklistEmpty,
  detailChecklistItem,
  detailChecklistList,
  detailChecklistSection,
  detailRowTitle,
} from "./project-detail-ui";
import { formatProjectActivityMessage } from "@/lib/project-detail";
import type { Project } from "@/types";
import { cn, formatRelativeTime } from "@/lib/utils";

const ACTIVITY_PAGE_SIZE = 7;

interface ProjectActivityTabProps {
  project: Project;
}

export default function ProjectActivityTab({ project }: ProjectActivityTabProps) {
  const [visibleCount, setVisibleCount] = useState(ACTIVITY_PAGE_SIZE);

  const activities = useMemo(
    () =>
      [...(project.activityLogs ?? [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [project.activityLogs]
  );

  useEffect(() => {
    setVisibleCount(ACTIVITY_PAGE_SIZE);
  }, [project.id]);

  const visible = activities.slice(0, visibleCount);
  const hasMore = visibleCount < activities.length;
  const remaining = activities.length - visibleCount;

  return (
    <section className={detailChecklistSection}>
      <ProjectTabSectionHeader title="Activité" count={activities.length} />

      {activities.length === 0 ? (
        <p className={detailChecklistEmpty}>Aucune activité enregistrée.</p>
      ) : (
        <>
          <ul className={cn(detailChecklistList, "mt-3")}>
            {visible.map((a) => (
              <li key={a.id} className={cn(detailChecklistItem, "items-start")}>
                {a.user ? (
                  <UserAvatar name={a.user.name} avatar={a.user.avatar} size="sm" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className={cn(detailRowTitle, "leading-snug")}>
                    {formatProjectActivityMessage(a)}
                  </p>
                  <p className={detailChecklistDate}>
                    {formatRelativeTime(a.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {(hasMore || activities.length > ACTIVITY_PAGE_SIZE) && (
            <div className="mt-2 flex items-center justify-end gap-2">
              {visibleCount > ACTIVITY_PAGE_SIZE && (
                <button
                  type="button"
                  onClick={() => setVisibleCount(ACTIVITY_PAGE_SIZE)}
                  className="text-[11px] text-[#9aa3b0]/50 transition hover:text-[#b8c9dc]/75"
                >
                  Réduire
                </button>
              )}
              {hasMore ? (
                <IconActionButton
                  label={`Afficher ${Math.min(remaining, ACTIVITY_PAGE_SIZE)} activités de plus`}
                  icon={ChevronsDown}
                  tone="view"
                  onClick={() =>
                    setVisibleCount((n) =>
                      Math.min(n + ACTIVITY_PAGE_SIZE, activities.length)
                    )
                  }
                />
              ) : (
                <Link
                  href={`/activity?projectId=${project.id}`}
                  className="text-[11px] font-medium text-[#8ba4c7]/80 transition hover:text-[#b8d4f0]"
                >
                  Historique complet
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
