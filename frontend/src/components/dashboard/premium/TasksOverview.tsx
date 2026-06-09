"use client";

import { addDays } from "date-fns";
import DayTasksPanel from "../DayTasksPanel";
import DashboardDeadlines from "../DashboardDeadlines";
import { sectionLabel } from "./styles";
import type { Deadline, Project, Task } from "@/types";

interface TasksOverviewProps {
  todayTasks?: Task[];
  tomorrowTasks?: Task[];
  upcomingDeadlines?: Deadline[];
  projects?: Project[];
}

export default function TasksOverview({
  todayTasks,
  tomorrowTasks,
  upcomingDeadlines,
  projects,
}: TasksOverviewProps) {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  return (
    <section>
      <p className={sectionLabel}>Travail</p>
      <h2 className="mt-1 text-xl font-light text-slate-900">Tâches & deadlines</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <DayTasksPanel
          title="Tâches du jour"
          tasks={todayTasks}
          projects={projects}
          defaultDate={today}
        />
        <DayTasksPanel
          title="Tâches de demain"
          tasks={tomorrowTasks}
          projects={projects}
          defaultDate={tomorrow}
        />
        <DashboardDeadlines deadlines={upcomingDeadlines} />
      </div>
    </section>
  );
}
