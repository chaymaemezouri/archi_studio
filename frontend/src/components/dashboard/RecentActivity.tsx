"use client";

import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import type { ActivityLog } from "@/types";
import { formatDate } from "@/lib/utils";

interface RecentActivityProps {
  activities?: ActivityLog[];
  limit?: number;
}

export default function RecentActivity({ activities = [], limit = 6 }: RecentActivityProps) {
  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-text-primary">Activité récente</h2>

      {activities.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-secondary">Aucune activité récente</p>
      ) : (
        <ul className="space-y-4">
          {activities.slice(0, limit).map((activity) => (
            <li key={activity.id} className="flex gap-3">
              <Avatar name={activity.user?.name || "Système"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">
                  <span className="font-medium">{activity.user?.name || "Système"}</span>{" "}
                  {activity.action}{" "}
                  <span className="text-text-secondary">{activity.entity}</span>
                </p>
                {activity.project?.name && (
                  <p className="text-xs text-text-secondary">{activity.project.name}</p>
                )}
                <p className="mt-0.5 text-xs text-text-muted">{formatDate(activity.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
