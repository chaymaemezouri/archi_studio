import type { User } from "@/types";
import { getApiOrigin } from "./api-config";

/**
 * URL affichable pour images uploadées ou assets publics.
 * Les fichiers /api/uploads/... passent par le proxy Next (même origine) côté navigateur.
 */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined;
  const raw = url.trim();
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/api/")) {
    if (typeof window !== "undefined") return raw;
    return `${getApiOrigin()}${raw}`;
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
}

/** Chemin public absolu depuis la racine du site (ex. /studios/amini.png). */
export function resolvePublicAssetUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined;

  let path = url.trim();

  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      path = new URL(path).pathname;
    } catch {
      return undefined;
    }
  }

  if (path.startsWith("/api/")) return resolveMediaUrl(path);

  return path.startsWith("/") ? path : `/${path}`;
}

export function normalizeUser(user: User): User {
  const avatar = user.avatar
    ? resolveMediaUrl(user.avatar) ?? resolvePublicAssetUrl(user.avatar)
    : user.avatar;

  if (!user.studio) {
    return avatar ? { ...user, avatar } : user;
  }

  const logoUrl =
    resolveMediaUrl(user.studio.logoUrl) ??
    resolvePublicAssetUrl(user.studio.logoUrl);

  return {
    ...user,
    ...(avatar ? { avatar } : {}),
    studio: {
      ...user.studio,
      ...(logoUrl ? { logoUrl } : {}),
    },
  };
}
