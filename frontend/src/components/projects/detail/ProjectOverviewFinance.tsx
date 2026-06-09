"use client";

import { Wallet } from "lucide-react";
import {
  detailLink,
  detailOverviewBlockTitle,
  detailOverviewCard,
  detailOverviewCardHeader,
  detailOverviewEmptyInline,
  detailTextStrong,
} from "./project-detail-ui";
import { getFinanceFollowUpCount } from "@/lib/project-detail";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import type { ProjectTabId } from "./project-detail-nav";

interface ProjectOverviewFinanceProps {
  project: Project;
  onTabChange: (tab: ProjectTabId) => void;
}

export default function ProjectOverviewFinance({
  project,
  onTabChange,
}: ProjectOverviewFinanceProps) {
  const followUp = getFinanceFollowUpCount(project);
  const devisCount = project.devis?.length ?? 0;
  const invoiceCount = project.invoices?.length ?? 0;
  const hasFinance = devisCount + invoiceCount > 0;

  return (
    <div className={detailOverviewCard}>
      <div className={detailOverviewCardHeader}>
        <h3 className={detailOverviewBlockTitle}>Finance</h3>
        <Wallet className="h-3.5 w-3.5 text-studio-light/40" aria-hidden />
      </div>

      {hasFinance ? (
        <>
          <p
            className={cn(
              detailTextStrong,
              "text-[13px]",
              followUp > 0 ? "text-amber-200/90" : "text-emerald-300/85"
            )}
          >
            {followUp > 0
              ? `${followUp} facture${followUp > 1 ? "s" : ""} à suivre`
              : "Paiements à jour"}
          </p>
          <p className="mt-1.5 text-[11px] text-glass-muted">
            {devisCount} devis · {invoiceCount} facture{invoiceCount > 1 ? "s" : ""}
          </p>
        </>
      ) : (
        <div className={detailOverviewEmptyInline}>Aucun devis ni facture</div>
      )}

      <button
        type="button"
        onClick={() => onTabChange("finances")}
        className={cn(detailLink, "mt-auto block pt-2 text-[10px]")}
      >
        Voir les finances
      </button>
    </div>
  );
}
