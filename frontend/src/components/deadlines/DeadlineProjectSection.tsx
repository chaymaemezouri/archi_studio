"use client";

import Link from "next/link";
import DeadlineRow, { DeadlineListHeader } from "./DeadlineRow";
import { deadlinesListTable, deadlinesShell } from "./deadlines-list-ui";
import type { DeadlineProjectGroup } from "@/lib/deadlines-list";
import { accentBar } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

interface DeadlineProjectSectionProps {
  group: DeadlineProjectGroup;
}

export default function DeadlineProjectSection({ group }: DeadlineProjectSectionProps) {
  const href = group.projectId ? `/projects/${group.projectId}` : undefined;
  const count = group.deadlines.length;

  return (
    <section className={cn(deadlinesShell, "space-y-3 p-3 sm:p-4")}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-app pb-2.5">
        <div className="min-w-0">
          {href ? (
            <Link
              href={href}
              className="flex items-center gap-2 text-[15px] font-semibold text-app-primary transition hover:text-studio-light"
            >
              <span className={cn(accentBar, "h-3.5")} aria-hidden />
              <span className="truncate">{group.projectName}</span>
            </Link>
          ) : (
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-app-primary">
              <span className={cn(accentBar, "h-3.5")} aria-hidden />
              <span className="truncate">{group.projectName}</span>
            </h2>
          )}
          <p className="mt-0.5 pl-3 text-[11px] text-glass-muted">
            {count} deadline{count !== 1 ? "s" : ""}
          </p>
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-[11px] font-medium text-glass-muted transition hover:text-studio-light"
          >
            Voir le projet →
          </Link>
        )}
      </header>

      <div className={deadlinesListTable}>
        <DeadlineListHeader />
        {group.deadlines.map((deadline) => (
          <DeadlineRow key={deadline.id} deadline={deadline} />
        ))}
      </div>
    </section>
  );
}
