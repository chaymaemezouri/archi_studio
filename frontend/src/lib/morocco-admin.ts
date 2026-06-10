import curatedData from "@/data/morocco-regions-curated.json";

export interface MoroccoProvinceEntry {
  nom: string;
  communes: string[];
  villes: string[];
}

export interface MoroccoRegionEntry {
  region: string;
  provinces: MoroccoProvinceEntry[];
}

export interface ResolvedCommuneLocation {
  regionName: string;
  prefectureName: string;
  communeName: string;
  cityName?: string;
}

const regionsData = curatedData as MoroccoRegionEntry[];

const regionsSorted = [...regionsData].sort((a, b) =>
  a.region.localeCompare(b.region, "fr"),
);

const regionByName = new Map(
  regionsData.map((entry) => [normalizeName(entry.region), entry]),
);

const provinceIndex = new Map<
  string,
  { region: MoroccoRegionEntry; province: MoroccoProvinceEntry }
>();

for (const regionEntry of regionsData) {
  for (const province of regionEntry.provinces) {
    provinceIndex.set(normalizeName(province.nom), {
      region: regionEntry,
      province,
    });
  }
}

const communeIndex = new Map<
  string,
  { region: MoroccoRegionEntry; province: MoroccoProvinceEntry; commune: string }[]
>();

const villeIndex = new Map<
  string,
  { region: MoroccoRegionEntry; province: MoroccoProvinceEntry; ville: string }[]
>();

for (const regionEntry of regionsData) {
  for (const province of regionEntry.provinces) {
    for (const commune of province.communes) {
      const key = normalizeName(commune);
      const list = communeIndex.get(key) ?? [];
      list.push({ region: regionEntry, province, commune });
      communeIndex.set(key, list);
    }
    for (const ville of province.villes) {
      const key = normalizeName(ville);
      const list = villeIndex.get(key) ?? [];
      list.push({ region: regionEntry, province, ville });
      villeIndex.set(key, list);
    }
  }
}

/** Arrondissements urbains (préfectures concernées uniquement). */
export const ARRONDISSEMENTS_BY_PREFECTURE: Record<string, string[]> = {
  Casablanca: [
    "Anfa",
    "Ain Chock",
    "Ain Sebaâ",
    "Al Fida",
    "Ben M'Sick",
    "Hay Hassani",
    "Mers Sultan",
    "Mohammadi",
    "Sbata",
  ],
  Rabat: [
    "Agdal-Ryad",
    "El Youssoufia",
    "Hassan",
    "Souissi",
    "Touarga",
    "Yacoub El Mansour",
  ],
  Salé: ["Bettana", "Hssaine", "Layayda", "Tabriquet"],
  Fès: [
    "Agdal",
    "El Mariniyine",
    "Fès El Bali",
    "Fès El Jdid",
    "Jnan El Ouard",
    "Saiss",
    "Zouagha",
  ],
  Marrakech: [
    "Gueliz",
    "Marrakech-Médina",
    "Ménara",
    "Sidi Youssef Ben Ali",
  ],
  Tanger: ["Boukhalef", "Charf", "Mghogha", "Médina", "Souani"],
  Tétouan: ["Bab Tout", "Bni Idder", "M'diq", "Martil", "Médina", "Saada"],
  Meknès: [
    "Al Ismailia",
    "El Bassatine",
    "El Menzeh",
    "Médina",
    "Ouislane",
    "Toulal",
  ],
};

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function pickMatch<T>(
  matches: T[],
  hints?: { prefecture?: string; region?: string },
  getPrefecture?: (item: T) => string,
  getRegion?: (item: T) => string,
): T | undefined {
  if (!matches.length) return undefined;
  if (matches.length === 1) return matches[0];

  if (hints?.prefecture) {
    const normalizedPrefecture = normalizeName(hints.prefecture);
    const byPrefecture = matches.find(
      (item) => normalizeName(getPrefecture?.(item) ?? "") === normalizedPrefecture,
    );
    if (byPrefecture) return byPrefecture;
  }

  if (hints?.region) {
    const normalizedRegion = normalizeName(hints.region);
    const byRegion = matches.find(
      (item) => normalizeName(getRegion?.(item) ?? "") === normalizedRegion,
    );
    if (byRegion) return byRegion;
  }

  return matches[0];
}

export function getMoroccoRegions(): MoroccoRegionEntry[] {
  return regionsSorted;
}

export function getMoroccoRegionNames(): string[] {
  return regionsSorted.map((entry) => entry.region);
}

export function findRegionByName(name: string): MoroccoRegionEntry | undefined {
  if (!name.trim()) return undefined;
  return regionByName.get(normalizeName(name));
}

export function getProvincesForRegion(regionName: string): MoroccoProvinceEntry[] {
  const region = findRegionByName(regionName);
  if (!region) return [];
  return [...region.provinces].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

export function getProvinceNamesForRegion(regionName: string): string[] {
  return getProvincesForRegion(regionName).map((province) => province.nom);
}

export function findProvinceByName(
  regionName: string,
  provinceName: string,
): MoroccoProvinceEntry | undefined {
  const region = findRegionByName(regionName);
  if (!region || !provinceName.trim()) return undefined;
  const key = normalizeName(provinceName);
  return region.provinces.find((province) => normalizeName(province.nom) === key);
}

export function getCommunesForPrefecture(
  regionName: string,
  prefectureName: string,
): string[] {
  const province = findProvinceByName(regionName, prefectureName);
  return province?.communes ?? [];
}

export function getVillesForPrefecture(
  regionName: string,
  prefectureName: string,
): string[] {
  const province = findProvinceByName(regionName, prefectureName);
  return province?.villes ?? [];
}

export function getAllVilles(): string[] {
  const names = new Set<string>();
  for (const regionEntry of regionsData) {
    for (const province of regionEntry.provinces) {
      for (const ville of province.villes) {
        names.add(ville);
      }
    }
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b, "fr"));
}

export function getMoroccoCommuneCount(): number {
  const names = new Set<string>();
  for (const regionEntry of regionsData) {
    for (const province of regionEntry.provinces) {
      for (const commune of province.communes) {
        names.add(commune);
      }
    }
  }
  return names.size;
}

export function getArrondissementsForPrefecture(prefectureName: string): string[] {
  const indexed = provinceIndex.get(normalizeName(prefectureName));
  if (!indexed) return [];

  const exact = ARRONDISSEMENTS_BY_PREFECTURE[indexed.province.nom];
  if (exact) return exact;

  const normalized = normalizeName(indexed.province.nom);
  for (const [key, values] of Object.entries(ARRONDISSEMENTS_BY_PREFECTURE)) {
    if (normalizeName(key) === normalized) return values;
  }
  return [];
}

export function hasArrondissements(prefectureName: string): boolean {
  return getArrondissementsForPrefecture(prefectureName).length > 0;
}

export function resolveCommuneByName(
  name: string,
  hints?: { prefecture?: string; region?: string },
): ResolvedCommuneLocation | null {
  const matches = communeIndex.get(normalizeName(name));
  if (!matches?.length) return null;

  const match = pickMatch(
    matches,
    hints,
    (item) => item.province.nom,
    (item) => item.region.region,
  );
  if (!match) return null;

  const cityName =
    match.province.villes.find(
      (ville) => normalizeName(ville) === normalizeName(match.commune),
    ) ?? match.province.villes[0];

  return {
    regionName: match.region.region,
    prefectureName: match.province.nom,
    communeName: match.commune,
    cityName,
  };
}

export function resolveVilleByName(
  name: string,
  hints?: { prefecture?: string; region?: string },
): ResolvedCommuneLocation | null {
  const matches = villeIndex.get(normalizeName(name));
  if (!matches?.length) return null;

  const match = pickMatch(
    matches,
    hints,
    (item) => item.province.nom,
    (item) => item.region.region,
  );
  if (!match) return null;

  const communeName =
    match.province.communes.find(
      (commune) => normalizeName(commune) === normalizeName(match.ville),
    ) ?? match.ville;

  return {
    regionName: match.region.region,
    prefectureName: match.province.nom,
    communeName,
    cityName: match.ville,
  };
}
