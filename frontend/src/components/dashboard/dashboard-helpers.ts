import { formatActivityLabel } from "@/lib/utils";

import type { ActivityLog } from "@/types";

import { isSameLocalDay } from "@/lib/dates";



export {

  filterProjects,

  getNextTaskForProject,

  getProjectNextDeadline,

  getProjectStatusBadge,

  isProjectNew,

  isProjectOverdue,

  isProjectUrgent,

  PROJECT_STATUS_LABELS,

  PROJECT_STATUS_STYLES,

  type ProjectFilter,

  type ProjectStatusBadge,

} from "@/lib/project-status";



export type GroupedActivity = {

  id: string;

  label: string;

  createdAt: string;

  count: number;

};



function activityGroupKey(a: ActivityLog): string {

  const projectKey = a.projectId ?? a.project?.name ?? "";

  return `${a.entity}-${a.entityId ?? ""}-${a.action}-${projectKey}`;

}



export function groupRecentActivities(

  activities: ActivityLog[],

  limit = 4

): GroupedActivity[] {

  const map = new Map<string, { items: ActivityLog[] }>();



  for (const a of activities) {

    const key = activityGroupKey(a);

    const bucket = map.get(key) ?? { items: [] };

    bucket.items.push(a);

    map.set(key, bucket);

  }



  const grouped: GroupedActivity[] = [];



  for (const { items } of Array.from(map.values())) {

    const sorted = [...items].sort(

      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

    );

    const latest = sorted[0];

    const baseLabel = formatActivityLabel(latest);

    const count = sorted.length;

    const allToday = sorted.every((x) => isSameLocalDay(x.createdAt, new Date()));



    let label = baseLabel;

    if (count > 1 && allToday) {

      label = `${baseLabel} ${count} fois aujourd'hui`;

    } else if (count > 1) {

      label = `${baseLabel} (${count} fois)`;

    }



    grouped.push({

      id: latest.id,

      label,

      createdAt: latest.createdAt,

      count,

    });

  }



  return grouped

    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    .slice(0, limit);

}


