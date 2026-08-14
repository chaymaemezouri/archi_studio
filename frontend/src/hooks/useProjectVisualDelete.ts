"use client";

import { useCallback } from "react";
import { useDialog } from "@/components/providers/DialogProvider";
import { useProjectDetailMutations } from "@/hooks/useProjectDetail";
import type { Project } from "@/types";

export const PROJECT_COVER_ITEM_ID = "cover";

export function useProjectVisualDelete(project: Project) {
  const { confirm } = useDialog();
  const { deletePlanRender, deleteFile, clearProjectCover } =
    useProjectDetailMutations(project.id);

  const deleteVisual = useCallback(
    async (itemId: string) => {
      const ok = await confirm({
        title: "Supprimer l'image",
        message: "Cette image sera retirée du projet. Continuer ?",
        variant: "danger",
        confirmLabel: "Supprimer",
      });
      if (!ok) return;

      if (itemId === PROJECT_COVER_ITEM_ID) {
        clearProjectCover.mutate();
        return;
      }
      if (project.planRenders?.some((asset) => asset.id === itemId)) {
        deletePlanRender.mutate(itemId);
        return;
      }
      deleteFile.mutate(itemId);
    },
    [confirm, project.planRenders, clearProjectCover, deletePlanRender, deleteFile],
  );

  return { deleteVisual };
}
