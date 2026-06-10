import api from "@/lib/api";

export async function uploadPaymentProof(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ url: string }>("/payments/upload-proof", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}
