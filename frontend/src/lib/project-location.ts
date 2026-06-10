import api from "@/lib/api";

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

/** Lien Google Maps à partir des coordonnées GPS ou de l'adresse saisie. */
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

export async function resolveProjectLocation(
  parts: ProjectLocationInput
): Promise<ResolvedProjectLocation | null> {
  try {
    const params = Object.fromEntries(
      Object.entries(parts).filter(
        ([, value]) => value != null && String(value).trim() !== ""
      )
    );
    const { data } = await api.get<ResolvedProjectLocation>(
      "/projects/location/resolve",
      { params }
    );
    return data;
  } catch (error) {
    console.warn("resolveProjectLocation failed", error);
    return null;
  }
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
