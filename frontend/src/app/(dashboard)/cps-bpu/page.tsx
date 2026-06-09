"use client";

import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import api from "@/lib/api";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import type { ProjectFile } from "@/types";
import { formatDate } from "@/lib/utils";

export default function CpsBpuPage() {
  const { data: files = [], isLoading } = useQuery({
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">CPS / BPU</h1>
        <p className="mt-1 text-text-secondary">Cahiers des prescriptions et bordereaux de prix</p>
      </div>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : files.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Aucun document CPS/BPU"
          description="Les cahiers des prescriptions apparaîtront ici."
        />
      ) : (
        <Table
          data={files}
          keyExtractor={(f) => f.id}
          columns={[
            { key: "name", header: "Document" },
            { key: "fileType", header: "Type" },
            { key: "project", header: "Projet", render: (f) => f.project?.name || "—" },
            { key: "createdAt", header: "Date", render: (f) => formatDate(f.createdAt) },
          ]}
        />
      )}
    </div>
  );
}
