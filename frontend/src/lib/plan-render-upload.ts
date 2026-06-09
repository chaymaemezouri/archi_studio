import api from "@/lib/api";
import type { PlanRender, PlanRenderKind } from "@/types";

export interface PlanRenderUploadMeta {
  kind: PlanRenderKind;
  category: string;
  name?: string;
  projectId?: string;
  clientId?: string;
  version?: string;
  tags?: string[];
  description?: string;
  isMainImage?: boolean;
}

export async function uploadPlanRenderFile(
  file: File,
  meta: PlanRenderUploadMeta
): Promise<PlanRender> {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", meta.kind);
  form.append("category", meta.category);
  if (meta.name) form.append("name", meta.name);
  if (meta.projectId) form.append("projectId", meta.projectId);
  if (meta.clientId) form.append("clientId", meta.clientId);
  if (meta.version) form.append("version", meta.version);
  if (meta.description) form.append("description", meta.description);
  if (meta.tags?.length) form.append("tags", meta.tags.join(","));
  if (meta.isMainImage) form.append("isMainImage", "true");

  const { data } = await api.post<PlanRender>("/plans-renders/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
