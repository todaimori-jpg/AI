import { FEATURED_TERMS, REFERENCE_ENTRIES, type ReferenceEntry } from '../data/reference';
import { normalizeText } from './text';

export type ReferenceTab = 'all' | 'dictionary' | 'thesaurus' | 'encyclopedia';

export interface OnlineDefinition {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

export interface OnlineLookup {
  term: string;
  definitions: OnlineDefinition[];
  synonyms: string[];
  antonyms: string[];
  encyclopedia?: { title: string; extract: string; url: string; thumbnail?: string };
  fetchedAt: number;
  error?: string;
}

const CACHE_KEY = 'station.reference.online.v1';
const CACHE_TTL = 14 * 86400000;
const CACHE_MAX = 60;

const byTerm = new Map(REFERENCE_ENTRIES.map((entry) => [normalizeText(entry.term), entry]));

export function entryForTerm(term: string): ReferenceEntry | undefined {
  return byTerm.get(normalizeText(term));
}

function scoreEntry(entry: ReferenceEntry, query: string): number {
  const terms = [entry.term, ...(entry.aliases ?? [])].map(normalizeText);
  let score = 0;
  for (const term of terms) {
    if (term === query) score = Math.max(score, 120);
    else if (term.startsWith(query)) score = Math.max(score, 80);
    else if (term.includes(query)) score = Math.max(score, 55);
    else if (term.split(' ').some((word) => word.startsWith(query))) score = Math.max(score, 40);
  }
  if (score === 0) {
    if (entry.synonyms.some((synonym) => normalizeText(synonym).includes(query))) score = 28;
    else if (normalizeText(entry.definition).includes(query)) score = 16;
    else if (normalizeText(entry.encyclopedia).includes(query)) score = 8;
  }
  return score;
}

function allowed(entry: ReferenceEntry, tab: ReferenceTab): boolean {
  if (tab === 'encyclopedia') return entry.focus === 'concept';
  if (tab === 'thesaurus') return entry.synonyms.length > 0;
  return true;
}

export function searchReference(query: string, tab: ReferenceTab = 'all'): ReferenceEntry[] {
  const cleaned = normalizeText(query);
  const pool = REFERENCE_ENTRIES.filter((entry) => allowed(entry, tab));
  if (!cleaned) {
    const featured = FEATURED_TERMS.map((term) => entryForTerm(term)).filter(
      (entry): entry is ReferenceEntry => Boolean(entry) && Boolean(entry && allowed(entry, tab)),
    );
    const remainder = pool
      .filter((entry) => !featured.includes(entry))
      .sort((a, b) => a.term.localeCompare(b.term));
    return [...featured, ...remainder];
  }
  return pool
    .map((entry) => ({ entry, score: scoreEntry(entry, cleaned) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.term.localeCompare(b.entry.term))
    .map((item) => item.entry);
}

export function countsForTab(tab: ReferenceTab): number {
  return REFERENCE_ENTRIES.filter((entry) => allowed(entry, tab)).length;
}

interface CacheEntry {
  value: OnlineLookup;
  at: number;
}

function readCache(): Record<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CacheEntry>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, CacheEntry>): void {
  try {
    const cutoff = Date.now() - CACHE_TTL * 2;
    const entries = Object.entries(cache)
      .filter(([, entry]) => entry.at > cutoff)
      .sort((a, b) => b[1].at - a[1].at)
      .slice(0, CACHE_MAX);
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // The cache is optional.
  }
}

export function cachedLookup(term: string): OnlineLookup | null {
  const cache = readCache();
  const hit = cache[normalizeText(term)];
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL) return null;
  return hit.value;
}

async function getJson(url: string, timeoutMs = 8000): Promise<unknown> {
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

interface DictionaryPayload {
  meanings?: { partOfSpeech?: string; definitions?: { definition?: string; example?: string }[] }[];
}

interface DatamuseWord {
  word?: string;
}

interface WikiSummary {
  title?: string;
  extract?: string;
  content_urls?: { desktop?: { page?: string } };
  thumbnail?: { source?: string };
}

export async function lookupOnline(term: string): Promise<OnlineLookup> {
  const clean = term.trim();
  if (!clean) throw new Error('Enter a word or phrase first.');
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('You are offline. The built-in desk reference is still available.');
  }
  const cached = cachedLookup(clean);
  if (cached) return cached;

  const encoded = encodeURIComponent(clean);
  const wikiTitle = encodeURIComponent(clean.replace(/\s+/g, '_'));
  const [dictionary, synonyms, antonyms, wiki] = await Promise.allSettled([
    getJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encoded}`),
    getJson(`https://api.datamuse.com/words?rel_syn=${encoded}&max=14`),
    getJson(`https://api.datamuse.com/words?rel_ant=${encoded}&max=10`),
    getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}?redirect=true`),
  ]);

  const result: OnlineLookup = {
    term: clean,
    definitions: [],
    synonyms: [],
    antonyms: [],
    fetchedAt: Date.now(),
  };
  const failures: string[] = [];

  if (dictionary.status === 'fulfilled' && Array.isArray(dictionary.value)) {
    const entries = dictionary.value as DictionaryPayload[];
    for (const entry of entries) {
      for (const meaning of entry.meanings ?? []) {
        for (const definition of meaning.definitions ?? []) {
          if (definition.definition) {
            result.definitions.push({
              partOfSpeech: meaning.partOfSpeech ?? '',
              definition: definition.definition,
              example: definition.example,
            });
          }
        }
      }
    }
    result.definitions = result.definitions.slice(0, 8);
  } else {
    failures.push('dictionary');
  }

  if (synonyms.status === 'fulfilled' && Array.isArray(synonyms.value)) {
    result.synonyms = (synonyms.value as DatamuseWord[])
      .map((item) => item.word ?? '')
      .filter(Boolean)
      .slice(0, 14);
  } else {
    failures.push('thesaurus');
  }

  if (antonyms.status === 'fulfilled' && Array.isArray(antonyms.value)) {
    result.antonyms = (antonyms.value as DatamuseWord[])
      .map((item) => item.word ?? '')
      .filter(Boolean)
      .slice(0, 10);
  }

  if (wiki.status === 'fulfilled') {
    const summary = wiki.value as WikiSummary;
    if (summary.extract && summary.extract.trim().length > 40) {
      result.encyclopedia = {
        title: summary.title ?? clean,
        extract: summary.extract,
        url: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${wikiTitle}`,
        thumbnail: summary.thumbnail?.source,
      };
    } else {
      failures.push('encyclopedia');
    }
  } else {
    failures.push('encyclopedia');
  }

  if (result.definitions.length === 0 && result.synonyms.length === 0 && !result.encyclopedia) {
    result.error = `No online entry was found${failures.length ? ` (${failures.join(', ')} unavailable)` : ''}.`;
  } else if (failures.length > 0) {
    result.error = `Partial result: ${failures.join(', ')} unavailable.`;
  }

  const cache = readCache();
  cache[normalizeText(clean)] = { value: result, at: Date.now() };
  writeCache(cache);
  return result;
}

const RECENT_KEY = 'station.reference.recent.v1';

export function readRecentTerms(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function rememberTerm(term: string): void {
  const clean = term.trim();
  if (!clean) return;
  try {
    const recent = [clean, ...readRecentTerms().filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    // Recents are optional.
  }
}

export interface ReferenceNote {
  term: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

const NOTES_KEY = 'station.reference.notes.v1';

export function readReferenceNotes(): ReferenceNote[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is ReferenceNote =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof (item as ReferenceNote).term === 'string' &&
          typeof (item as ReferenceNote).body === 'string',
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function writeReferenceNotes(notes: ReferenceNote[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    // The notes library is optional.
  }
}

export function referenceNoteFor(term: string): ReferenceNote | undefined {
  const key = normalizeText(term);
  return readReferenceNotes().find((note) => normalizeText(note.term) === key);
}

export function saveReferenceNote(term: string, body: string): ReferenceNote | null {
  const clean = term.trim();
  const text = body.trim();
  if (!clean) return null;
  const notes = readReferenceNotes();
  const key = normalizeText(clean);
  const existing = notes.find((note) => normalizeText(note.term) === key);
  if (!text) {
    writeReferenceNotes(notes.filter((note) => normalizeText(note.term) !== key));
    return null;
  }
  const now = Date.now();
  const next: ReferenceNote = existing
    ? { ...existing, body: text, updatedAt: now }
    : { term: clean, body: text, createdAt: now, updatedAt: now };
  writeReferenceNotes([next, ...notes.filter((note) => normalizeText(note.term) !== key)].slice(0, 120));
  return next;
}

export function deleteReferenceNote(term: string): void {
  const key = normalizeText(term);
  writeReferenceNotes(readReferenceNotes().filter((note) => normalizeText(note.term) !== key));
}

export function clearReferenceData(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(RECENT_KEY);
    localStorage.removeItem(NOTES_KEY);
  } catch {
    // Reference storage is optional.
  }
}

