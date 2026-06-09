"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import NotificationListItem from "@/components/notifications/NotificationListItem";
import {
  accentBar,
  filterChipActive,
  filterChipInactive,
  glassBtnIcon,
  glassPanel,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";
import {
  countUrgentUnread,
  filterNotifications,
  type NotifFilter,
} from "@/lib/notification-utils";
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useSyncNotifications,
} from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<NotifFilter>("all");
  const { data: notifications = [], isLoading } = useNotifications();
  const sync = useSyncNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const filtered = useMemo(
    () => filterNotifications(notifications, filter === "all" ? "all" : filter),
    [notifications, filter]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentUnread = countUrgentUnread(notifications);

  const openNotification = (notif: (typeof notifications)[0]) => {
    if (!notif.read) markAsRead.mutate(notif.id);
    if (notif.link?.startsWith("/")) router.push(notif.link);
  };

  const filters: { id: NotifFilter; label: string; count?: number }[] = [
    { id: "all", label: "Toutes" },
    { id: "urgent", label: "Urgent", count: urgentUnread || undefined },
    { id: "unread", label: "Non lues", count: unreadCount || undefined },
  ];

  return (
    <div className="space-y-5 pb-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-app-primary">
            <span className={accentBar} aria-hidden />
            Notifications
          </h1>
          <p className="mt-1.5 text-sm text-glass-muted">
            {unreadCount > 0
              ? `${unreadCount} non lue${unreadCount !== 1 ? "s" : ""}${
                  urgentUnread > 0
                    ? ` · ${urgentUnread} urgent${urgentUnread !== 1 ? "es" : "e"}`
                    : ""
                }`
              : "Alertes intelligentes : tâches, réunions, deadlines et factures"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => sync.mutate()}
            disabled={sync.isPending}
            className={cn(
              glassBtnIcon,
              "h-9 gap-2 px-3 text-[13px] font-medium text-glass-secondary hover:text-studio-light disabled:opacity-50"
            )}
          >
            Actualiser
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead.mutate()}
              className={cn(
                glassBtnIcon,
                "h-9 gap-2 px-3 text-[13px] font-medium text-glass-secondary hover:text-studio-light"
              )}
            >
              <CheckCheck className="h-4 w-4" strokeWidth={1.75} />
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[12px] font-medium transition",
              filter === f.id ? filterChipActive : filterChipInactive
            )}
          >
            {f.label}
            {f.count != null && f.count > 0 && (
              <span className="ml-1 opacity-75">({f.count})</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={cn(glassPanel, "space-y-1 p-2")}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[76px] animate-pulse rounded-md bg-[color:var(--glass-bg-hover)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={cn(glassPanel, "py-12")}>
          <EmptyState
            icon={Bell}
            title={
              filter === "urgent"
                ? "Aucune alerte urgente"
                : filter === "unread"
                  ? "Tout est lu"
                  : "Aucune notification"
            }
            description="Les rappels apparaissent automatiquement pour les tâches en retard, réunions du jour et deadlines."
          />
        </div>
      ) : (
        <div className={cn(glassPanel, "overflow-hidden py-1")}>
          {filtered.map((notif) => (
            <div key={notif.id} className="group/row relative">
              <NotificationListItem
                notification={notif}
                onClick={() => openNotification(notif)}
                fullDate
                className={notif.link ? "pr-16" : undefined}
              />
              {notif.link && (
                <Link
                  href={notif.link}
                  onClick={() => !notif.read && markAsRead.mutate(notif.id)}
                  className="absolute right-4 top-4 text-[11px] text-studio-light/70 opacity-0 transition hover:text-studio-light group-hover/row:opacity-100"
                >
                  Ouvrir
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
