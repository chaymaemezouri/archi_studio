"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, ListTodo } from "lucide-react";
import DashboardAddMenu, { type QuickAddAction } from "./DashboardAddMenu";
import { dashboardActionBtn } from "./dashboard-ui";
import { cn } from "@/lib/utils";

interface DashboardPageHeaderProps {
  today: Date;
  isLoading?: boolean;
  onQuickAdd: (action: QuickAddAction) => void;
}

export default function DashboardPageHeader({
  today,
  isLoading,
  onQuickAdd,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold tracking-tight text-app-primary">
          Tableau de bord
        </h1>
        <p className="mt-0.5 text-[12px] capitalize text-glass-muted">
          {format(today, "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/tasks" className={cn(dashboardActionBtn, "h-8 px-2.5")}>
          <ListTodo className="h-3.5 w-3.5 text-studio-light/80" strokeWidth={1.75} />
          Tâches
        </Link>
        <Link href="/calendar" className={cn(dashboardActionBtn, "h-8 px-2.5")}>
          <CalendarDays className="h-3.5 w-3.5 text-studio-light/80" strokeWidth={1.75} />
          Calendrier
        </Link>
        <DashboardAddMenu onQuickAdd={onQuickAdd} disabled={isLoading} />
      </div>
    </div>
  );
}
