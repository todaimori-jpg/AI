import type {
  AiSettings,
  Area,
  Article,
  Difficulty,
  EvidenceSource,
  Highlight,
  Mission,
  MissionUpdate,
  Profile,
  Report,
  ScanInfo,
  Settings,
  Toast,
} from '../types';
import { DEFAULT_PROFILE, DEFAULT_SETTINGS, mergeProfile, mergeSettings } from './defaults';
import { archetypeById } from '../data/archetypes';
import {
  clearEverything,
  deleteArticleRecord,
  deleteMissionRecord,
  loadAll,
  replaceAll,
  saveArticle,
  saveKv,
  saveMission,
} from '../lib/db';
import { DEADLINE_HOURS, DIMENSIONS } from '../lib/constants';
import { evaluateMission } from '../lib/evaluator';
import { generateTasking } from '../lib/generator';
import { scanLive, readCachedScan, type ScanResult } from '../lib/live';
import { aiReview, buildIntro, supervisorTurn } from '../lib/supervisor';
import { testAiConnection } from '../lib/ai';
import { nextSourceLabel, uid } from '../lib/ids';
import { dayKey, fmtHours } from '../lib/time';
import { hashString } from '../lib/rng';
import { clearReferenceData } from '../lib/reference';

export interface AppState {
  ready: boolean;
  fatal?: string;
  storageMode: 'idb' | 'local';
  warning?: string;
  missions: Mission[];
  articles: Article[];
  settings: Settings;
  profile: Profile;
  toasts: Toast[];
  scan: ScanInfo | null;
  scanning: boolean;
  scanningDetail: string;
  busy: Record<string, boolean>;
}

interface GenerateOptions {
  area?: Area;
  forceScan?: boolean;
  count?: number;
  announce?: boolean;
}

type Listener = () => void;

export function createAppStore() {
  let state: AppState = {
    ready: false,
    storageMode: 'idb',
    missions: [],
    articles: [],
    settings: DEFAULT_SETTINGS,
    profile: DEFAULT_PROFILE,
    toasts: [],
    scan: null,
    scanning: false,
    scanningDetail: '',
    busy: {},
  };

  const listeners = new Set<Listener>();
  const missionTimers = new Map<string, number>();
  let settingsTimer: number | null = null;
  let profileTimer: number | null = null;
  let initialized = false;

  const get = (): AppState => state;
  const notify = () => listeners.forEach((listener) => listener());
  const set = (patch: Partial<AppState> | ((current: AppState) => Partial<AppState>)) => {
    state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
    notify();
  };

  const subscribe = (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const scheduleMissionSave = (id: string, delay = 500) => {
    const existing = missionTimers.get(id);
    if (existing) window.clearTimeout(existing);
    missionTimers.set(
      id,
      window.setTimeout(() => {
        missionTimers.delete(id);
        const mission = get().missions.find((m) => m.id === id);
        if (mission) void saveMission(mission);
      }, delay),
    );
  };

  const scheduleSettingsSave = () => {
    if (settingsTimer) window.clearTimeout(settingsTimer);
    settingsTimer = window.setTimeout(() => {
      settingsTimer = null;
      void saveKv('settings', get().settings);
    }, 300);
  };

  const scheduleProfileSave = () => {
    if (profileTimer) window.clearTimeout(profileTimer);
    profileTimer = window.setTimeout(() => {
      profileTimer = null;
      void saveKv('profile', get().profile);
    }, 300);
  };

  const flush = () => {
    missionTimers.forEach((timer, id) => {
      window.clearTimeout(timer);
      const mission = get().missions.find((m) => m.id === id);
      if (mission) void saveMission(mission);
    });
    missionTimers.clear();
    if (settingsTimer) {
      window.clearTimeout(settingsTimer);
      settingsTimer = null;
      void saveKv('settings', get().settings);
    }
    if (profileTimer) {
      window.clearTimeout(profileTimer);
      profileTimer = null;
      void saveKv('profile', get().profile);
    }
  };

  const toast = (text: string, tone: Toast['tone'] = 'info') => {
    const entry: Toast = { id: uid('t'), text, tone };
    set((current) => ({ toasts: [...current.toasts, entry].slice(-4) }));
    window.setTimeout(() => {
      set((current) => ({ toasts: current.toasts.filter((t) => t.id !== entry.id) }));
    }, tone === 'bad' ? 7500 : 5000);
  };

  const setBusy = (key: string, value: boolean) => {
    set((current) => {
      const busy = { ...current.busy };
      if (value) busy[key] = true;
      else delete busy[key];
      return { busy };
    });
  };

  const replaceMission = (next: Mission, persist = true) => {
    set((current) => ({
      missions: current.missions.map((m) => (m.id === next.id ? next : m)),
    }));
    if (persist) scheduleMissionSave(next.id);
  };

  const supervisorMessage = (
    mission: Mission,
    text: string,
    kind: 'intro' | 'chat' | 'review' | 'inject' | 'system',
    mode?: 'offline' | 'ai',
  ): Mission => ({
    ...mission,
    messages: [
      ...mission.messages,
      { id: uid('msg'), role: 'supervisor', text, at: Date.now(), kind, mode },
    ],
  });

  const collectAnchors = async (force: boolean): Promise<ScanResult> => {
    const settings = get().settings;
    if (!settings.liveIntel) {
      return {
        anchors: [],
        used: [],
        online: false,
        note: 'Live collection is switched off. Taskings use standing collection points.',
      };
    }
    const result = await scanLive(force);
    set({
      scan: {
        at: result.cachedAt ?? Date.now(),
        online: result.online,
        used: result.used,
        anchors: result.anchors.length,
        note: result.note,
      },
    });
    return result;
  };

  const generateMission = async (options: GenerateOptions = {}): Promise<Mission | null> => {
    if (get().scanning) return null;
    const count = Math.max(1, options.count ?? 1);
    const announce = options.announce ?? true;
    set({ scanning: true, scanningDetail: get().settings.liveIntel ? 'Scanning public feeds' : 'Building from standing collection points' });

    let created: Mission | null = null;
    try {
      const scan = await collectAnchors(options.forceScan ?? false);
      set({ scanningDetail: 'Drafting tasking' });
      const anchors = scan.anchors;

      for (let index = 0; index < count; index += 1) {
        const current = get();
        const seen = new Set(current.profile.seenKeys);
        let generated: ReturnType<typeof generateTasking> | null = null;
        for (let attempt = 0; attempt < 8; attempt += 1) {
          const candidate = generateTasking({
            existing: current.missions,
            profile: current.profile,
            settings: current.settings,
            anchors,
            forceArea: options.area,
          });
          generated = candidate;
          if (!seen.has(candidate.dedupeKey)) break;
        }
        if (!generated) break;
        const mission = generated.mission;
        created = mission;
        const seenKeys = [generated.dedupeKey, ...current.profile.seenKeys].slice(0, 320);
        const profile: Profile = {
          ...current.profile,
          generated: current.profile.generated + 1,
          lastGeneratedAt: Date.now(),
          seenKeys,
        };
        set({
          missions: [mission, ...current.missions],
          profile,
        });
        void saveMission(mission);
        scheduleProfileSave();
      }

      if (scan.note && scan.anchors.length === 0) toast(scan.note, 'warn');
      if (created && announce) {
        toast(`${created.code} — new tasking available.`, 'good');
      }
      return created;
    } catch (error) {
      toast(`Tasking generation failed: ${(error as Error).message}`, 'bad');
      return created;
    } finally {
      set({ scanning: false, scanningDetail: '' });
    }
  };

  const ensureFeed = async () => {
    const current = get();
    const offers = current.missions.filter((m) => m.status === 'offered').length;
    const firstRun = current.profile.generated === 0;
    if (firstRun) {
      await generateMission({ count: 3, announce: false });
      return;
    }
    if (offers < 5) {
      await generateMission({ count: 1, announce: false });
    }
  };

  const init = async () => {
    if (initialized) return;
    initialized = true;
    try {
      const loaded = await loadAll();
      const missions = [...loaded.missions].sort((a, b) => b.createdAt - a.createdAt);
      set({
        ready: true,
        storageMode: loaded.mode,
        warning: loaded.warning,
        missions,
        articles: [...loaded.articles].sort((a, b) => b.savedAt - a.savedAt),
        settings: mergeSettings(loaded.settings),
        profile: mergeProfile(loaded.profile),
      });
      if (get().settings.liveIntel && navigator.onLine === false) {
        toast('Offline. Saved articles and unfinished missions remain available.', 'warn');
      }
      void ensureFeed();
    } catch (error) {
      set({ ready: true, fatal: (error as Error).message });
    }
  };

  const acceptMission = (id: string) => {
    const mission = get().missions.find((m) => m.id === id);
    if (!mission || mission.status !== 'offered') return;
    const now = Date.now();
    let next: Mission = {
      ...mission,
      status: 'accepted',
      acceptedAt: now,
      dueAt: now + DEADLINE_HOURS[mission.difficulty] * 3600000,
      messages: [],
    };
    next = supervisorMessage(next, buildIntro(next), 'intro');
    replaceMission(next, false);
    const profile = { ...get().profile, onboardingDone: true };
    set({ profile });
    scheduleProfileSave();
    void saveMission(next);
    toast(`${mission.code} accepted. ${fmtHours(DEADLINE_HOURS[mission.difficulty])} on the clock.`, 'good');
  };

  const declineMission = (id: string) => {
    const mission = get().missions.find((m) => m.id === id);
    if (!mission || mission.status !== 'offered') return;
    set((current) => ({ missions: current.missions.filter((m) => m.id !== id) }));
    void deleteMissionRecord(id);
    toast(`Tasking ${mission.code} declined. It will not be offered again.`, 'info');
  };

  const askSupervisor = async (id: string, text: string): Promise<void> => {
    const mission = get().missions.find((m) => m.id === id);
    const clean = text.trim();
    if (!mission || !clean || get().busy[`chat:${id}`]) return;
    const prior = mission.messages;
    const withUser: Mission = {
      ...mission,
      messages: [
        ...mission.messages,
        { id: uid('msg'), role: 'analyst', text: clean, at: Date.now(), kind: 'chat' },
      ],
    };
    replaceMission(withUser);
    setBusy(`chat:${id}`, true);
    try {
      const reply = await supervisorTurn(
        get().settings.ai,
        get().missions.find((m) => m.id === id) ?? withUser,
        get().articles,
        prior,
        clean,
      );
      const current = get().missions.find((m) => m.id === id);
      if (!current) return;
      const next = supervisorMessage(current, reply.text, 'chat', reply.mode);
      replaceMission(next);
      if (reply.error) toast('AI supervisor unavailable — offline tradecraft engine answered.', 'warn');
    } catch (error) {
      toast(`Supervisor error: ${(error as Error).message}`, 'bad');
    } finally {
      setBusy(`chat:${id}`, false);
    }
  };

  const requestUpdate = async (id: string): Promise<void> => {
    const mission = get().missions.find((m) => m.id === id);
    if (!mission || get().busy[`update:${id}`]) return;
    setBusy(`update:${id}`, true);
    try {
      const used = new Set(mission.updates.map((u) => u.url).filter(Boolean));
      const pickAnchor = (anchors: ScanResult['anchors']) =>
        [...anchors]
          .filter((a) => a.hints.includes(mission.area) && !used.has(a.url))
          .sort((a, b) => b.publishedAt - a.publishedAt)[0] ?? null;
      let anchor = null;
      if (get().settings.liveIntel) {
        anchor = pickAnchor(readCachedScan()?.anchors ?? []);
        if (!anchor) {
          const scan = await collectAnchors(false);
          anchor = pickAnchor(scan.anchors);
        }
      }

      const current = get().missions.find((m) => m.id === id);
      if (!current) return;
      let update: MissionUpdate;
      if (anchor) {
        update = {
          id: uid('upd'),
          at: Date.now(),
          kind: 'live',
          title: 'New public reporting on your problem set',
          classification: 'LIVE REPORTING',
          body: [
            `${anchor.source} surfaced a lead relevant to ${mission.area}: “${anchor.text}”`,
            '',
            'This is a live lead, not verification. Open the original, establish the date, place, and actor, then state in your report whether it corroborates, complicates, or contradicts your current line.',
          ].join('\n'),
          url: anchor.url,
        };
      } else {
        const archetype = archetypeById.get(mission.archetypeId);
        const injects = archetype?.injects ?? [
          'A second source now reports a detail that sits awkwardly with your lead judgment.',
        ];
        const index = hashString(`${mission.id}:${mission.updates.length}`) % injects.length;
        update = {
          id: uid('upd'),
          at: Date.now(),
          kind: 'inject',
          title: 'Exercise inject — new development',
          classification: 'TRAINING INJECT — SIMULATED',
          body: [
            injects[index],
            '',
            'This is a simulated training inject, generated for exercise purposes. It is not real reporting and must never be cited as evidence. Treat it as a staff officer’s prompt: what would this change, and what would you collect or re-check next?',
          ].join('\n'),
        };
      }

      const next = supervisorMessage(
        { ...current, updates: [...current.updates, update] },
        update.classification === 'LIVE REPORTING'
          ? 'A live public-source lead has been posted to your tasking. Verify it before it touches the assessment. Remember: a lead is not a source.'
          : 'A simulated inject has been posted. Do not cite it as evidence. Use it to test whether your judgments survive a new development.',
        'inject',
        get().settings.ai.enabled ? 'ai' : 'offline',
      );
      replaceMission(next);
      toast(update.classification === 'LIVE REPORTING' ? 'Live lead added to tasking.' : 'Training inject added.', 'info');
    } catch (error) {
      toast(`Update failed: ${(error as Error).message}`, 'bad');
    } finally {
      setBusy(`update:${id}`, false);
    }
  };

  const acknowledgeUpdate = (id: string, updateId: string) => {
    const mission = get().missions.find((m) => m.id === id);
    if (!mission) return;
    replaceMission({
      ...mission,
      updates: mission.updates.map((u) => (u.id === updateId ? { ...u, acknowledged: true } : u)),
    });
  };

  const updateReport = (id: string, patch: Partial<Omit<Report, 'updatedAt' | 'revision'>>) => {
    const mission = get().missions.find((m) => m.id === id);
    if (!mission) return;
    replaceMission({
      ...mission,
      report: { ...mission.report, ...patch, updatedAt: Date.now() },
    });
  };

  const addSource = (id: string): EvidenceSource | null => {
    const mission = get().missions.find((m) => m.id === id);
    if (!mission) return null;
    const source: EvidenceSource = {
      id: uid('src'),
      label: nextSourceLabel(mission.report.sources),
      title: '',
      publisher: '',
      url: '',
      publishedAt: '',
      accessedAt: Date.now(),
      type: 'news',
      reliability: '?',
      credibility: '?',
      verification: 'unverified',
      excerpt: '',
      note: '',
    };
    updateReport(id, { sources: [...mission.report.sources, source] });
    return source;
  };

  const addSourceFromArticle = (id: string, articleId: string): EvidenceSource | null => {
    const mission = get().missions.find((m) => m.id === id);
    const article = get().articles.find((a) => a.id === articleId);
    if (!mission || !article) return null;
    const excerpt =
      article.highlights.map((h) => h.quote).filter(Boolean).join(' … ') ||
      (article.blocks[0] ?? '').slice(0, 500);
    const source: EvidenceSource = {
      id: uid('src'),
      label: nextSourceLabel(mission.report.sources),
      title: article.title,
      publisher: article.publisher,
      url: article.url,
      publishedAt: article.publishedAt,
      accessedAt: Date.now(),
      type: article.sourceKind === 'web' ? 'news' : 'other',
      reliability: '?',
      credibility: '?',
      verification: 'unverified',
      excerpt,
      note: 'Saved offline in the evidence library. Highlighted excerpts are stored locally.',
      articleId: article.id,
    };
    updateReport(id, { sources: [...mission.report.sources, source] });
    return source;
  };

  const removeSource = (id: string, sourceId: string) => {
    const mission = get().missions.find((m) => m.id === id);
    if (!mission) return;
    updateReport(id, { sources: mission.report.sources.filter((s) => s.id !== sourceId) });
  };

  const submitMission = async (id: string): Promise<void> => {
    const mission = get().missions.find((m) => m.id === id);
    if (!mission || (mission.status !== 'accepted' && mission.status !== 'offered')) return;
    const now = Date.now();
    const base: Mission = {
      ...mission,
      status: 'accepted',
      acceptedAt: mission.acceptedAt ?? now,
      attempts: mission.attempts + 1,
    };
    const submitted: Mission = {
      ...base,
      status: 'submitted',
      submittedAt: now,
      report: { ...mission.report, revision: mission.report.revision + 1, updatedAt: now },
    };
    const review = evaluateMission(submitted, get().articles, now);
    const reviewed: Mission = supervisorMessage(
      { ...submitted, reviews: [...submitted.reviews, review] },
      `Review posted: ${review.score}/100 (${review.gradeLabel}). ${review.findings.filter((f) => f.severity === 'critical').length} critical finding(s). Open the review board before you argue with it.`,
      'review',
      'offline',
    );
    replaceMission(reviewed, false);
    const profile = { ...get().profile, submitted: get().profile.submitted + 1 };
    set({ profile });
    scheduleProfileSave();
    await saveMission(reviewed);
    toast(`Report submitted for ${mission.code}. Review posted.`, 'good');
    const settings = get().settings;
    if (settings.ai.enabled && settings.ai.apiKey.trim()) {
      void runAiReview(id);
    }
  };

  const runAiReview = async (id: string): Promise<void> => {
    const mission = get().missions.find((m) => m.id === id);
    if (!mission || get().busy[`review:${id}`]) return;
    const review = mission.reviews[mission.reviews.length - 1];
    if (!review) return;
    const settings = get().settings;
    if (!settings.ai.enabled || !settings.ai.apiKey.trim()) {
      toast('Enable the AI supervisor in settings to request a written read.', 'warn');
      return;
    }
    setBusy(`review:${id}`, true);
    const markReview = (patch: Partial<typeof review>) => {
      const current = get().missions.find((m) => m.id === id);
      if (!current) return;
      replaceMission({
        ...current,
        reviews: current.reviews.map((r) => (r.id === review.id ? { ...r, ...patch } : r)),
      });
    };
    markReview({ aiStatus: 'pending' });
    try {
      const payload = await aiReview(settings.ai, mission, get().articles, review);
      if (!payload) {
        markReview({ aiStatus: 'failed' });
        toast('The AI review returned an unusable response. The audit remains valid.', 'warn');
        return;
      }
      const current = get().missions.find((m) => m.id === id);
      if (!current) return;
      const latest = current.reviews.find((r) => r.id === review.id);
      if (!latest) return;
      const severityOrder = { critical: 0, major: 1, minor: 2, note: 3 } as const;
      const findings = [...latest.findings, ...payload.findings].sort(
        (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
      );
      const strengths = Array.from(new Set([...latest.strengths, ...payload.strengths])).slice(0, 8);
      const next = supervisorMessage(
        {
          ...current,
          reviews: current.reviews.map((r) =>
            r.id === review.id
              ? { ...r, findings, strengths, aiNarrative: payload.narrative, aiStatus: 'done' }
              : r,
          ),
        },
        payload.narrative,
        'review',
        'ai',
      );
      replaceMission(next);
      toast('Supervisor read added to the review.', 'good');
    } catch (error) {
      markReview({ aiStatus: 'failed' });
      toast(`AI review failed: ${(error as Error).message}`, 'bad');
    } finally {
      setBusy(`review:${id}`, false);
    }
  };

  const reviseMission = (id: string) => {
    const mission = get().missions.find((m) => m.id === id);
    if (!mission || (mission.status !== 'reviewed' && mission.status !== 'submitted')) return;
    const latest = mission.reviews[mission.reviews.length - 1];
    if (latest?.accepted) {
      toast('That review is already filed. Open a new tasking if you want to keep training.', 'info');
      return;
    }
    const now = Date.now();
    const hours = Math.max(6, Math.round(DEADLINE_HOURS[mission.difficulty] / 2));
    let next: Mission = {
      ...mission,
      status: 'accepted',
      submittedAt: undefined,
      dueAt: now + hours * 3600000,
    };
    next = supervisorMessage(
      next,
      `Revision post opened: ${hours} hours. Re-open only the findings that matter. A revision is not a rewrite; it is a demonstration that you can fix a specific reasoning defect without breaking the rest of the product.`,
      'system',
    );
    replaceMission(next, false);
    void saveMission(next);
    toast('Revision post opened. The clock is running again.', 'info');
  };

  const acceptReview = (id: string) => {
    const mission = get().missions.find((m) => m.id === id);
    if (!mission || (mission.status !== 'reviewed' && mission.status !== 'submitted')) return;
    const review = mission.reviews[mission.reviews.length - 1];
    if (!review) return;
    if (review.accepted) {
      toast('That review is already filed.', 'info');
      return;
    }
    const profile = get().profile;
    const today = dayKey();
    const yesterday = dayKey(Date.now() - 86400000);
    const streak =
      profile.lastTrainingDay === today
        ? profile.streak
        : profile.lastTrainingDay === yesterday
          ? profile.streak + 1
          : 1;
    const xp = profile.xp + Math.round(review.score * 2 + mission.difficulty * 20);
    const skill = { ...profile.skill };
    for (const dimension of DIMENSIONS) {
      skill[dimension.id] = Math.round(profile.skill[dimension.id] * 0.7 + review.dimensions[dimension.id] * 0.3);
    }
    const recentScores = [...profile.recentScores, review.score].slice(-5);
    const window = recentScores.slice(-3);
    const avg = window.reduce((sum, value) => sum + value, 0) / Math.max(1, window.length);
    let targetDifficulty = profile.targetDifficulty;
    if (window.length >= 2 && avg >= 84) targetDifficulty = Math.min(5, targetDifficulty + 1) as Difficulty;
    else if (window.length >= 2 && avg < 62) targetDifficulty = Math.max(1, targetDifficulty - 1) as Difficulty;

    const nextProfile: Profile = {
      ...profile,
      xp,
      level: Math.max(1, Math.floor(xp / 500) + 1),
      streak,
      lastTrainingDay: today,
      completed: profile.completed + 1,
      skill,
      recentScores,
      targetDifficulty,
      history: [
        {
          id: uid('hist'),
          date: Date.now(),
          score: review.score,
          missionId: mission.id,
          missionTitle: mission.title,
          area: mission.area,
          difficulty: mission.difficulty,
        },
        ...profile.history,
      ].slice(0, 200),
    };
    set({ profile: nextProfile });
    scheduleProfileSave();
    const filed: Mission = {
      ...mission,
      status: 'reviewed',
      reviews: mission.reviews.map((entry) => (entry.id === review.id ? { ...entry, accepted: true } : entry)),
    };
    replaceMission(filed, false);
    void saveMission(filed);
    toast(`Review accepted. +${Math.round(review.score * 2 + mission.difficulty * 20)} XP.`, 'good');
  };

  const archiveMission = (id: string) => {
    const mission = get().missions.find((m) => m.id === id);
    if (!mission) return;
    const next = { ...mission, status: 'archived' as const };
    replaceMission(next, false);
    void saveMission(next);
    toast('Mission filed to the archive.', 'info');
  };

  const deleteMission = (id: string) => {
    set((current) => ({ missions: current.missions.filter((m) => m.id !== id) }));
    void deleteMissionRecord(id);
  };

  const addArticle = (article: Article) => {
    set((current) => ({ articles: [article, ...current.articles] }));
    void saveArticle(article);
  };

  const updateArticle = (id: string, patch: Partial<Article>) => {
    const article = get().articles.find((a) => a.id === id);
    if (!article) return;
    const next = { ...article, ...patch };
    set((current) => ({ articles: current.articles.map((a) => (a.id === id ? next : a)) }));
    void saveArticle(next);
  };

  const deleteArticle = (id: string) => {
    set((current) => ({ articles: current.articles.filter((a) => a.id !== id) }));
    void deleteArticleRecord(id);
    const affected = get().missions.filter((m) => m.report.sources.some((s) => s.articleId === id));
    affected.forEach((mission) => {
      const next: Mission = {
        ...mission,
        report: {
          ...mission.report,
          sources: mission.report.sources.map((s) => (s.articleId === id ? { ...s, articleId: undefined } : s)),
        },
      };
      replaceMission(next);
    });
    toast('Saved article removed. Source register entries were detached.', 'info');
  };

  const addHighlight = (articleId: string, input: Omit<Highlight, 'id' | 'createdAt'>): Highlight | null => {
    const article = get().articles.find((a) => a.id === articleId);
    if (!article) return null;
    const highlight: Highlight = { ...input, id: uid('hl'), createdAt: Date.now() };
    updateArticle(articleId, { highlights: [...article.highlights, highlight] });
    return highlight;
  };

  const updateHighlight = (articleId: string, highlightId: string, patch: Partial<Highlight>) => {
    const article = get().articles.find((a) => a.id === articleId);
    if (!article) return;
    updateArticle(articleId, {
      highlights: article.highlights.map((h) => (h.id === highlightId ? { ...h, ...patch } : h)),
    });
  };

  const deleteHighlight = (articleId: string, highlightId: string) => {
    const article = get().articles.find((a) => a.id === articleId);
    if (!article) return;
    updateArticle(articleId, { highlights: article.highlights.filter((h) => h.id !== highlightId) });
  };

  const linkArticle = (articleId: string, missionId: string) => {
    const article = get().articles.find((a) => a.id === articleId);
    if (!article) return;
    const missionIds = article.missionIds.includes(missionId)
      ? article.missionIds.filter((id) => id !== missionId)
      : [...article.missionIds, missionId];
    updateArticle(articleId, { missionIds });
  };

  const updateSettings = (patch: Partial<Settings>) => {
    set({ settings: mergeSettings({ ...get().settings, ...patch }) });
    scheduleSettingsSave();
  };

  const updateAi = (patch: Partial<AiSettings>) => {
    updateSettings({ ai: { ...get().settings.ai, ...patch } });
  };

  const updateProfile = (patch: Partial<Profile>) => {
    set({ profile: { ...get().profile, ...patch } });
    scheduleProfileSave();
  };

  const testAi = async (): Promise<string | null> => {
    if (get().busy['ai-test']) return null;
    setBusy('ai-test', true);
    try {
      const reply = await testAiConnection(get().settings.ai);
      toast(`AI provider replied: ${reply}`, 'good');
      return reply;
    } catch (error) {
      toast(`AI test failed: ${(error as Error).message}`, 'bad');
      return null;
    } finally {
      setBusy('ai-test', false);
    }
  };

  const exportData = (): string => {
    const current = get();
    const payload = {
      app: 'STATION',
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: { ...current.settings, ai: { ...current.settings.ai, apiKey: '' } },
      profile: current.profile,
      missions: current.missions,
      articles: current.articles,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importData = async (raw: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(raw) as {
        missions?: unknown;
        articles?: unknown;
        settings?: Partial<Settings>;
        profile?: Partial<Profile>;
      };
      if (!Array.isArray(parsed.missions) || !Array.isArray(parsed.articles)) {
        toast('Import rejected: the file does not contain missions and articles.', 'bad');
        return false;
      }
      const settings = mergeSettings(parsed.settings);
      settings.ai.apiKey = get().settings.ai.apiKey;
      const profile = mergeProfile(parsed.profile);
      const missions = parsed.missions as Mission[];
      const articles = parsed.articles as Article[];
      await replaceAll({ missions, articles, settings, profile });
      set({
        missions: [...missions].sort((a, b) => b.createdAt - a.createdAt),
        articles: [...articles].sort((a, b) => b.savedAt - a.savedAt),
        settings,
        profile,
      });
      toast('Workspace imported. Kept your current API key.', 'good');
      return true;
    } catch (error) {
      toast(`Import failed: ${(error as Error).message}`, 'bad');
      return false;
    }
  };

  const resetAll = async () => {
    await clearEverything();
    try {
      localStorage.removeItem('station.live.anchors.v1');
    } catch {
      // Cache cleanup is best-effort.
    }
    clearReferenceData();
    set({
      missions: [],
      articles: [],
      settings: DEFAULT_SETTINGS,
      profile: DEFAULT_PROFILE,
      toasts: [],
      scan: null,
    });
    await generateMission({ count: 3, announce: false });
    toast('Workspace reset. Three fresh taskings are on the board.', 'info');
  };

  const actions = {
    init,
    flush,
    acceptMission,
    declineMission,
    generateMission,
    askSupervisor,
    requestUpdate,
    acknowledgeUpdate,
    updateReport,
    addSource,
    addSourceFromArticle,
    removeSource,
    submitMission,
    runAiReview,
    reviseMission,
    acceptReview,
    archiveMission,
    deleteMission,
    addArticle,
    updateArticle,
    deleteArticle,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    linkArticle,
    updateSettings,
    updateAi,
    updateProfile,
    testAi,
    exportData,
    importData,
    resetAll,
    toast,
  };

  return { getState: get, subscribe, actions, flush };
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppActions = AppStore['actions'];
