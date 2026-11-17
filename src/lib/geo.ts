import { WORLD_COUNTRIES, type WorldCountry } from '../data/world';

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 520;
const LAT_TOP = 84;
const LAT_BOTTOM = -64;

export function project(lon: number, lat: number): [number, number] {
  const x = ((lon + 180) / 360) * MAP_WIDTH;
  const clamped = Math.max(LAT_BOTTOM, Math.min(LAT_TOP, lat));
  const y = ((LAT_TOP - clamped) / (LAT_TOP - LAT_BOTTOM)) * MAP_HEIGHT;
  return [x, y];
}

export function unproject(x: number, y: number): [number, number] {
  const lon = (x / MAP_WIDTH) * 360 - 180;
  const lat = LAT_TOP - (y / MAP_HEIGHT) * (LAT_TOP - LAT_BOTTOM);
  return [lon, lat];
}

function ringsToPath(rings: number[][]): string {
  let d = '';
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i += 2) {
      const [x, y] = project(ring[i], ring[i + 1]);
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    d += 'Z';
  }
  return d;
}

export interface CountryShape extends WorldCountry {
  d: string;
}

export const WORLD_SHAPES: CountryShape[] = WORLD_COUNTRIES.filter(
  (country) => country.name !== 'Antarctica',
).map((country) => ({ ...country, d: ringsToPath(country.rings) }));

export interface LocatedPlace {
  name: string;
  lat: number;
  lon: number;
}

interface AliasEntry {
  alias: string;
  normalized: string;
  short: boolean;
  country: LocatedPlace;
}

// Straits, seas and regions that show up in tasking text far more often than the
// bordering state does. Exact aliases only, resolved after longer country aliases.
const REGION_SEEDS: { name: string; lat: number; lon: number; aliases: string[] }[] = [
  { name: 'Crimean Peninsula', lat: 45.3, lon: 34.4, aliases: ['crimea', 'crimean'] },
  { name: 'Kerch Strait', lat: 45.3, lon: 36.5, aliases: ['kerch'] },
  { name: 'Black Sea', lat: 43.2, lon: 34.3, aliases: ['black sea'] },
  { name: 'Sea of Azov', lat: 46.1, lon: 36.0, aliases: ['azov'] },
  { name: 'Bosphorus', lat: 41.1, lon: 29.1, aliases: ['bosphorus', 'bosporus'] },
  { name: 'Suez Canal', lat: 30.4, lon: 32.4, aliases: ['suez'] },
  { name: 'Red Sea', lat: 19.5, lon: 38.5, aliases: ['red sea'] },
  { name: 'Gulf of Aden', lat: 12.5, lon: 47.5, aliases: ['gulf of aden'] },
  { name: 'Bab el-Mandeb', lat: 12.6, lon: 43.4, aliases: ['bab el mandeb', 'bab al mandab'] },
  { name: 'Strait of Hormuz', lat: 26.6, lon: 56.4, aliases: ['hormuz'] },
  { name: 'Persian Gulf', lat: 27.0, lon: 51.5, aliases: ['persian gulf'] },
  { name: 'Taiwan Strait', lat: 24.5, lon: 119.5, aliases: ['taiwan strait'] },
  { name: 'South China Sea', lat: 12.5, lon: 114.0, aliases: ['south china sea'] },
  { name: 'East China Sea', lat: 28.0, lon: 125.0, aliases: ['east china sea'] },
  { name: 'Baltic Sea', lat: 58.0, lon: 20.0, aliases: ['baltic'] },
  { name: 'Mediterranean', lat: 35.0, lon: 18.0, aliases: ['mediterranean'] },
  { name: 'Levant', lat: 33.8, lon: 35.8, aliases: ['levant'] },
  { name: 'Horn of Africa', lat: 8.0, lon: 47.0, aliases: ['horn of africa'] },
  { name: 'Sahel', lat: 15.0, lon: 2.0, aliases: ['sahel'] },
  { name: 'Balkans', lat: 42.5, lon: 21.5, aliases: ['balkans'] },
  { name: 'Panama Canal', lat: 9.1, lon: -79.7, aliases: ['panama canal'] },
  { name: 'Gulf of Mexico', lat: 25.0, lon: -90.0, aliases: ['gulf of mexico'] },
];

const ALIAS_INDEX: AliasEntry[] = [];
for (const region of REGION_SEEDS) {
  for (const alias of region.aliases) {
    ALIAS_INDEX.push({
      alias,
      normalized: alias,
      short: false,
      country: { name: region.name, lat: region.lat, lon: region.lon },
    });
  }
}
for (const country of WORLD_COUNTRIES) {
  const place: LocatedPlace = { name: country.name, lat: country.label[1], lon: country.label[0] };
  const aliases = new Set([country.name, ...country.aliases]);
  for (const alias of aliases) {
    if (!alias) continue;
    const normalized = alias
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (normalized.length < 2) continue;
    ALIAS_INDEX.push({
      alias,
      normalized,
      short: normalized.length <= 2,
      country: place,
    });
  }
}
ALIAS_INDEX.sort((a, b) => b.normalized.length - a.normalized.length);

let cachedHaystack = '';
let cachedMatches: Map<string, LocatedPlace | null> = new Map();

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function locateText(text: string): LocatedPlace | null {
  if (!text.trim()) return null;
  const haystack = normalizeText(text);
  if (haystack !== cachedHaystack) {
    cachedHaystack = haystack;
    cachedMatches = new Map();
    const padded = ` ${haystack} `;
    const upper = text.toUpperCase();
    let found: LocatedPlace | null = null;
    for (const entry of ALIAS_INDEX) {
      if (found) break;
      if (entry.short) {
        if (new RegExp(`\\b${entry.alias}\\b`).test(upper)) found = entry.country;
        continue;
      }
      if (padded.includes(` ${entry.normalized} `)) found = entry.country;
    }
    cachedMatches.set(haystack, found);
    return found;
  }
  return cachedMatches.get(haystack) ?? null;
}
