import type { Article, Mission, Profile, Settings } from '../types';

export interface LoadResult {
  missions: Mission[];
  articles: Article[];
  settings?: Settings;
  profile?: Profile;
  mode: 'idb' | 'local';
  warning?: string;
}

type StoreName = 'missions' | 'articles' | 'kv';

const DB_NAME = 'station-command-db';
const DB_VERSION = 1;
const LS_KEY = 'station.command.local.v1';

let backend: 'idb' | 'local' | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('missions')) db.createObjectStore('missions', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('articles')) db.createObjectStore('articles', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv', { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local database'));
    request.onblocked = () => reject(new Error('Local database is blocked by another tab'));
  });
  return dbPromise;
}

interface LocalSnapshot {
  missions: Mission[];
  articles: Article[];
  kv: Record<string, unknown>;
}

function readLocal(): LocalSnapshot {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { missions: [], articles: [], kv: {} };
    const parsed = JSON.parse(raw) as Partial<LocalSnapshot>;
    return {
      missions: Array.isArray(parsed.missions) ? parsed.missions : [],
      articles: Array.isArray(parsed.articles) ? parsed.articles : [],
      kv: parsed.kv && typeof parsed.kv === 'object' ? parsed.kv : {},
    };
  } catch {
    return { missions: [], articles: [], kv: {} };
  }
}

function writeLocal(snapshot: LocalSnapshot): void {
  localStorage.setItem(LS_KEY, JSON.stringify(snapshot));
}

async function idbGetAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error ?? new Error('Read failed'));
  });
}

async function idbPut(store: StoreName, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Write failed'));
  });
}

async function idbDelete(store: StoreName, key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Delete failed'));
  });
}

async function idbClear(store: StoreName): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Clear failed'));
  });
}

async function ensureBackend(): Promise<'idb' | 'local'> {
  if (backend) return backend;
  try {
    await openDb();
    backend = 'idb';
  } catch {
    backend = 'local';
  }
  return backend;
}

export async function loadAll(): Promise<LoadResult> {
  const mode = await ensureBackend();
  if (mode === 'local') {
    const snapshot = readLocal();
    return {
      missions: snapshot.missions,
      articles: snapshot.articles,
      settings: snapshot.kv.settings as Settings | undefined,
      profile: snapshot.kv.profile as Profile | undefined,
      mode,
      warning: 'IndexedDB is unavailable. Data is being kept in localStorage and may be cleared by the browser.',
    };
  }
  try {
    const [missions, articles, kv] = await Promise.all([
      idbGetAll<Mission>('missions'),
      idbGetAll<Article>('articles'),
      idbGetAll<{ key: string; value: unknown }>('kv'),
    ]);
    const map = new Map(kv.map((entry) => [entry.key, entry.value]));
    return {
      missions,
      articles,
      settings: map.get('settings') as Settings | undefined,
      profile: map.get('profile') as Profile | undefined,
      mode,
    };
  } catch (error) {
    backend = 'local';
    const snapshot = readLocal();
    return {
      missions: snapshot.missions,
      articles: snapshot.articles,
      settings: snapshot.kv.settings as Settings | undefined,
      profile: snapshot.kv.profile as Profile | undefined,
      mode: 'local',
      warning: `Local database could not be read (${(error as Error).message}). Falling back to localStorage.`,
    };
  }
}

export async function saveMission(mission: Mission): Promise<void> {
  if ((await ensureBackend()) === 'local') {
    const snapshot = readLocal();
    const index = snapshot.missions.findIndex((m) => m.id === mission.id);
    if (index >= 0) snapshot.missions[index] = mission;
    else snapshot.missions.push(mission);
    writeLocal(snapshot);
    return;
  }
  await idbPut('missions', mission);
}

export async function saveArticle(article: Article): Promise<void> {
  if ((await ensureBackend()) === 'local') {
    const snapshot = readLocal();
    const index = snapshot.articles.findIndex((a) => a.id === article.id);
    if (index >= 0) snapshot.articles[index] = article;
    else snapshot.articles.push(article);
    writeLocal(snapshot);
    return;
  }
  await idbPut('articles', article);
}

export async function deleteArticleRecord(id: string): Promise<void> {
  if ((await ensureBackend()) === 'local') {
    const snapshot = readLocal();
    snapshot.articles = snapshot.articles.filter((a) => a.id !== id);
    writeLocal(snapshot);
    return;
  }
  await idbDelete('articles', id);
}

export async function deleteMissionRecord(id: string): Promise<void> {
  if ((await ensureBackend()) === 'local') {
    const snapshot = readLocal();
    snapshot.missions = snapshot.missions.filter((m) => m.id !== id);
    writeLocal(snapshot);
    return;
  }
  await idbDelete('missions', id);
}

export async function saveKv(key: 'settings' | 'profile', value: unknown): Promise<void> {
  if ((await ensureBackend()) === 'local') {
    const snapshot = readLocal();
    snapshot.kv[key] = value;
    writeLocal(snapshot);
    return;
  }
  await idbPut('kv', { key, value });
}

export async function replaceAll(data: {
  missions: Mission[];
  articles: Article[];
  settings: Settings;
  profile: Profile;
}): Promise<void> {
  if ((await ensureBackend()) === 'local') {
    writeLocal({
      missions: data.missions,
      articles: data.articles,
      kv: { settings: data.settings, profile: data.profile },
    });
    return;
  }
  await Promise.all([idbClear('missions'), idbClear('articles'), idbClear('kv')]);
  await Promise.all([
    ...data.missions.map((m) => idbPut('missions', m)),
    ...data.articles.map((a) => idbPut('articles', a)),
    idbPut('kv', { key: 'settings', value: data.settings }),
    idbPut('kv', { key: 'profile', value: data.profile }),
  ]);
}

export async function clearEverything(): Promise<void> {
  if ((await ensureBackend()) === 'local') {
    localStorage.removeItem(LS_KEY);
    return;
  }
  await Promise.all([idbClear('missions'), idbClear('articles'), idbClear('kv')]);
}

export async function estimateStorage(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null;
  const estimate = await navigator.storage.estimate();
  return { usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 };
}

export async function requestPersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
