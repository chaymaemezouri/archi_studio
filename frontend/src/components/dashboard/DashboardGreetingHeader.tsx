"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { accentText } from "./dashboard-ui";
import DashboardAddMenu, { type QuickAddAction } from "./DashboardAddMenu";

function firstName(name?: string | null): string | null {
  if (!name?.trim()) return null;
  const first = name.trim().split(/\s+/)[0];
  if (first.length <= 4) return first.toUpperCase();
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

interface DashboardGreetingHeaderProps {
  onQuickAdd: (action: QuickAddAction) => void;
  addDisabled?: boolean;
}

export default function DashboardGreetingHeader({
  onQuickAdd,
  addDisabled,
}: DashboardGreetingHeaderProps) {
  const { user } = useAuth();
  const name = firstName(user?.name);
  const dateLabel = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  return (
    <header className="flex flex-col gap-5 pb-1 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-1.5">
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-stone-900 sm:text-[1.875rem]">
          {name ? (
            <>
              <span className="font-normal text-stone-500">Bonjour </span>
              <span className={accentText}>{name}</span>
              <span className="font-normal text-stone-500">,</span>
            </>
          ) : (
            <span>Bonjour,</span>
          )}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-stone-500">
          Voici un aperçu de vos projets et tâches.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <time
          dateTime={new Date().toISOString().split("T")[0]}
          className="text-xs font-medium capitalize tracking-wide text-stone-400 sm:text-sm"
        >
          {dateLabel}
        </time>
        <DashboardAddMenu onQuickAdd={onQuickAdd} disabled={addDisabled} />
      </div>
    </header>
  );
}
