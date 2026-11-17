import type {
  Alternative,
  Anchor,
  Area,
  Difficulty,
  LiveAnchor,
  Mission,
  Pir,
  Profile,
  Report,
  ResearchVector,
  Settings,
} from '../types';
import { ARCHETYPES, HOOK_TOKEN, type Archetype } from '../data/archetypes';
import {
  AREAS,
  CODENAMES,
  DEADLINE_HOURS,
  MIN_PIRS,
  MIN_SOURCES,
  wordTarget,
} from './constants';
import { mulberry32, pick, pickMany, randomSeed } from './rng';
import { makeMissionCode, uid } from './ids';
import { domainOf, truncate } from './text';
import { fmtDate } from './time';

export interface GenerateInput {
  existing: Mission[];
  profile: Profile;
  settings: Settings;
  anchors: LiveAnchor[];
  now?: number;
  forceArea?: Area;
  forcedDifficulty?: Difficulty;
}

export interface GeneratedTasking {
  mission: Mission;
  dedupeKey: string;
}

export function requiredAlternatives(difficulty: Difficulty): number {
  return difficulty < 3 ? 2 : difficulty < 5 ? 3 : 4;
}

function clampDifficulty(value: number, archetype: Archetype): Difficulty {
  const clamped = Math.min(5, Math.max(1, Math.round(value)));
  return Math.min(archetype.difficulty[1], Math.max(archetype.difficulty[0], clamped)) as Difficulty;
}

function chooseArea(rng: () => number, existing: Mission[], supported: Area[]): Area {
  const recent = existing.slice(0, 8).map((m) => m.area);
  const counts = new Map<Area, number>();
  for (const area of supported) counts.set(area, 0);
  for (const area of recent) counts.set(area, (counts.get(area) ?? 0) + 1);
  const fresh = supported.filter((area) => !recent.slice(0, 3).includes(area));
  const pool = fresh.length > 0 ? fresh : supported;
  const weights = pool.map((area) => 1 / (1 + (counts.get(area) ?? 0)));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = rng() * total;
  for (let i = 0; i < pool.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function chooseArchetype(rng: () => number, area: Area, difficulty: Difficulty, existing: Mission[]): Archetype {
  const recent = existing.slice(0, 6).map((m) => m.archetypeId);
  let pool = ARCHETYPES.filter(
    (a) =>
      a.area === area &&
      difficulty >= a.difficulty[0] &&
      difficulty <= a.difficulty[1] &&
      !recent.includes(a.id),
  );
  if (pool.length === 0) {
    pool = ARCHETYPES.filter(
      (a) => a.area === area && difficulty >= a.difficulty[0] && difficulty <= a.difficulty[1],
    );
  }
  if (pool.length === 0) {
    pool = ARCHETYPES.filter((a) => a.area === area);
  }
  return pick(rng, pool);
}

function anchorScore(anchor: LiveAnchor, archetype: Archetype, now: number): number {
  const text = anchor.text.toLowerCase();
  let score = archetype.keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 2 : 0), 0);
  const ageDays = (now - anchor.publishedAt) / 86400000;
  if (ageDays < 2) score += 2;
  if (ageDays < 7) score += 1;
  return score;
}

function chooseLiveAnchor(
  rng: () => number,
  archetype: Archetype,
  anchors: LiveAnchor[],
  existing: Mission[],
  now: number,
): LiveAnchor | null {
  const usedUrls = new Set(existing.map((m) => m.anchor?.url).filter(Boolean));
  const candidates = anchors.filter(
    (a) => a.hints.includes(archetype.area) && !usedUrls.has(a.url),
  );
  if (candidates.length === 0) return null;
  const ranked = [...candidates]
    .sort((a, b) => anchorScore(b, archetype, now) - anchorScore(a, archetype, now))
    .slice(0, 4);
  const positive = ranked.filter((a) => anchorScore(a, archetype, now) > 0);
  return pick(rng, positive.length > 0 ? positive : ranked);
}

function makeAnchor(
  rng: () => number,
  live: LiveAnchor | null,
  archetype: Archetype,
  existing: Mission[],
  now: number,
): Anchor {
  if (live) {
    return {
      kind: 'live',
      label: truncate(live.text, 260),
      url: live.url,
      source: live.source,
      publishedAt: live.publishedAt,
      detail:
        'Automated public-source lead. It is unverified and may be incomplete, recycled, or wrong. Open the original link and confirm the date, place, and claim.',
      matchedAt: now,
      place: live.place,
      lat: live.lat,
      lon: live.lon,
    };
  }
  const usedLabels = new Set(existing.map((m) => m.anchor?.label).filter(Boolean));
  const fresh = archetype.anchors.filter((a) => !usedLabels.has(a.label));
  const seed = pick(rng, fresh.length > 0 ? fresh : archetype.anchors);
  return {
    kind: 'standing',
    label: seed.label,
    url: seed.url,
    source: seed.source,
    detail: seed.detail ?? 'Select one current case and record its identifier, date, and source.',
    matchedAt: now,
  };
}

function hookParagraph(anchor: Anchor): string {
  if (anchor.kind === 'live') {
    return [
      `LIVE LEAD — ${anchor.source}, dated ${fmtDate(anchor.publishedAt)}: “${anchor.label}.”`,
      '',
      'This is an unverified lead from an automated scan of public sources, not confirmed reporting. Open the original link, establish what it actually says, and state in your report whether it survived verification. If the link does not support the lead, say so.',
    ].join('\n');
  }
  const locator = anchor.url ? ` — ${domainOf(anchor.url)}` : '';
  return [
    `COLLECTION POINT — ${anchor.label} (${anchor.source}${locator}).`,
    '',
    `${anchor.detail ?? 'Choose a current case.'} Record the specific case, locator, and source date you used. A tasking that names no case has not begun.`,
  ].join('\n');
}

function makeReport(pirs: Pir[]): Report {
  const blankAlternative = (): Alternative => ({
    id: uid('alt'),
    hypothesis: '',
    supporting: '',
    contradicting: '',
    assessment: '',
  });
  return {
    bluf: '',
    judgments: [],
    answers: Object.fromEntries(pirs.map((pir) => [pir.id, ''])),
    alternatives: [blankAlternative(), blankAlternative()],
    gaps: '',
    indicators: '',
    methods: '',
    sources: [],
    updatedAt: Date.now(),
    revision: 0,
  };
}

function priorityFor(rng: () => number, difficulty: Difficulty): Mission['priority'] {
  if (difficulty >= 5) return 'IMMEDIATE';
  if (difficulty === 4) return rng() < 0.55 ? 'IMMEDIATE' : 'PRIORITY';
  if (difficulty === 3) return 'PRIORITY';
  if (difficulty === 2) return rng() < 0.25 ? 'PRIORITY' : 'ROUTINE';
  return 'ROUTINE';
}

export function generateTasking(input: GenerateInput): GeneratedTasking {
  const now = input.now ?? Date.now();
  const rng = mulberry32(randomSeed());
  const requestedDifficulty = (input.forcedDifficulty ??
    (input.settings.difficultyMode === 'manual' ? input.settings.manualLevel : input.profile.targetDifficulty)) as Difficulty;
  const supportedAreas = (Object.keys(AREAS) as Area[]).filter((area) =>
    ARCHETYPES.some(
      (a) => a.area === area && requestedDifficulty >= a.difficulty[0] && requestedDifficulty <= a.difficulty[1],
    ),
  );
  const area = input.forceArea ?? chooseArea(rng, input.existing, supportedAreas.length > 0 ? supportedAreas : (Object.keys(AREAS) as Area[]));
  const archetype = chooseArchetype(rng, area, requestedDifficulty, input.existing);
  const difficulty = clampDifficulty(requestedDifficulty, archetype);

  const liveAnchor = chooseLiveAnchor(rng, archetype, input.anchors, input.existing, now);
  const anchor = makeAnchor(rng, liveAnchor, archetype, input.existing, now);

  const pirCount = Math.min(MIN_PIRS[difficulty], archetype.pirs.length);
  const core = archetype.pirs.slice(0, Math.min(2, pirCount));
  const extras = pickMany(rng, archetype.pirs.slice(2), Math.max(0, pirCount - core.length));
  const chosen = [...core, ...extras];
  const pirs: Pir[] = chosen.map((seed) => ({
    id: uid('pir'),
    question: seed.q,
    focus: seed.focus,
  }));

  const situation = archetype.situation.replace(HOOK_TOKEN, hookParagraph(anchor));

  const recentCodenames = new Set(input.existing.slice(0, 10).map((m) => m.codename));
  const codenamePool = CODENAMES.filter((c) => !recentCodenames.has(c));
  const codename = pick(rng, codenamePool.length > 0 ? codenamePool : CODENAMES);

  const liveVector: ResearchVector | null = anchor.url
    ? {
        id: uid('vec'),
        label: anchor.kind === 'live' ? 'Verify the live lead' : 'Anchor collection point',
        kind: anchor.kind === 'live' ? 'news' : 'reference',
        url: anchor.url,
        note:
          anchor.kind === 'live'
            ? 'Start here, then move upstream to the underlying document, dataset, or original image.'
            : 'Choose a current case from this collection point. Capture the case identifier.',
      }
    : null;

  const vectors: ResearchVector[] = [];
  const seenVectorKeys = new Set<string>();
  if (liveVector) {
    vectors.push(liveVector);
    if (anchor.url) seenVectorKeys.add(anchor.url);
  }
  for (const seed of archetype.vectors) {
    const key = seed.url ?? seed.label;
    if (seenVectorKeys.has(key)) continue;
    seenVectorKeys.add(key);
    vectors.push({
      id: uid('vec'),
      label: seed.label,
      kind: seed.kind,
      url: seed.url,
      query: seed.query,
      note: seed.note,
    });
  }

  const minSources = MIN_SOURCES[difficulty];
  const minAlternatives = requiredAlternatives(difficulty);
  const requirements = Array.from(
    new Set([
      ...archetype.requirements,
      `Cite at least ${minSources} distinct sources inline with [S#] tags.`,
      `Answer all ${pirs.length} intelligence questions; evaluate at least ${minAlternatives} competing hypotheses with evidence for and against.`,
      'Give every key judgment an explicit confidence using the standard probability yardstick.',
      'Mark every source you could not verify as UNVERIFIED. Never cite a training inject.',
    ]),
  );

  const report = makeReport(pirs);

  const mission: Mission = {
    id: uid('msn'),
    code: makeMissionCode(input.profile.generated + 1, now),
    codename,
    archetypeId: archetype.id,
    area: archetype.area,
    title: archetype.title,
    tagline: archetype.tagline,
    priority: priorityFor(rng, difficulty),
    difficulty,
    status: 'offered',
    createdAt: now,
    dueAt: now + DEADLINE_HOURS[difficulty] * 3600000,
    anchor,
    situation,
    intent: archetype.intent,
    pirs,
    deliverable: {
      format: archetype.format,
      maxWords: wordTarget(difficulty),
      requirements,
    },
    vectors,
    updates: [],
    messages: [],
    report,
    reviews: [],
    attempts: 0,
    seed: randomSeed(),
    skillsFocus: Array.from(new Set([
      ...archetype.skillsFocus,
      ...(difficulty >= 4 ? (['alternatives', 'gaps'] as const) : []),
    ])),
  };

  return {
    mission,
    dedupeKey: `${archetype.id}|${anchor.url ?? anchor.label}`,
  };
}
