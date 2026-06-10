"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import {
  registerProjectFile,
  uploadProjectFile,
  type ProjectUploadFolder,
} from "@/lib/project-upload";
import { uploadDocumentFile } from "@/lib/document-upload";
import { uploadPlanRenderFile } from "@/lib/plan-render-upload";
import type {
  ChantierLog,
  Deadline,
  Meeting,
  ProjectFile,
  ProjectPhase,
  Task,
  TaskStatus,
} from "@/types";

export function invalidateProjectQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string
) {
  queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
  queryClient.invalidateQueries({ queryKey: ["projects"] });
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
  queryClient.invalidateQueries({ queryKey: ["calendar"] });
  queryClient.invalidateQueries({ queryKey: ["plans-renders"] });
  queryClient.invalidateQueries({ queryKey: ["documents"] });
  queryClient.invalidateQueries({ queryKey: ["documents", "project", projectId] });
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
  queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
}

export function useProjectDetailMutations(projectId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => invalidateProjectQueries(queryClient, projectId);

  const createTask = useMutation({
    mutationFn: async (payload: {
      title: string;
      dueDate?: string;
      priority?: string;
    }) => {
      const { data } = await api.post<Task>("/tasks", { ...payload, projectId });
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Tâche ajoutée");
    },
    onError: () => toast.error("Impossible d'ajouter la tâche"),
  });

  const updateTask = useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      status?: TaskStatus;
      title?: string;
      description?: string;
      dueDate?: string;
      priority?: string;
    }) => {
      const { data } = await api.patch<Task>(`/tasks/${id}`, body);
      return data;
    },
    onSuccess: () => invalidate(),
    onError: () => toast.error("Erreur tâche"),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Tâche supprimée");
    },
    onError: () => toast.error("Impossible de supprimer la tâche"),
  });

  const createDeadline = useMutation({
    mutationFn: async (payload: { title: string; date: string; priority?: string }) => {
      const { data } = await api.post<Deadline>("/deadlines", { ...payload, projectId });
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Deadline créée");
    },
    onError: () => toast.error("Impossible de créer la deadline"),
  });

  const updateDeadline = useMutation({
    mutationFn: async ({ id, ...body }: { id: string; done?: boolean; title?: string }) => {
      const { data } = await api.patch<Deadline>(`/deadlines/${id}`, body);
      return data;
    },
    onSuccess: () => invalidate(),
    onError: () => toast.error("Erreur deadline"),
  });

  const deleteDeadline = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/deadlines/${id}`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Deadline supprimée");
    },
    onError: () => toast.error("Impossible de supprimer"),
  });

  const createMeeting = useMutation({
    mutationFn: async (payload: {
      title: string;
      date: string;
      startTime?: string;
      location?: string;
      notes?: string;
    }) => {
      const { data } = await api.post<Meeting>("/meetings", { ...payload, projectId });
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Réunion planifiée");
    },
    onError: () => toast.error("Impossible de planifier la réunion"),
  });

  const updateMeeting = useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      title?: string;
      date?: string;
      startTime?: string;
      location?: string;
      notes?: string;
    }) => {
      const { data } = await api.patch<Meeting>(`/meetings/${id}`, body);
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Réunion mise à jour");
    },
    onError: () => toast.error("Impossible de mettre à jour la réunion"),
  });

  const deleteMeeting = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/meetings/${id}`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Réunion supprimée");
    },
    onError: () => toast.error("Impossible de supprimer la réunion"),
  });

  const createChantierLog = useMutation({
    mutationFn: async (payload: {
      date: string;
      siteVisit?: string;
      chantierPhase?: string;
      description: string;
      progress?: number;
      issues?: string;
      nextSteps?: string;
      photos?: string[];
      reportUrl?: string;
      reportName?: string;
    }) => {
      const { data } = await api.post<ChantierLog>("/chantier", { ...payload, projectId });
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Journal chantier ajouté");
    },
    onError: () => toast.error("Impossible d'ajouter le journal"),
  });

  const uploadFile = useMutation({
    mutationFn: async ({
      file,
      folder,
      fileType,
      setAsCover,
    }: {
      file: File;
      folder: ProjectUploadFolder;
      fileType: string;
      setAsCover?: boolean;
    }) => {
      const uploaded = await uploadProjectFile(projectId, file, folder);
      await registerProjectFile({
        projectId,
        name: uploaded.originalName || file.name,
        url: uploaded.url,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
        fileType,
      });
      if (setAsCover) {
        await api.patch(`/projects/${projectId}`, { imageUrl: uploaded.url });
      }
      return uploaded;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Fichier ajouté");
    },
    onError: () => toast.error("Échec de l'envoi du fichier"),
  });

  const uploadDocument = useMutation({
    mutationFn: async (file: File) => {
      return uploadDocumentFile(file, {
        name: file.name.replace(/\.[^.]+$/, ""),
        projectId,
        category: "PROJECT_DOC",
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Document ajouté");
    },
    onError: () => toast.error("Impossible d'ajouter le document"),
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Document supprimé");
    },
    onError: () => toast.error("Impossible de supprimer le document"),
  });

  const updateDocument = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data } = await api.patch(`/documents/${id}`, { name });
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Document renommé");
    },
    onError: () => toast.error("Impossible de renommer le document"),
  });

  const uploadPlanRender = useMutation({
    mutationFn: async ({
      file,
      kind,
      category,
      isMainImage,
    }: {
      file: File;
      kind: "PLAN" | "RENDER";
      category?: string;
      isMainImage?: boolean;
    }) => {
      return uploadPlanRenderFile(file, {
        kind,
        category: category ?? "AUTRE",
        projectId,
        name: file.name.replace(/\.[^.]+$/, ""),
        isMainImage,
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Fichier ajouté");
    },
    onError: () => toast.error("Échec de l'envoi du fichier"),
  });

  const deletePlanRender = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/plans-renders/${id}`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Élément supprimé");
    },
    onError: () => toast.error("Impossible de supprimer"),
  });

  const setPlanRenderMainImage = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/plans-renders/${id}/main-image`);
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Image principale définie");
    },
    onError: () => toast.error("Impossible de définir l'image principale"),
  });

  const deleteFile = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/project-files/${id}`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Fichier supprimé");
    },
    onError: () => toast.error("Impossible de supprimer le fichier"),
  });

  const updateFile = useMutation({
    mutationFn: async ({ id, name, fileType }: { id: string; name?: string; fileType?: string }) => {
      const { data } = await api.patch<ProjectFile>(`/project-files/${id}`, { name, fileType });
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Fichier mis à jour");
    },
    onError: () => toast.error("Impossible de renommer le fichier"),
  });

  const setProjectCover = useMutation({
    mutationFn: async (imageUrl: string) => {
      const { data } = await api.patch(`/projects/${projectId}`, { imageUrl });
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Image principale mise à jour");
    },
    onError: () => toast.error("Impossible de définir l'image principale"),
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/invoices/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Facture mise à jour");
    },
    onError: () => toast.error("Impossible de mettre à jour la facture"),
  });

  const updateProjectMeta = useMutation({
    mutationFn: async (body: {
      phase?: ProjectPhase;
      progress?: number;
      isFavorite?: boolean;
    }) => {
      const { data } = await api.patch(`/projects/${projectId}`, body);
      return data;
    },
    onSuccess: () => invalidate(),
    onError: () => toast.error("Mise à jour impossible"),
  });

  const updateProjectNotes = useMutation({
    mutationFn: async (notes: string | null) => {
      const { data } = await api.patch(`/projects/${projectId}`, { notes });
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Notes enregistrées");
    },
    onError: () => toast.error("Impossible d'enregistrer les notes"),
  });

  const createProjectNote = useMutation({
    mutationFn: async (body: {
      content: string;
      title?: string;
      pinned?: boolean;
    }) => {
      const { data } = await api.post(`/projects/${projectId}/notes`, body);
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Note ajoutée");
    },
    onError: () => toast.error("Impossible d'ajouter la note"),
  });

  const updateProjectNote = useMutation({
    mutationFn: async ({
      noteId,
      ...body
    }: {
      noteId: string;
      content?: string;
      title?: string | null;
      pinned?: boolean;
    }) => {
      const { data } = await api.patch(
        `/projects/${projectId}/notes/${noteId}`,
        body
      );
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Note mise à jour");
    },
    onError: () => toast.error("Impossible de mettre à jour la note"),
  });

  const deleteProjectNote = useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/projects/${projectId}/notes/${noteId}`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Note supprimée");
    },
    onError: () => toast.error("Impossible de supprimer la note"),
  });

  const updateChecklistItem = useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      status?: "MISSING" | "UPLOADED" | "VALIDATED";
      notes?: string;
      fileUrl?: string | null;
      documentId?: string | null;
    }) => {
      const { data } = await api.patch(
        `/projects/${projectId}/checklist/${id}`,
        body
      );
      return data;
    },
    onSuccess: () => invalidate(),
    onError: () => toast.error("Impossible de mettre à jour la checklist"),
  });

  return {
    createTask,
    updateTask,
    deleteTask,
    createDeadline,
    updateDeadline,
    deleteDeadline,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    createChantierLog,
    uploadFile,
    uploadDocument,
    uploadPlanRender,
    deleteFile,
    deleteDocument,
    deletePlanRender,
    updateFile,
    updateDocument,
    setPlanRenderMainImage,
    setProjectCover,
    updateInvoice,
    updateProjectMeta,
    updateProjectNotes,
    createProjectNote,
    updateProjectNote,
    deleteProjectNote,
    updateChecklistItem,
    invalidate,
  };
}
