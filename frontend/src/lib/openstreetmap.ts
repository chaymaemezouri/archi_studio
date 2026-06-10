/** Tuiles et liens OpenStreetMap */

export const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const OSM_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** Centre approximatif du Maroc (affichage par défaut). */
export const MOROCCO_MAP_CENTER: [number, number] = [31.7917, -7.0926];

export function buildOsmMapsUrl(
  latitude: number,
  longitude: number,
  zoom = 17
): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`;
}

export function buildOsmEmbedUrl(latitude: number, longitude: number): string {
  const delta = 0.012;
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}
