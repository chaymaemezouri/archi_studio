import api from "@/lib/api";
import type { AxiosError } from "axios";
import { buildOsmMapsUrl } from "@/lib/openstreetmap";

export interface ProjectLocationInput {
  address?: string | null;
  arrondissement?: string | null;
  commune?: string | null;
  prefecture?: string | null;
  province?: string | null;
  city?: string | null;
  country?: string | null;
  coordinateX?: number | null;
  coordinateY?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  useTopoCoordinates?: boolean | null;
  mapsUrl?: string | null;
}

export function buildProjectLocationQuery(input: ProjectLocationInput): string {
  return [
    input.address,
    input.arrondissement,
    input.commune,
    input.prefecture,
    input.province,
    input.city,
    input.country ?? "Maroc",
  ]
    .filter((part) => part?.trim())
    .join(", ");
}

/** Lien OpenStreetMap à partir des coordonnées GPS. */
export function buildOpenStreetMapUrl(input: ProjectLocationInput): string {
  const lat = input.latitude;
  const lng = input.longitude;
  if (lat != null && lng != null) {
    return buildOsmMapsUrl(lat, lng);
  }
  return "";
}

/** Lien Google Maps (secours si pas de coordonnées GPS). */
export function buildGoogleMapsUrl(input: ProjectLocationInput): string {
  const lat = input.latitude;
  const lng = input.longitude;
  if (lat != null && lng != null) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  const query = buildProjectLocationQuery(input);
  if (query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  return "";
}

export function buildProjectMapsUrl(input: ProjectLocationInput): string {
  if (input.mapsUrl?.trim()) return input.mapsUrl.trim();
  const osm = buildOpenStreetMapUrl(input);
  if (osm) return osm;
  return buildGoogleMapsUrl(input);
}

export function parseCoordinate(raw: string): number | undefined {
  const n = Number(raw.replace(/\s/g, "").replace(",", "."));
  if (!raw.trim() || Number.isNaN(n)) return undefined;
  return n;
}

export async function geocodeProjectLocation(
  query: string
): Promise<{ latitude: number; longitude: number } | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ma&q=${encodeURIComponent(trimmed)}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;
  const results = (await response.json()) as { lat: string; lon: string }[];
  const hit = results[0];
  if (!hit) return null;
  return { latitude: Number(hit.lat), longitude: Number(hit.lon) };
}

export interface ResolvedProjectLocation {
  latitude: number;
  longitude: number;
  coordinateX: number;
  coordinateY: number;
  merchichZone?: string;
  merchichZoneLabel?: string;
  mapsUrl: string;
  topomapUrl: string;
  query: string;
  matchedLabel?: string;
}

/** Champs acceptés par GET /projects/location/resolve (évite erreur 400). */
export function buildLocationResolveParams(
  parts: ProjectLocationInput
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  const stringFields = [
    "address",
    "arrondissement",
    "commune",
    "prefecture",
    "province",
    "city",
    "country",
  ] as const;

  for (const key of stringFields) {
    const value = parts[key];
    if (typeof value === "string" && value.trim()) {
      params[key] = value.trim();
    }
  }

  if (parts.latitude != null && Number.isFinite(parts.latitude)) {
    params.latitude = parts.latitude;
  }
  if (parts.longitude != null && Number.isFinite(parts.longitude)) {
    params.longitude = parts.longitude;
  }

  return params;
}

export const TOPOMAP_PORTAL_URL = "https://topox.ma/";

export function getMerchichZoneLabelFromLatitude(latitude: number): string {
  if (latitude >= 33.3) return "Zone 1 — Nord";
  if (latitude >= 29.7) return "Zone 2 — Centre";
  if (latitude >= 26.1) return "Zone 3 — Sud";
  return "Zone 4 — Sahara";
}

/** Ordres de grandeur typiques des coordonnées Merchich au Maroc. */
export function isMerchichPlausible(coordinateX: number, coordinateY: number): boolean {
  return (
    coordinateX >= 80_000 &&
    coordinateX <= 1_600_000 &&
    coordinateY >= 80_000 &&
    coordinateY <= 900_000
  );
}

const AMBIGUOUS_ADDRESS_RE =
  /\b(m[eé]dina|centre|ville|quartier|ancien|nouveau|hay|quart)\b/i;

export function isAmbiguousAddress(address?: string | null): boolean {
  return AMBIGUOUS_ADDRESS_RE.test(address?.trim() ?? "");
}

/** Prêt pour le géocodage auto (ville + ancrage territorial). */
export function canAutoResolveLocation(parts: ProjectLocationInput): {
  ok: boolean;
  missing?: string;
} {
  const city = parts.city?.trim() ?? "";
  const address = parts.address?.trim() ?? "";
  const prefecture = parts.prefecture?.trim() ?? "";
  const commune = parts.commune?.trim() ?? "";

  if (city.length < 2) {
    return { ok: false, missing: "renseignez la ville" };
  }

  if (address.length >= 3) {
    if (isAmbiguousAddress(address) && !prefecture && !commune) {
      return {
        ok: false,
        missing: "précisez la préfecture ou la commune (adresse générique)",
      };
    }
    return { ok: true };
  }

  if (commune.length >= 2 && prefecture.length >= 2) {
    return { ok: true };
  }

  return { ok: false, missing: "renseignez l'adresse (3 caractères min.)" };
}

export function getMerchichVerificationHint(
  coordinateX?: number | null,
  coordinateY?: number | null,
  merchichZoneLabel?: string | null
): string {
  if (coordinateX == null || coordinateY == null) {
    return "Placez un point sur la carte ou utilisez « Localiser (OSM) » pour obtenir X/Y.";
  }
  const plausible = isMerchichPlausible(coordinateX, coordinateY);
  const zone = merchichZoneLabel ? ` (${merchichZoneLabel})` : "";
  if (!plausible) {
    return `Coordonnées hors plage habituelle au Maroc${zone}. Vérifiez le point sur la carte ou saisissez les valeurs cadastrales.`;
  }
  return `Plage Merchich cohérente${zone}. Vérifiez sur topoX.ma que le point correspond à votre parcelle.`;
}

export async function resolveProjectLocation(
  parts: ProjectLocationInput
): Promise<ResolvedProjectLocation | null> {
  try {
    const params = buildLocationResolveParams(parts);
    if (
      params.latitude == null &&
      params.longitude == null &&
      !params.address &&
      !params.city
    ) {
      return null;
    }
    const { data } = await api.get<ResolvedProjectLocation>(
      "/projects/location/resolve",
      { params }
    );
    return data;
  } catch (error) {
    console.warn("resolveProjectLocation failed", error);
    throw error;
  }
}

export function getResolveLocationErrorMessage(error: unknown): string {
  const axiosErr = error as AxiosError<{ message?: string | string[] }>;
  const msg = axiosErr.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string" && msg.trim()) return msg;
  return "Calcul des coordonnées indisponible. Vérifiez que le backend est démarré.";
}

export function getProjectLocationLabel(project: ProjectLocationInput): string {
  return buildProjectLocationQuery(project);
}

/** Libellé court pour cartes projet (commune / ville en priorité). */
export function getProjectCardLocation(project: ProjectLocationInput): string {
  return (
    project.commune?.trim() ||
    project.city?.trim() ||
    project.prefecture?.trim() ||
    project.province?.trim() ||
    project.address?.trim() ||
    ""
  );
}

export function getProjectMapsUrl(project: ProjectLocationInput): string | null {
  const url = buildProjectMapsUrl(project);
  return url || null;
}

export function canShowProjectOnMap(project: ProjectLocationInput): boolean {
  return Boolean(getProjectMapsUrl(project));
}
