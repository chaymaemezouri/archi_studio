import api from "./api";
import type { AuthResponse, LoginCredentials, RegisterCredentials } from "@/types";

const TOKEN_KEY = "token";

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = "token=; path=/; max-age=0";
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getToken(data: AuthResponse): string {
  const token = data.access_token ?? data.accessToken;
  if (!token) {
    throw new Error("Token manquant dans la réponse API");
  }
  return token;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", credentials);
  setAuthToken(getToken(data));
  return data;
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", credentials);
  setAuthToken(getToken(data));
  return data;
}

export async function getProfile() {
  const { data } = await api.get("/auth/me");
  return data;
}
