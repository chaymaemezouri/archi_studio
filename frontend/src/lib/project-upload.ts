import api from "@/lib/api";

export type ProjectUploadFolder = "images" | "renders" | "plans" | "documents";

export interface UploadedFileResult {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export async function uploadProjectFile(
  projectId: string,
  file: File,
  folder: ProjectUploadFolder = "images"
): Promise<UploadedFileResult> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<UploadedFileResult>(
    `/uploads/${folder}/${projectId}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function registerProjectFile(params: {
  projectId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  fileType: string;
}) {
  const { data } = await api.post("/project-files", params);
  return data;
}

export async function syncProjectImages(
  projectId: string,
  files: File[],
  coverIndex = 0
): Promise<string | undefined> {
  if (files.length === 0) return undefined;

  let coverUrl: string | undefined;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const uploaded = await uploadProjectFile(projectId, file, "images");
    const isCover = i === coverIndex;
    if (isCover) coverUrl = uploaded.url;

    await registerProjectFile({
      projectId,
      name: uploaded.originalName || file.name,
      url: uploaded.url,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      fileType: isCover ? "IMAGE" : "RENDER",
    });
  }

  if (coverUrl) {
    await api.patch(`/projects/${projectId}`, { imageUrl: coverUrl });
  }

  return coverUrl;
}
