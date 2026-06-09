import api from "@/lib/api";

export interface UploadedFileResult {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export async function uploadClientFile(
  clientId: string,
  file: File
): Promise<UploadedFileResult> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<UploadedFileResult>(
    `/uploads/clients/${clientId}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}
