"use client";

import { Calendar } from "lucide-react";
import Card from "@/components/ui/Card";
import type { Meeting } from "@/types";
import { formatDate } from "@/lib/utils";

interface CalendarWidgetProps {
  meetings?: Meeting[];
}

export default function CalendarWidget({ meetings }: CalendarWidgetProps) {
  const meetingList = Array.isArray(meetings) ? meetings : [];
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const monthName = today.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold capitalize text-text-primary">{monthName}</h2>
        <Calendar className="h-5 w-5 text-accent" />
      </div>

      <div className="mb-4 grid grid-cols-7 gap-1 text-center text-xs text-text-muted">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-7 gap-1">
        {Array.from({ length: (firstDay + 6) % 7 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate();
          return (
            <div
              key={day}
              className={`flex h-8 items-center justify-center rounded-lg text-sm ${
                isToday
                  ? "bg-accent font-medium text-white"
                  : "text-text-secondary hover:bg-white/5"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {meetingList.length === 0 ? (
        <p className="text-center text-sm text-text-secondary">Aucune réunion prévue</p>
      ) : (
        <ul className="space-y-2 border-t border-dark-border pt-4">
          {meetingList.slice(0, 3).map((meeting) => (
            <li key={meeting.id} className="text-sm">
              <p className="font-medium text-text-primary">{meeting.title}</p>
              <p className="text-xs text-text-secondary">
                {formatDate(meeting.date)}
                {meeting.startTime && ` · ${meeting.startTime}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
