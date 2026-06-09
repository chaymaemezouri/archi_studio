import api from "@/lib/api";
import type { User } from "@/types";

export interface StudioSettings {
  cabinetName?: string;
  cabinetAddress?: string;
  cabinetPhone?: string;
  cabinetEmail?: string;
  cabinetLogo?: string | null;
  cabinetCity?: string | null;
  cabinetIce?: string | null;
  cabinetRc?: string | null;
  cabinetCnss?: string | null;
  cabinetPatente?: string | null;
  cabinetWebsite?: string | null;
  cabinetCountry?: string | null;
  bankName?: string | null;
  bankRib?: string | null;
  paymentTermsDays?: number;
  invoiceFooter?: string | null;
  tvaDefault?: number;
  invoicePrefix?: string;
  devisPrefix?: string;
  cgv?: string | null;
  updatedAt?: string;
}

export interface StudioTeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  createdAt: string;
}

export async function fetchStudioTeam() {
  const { data } = await api.get<StudioTeamMember[]>("/settings/team");
  return data;
}

export async function fetchStudioSettings() {
  const { data } = await api.get<StudioSettings>("/settings");
  return data;
}

export async function updateStudioSettings(payload: StudioSettings) {
  const { data } = await api.patch<StudioSettings>("/settings", payload);
  return data;
}

export async function uploadStudioLogo(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<StudioSettings>("/settings/logo", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateUserProfile(payload: { name?: string }) {
  const { data } = await api.patch<User>("/auth/me", payload);
  return data;
}

export async function uploadUserAvatar(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<User>("/auth/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function changeUserPassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  const { data } = await api.post<{ success: boolean }>(
    "/auth/change-password",
    payload
  );
  return data;
}
