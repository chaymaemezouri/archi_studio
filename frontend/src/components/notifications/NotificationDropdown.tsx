"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import NotificationListItem from "./NotificationListItem";
import { glassDropdown } from "@/lib/glass-styles";
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
import type { Notification } from "@/types";

interface NotificationDropdownProps {
  onClose: () => void;
}

const FILTER_TABS: { id: NotifFilter; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "urgent", label: "Urgent" },
  { id: "unread", label: "Non lues" },
];

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<NotifFilter>("all");
  const { data: notifications = [], isLoading, isFetching } = useNotifications();
  const sync = useSyncNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const syncedOnOpen = useRef(false);
  useEffect(() => {
    if (syncedOnOpen.current) return;
    syncedOnOpen.current = true;
    sync.mutate();
  }, [sync]);

  const filtered = filterNotifications(notifications, filter);
  const recent = filtered.slice(0, 6);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentUnread = countUrgentUnread(notifications);

  const handleClick = (notif: Notification) => {
    if (!notif.read) markAsRead.mutate(notif.id);
    onClose();
    router.push(notif.link?.startsWith("/") ? notif.link : "/dashboard");
  };

  const statusLine = (() => {
    if (sync.isPending || isFetching) return "Mise à jour…";
    if (unreadCount === 0) return "Aucune alerte en attente";
    const base = `${unreadCount} non lue${unreadCount !== 1 ? "s" : ""}`;
    if (urgentUnread > 0) {
      return `${base} · ${urgentUnread} prioritaire${urgentUnread !== 1 ? "s" : ""}`;
    }
    return base;
  })();

  return (
    <div
      className={cn(
        glassDropdown,
        "z-[100] flex flex-col overflow-hidden",
        /* Mobile : panneau sous le header, centré dans l'écran */
        "fixed inset-x-3 top-[3.35rem] w-auto max-w-none",
        "max-h-[min(70dvh,calc(100dvh-4.5rem))]",
        /* Desktop : ancré à la cloche */
        "md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-1.5",
        "md:w-[min(360px,calc(100vw-1.5rem))] md:max-h-none"
      )}
      role="menu"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-medium text-glass">Notifications</h3>
          <p className="mt-0.5 text-[11px] text-glass-muted">{statusLine}</p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            title="Tout marquer comme lu"
            className="shrink-0 rounded-md px-2 py-1 text-[11px] text-studio-light/70 transition hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
          >
            <span className="inline-flex items-center gap-1">
              <CheckCheck className="h-3 w-3" strokeWidth={1.75} />
              Tout lu
            </span>
          </button>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto border-t border-app px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTER_TABS.map((f) => {
          const count =
            f.id === "urgent"
              ? urgentUnread
              : f.id === "unread"
                ? unreadCount
                : undefined;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 border-b-2 py-2 text-[11px] font-medium transition",
                filter === f.id
                  ? "border-studio-light text-studio-light"
                  : "border-transparent text-glass-muted hover:text-glass-secondary"
              )}
            >
              {f.label}
              {count != null && count > 0 ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-app md:max-h-[min(300px,50vh)]">
        {isLoading ? (
          <div className="space-y-2 px-3 py-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-[color:var(--glass-bg-hover)]" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="px-3 py-8 text-center text-[12px] text-glass-muted">
            {filter === "urgent"
              ? "Aucune alerte prioritaire"
              : filter === "unread"
                ? "Tout est à jour"
                : "Aucune notification"}
          </p>
        ) : (
          <div className="py-1">
            {recent.map((notif) => (
              <NotificationListItem
                key={notif.id}
                notification={notif}
                onClick={() => handleClick(notif)}
                compact
              />
            ))}
          </div>
        )}
      </div>

      <Link
        href="/notifications"
        onClick={onClose}
        className="block border-t border-app px-3 py-2.5 text-center text-[11px] text-studio-light/65 transition hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
      >
        Voir tout l&apos;historique
      </Link>
    </div>
  );
}
