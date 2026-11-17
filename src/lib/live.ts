import type { Area, LiveAnchor } from '../types';
import { AREAS } from './constants';
import { utcDateParts } from './time';
import { hashString } from './rng';
import { locateText } from './geo';

const CACHE_KEY = 'station.live.anchors.v1';
const CACHE_TTL = 20 * 60 * 1000;

interface CachedScan {
  at: number;
  anchors: LiveAnchor[];
  used: string[];
  online: boolean;
  note?: string;
}

export interface ScanResult {
  anchors: LiveAnchor[];
  used: string[];
  online: boolean;
  note?: string;
  cachedAt?: number;
}

function classify(text: string): Area[] {
  const lower = text.toLowerCase();
  const scores: { area: Area; score: number }[] = [];
  (Object.keys(AREAS) as Area[]).forEach((area) => {
    let score = 0;
    for (const keyword of AREAS[area].keywords) {
      if (lower.includes(keyword)) score += keyword.includes(' ') ? 2 : 1;
    }
    if (score > 0) scores.push({ area, score });
  });
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.area);
}

function readCache(): CachedScan | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedScan;
    if (!Array.isArray(parsed.anchors)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readCachedScan(): ScanResult | null {
  const cached = readCache();
  if (!cached) return null;
  return {
    anchors: cached.anchors,
    used: cached.used,
    online: cached.online,
    note: cached.note,
    cachedAt: cached.at,
  };
}

function writeCache(scan: CachedScan): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(scan));
  } catch {
    // Cache is optional; ignore quota errors.
  }
}

async function fetchJson(url: string, timeoutMs = 7000): Promise<unknown> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as unknown;
  } finally {
    window.clearTimeout(timer);
  }
}

async function wikipediaAnchors(): Promise<LiveAnchor[]> {
  const anchors: LiveAnchor[] = [];
  for (const offset of [0, -1]) {
    const day = utcDateParts(Date.now() + offset * 86400000);
    const page = `Portal:Current_events/${day.y}_${monthName(day.m)}_${day.d}`;
    const url =
      'https://en.wikipedia.org/w/api.php?action=parse&page=' +
      encodeURIComponent(page) +
      '&prop=text&format=json&origin=*&formatversion=2';
    try {
      const data = (await fetchJson(url, 8000)) as { parse?: { text?: string } };
      const html = data.parse?.text;
      if (!html) continue;
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const items = Array.from(doc.querySelectorAll('li')).slice(0, 90);
      const pageTime = Date.UTC(day.y, day.m - 1, day.d, 12, 0, 0);
      for (const item of items) {
        const external = item.querySelector('a.external');
        const href = external?.getAttribute('href') ?? '';
        if (!/^https?:\/\//.test(href)) continue;
        const text = (item.textContent ?? '')
          .replace(/\[\d+\]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (text.length < 50 || text.length > 380) continue;
        const hints = classify(text);
        if (hints.length === 0) continue;
        const place = locateText(text);
        anchors.push({
          id: `wiki-${hashString(href + text)}`,
          text,
          url: href,
          source: 'Wikipedia current events',
          publishedAt: pageTime,
          hints,
          place: place?.name,
          lat: place?.lat,
          lon: place?.lon,
        });
      }
    } catch {
      // Try the previous day or the next source.
    }
    if (anchors.length > 10) break;
  }
  return anchors;
}

function monthName(m: number): string {
  return [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ][m - 1];
}

async function usgsAnchors(): Promise<LiveAnchor[]> {
  const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson';
  const data = (await fetchJson(url, 8000)) as {
    features?: {
      properties?: {
        mag?: number;
        place?: string;
        time?: number;
        url?: string;
        tsunami?: number;
        title?: string;
      };
      geometry?: { coordinates?: unknown };
    }[];
  };
  const anchors: LiveAnchor[] = [];
  for (const feature of data.features ?? []) {
    const p = feature.properties;
    if (!p || typeof p.mag !== 'number' || !p.url) continue;
    const title = p.title ?? `M${p.mag} — ${p.place ?? 'unknown location'}`;
    const hints: Area[] = ['humanitarian', 'imagery'];
    if (p.tsunami) hints.push('logistics');
    const coords = firstLonLat(feature.geometry?.coordinates);
    anchors.push({
      id: `usgs-${hashString(p.url)}`,
      text: `${title}${p.tsunami ? ' — tsunami advisory issued.' : ''}`,
      url: p.url,
      source: 'USGS',
      publishedAt: p.time ?? Date.now(),
      hints,
      place: p.place,
      lat: coords?.[1],
      lon: coords?.[0],
    });
  }
  return anchors.slice(0, 12);
}

function firstLonLat(value: unknown): [number, number] | null {
  if (!Array.isArray(value)) return null;
  if (typeof value[0] === 'number' && typeof value[1] === 'number') return [value[0], value[1]];
  for (const item of value) {
    const found = firstLonLat(item);
    if (found) return found;
  }
  return null;
}

const EONET_HINTS: Record<string, Area[]> = {
  Wildfires: ['imagery', 'aviation', 'humanitarian'],
  Volcanoes: ['aviation', 'imagery'],
  'Severe Storms': ['humanitarian', 'logistics'],
  Floods: ['humanitarian', 'logistics'],
  'Sea and Lake Ice': ['logistics', 'forecasting'],
  Drought: ['humanitarian', 'logistics', 'forecasting'],
  'Dust and Haze': ['aviation', 'humanitarian'],
  'Temperature Extremes': ['humanitarian', 'forecasting'],
  'Manmade': ['humanitarian', 'logistics'],
};

async function eonetAnchors(): Promise<LiveAnchor[]> {
  const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=30&limit=40';
  const data = (await fetchJson(url, 7000)) as {
    events?: {
      id?: string;
      title?: string;
      description?: string | null;
      link?: string;
      categories?: { title?: string }[];
      sources?: { url?: string }[];
      geometry?: { date?: string; coordinates?: unknown }[];
    }[];
  };
  const anchors: LiveAnchor[] = [];
  for (const event of data.events ?? []) {
    const category = event.categories?.[0]?.title ?? '';
    const hints = EONET_HINTS[category] ?? [];
    if (hints.length === 0) continue;
    const link = event.sources?.[0]?.url ?? event.link;
    if (!link) continue;
    const last = event.geometry?.[event.geometry.length - 1];
    const coords = firstLonLat(last?.coordinates);
    anchors.push({
      id: `eonet-${event.id ?? hashString(link)}`,
      text: `${event.title ?? 'Hazard event'}${category ? ` — ${category}` : ''}`,
      url: link,
      source: 'NASA EONET',
      publishedAt: last?.date ? new Date(last.date).getTime() : Date.now(),
      hints,
      place: event.title,
      lat: coords?.[1],
      lon: coords?.[0],
    });
  }
  return anchors;
}

function dedupe(anchors: LiveAnchor[]): LiveAnchor[] {
  const seen = new Set<string>();
  const out: LiveAnchor[] = [];
  for (const anchor of anchors) {
    const key = anchor.url || anchor.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(anchor);
  }
  return out.sort((a, b) => b.publishedAt - a.publishedAt);
}

export async function scanLive(force = false): Promise<ScanResult> {
  const cached = readCache();
  if (!force && cached && Date.now() - cached.at < CACHE_TTL) {
    return {
      anchors: cached.anchors,
      used: cached.used,
      online: cached.online,
      note: cached.note,
      cachedAt: cached.at,
    };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return {
      anchors: cached?.anchors ?? [],
      used: cached?.used ?? [],
      online: false,
      note: 'Offline. Using only previously cached leads and standing collection points.',
      cachedAt: cached?.at,
    };
  }

  const used: string[] = [];
  const tasks: { name: string; run: () => Promise<LiveAnchor[]> }[] = [
    { name: 'Wikipedia current events', run: wikipediaAnchors },
    { name: 'USGS', run: usgsAnchors },
    { name: 'NASA EONET', run: eonetAnchors },
  ];
  const results = await Promise.allSettled(tasks.map((t) => t.run()));
  const anchors: LiveAnchor[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      used.push(tasks[index].name);
      anchors.push(...result.value);
    }
  });

  const merged = dedupe(anchors).slice(0, 80);
  const online = merged.length > 0;
  const note = online
    ? undefined
    : 'Public feeds did not return usable leads. Missions will use standing collection points.';
  const scan: CachedScan = {
    at: Date.now(),
    anchors: merged,
    used,
    online,
    note,
  };
  if (merged.length > 0) writeCache(scan);
  return { anchors: merged, used, online, note, cachedAt: scan.at };
}
