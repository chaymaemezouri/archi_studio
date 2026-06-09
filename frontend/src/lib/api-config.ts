/** Base URL de l'API (avec suffixe /api). */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
}

/** Origine du backend sans /api (ex. http://localhost:3002). */
export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/?$/, "");
}
