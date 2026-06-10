import api from "@/lib/api";
import { uploadClientFile } from "@/lib/client-upload";

export type ClientCinUploads = {
  front?: File | null;
  back?: File | null;
};

async function uploadCinFace(
  clientId: string,
  file: File,
  face: "front" | "back"
): Promise<void> {
  const uploaded = await uploadClientFile(clientId, file);
  const label = face === "front" ? "CIN recto" : "CIN verso";
  const displayName = uploaded.originalName || file.name;

  await api.patch(`/clients/${clientId}`, {
    ...(face === "front"
      ? {
          cinDocumentUrl: uploaded.url,
          cinDocumentName: displayName,
        }
      : {
          cinDocumentBackUrl: uploaded.url,
          cinDocumentBackName: displayName,
        }),
  });

  await api.post(`/clients/${clientId}/documents`, {
    name: `${label} — ${displayName}`,
    url: uploaded.url,
    mimeType: uploaded.mimeType,
    size: uploaded.size,
    docType: "ID",
  });
}

export async function attachClientCinDocuments(
  clientId: string,
  uploads: ClientCinUploads
): Promise<void> {
  if (uploads.front) {
    await uploadCinFace(clientId, uploads.front, "front");
  }
  if (uploads.back) {
    await uploadCinFace(clientId, uploads.back, "back");
  }
}

export type CinOcrResult = {
  firstName?: string;
  lastName?: string;
  cinNumber?: string;
  cinValidUntil?: string;
  address?: string;
  rawText?: string;
};

export async function scanClientCinImage(file: File): Promise<CinOcrResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<CinOcrResult>("/clients/ocr/cin", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function downloadArchitectContractPdf(
  clientId: string,
  filename?: string,
  projectId?: string
): Promise<void> {
  const params = projectId ? { projectId } : undefined;
  const { data } = await api.get<ArrayBuffer>(
    `/pdf/clients/${clientId}/architect-contract`,
    { responseType: "arraybuffer", params }
  );
  const blob = new Blob([data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename ?? `contrat-architecte-${clientId.slice(0, 8)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
