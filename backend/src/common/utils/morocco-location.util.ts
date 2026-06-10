import proj4 from 'proj4';

/** Paramètres Merchich / Lambert officiels (EPSG 26191–26194, compatibles topoX / ANCFCC). */
proj4.defs('WGS84', '+proj=longlat +datum=WGS84 +no_defs +type=crs');
proj4.defs(
  'MERCHICH_NORD',
  '+proj=lcc +lat_1=33.3 +lat_0=33.3 +lon_0=-5.4 +k_0=0.999625769 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs +type=crs',
);
proj4.defs(
  'MERCHICH_CENTRE',
  '+proj=lcc +lat_1=29.7 +lat_0=29.7 +lon_0=-5.4 +k_0=0.999615596 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs +type=crs',
);
proj4.defs(
  'MERCHICH_SUD',
  '+proj=lcc +lat_1=26.1 +lat_0=26.1 +lon_0=-5.4 +k_0=0.999616304 +x_0=1200000 +y_0=400000 +a=6378249.2 +b=6356515 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs +type=crs',
);
proj4.defs(
  'MERCHICH_SAHARA',
  '+proj=lcc +lat_1=22.5 +lat_0=22.5 +lon_0=-5.4 +k_0=0.999616437 +x_0=1500000 +y_0=400000 +a=6378249.2 +b=6356515 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs +type=crs',
);

/** topoX remplace l’ancien portail topomap.ma (domaine indisponible). */
export const TOPOMAP_PORTAL_URL = 'https://topox.ma/';

export interface LocationParts {
  address?: string;
  arrondissement?: string;
  commune?: string;
  prefecture?: string;
  province?: string;
  city?: string;
  country?: string;
}

export interface ResolvedLocation {
  latitude: number;
  longitude: number;
  coordinateX: number;
  coordinateY: number;
  merchichZone: string;
  merchichZoneLabel: string;
  mapsUrl: string;
  topomapUrl: string;
  query: string;
  matchedLabel?: string;
}

interface GeocodeHit {
  latitude: number;
  longitude: number;
  query: string;
  label?: string;
  score: number;
}

function normalizeCountry(country?: string): string {
  const c = country?.trim().toLowerCase();
  if (!c || c === 'maroc' || c === 'morocco' || c === 'ma') return 'Morocco';
  return country!.trim();
}

function normalizeCity(city?: string): string {
  if (!city?.trim()) return '';
  const c = city.trim();
  return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
}

const CITY_GEO_ALIASES: Record<string, string[]> = {
  tanger: ['Tanger', 'Tangier', 'Tanger-Assilah'],
  tangier: ['Tanger', 'Tangier'],
  casablanca: ['Casablanca', 'Casablanca-Settat'],
  rabat: ['Rabat', 'Rabat-Salé-Kénitra', 'Sale'],
  marrakech: ['Marrakech', 'Marrakesh'],
  fes: ['Fès', 'Fes'],
  agadir: ['Agadir'],
};

function citySearchVariants(city?: string): string[] {
  const normalized = normalizeCity(city);
  if (!normalized) return [];
  const key = normalized.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const aliases = CITY_GEO_ALIASES[key] ?? [];
  return [...new Set([normalized, ...aliases])];
}

function addressSearchVariants(address: string): string[] {
  const base = address.trim();
  const variants = new Set<string>([base]);

  if (/spartel/i.test(base)) {
    variants.add('Cap Spartel');
    variants.add('Phare du Cap Spartel');
    variants.add('Cap Spartel, Tanger');
  }

  const withoutCom = base.replace(/\s*\bcom\b\s*/gi, ' ').replace(/\s+/g, ' ').trim();
  if (withoutCom && withoutCom !== base) variants.add(withoutCom);

  return [...variants].filter(Boolean);
}

export function buildLocationQuery(parts: LocationParts): string {
  const city = normalizeCity(parts.city);
  return [
    parts.address?.trim(),
    parts.arrondissement?.trim(),
    parts.commune?.trim(),
    parts.prefecture?.trim(),
    parts.province?.trim(),
    city,
    normalizeCountry(parts.country),
  ]
    .filter(Boolean)
    .join(', ');
}

export function buildMapsSearchUrl(parts: LocationParts): string {
  const query = buildLocationQuery(parts);
  if (!query) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Requêtes du plus précis au plus large (adresse + ville en priorité). */
export function buildGeocodeQueries(parts: LocationParts): string[] {
  const country = normalizeCountry(parts.country);
  const cityVariants = citySearchVariants(parts.city);
  const queries: string[] = [];
  const address = parts.address?.trim();
  const commune = parts.commune?.trim();

  if (address) {
    for (const variant of addressSearchVariants(address)) {
      for (const city of cityVariants.length ? cityVariants : [normalizeCity(parts.city)].filter(Boolean)) {
        queries.push(`${variant}, ${city}, ${country}`);
        queries.push(`${variant}, ${city}`);
      }
      if (commune) queries.push(`${variant}, ${commune}, ${country}`);
      queries.push(`${variant}, ${country}`);
    }
  }

  for (const city of cityVariants) {
    queries.push(`${city}, ${country}`);
  }
  if (commune) queries.push(`${commune}, ${country}`);

  const full = buildLocationQuery(parts);
  if (full) queries.push(full);

  return [...new Set(queries.map((q) => q.trim()).filter(Boolean))];
}

/** Auto-calcul : exiger adresse + ville pour viser le bon point, pas le centre-ville seul. */
export function hasAutoResolvableLocation(parts: LocationParts): boolean {
  return (
    (parts.address?.trim().length ?? 0) >= 3 &&
    (parts.city?.trim().length ?? 0) >= 2
  );
}

export function hasResolvableLocation(parts: LocationParts): boolean {
  return hasAutoResolvableLocation(parts) || Boolean(parts.commune?.trim());
}

export function merchichZoneForLatitude(latitude: number): {
  crs: string;
  code: string;
  label: string;
} {
  if (latitude >= 33.3) {
    return { crs: 'MERCHICH_NORD', code: 'N', label: 'Zone 1 — Nord' };
  }
  if (latitude >= 29.7) {
    return { crs: 'MERCHICH_CENTRE', code: 'S', label: 'Zone 2 — Centre' };
  }
  if (latitude >= 26.1) {
    return { crs: 'MERCHICH_SUD', code: 'SN', label: 'Zone 3 — Sud' };
  }
  return { crs: 'MERCHICH_SAHARA', code: 'SS', label: 'Zone 4 — Sahara' };
}

export function buildTopomapUrl(
  coordinateX: number,
  coordinateY: number,
  _latitude?: number,
): string {
  return TOPOMAP_PORTAL_URL;
}

export function wgs84ToMerchich(
  longitude: number,
  latitude: number,
): {
  coordinateX: number;
  coordinateY: number;
  merchichZone: string;
  merchichZoneLabel: string;
} {
  const zone = merchichZoneForLatitude(latitude);
  const [x, y] = proj4('WGS84', zone.crs, [longitude, latitude]);
  return {
    coordinateX: Math.round(x),
    coordinateY: Math.round(y),
    merchichZone: zone.code,
    merchichZoneLabel: zone.label,
  };
}

function scoreGeocodeHit(
  label: string,
  parts: LocationParts,
  importance = 0,
): number {
  const name = label.toLowerCase();
  let score = importance;

  const address = parts.address?.trim().toLowerCase() ?? '';
  const tokens = address
    .split(/[\s,]+/)
    .map((t) => t.replace(/[^a-zàâäéèêëïîôùûüç0-9]/gi, ''))
    .filter((t) => t.length > 2);

  for (const token of tokens) {
    if (name.includes(token)) score += 3;
  }

  if (/spartel/i.test(address) && name.includes('spartel')) score += 8;
  if (/spartel/i.test(address) && name.includes('phare')) score += 4;

  const city = normalizeCity(parts.city).toLowerCase();
  if (city && name.includes(city)) score += 2;

  return score;
}

const nominatimPause = () => new Promise((r) => setTimeout(r, 350));

async function nominatimSearchMany(
  params: Record<string, string>,
  limit = 5,
): Promise<{ latitude: number; longitude: number; label: string; importance: number }[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  for (const [key, value] of Object.entries(params)) {
    if (value.trim()) url.searchParams.set(key, value.trim());
  }
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('addressdetails', '1');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ArchitectureStudio/1.0 (location-resolve)',
      },
    });
    if (!response.ok) return [];

    const results = (await response.json()) as {
      lat: string;
      lon: string;
      display_name: string;
      importance?: number;
    }[];

    return results.map((hit) => ({
      latitude: Number(hit.lat),
      longitude: Number(hit.lon),
      label: hit.display_name,
      importance: hit.importance ?? 0,
    }));
  } catch {
    return [];
  }
}

async function nominatimStructured(
  parts: LocationParts,
): Promise<{ latitude: number; longitude: number; label: string; importance: number }[]> {
  const address = parts.address?.trim();
  const city = normalizeCity(parts.city);
  if (!address || !city) return [];

  const params: Record<string, string> = {
    street: address,
    city,
    country: normalizeCountry(parts.country),
  };
  if (parts.commune?.trim()) params.county = parts.commune.trim();
  if (parts.prefecture?.trim()) params.state = parts.prefecture.trim();

  return nominatimSearchMany(params, 5);
}

async function geocodePhoton(
  query: string,
  parts: LocationParts,
): Promise<GeocodeHit | null> {
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=fr`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      features?: {
        geometry: { coordinates: [number, number] };
        properties: {
          name?: string;
          street?: string;
          city?: string;
          country?: string;
          state?: string;
        };
      }[];
    };

    let best: GeocodeHit | null = null;
    for (const feature of data.features ?? []) {
      const [longitude, latitude] = feature.geometry.coordinates;
      const label = [
        feature.properties.name ?? feature.properties.street,
        feature.properties.city,
        feature.properties.state,
        feature.properties.country,
      ]
        .filter(Boolean)
        .join(', ');

      const candidate: GeocodeHit = {
        latitude,
        longitude,
        query,
        label,
        score: scoreGeocodeHit(label, parts, 0),
      };
      if (!best || candidate.score > best.score) best = candidate;
    }
    return best;
  } catch {
    return null;
  }
}

async function geocodeWithQueries(
  parts: LocationParts,
): Promise<GeocodeHit | null> {
  const queries = buildGeocodeQueries(parts);
  let best: GeocodeHit | null = null;

  const structuredHits = await nominatimStructured(parts);
  for (const hit of structuredHits) {
    const score = scoreGeocodeHit(hit.label, parts, hit.importance + 1);
    const candidate: GeocodeHit = {
      latitude: hit.latitude,
      longitude: hit.longitude,
      query: buildLocationQuery(parts),
      label: hit.label,
      score,
    };
    if (!best || candidate.score > best.score) best = candidate;
  }
  if (best !== null && best.score >= 4) return best;

  for (const query of queries) {
    const hits = await nominatimSearchMany({ q: query, countrycodes: 'ma' }, 8);
    for (const hit of hits) {
      const score = scoreGeocodeHit(hit.label, parts, hit.importance);
      const candidate: GeocodeHit = {
        latitude: hit.latitude,
        longitude: hit.longitude,
        query,
        label: hit.label,
        score,
      };
      if (!best || candidate.score > best.score) best = candidate;
    }
    if (best !== null && best.score >= 5) break;
    await nominatimPause();
  }

  if (best !== null && best.score >= 2) return best;

  for (const query of queries.slice(0, 6)) {
    const photon = await geocodePhoton(query, parts);
    if (photon) {
      if (!best || photon.score > best.score) best = photon;
      if (photon.score >= 5) return photon;
    }
  }

  return best;
}

export async function geocodeLocationParts(
  parts: LocationParts,
): Promise<GeocodeHit | null> {
  return geocodeWithQueries(parts);
}

export async function resolveMoroccoLocation(
  parts: LocationParts,
): Promise<ResolvedLocation | null> {
  if (!hasResolvableLocation(parts)) return null;

  const hit = await geocodeLocationParts(parts);
  if (!hit) return null;

  const merchich = wgs84ToMerchich(hit.longitude, hit.latitude);

  const mapsSearch = buildMapsSearchUrl(parts);

  return {
    latitude: hit.latitude,
    longitude: hit.longitude,
    coordinateX: merchich.coordinateX,
    coordinateY: merchich.coordinateY,
    merchichZone: merchich.merchichZone,
    merchichZoneLabel: merchich.merchichZoneLabel,
    mapsUrl:
      mapsSearch ||
      `https://www.google.com/maps?q=${hit.latitude},${hit.longitude}`,
    topomapUrl: buildTopomapUrl(
      merchich.coordinateX,
      merchich.coordinateY,
      hit.latitude,
    ),
    query: hit.query,
    matchedLabel: hit.label,
  };
}
