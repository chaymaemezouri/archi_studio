import api from "@/lib/api";
import type { Document } from "@/types";

export interface DocumentUploadMeta {
  name?: string;
  category?: string;
  projectId?: string;
  clientId?: string;
  tags?: string[];
  description?: string;
}

export async function uploadDocumentFile(
  file: File,
  meta: DocumentUploadMeta = {}
): Promise<Document> {
  const form = new FormData();
  form.append("file", file);
  if (meta.name) form.append("name", meta.name);
  if (meta.category) form.append("category", meta.category);
  if (meta.projectId) form.append("projectId", meta.projectId);
  if (meta.clientId) form.append("clientId", meta.clientId);
  if (meta.description) form.append("description", meta.description);
  if (meta.tags?.length) form.append("tags", meta.tags.join(","));

  const { data } = await api.post<Document>("/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
