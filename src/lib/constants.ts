import type {
  Area,
  ConfidenceId,
  DimensionId,
  Difficulty,
  HighlightColor,
  Priority,
  SourceType,
  VectorKind,
} from '../types';

export const APP_NAME = 'STATION';
export const APP_SUBTITLE = 'All-Source Intelligence Trainer';
export const CLASSIFICATION = 'UNCLASSIFIED // OPEN SOURCE // TRAINING EXERCISE';

export const CODENAMES = [
  'KESTREL',
  'HALCYON',
  'TALON',
  'ORACLE',
  'MERIDIAN',
  'LANTERN',
  'VECTOR',
  'CADENCE',
  'NORTHWIND',
  'IRONSIDE',
  'SABLE',
  'WARDEN',
  'ATLAS',
  'PELICAN',
  'MAGPIE',
  'COMPASS',
  'SENTRY',
  'FOXGLOVE',
  'DAGGER',
  'BEACON',
  'HARBOR',
  'GRANITE',
  'SOLSTICE',
  'TIDE',
  'ANVIL',
  'QUILL',
  'LYNX',
  'RAVEN',
  'ORCHID',
  'TEMPEST',
  'CINDER',
  'VIGIL',
  'HORIZON',
  'CIRRUS',
  'MONARCH',
  'PIONEER',
  'WRAITH',
  'SIGNAL',
  'BASTION',
  'CORMORANT',
  'EMBERS',
  'FATHOM',
  'GARNET',
  'HELIOS',
  'JUNIPER',
  'KODIAK',
  'LODESTAR',
  'MISTRAL',
  'NOMAD',
  'OBSIDIAN',
  'PRAIRIE',
  'QUARRY',
  'RIPTIDE',
  'SUMMIT',
  'TUNDRA',
  'UMBRA',
  'VESPER',
  'WAYPOINT',
  'ZEPHYR',
  'ALLOY',
  'BRAMBLE',
  'CIPHER',
  'DELTA',
  'FLINT',
  'GALE',
  'HARRIER',
  'INGOT',
  'JACKAL',
  'KILN',
  'LATTICE',
  'MORROW',
  'NIMBUS',
  'ONYX',
  'PRISM',
  'QUARRY',
  'RELAY',
  'SLATE',
  'TRACER',
  'ULSTER',
  'VANTAGE',
  'WILLOW',
  'XENON',
  'YARROW',
  'ZODIAC',
];

export interface AreaMeta {
  label: string;
  short: string;
  code: string;
  blurb: string;
  keywords: string[];
}

export const AREAS: Record<Area, AreaMeta> = {
  aviation: {
    label: 'Aviation',
    short: 'AVN',
    code: 'AIR',
    blurb: 'Airspace, airports, navigation integrity, and flight operations.',
    keywords: [
      'aviation',
      'airline',
      'airport',
      'flight',
      'aircraft',
      'airspace',
      'air traffic',
      'runway',
      'aerial',
      'drone',
      'uav',
      'notam',
      'icao',
      'faa',
      'easa',
      'boeing',
      'airbus',
      'jet',
      'plane',
      'pilot',
      'terminal',
      'ground stop',
      'gps',
      'navigation',
    ],
  },
  geopolitics: {
    label: 'Geopolitics',
    short: 'GEO',
    code: 'POL',
    blurb: 'State behavior, diplomacy, sanctions, elections, and security posture.',
    keywords: [
      'president',
      'prime minister',
      'minister',
      'election',
      'vote',
      'parliament',
      'summit',
      'treaty',
      'sanctions',
      'diplomat',
      'embassy',
      'military',
      'nato',
      'united nations',
      'border',
      'talks',
      'coup',
      'protest',
      'government',
      'opposition',
      'coalition',
      'sovereign',
      'annex',
      'ceasefire',
      'defense',
      'foreign ministry',
    ],
  },
  logistics: {
    label: 'Logistics',
    short: 'LOG',
    code: 'SUP',
    blurb: 'Shipping, ports, corridors, energy, and supply-chain stress.',
    keywords: [
      'port',
      'shipping',
      'vessel',
      'cargo',
      'container',
      'trade',
      'export',
      'import',
      'pipeline',
      'canal',
      'railway',
      'rail',
      'supply chain',
      'oil',
      'gas',
      'lng',
      'refinery',
      'tanker',
      'freight',
      'trucking',
      'customs',
      'tariff',
      'chokepoint',
      'strait',
      'commodity',
      'minerals',
    ],
  },
  humanitarian: {
    label: 'Humanitarian',
    short: 'HUM',
    code: 'HUM',
    blurb: 'Disaster response, displacement, food security, and public health.',
    keywords: [
      'earthquake',
      'flood',
      'wildfire',
      'storm',
      'hurricane',
      'cyclone',
      'typhoon',
      'refugee',
      'displaced',
      'famine',
      'food security',
      'aid',
      'humanitarian',
      'casualties',
      'killed',
      'drought',
      'outbreak',
      'epidemic',
      'cholera',
      'landslide',
      'tsunami',
      'volcano',
      'evacuate',
      'shelter',
      'international red cross',
      'och a',
      'ocha',
    ],
  },
  imagery: {
    label: 'Imagery & Geography',
    short: 'IMG',
    code: 'GEOINT',
    blurb: 'Satellite imagery, change detection, geolocation, and terrain.',
    keywords: [
      'satellite',
      'imagery',
      'aerial',
      'map',
      'mapping',
      'geospatial',
      'coordinates',
      'geolocation',
      'construction',
      'expansion',
      'burn scar',
      'damage',
      'eruption',
      'bridge',
      'port expansion',
      'airfield',
      'night lights',
      'remote sensing',
      'landsat',
      'sentinel',
      'planet labs',
      'earth observation',
      'topography',
    ],
  },
  verification: {
    label: 'Information Verification',
    short: 'VER',
    code: 'VER',
    blurb: 'Provenance, authenticity, claim tracing, and media forensics.',
    keywords: [
      'claim',
      'video',
      'footage',
      'photo',
      'image',
      'disinformation',
      'misinformation',
      'fake',
      'hoax',
      'viral',
      'denied',
      'denies',
      'leaked',
      'document',
      'authentic',
      'manipulated',
      'deepfake',
      'rumor',
      'alleged',
      'unverified',
      'fact check',
      'debunk',
      'social media',
      'telegram',
      'x post',
    ],
  },
  forecasting: {
    label: 'Forecasting',
    short: 'FCST',
    code: 'EST',
    blurb: 'Indicators and warning, scenarios, and probabilistic assessment.',
    keywords: [
      'forecast',
      'outlook',
      'risk',
      'warning',
      'indicator',
      'upcoming',
      'expected',
      'projection',
      'scenario',
      'season',
      'deadline',
      'negotiation',
      'vote',
      'referendum',
      'scheduled',
      'monsoon',
      'winter',
      'harvest',
      'debt',
      'default',
      'currency',
      'inflation',
    ],
  },
};

export interface ConfidenceMeta {
  id: ConfidenceId;
  label: string;
  short: string;
  range: string;
  pct: [number, number];
}

export const CONFIDENCE_LEVELS: ConfidenceMeta[] = [
  { id: 'remote', label: 'almost no chance', short: 'ALMOST NO CHANCE', range: '01–05%', pct: [1, 5] },
  { id: 'very-unlikely', label: 'very unlikely', short: 'VERY UNLIKELY', range: '05–20%', pct: [5, 20] },
  { id: 'unlikely', label: 'unlikely', short: 'UNLIKELY', range: '20–40%', pct: [20, 40] },
  { id: 'even', label: 'roughly even chance', short: 'EVEN CHANCE', range: '40–60%', pct: [40, 60] },
  { id: 'likely', label: 'likely', short: 'LIKELY', range: '60–80%', pct: [60, 80] },
  { id: 'very-likely', label: 'very likely', short: 'VERY LIKELY', range: '80–95%', pct: [80, 95] },
  { id: 'almost-certain', label: 'almost certain', short: 'ALMOST CERTAIN', range: '95–99%', pct: [95, 99] },
];

export const confidenceMeta = (id: ConfidenceId): ConfidenceMeta =>
  CONFIDENCE_LEVELS.find((c) => c.id === id) ?? CONFIDENCE_LEVELS[3];

export interface DimensionMeta {
  id: DimensionId;
  label: string;
  short: string;
  blurb: string;
  weight: number;
  standard: string;
}

export const DIMENSIONS: DimensionMeta[] = [
  {
    id: 'sourcing',
    label: 'Source quality',
    short: 'SOURCING',
    blurb: 'Credible, diverse, primary sources with provenance and grading.',
    weight: 22,
    standard: 'ODNI Standard 1 — source quality and credibility',
  },
  {
    id: 'evidence',
    label: 'Evidence & logic',
    short: 'EVIDENCE',
    blurb: 'Judgments are traceable to cited evidence, not assertion.',
    weight: 20,
    standard: 'ODNI Standards 3 & 6 — data vs. judgment, logical argument',
  },
  {
    id: 'uncertainty',
    label: 'Uncertainty',
    short: 'UNCERTAINTY',
    blurb: 'Confidence is explicit, calibrated, and expressed with the standard yardstick.',
    weight: 14,
    standard: 'ODNI Standard 2 — express and explain uncertainty',
  },
  {
    id: 'alternatives',
    label: 'Alternatives',
    short: 'ALTERNATIVES',
    blurb: 'Competing hypotheses are tested with supporting and disconfirming evidence.',
    weight: 16,
    standard: 'ODNI Standard 4 — analysis of alternatives',
  },
  {
    id: 'gaps',
    label: 'Gaps & collection',
    short: 'GAPS',
    blurb: 'What remains unknown is stated, with concrete collection or verification tasks.',
    weight: 10,
    standard: 'ODNI Standard 5 — relevance, gaps, implications',
  },
  {
    id: 'objectivity',
    label: 'Objectivity',
    short: 'OBJECTIVITY',
    blurb: 'Language is neutral, free of advocacy, mirror-imaging, and unsupported certainty.',
    weight: 8,
    standard: 'ICD 203 — objective, independent of political consideration',
  },
  {
    id: 'structure',
    label: 'Structure & timeliness',
    short: 'STRUCTURE',
    blurb: 'BLUF, readable organization, and delivery against the deadline.',
    weight: 10,
    standard: 'ODNI Standard 6 & timeliness',
  },
];

export const dimensionMeta = (id: DimensionId): DimensionMeta =>
  DIMENSIONS.find((d) => d.id === id) ?? DIMENSIONS[0];

export const PRIORITIES: Record<Priority, { label: string; tone: string }> = {
  ROUTINE: { label: 'ROUTINE', tone: 'neutral' },
  PRIORITY: { label: 'PRIORITY', tone: 'amber' },
  IMMEDIATE: { label: 'IMMEDIATE', tone: 'red' },
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'FOUNDATION',
  2: 'INTERMEDIATE',
  3: 'ADVANCED',
  4: 'DEMANDING',
  5: 'EXPERT',
};

export const HIGHLIGHT_COLORS: { id: HighlightColor; label: string }[] = [
  { id: 'amber', label: 'Key fact' },
  { id: 'cyan', label: 'Context' },
  { id: 'green', label: 'Corroborates' },
  { id: 'rose', label: 'Contradiction' },
];

export const VECTOR_KINDS: Record<VectorKind, string> = {
  official: 'Official record',
  dataset: 'Dataset',
  imagery: 'Imagery',
  news: 'Reporting',
  ngo: 'NGO / IO',
  academic: 'Academic',
  reference: 'Reference',
};

export const SOURCE_TYPES: { id: SourceType; label: string; hint: string }[] = [
  { id: 'primary', label: 'Primary document', hint: 'The original record, notice, image, or statement.' },
  { id: 'official', label: 'Official statement', hint: 'Government or institutional release about the event.' },
  { id: 'dataset', label: 'Dataset', hint: 'Structured observations you can query yourself.' },
  { id: 'imagery', label: 'Imagery', hint: 'Satellite, aerial, or geotagged visual evidence.' },
  { id: 'news', label: 'News reporting', hint: 'Journalistic account; look for what it cites.' },
  { id: 'ngo', label: 'NGO / IO report', hint: 'Humanitarian or intergovernmental assessment.' },
  { id: 'academic', label: 'Academic work', hint: 'Peer-reviewed or expert analysis.' },
  { id: 'social', label: 'Social / user media', hint: 'Unverified user content; provenance required.' },
  { id: 'other', label: 'Other', hint: 'Anything not covered above.' },
];

export const RELIABILITY_CODES: { id: string; label: string }[] = [
  { id: 'A', label: 'A — Completely reliable' },
  { id: 'B', label: 'B — Usually reliable' },
  { id: 'C', label: 'C — Fairly reliable' },
  { id: 'D', label: 'D — Not usually reliable' },
  { id: 'E', label: 'E — Unreliable' },
  { id: 'F', label: 'F — Cannot be judged' },
  { id: '?', label: 'Not graded' },
];

export const CREDIBILITY_CODES: { id: string; label: string }[] = [
  { id: '1', label: '1 — Confirmed by other sources' },
  { id: '2', label: '2 — Probably true' },
  { id: '3', label: '3 — Possibly true' },
  { id: '4', label: '4 — Doubtful' },
  { id: '5', label: '5 — Improbable' },
  { id: '6', label: '6 — Cannot be judged' },
  { id: '?', label: 'Not graded' },
];

export const VERIFICATION_LABELS = {
  'verified-primary': 'Verified against primary source',
  corroborated: 'Corroborated',
  'single-source': 'Single source',
  unverified: 'Unverified',
} as const;

export const RANKS = [
  { title: 'Analyst', xp: 0 },
  { title: 'Senior Analyst', xp: 600 },
  { title: 'Watch Officer', xp: 1500 },
  { title: 'Team Lead', xp: 3000 },
  { title: 'Senior Lead', xp: 5000 },
  { title: 'Chief Analyst', xp: 8000 },
];

export const DEADLINE_HOURS: Record<Difficulty, number> = {
  1: 72,
  2: 48,
  3: 36,
  4: 24,
  5: 12,
};

export const MIN_SOURCES: Record<Difficulty, number> = {
  1: 3,
  2: 4,
  3: 5,
  4: 6,
  5: 7,
};

export const MIN_PIRS: Record<Difficulty, number> = {
  1: 3,
  2: 4,
  3: 5,
  4: 6,
  5: 6,
};

export const wordTarget = (difficulty: Difficulty): number => 650 + difficulty * 250;

export function rankForXp(xp: number): { title: string; next: string | null; progress: number; index: number } {
  let index = 0;
  for (let i = 0; i < RANKS.length; i += 1) {
    if (xp >= RANKS[i].xp) index = i;
  }
  const current = RANKS[index];
  const next = RANKS[index + 1];
  const progress = next ? Math.min(1, (xp - current.xp) / (next.xp - current.xp)) : 1;
  return { title: current.title, next: next?.title ?? null, progress, index };
}

export function gradeForScore(score: number): { grade: string; label: string } {
  if (score >= 90) return { grade: 'A', label: 'OUTSTANDING' };
  if (score >= 80) return { grade: 'B', label: 'STRONG' };
  if (score >= 70) return { grade: 'C', label: 'SATISFACTORY' };
  if (score >= 60) return { grade: 'D', label: 'MARGINAL' };
  return { grade: 'F', label: 'UNSATISFACTORY' };
}

export const GRADE_TONES: Record<string, string> = {
  A: 'tag-green',
  B: 'tag-cyan',
  C: 'tag-amber',
  D: 'tag-amber',
  F: 'tag-rose',
};
