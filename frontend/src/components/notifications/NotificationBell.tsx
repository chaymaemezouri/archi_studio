"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { glassBtnIcon } from "@/lib/glass-styles";
import { useUnreadCount } from "@/hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";

const notificationBadgeBase = cn(
  "absolute -right-0.5 -top-0.5 flex h-[15px] min-w-[15px] items-center justify-center",
  "rounded-full px-1 text-[8px] font-medium leading-none tabular-nums",
  "ring-2 ring-[#07070b]"
);

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: summary } = useUnreadCount();
  const unreadCount = summary?.count ?? 0;
  const urgentCount = summary?.urgentCount ?? 0;

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
            : "Notifications"
        }
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          glassBtnIcon,
          "relative h-9 w-9 border-0 text-white/55",
          "hover:text-studio-light/90",
          open && "bg-white/[0.06] text-studio-light"
        )}
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span
            className={cn(
              notificationBadgeBase,
              urgentCount > 0
                ? "border border-amber-400/30 bg-[#1c1810]/95 text-amber-200/90 shadow-[0_0_10px_rgba(251,191,36,0.12)]"
                : "border border-[#8ba4c7]/35 bg-[#141a24]/95 text-[#b8cfe8]"
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer les notifications"
            className="fixed inset-0 z-[90] bg-black/45 md:hidden"
            onClick={() => setOpen(false)}
          />
          <NotificationDropdown onClose={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}
