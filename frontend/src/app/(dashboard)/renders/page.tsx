"use client";

import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon } from "lucide-react";
import api from "@/lib/api";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import type { ProjectFile } from "@/types";
import { formatDate } from "@/lib/utils";

export default function RendersPage() {
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["project-files", "renders"],
    queryFn: async () => {
      const { data } = await api.get<ProjectFile[]>("/project-files");
      return data.filter((f) => f.fileType.toUpperCase().includes("RENDER"));
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Rendus</h1>
        <p className="mt-1 text-text-secondary">Visualisations et rendus 3D</p>
      </div>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : files.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Aucun rendu"
          description="Uploadez des rendus depuis vos projets."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <Card key={file.id} padding={false} className="overflow-hidden">
              <div className="aspect-video bg-dark-elevated">
                {file.mimeType.startsWith("image/") ? (
                  <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-text-muted" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium text-text-primary">{file.name}</p>
                <p className="text-sm text-text-secondary">{file.project?.name}</p>
                <p className="mt-1 text-xs text-text-muted">{formatDate(file.createdAt)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
