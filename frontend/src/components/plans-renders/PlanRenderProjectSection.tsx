"use client";

import Link from "next/link";
import { Image as ImageIcon, Layers } from "lucide-react";
import PlanRenderGridCard from "./PlanRenderGridCard";
import PlanRenderRow, { PlanRenderListHeader } from "./PlanRenderRow";
import {
  plansRendersListTable,
  plansRendersShell,
} from "./plans-renders-list-ui";
import type { PlanRenderProjectGroup } from "@/lib/plans-renders-list";
import type { PlanRender } from "@/types";
import { accentBar } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

interface PlanRenderProjectSectionProps {
  group: PlanRenderProjectGroup;
  view: "grid" | "list";
  onEdit: (asset: PlanRender) => void;
  onPreview: (asset: PlanRender) => void;
}

function Subsection({
  icon: Icon,
  label,
  count,
  view,
  assets,
  onEdit,
  onPreview,
}: {
  icon: typeof Layers;
  label: string;
  count: number;
  view: "grid" | "list";
  assets: PlanRender[];
  onEdit: (asset: PlanRender) => void;
  onPreview: (asset: PlanRender) => void;
}) {
  if (count === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Icon className="h-3.5 w-3.5 text-glass-muted" strokeWidth={1.75} />
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-glass-muted">
          {label}
          <span className="ml-1.5 font-normal tabular-nums text-glass-muted/80">
            ({count})
          </span>
        </h3>
      </div>

      {view === "list" ? (
        <div className={plansRendersListTable}>
          {assets.map((asset) => (
            <PlanRenderRow
              key={asset.id}
              asset={asset}
              onEdit={onEdit}
              onPreview={onPreview}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            <PlanRenderGridCard
              key={asset.id}
              asset={asset}
              onEdit={onEdit}
              onPreview={onPreview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlanRenderProjectSection({
  group,
  view,
  onEdit,
  onPreview,
}: PlanRenderProjectSectionProps) {
  const total = group.renders.length + group.plans.length;
  const href = group.projectId
    ? `/projects/${group.projectId}`
    : group.clientId
      ? `/clients/${group.clientId}`
      : undefined;

  return (
    <section className={cn(plansRendersShell, "space-y-3 p-3 sm:p-4")}>
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
            {group.renders.length} rendu{group.renders.length !== 1 ? "s" : ""}
            {" · "}
            {group.plans.length} plan{group.plans.length !== 1 ? "s" : ""}
            {" · "}
            {total} fichier{total !== 1 ? "s" : ""}
          </p>
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-[11px] font-medium text-glass-muted transition hover:text-studio-light"
          >
            {group.projectId ? "Voir le projet →" : "Voir le client →"}
          </Link>
        )}
      </header>

      {view === "list" && (group.renders.length > 0 || group.plans.length > 0) && (
        <PlanRenderListHeader />
      )}

      <Subsection
        icon={ImageIcon}
        label="Rendus"
        count={group.renders.length}
        view={view}
        assets={group.renders}
        onEdit={onEdit}
        onPreview={onPreview}
      />

      <Subsection
        icon={Layers}
        label="Plans"
        count={group.plans.length}
        view={view}
        assets={group.plans}
        onEdit={onEdit}
        onPreview={onPreview}
      />
    </section>
  );
}
