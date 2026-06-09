import type { Project } from "@/types";

function uniqueLocationParts(parts: (string | null | undefined)[]): string[] {
  const result: string[] = [];
  for (const raw of parts) {
    const part = raw?.trim();
    if (!part) continue;
    const lower = part.toLowerCase();
    const duplicate = result.some(
      (existing) =>
        existing.toLowerCase() === lower ||
        existing.toLowerCase().includes(lower) ||
        lower.includes(existing.toLowerCase())
    );
    if (!duplicate) result.push(part);
  }
  return result;
}

/** Adresse complète pour Google Maps. */
export function getProjectLocationLabel(project: Project): string {
  return uniqueLocationParts([project.address, project.city, project.country]).join(", ");
}

/** Ligne courte affichée sur la carte (évite les doublons ville/adresse). */
export function getProjectCardLocation(project: Project): string {
  const address = project.address?.trim();
  const cityCountry = uniqueLocationParts([project.city, project.country]).join(", ");

  if (address && cityCountry) {
    const addrLower = address.toLowerCase();
    const cityLower = project.city?.trim().toLowerCase();
    if (cityLower && addrLower.includes(cityLower)) return address;
    return `${address} · ${cityCountry}`;
  }

  return address || cityCountry;
}

export function canShowProjectOnMap(project: Project): boolean {
  return Boolean(
    project.address?.trim() || project.city?.trim() || project.country?.trim()
  );
}

/** Lien Google Maps pour localiser le chantier / site. */
export function getProjectMapsUrl(project: Project): string | null {
  if (!canShowProjectOnMap(project)) return null;
  const query = encodeURIComponent(getProjectLocationLabel(project));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
