"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import {
  GlassListHeader,
  GlassListRow,
  GlassListTable,
  GlassPageShell,
} from "@/components/ui/GlassPageShell";
import api from "@/lib/api";
import { listLink } from "@/lib/theme-classes";
import type { ProjectFile } from "@/types";
import { formatDate } from "@/lib/utils";

export default function CpsBpuPage() {
  const { data: files = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["project-files", "cps-bpu"],
    queryFn: async () => {
      const { data } = await api.get<ProjectFile[]>("/project-files");
      return data.filter(
        (f) =>
          f.fileType.toUpperCase().includes("CPS") ||
          f.fileType.toUpperCase().includes("BPU")
      );
    },
  });

  return (
    <GlassPageShell
      title="CPS / BPU"
      description="Cahiers des prescriptions et bordereaux de prix"
      icon={ClipboardList}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && files.length === 0}
      emptyTitle="Aucun document CPS/BPU"
      emptyDescription="Les cahiers des prescriptions apparaîtront ici depuis vos projets."
    >
      <GlassListTable>
        <GlassListHeader
          columns={["Document", "Type", "Projet", "Date"]}
          className="grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,0.7fr)]"
        />
        {files.map((f) => (
          <GlassListRow
            key={f.id}
            className="grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,0.7fr)]"
          >
            <a
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className={listLink}
            >
              {f.name}
            </a>
            <span>{f.fileType}</span>
            <span className="truncate">
              {f.project ? (
                <Link href={`/projects/${f.project.id}`} className={listLink}>
                  {f.project.name}
                </Link>
              ) : (
                "—"
              )}
            </span>
            <span>{formatDate(f.createdAt)}</span>
          </GlassListRow>
        ))}
      </GlassListTable>
    </GlassPageShell>
  );
}
