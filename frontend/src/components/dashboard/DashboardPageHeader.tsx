"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock3, FileDown } from "lucide-react";
import DashboardAddMenu, { type QuickAddAction } from "./DashboardAddMenu";
import { dashboardActionBtn, dashboardPanel } from "./dashboard-ui";
import { cn } from "@/lib/utils";
import type { TodayExecutiveBrief } from "./dashboard-executive";

interface DashboardPageHeaderProps {
  today: Date;
  brief: TodayExecutiveBrief | null;
  isLoading?: boolean;
  pdfLoading?: boolean;
  onWeeklyPdf: () => void;
  onQuickAdd: (action: QuickAddAction) => void;
}

const actionBtn = cn(dashboardActionBtn, "h-10 flex-1");

export default function DashboardPageHeader({
  today,
  brief,
  isLoading,
  pdfLoading,
  onWeeklyPdf,
  onQuickAdd,
}: DashboardPageHeaderProps) {
  return (
    <>
      {/* Mobile — carte résumé + actions */}
      <div className="space-y-2 lg:hidden">
        <section className={cn(dashboardPanel, "px-3.5 py-3")}>
          <p className="text-[11px] font-medium capitalize text-glass-muted">
            {format(today, "EEEE d MMMM", { locale: fr })}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-glass">
            {brief?.summaryLine ?? (isLoading ? "Chargement…" : "Bienvenue sur votre espace.")}
          </p>
          {brief?.recommendedAction && (
            <p className="mt-2 text-[11px] leading-relaxed text-studio-light/75">
              <span className="text-glass-muted">Priorité · </span>
              {brief.recommendedAction.href ? (
                <Link
                  href={brief.recommendedAction.href}
                  className="underline decoration-studio-light/30 underline-offset-2"
                >
                  {brief.recommendedAction.label}
                </Link>
              ) : (
                brief.recommendedAction.label
              )}
            </p>
          )}
        </section>

        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <button
            type="button"
            onClick={onWeeklyPdf}
            disabled={pdfLoading || isLoading}
            className={actionBtn}
          >
            <FileDown className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span>{pdfLoading ? "PDF…" : "Résumé"}</span>
          </button>
          <Link href="/calendar" className={actionBtn}>
            <Clock3 className="h-3.5 w-3.5 shrink-0 text-studio-light/80" strokeWidth={1.75} />
            Agenda
          </Link>
          <div className="flex items-center justify-center">
            <DashboardAddMenu onQuickAdd={onQuickAdd} disabled={isLoading} />
          </div>
        </div>
      </div>

      {/* Desktop — ligne compacte */}
      <div className="hidden flex-wrap items-center justify-between gap-2 lg:flex">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] capitalize text-glass-muted">
            {format(today, "EEEE d MMMM yyyy", { locale: fr })}
          </p>
          <p className="mt-0.5 text-[12px] text-glass-secondary">
            {brief?.summaryLine ?? "Chargement du résumé…"}
          </p>
          {brief?.recommendedAction && (
            <p className="mt-1 text-[11px] text-studio-light/70">
              Priorité :{" "}
              {brief.recommendedAction.href ? (
                <Link
                  href={brief.recommendedAction.href}
                  className="underline decoration-studio-light/30 underline-offset-2 hover:text-studio-light"
                >
                  {brief.recommendedAction.label}
                </Link>
              ) : (
                <span>{brief.recommendedAction.label}</span>
              )}
              {brief.recommendedAction.detail && (
                <span className="text-glass-muted"> — {brief.recommendedAction.detail}</span>
              )}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onWeeklyPdf}
            disabled={pdfLoading || isLoading}
            className={cn(dashboardActionBtn, "h-8 px-2.5")}
          >
            <FileDown className="h-3.5 w-3.5" strokeWidth={1.75} />
            {pdfLoading ? "PDF…" : "Résumé PDF"}
          </button>
          <Link
            href="/calendar"
            className={cn(dashboardActionBtn, "h-8 px-2.5")}
          >
            <Clock3 className="h-3.5 w-3.5 text-studio-light/80" />
            Agenda
          </Link>
          <DashboardAddMenu onQuickAdd={onQuickAdd} disabled={isLoading} />
        </div>
      </div>
    </>
  );
}
