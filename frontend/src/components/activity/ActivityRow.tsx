"use client";

import UserAvatar from "@/components/projects/detail/UserAvatar";
import {
  ACTIVITY_ENTITY_LABELS,
  getActivityLinks,
} from "@/lib/activity-list";
import { formatProjectActivityMessage } from "@/lib/project-detail";
import type { ActivityLog } from "@/types";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import ActivityRowActions from "./ActivityRowActions";
import { activityListItem } from "./activity-list-ui";

interface ActivityRowProps {
  log: ActivityLog;
}

export default function ActivityRow({ log }: ActivityRowProps) {
  const links = getActivityLinks(log);
  const projectHref = log.projectId ? `/projects/${log.projectId}` : undefined;
  const clientHref = log.clientId ? `/clients/${log.clientId}` : undefined;

  const contextLabel =
    log.project?.name ?? log.client?.name ?? null;
  const entityLabel = ACTIVITY_ENTITY_LABELS[log.entity] ?? log.entity;

  return (
    <li className={activityListItem}>
      <UserAvatar
        name={log.user?.name ?? "Système"}
        avatar={log.user?.avatar}
        size="sm"
        className="ring-[#8ba4c7]/20"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug text-glass">
          {formatProjectActivityMessage(log)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-glass-muted">
          {contextLabel && <span>{contextLabel}</span>}
          {contextLabel && <span className="text-[#8ba4c7]/25">·</span>}
          <span>{entityLabel}</span>
          <span className="text-[#8ba4c7]/25">·</span>
          <span title={formatDate(log.createdAt)}>{formatRelativeTime(log.createdAt)}</span>
        </div>
      </div>
      <ActivityRowActions
        id={log.id}
        projectHref={projectHref}
        clientHref={clientHref}
        menuLinks={links}
      />
    </li>
  );
}
