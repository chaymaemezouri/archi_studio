"use client";

import type { Notification } from "@/types";
import { getNotificationMeta } from "@/lib/notification-meta";
import { isUrgentNotification } from "@/lib/notification-utils";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";

interface NotificationListItemProps {
  notification: Notification;
  onClick?: () => void;
  fullDate?: boolean;
  compact?: boolean;
  className?: string;
}

export default function NotificationListItem({
  notification,
  onClick,
  fullDate,
  compact,
  className,
}: NotificationListItemProps) {
  const unread = !notification.read;
  const urgent = isUrgentNotification(notification);
  const meta = getNotificationMeta(notification.type);
  const timeLabel = fullDate
    ? formatDate(notification.createdAt)
    : formatRelativeTime(notification.createdAt);

  const content = (
    <div className="flex min-w-0 gap-2.5">
      <span
        className={cn(
          "mt-1.5 h-full min-h-[28px] w-0.5 shrink-0 rounded-full",
          urgent && unread
            ? "bg-rose-400/70"
            : unread
              ? "bg-studio-light/80"
              : "bg-transparent"
        )}
        aria-hidden
      />
      <span className="min-w-0 flex-1 py-2">
        <span className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "truncate text-[13px] leading-snug",
              unread ? "font-medium text-white/90" : "text-white/52"
            )}
          >
            {notification.title}
          </span>
          <span className="shrink-0 text-[10px] tabular-nums text-white/28">{timeLabel}</span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[11px] leading-relaxed text-white/36">
          {notification.message}
        </span>
        {!compact && (
          <span className="mt-1 block text-[10px] text-white/30">{meta.label}</span>
        )}
      </span>
    </div>
  );

  const rowClass = cn(
    "w-full text-left transition hover:bg-white/[0.04]",
    compact ? "px-3" : "border-l-2 border-transparent px-4 py-0.5",
    !compact && unread && "border-studio-light/50",
    className
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={rowClass}>
        {content}
      </button>
    );
  }

  return <div className={rowClass}>{content}</div>;
}
