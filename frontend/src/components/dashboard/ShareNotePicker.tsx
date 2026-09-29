"use client";

import { useState } from "react";
import { FileText, FolderKanban, Image as ImageIcon, PenTool, UserRound } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useDocuments } from "@/hooks/useDocuments";
import { usePlansRenders } from "@/hooks/usePlansRenders";
import { useProjects } from "@/hooks/useProjects";
import {
  refFromClient,
  refFromDocument,
  refFromPlanRender,
  refFromProject,
  type SharedNoteRefDraft,
} from "@/hooks/useSharedNotes";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "CLIENT" as const, label: "Contact", icon: UserRound },
  { id: "PROJECT" as const, label: "Projet", icon: FolderKanban },
  { id: "DOCUMENT" as const, label: "Document", icon: FileText },
  { id: "PLAN" as const, label: "Plan", icon: PenTool },
  { id: "RENDER" as const, label: "Image", icon: ImageIcon },
];

export default function ShareNotePicker({
  onPick,
}: {
  onPick: (ref: SharedNoteRefDraft) => void;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("CLIENT");
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: documents = [], isLoading: documentsLoading } = useDocuments();
  const { data: assets = [], isLoading: assetsLoading } = usePlansRenders();

  const items: SharedNoteRefDraft[] =
    tab === "CLIENT"
      ? clients.map(refFromClient)
      : tab === "PROJECT"
        ? projects.map(refFromProject)
        : tab === "DOCUMENT"
          ? documents.map(refFromDocument)
          : assets.filter((asset) => asset.kind === tab).map(refFromPlanRender);

  const loading =
    (tab === "CLIENT" && clientsLoading) ||
    (tab === "PROJECT" && projectsLoading) ||
    (tab === "DOCUMENT" && documentsLoading) ||
    ((tab === "PLAN" || tab === "RENDER") && assetsLoading);

  return (
    <div className="overflow-hidden rounded-xl border border-glass bg-[color:var(--glass-bg)]">
      <div className="flex gap-1 overflow-x-auto border-b border-app p-1.5">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] transition",
                active
                  ? "bg-studio-light text-white dark:text-[#0a0a0f]"
                  : "text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-glass"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
      <ul className="max-h-44 overflow-y-auto p-1">
        {loading ? (
          <li className="px-2 py-3 text-[12px] text-glass-muted">Chargement…</li>
        ) : items.length === 0 ? (
          <li className="px-2 py-3 text-[12px] text-glass-muted">Rien à partager pour le moment.</li>
        ) : (
          items.map((item) => (
            <li key={`${item.kind}-${item.entityId}`}>
              <button
                type="button"
                onClick={() => onPick(item)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-[color:var(--glass-bg-hover)]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] text-glass">{item.title}</span>
                  {item.subtitle && (
                    <span className="block truncate text-[11px] text-glass-muted">{item.subtitle}</span>
                  )}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
