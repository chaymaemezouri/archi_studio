"use client";

import DashboardCalendar from "../DashboardCalendar";
import DashboardAgenda from "../DashboardAgenda";
import { sectionLabel } from "./styles";
import type { Deadline, Meeting, Project, Task } from "@/types";

interface PlanningSectionProps {
  meetings?: Meeting[];
  calendarDeadlines?: Deadline[];
  calendarTasks?: Task[];
  projects?: Project[];
}

export default function PlanningSection({
  meetings,
  calendarDeadlines,
  calendarTasks,
  projects,
}: PlanningSectionProps) {
  return (
    <section>
      <p className={sectionLabel}>Planning</p>
      <h2 className="mt-1 text-xl font-light text-slate-900">Calendrier & agenda</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardCalendar
          meetings={meetings}
          deadlines={calendarDeadlines}
          tasks={calendarTasks}
          projects={projects}
        />
        <DashboardAgenda
          meetings={meetings}
          deadlines={calendarDeadlines}
          tasks={calendarTasks}
        />
      </div>
    </section>
  );
}
