export type Area =
  | 'aviation'
  | 'geopolitics'
  | 'logistics'
  | 'humanitarian'
  | 'imagery'
  | 'verification'
  | 'forecasting';

export type Priority = 'ROUTINE' | 'PRIORITY' | 'IMMEDIATE';
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type MissionStatus = 'offered' | 'accepted' | 'submitted' | 'reviewed' | 'archived';

export type VectorKind =
  | 'official'
  | 'dataset'
  | 'imagery'
  | 'news'
  | 'ngo'
  | 'academic'
  | 'reference';

export interface Anchor {
  kind: 'live' | 'standing';
  label: string;
  url?: string;
  source: string;
  publishedAt?: number;
  detail?: string;
  matchedAt?: number;
  place?: string;
  lat?: number;
  lon?: number;
}

export interface Pir {
  id: string;
  question: string;
  focus?: string;
}

export interface ResearchVector {
  id: string;
  label: string;
  kind: VectorKind;
  url?: string;
  query?: string;
  note?: string;
}

export interface VectorSeed {
  label: string;
  kind: VectorKind;
  url?: string;
  query?: string;
  note?: string;
}

export interface AnchorSeed {
  label: string;
  source: string;
  url?: string;
  detail?: string;
}

export type SourceType =
  | 'primary'
  | 'official'
  | 'dataset'
  | 'imagery'
  | 'news'
  | 'ngo'
  | 'academic'
  | 'social'
  | 'other';

export type Reliability = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | '?';
export type Credibility = '1' | '2' | '3' | '4' | '5' | '6' | '?';
export type VerificationStatus =
  | 'verified-primary'
  | 'corroborated'
  | 'single-source'
  | 'unverified';

export interface EvidenceSource {
  id: string;
  label: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string;
  accessedAt: number;
  type: SourceType;
  reliability: Reliability;
  credibility: Credibility;
  verification: VerificationStatus;
  excerpt: string;
  note: string;
  articleId?: string;
}

export type ConfidenceId =
  | 'remote'
  | 'very-unlikely'
  | 'unlikely'
  | 'even'
  | 'likely'
  | 'very-likely'
  | 'almost-certain';

export interface KeyJudgment {
  id: string;
  text: string;
  confidence: ConfidenceId;
}

export interface Alternative {
  id: string;
  hypothesis: string;
  supporting: string;
  contradicting: string;
  assessment: string;
}

export interface Report {
  bluf: string;
  judgments: KeyJudgment[];
  answers: Record<string, string>;
  alternatives: Alternative[];
  gaps: string;
  indicators: string;
  methods: string;
  sources: EvidenceSource[];
  updatedAt: number;
  revision: number;
}

export type DimensionId =
  | 'sourcing'
  | 'evidence'
  | 'uncertainty'
  | 'alternatives'
  | 'gaps'
  | 'objectivity'
  | 'structure';

export type Severity = 'critical' | 'major' | 'minor' | 'note';

export interface ReviewFinding {
  id: string;
  dimension: DimensionId;
  severity: Severity;
  message: string;
  evidence?: string;
  task?: string;
  origin?: 'audit' | 'supervisor';
}

export interface SourceAudit {
  label: string;
  title: string;
  status: 'not-accessed' | 'pattern-only' | 'excerpt-found' | 'excerpt-missing';
  note: string;
}

export interface Review {
  id: string;
  submittedAt: number;
  onTime: boolean;
  lateByHours: number;
  score: number;
  grade: string;
  gradeLabel: string;
  dimensions: Record<DimensionId, number>;
  findings: ReviewFinding[];
  strengths: string[];
  sourceAudit: SourceAudit[];
  aiNarrative?: string;
  aiStatus?: 'idle' | 'pending' | 'done' | 'failed';
  accepted?: boolean;
  attempt: number;
  wordCount: number;
}

export interface MissionUpdate {
  id: string;
  at: number;
  kind: 'live' | 'inject' | 'supervisor';
  title: string;
  body: string;
  url?: string;
  classification: 'LIVE REPORTING' | 'TRAINING INJECT — SIMULATED' | 'SUPERVISOR NOTE';
  acknowledged?: boolean;
}

export interface SupervisorMessage {
  id: string;
  role: 'supervisor' | 'analyst';
  text: string;
  at: number;
  mode?: 'offline' | 'ai';
  kind?: 'intro' | 'chat' | 'review' | 'inject' | 'system';
}

export interface Deliverable {
  format: string;
  maxWords: number;
  requirements: string[];
}

export interface Mission {
  id: string;
  code: string;
  codename: string;
  archetypeId: string;
  area: Area;
  title: string;
  tagline: string;
  priority: Priority;
  difficulty: Difficulty;
  status: MissionStatus;
  createdAt: number;
  dueAt: number;
  acceptedAt?: number;
  submittedAt?: number;
  anchor?: Anchor;
  situation: string;
  intent: string;
  pirs: Pir[];
  deliverable: Deliverable;
  vectors: ResearchVector[];
  updates: MissionUpdate[];
  messages: SupervisorMessage[];
  report: Report;
  reviews: Review[];
  attempts: number;
  seed: number;
  skillsFocus: DimensionId[];
}

export type HighlightColor = 'amber' | 'cyan' | 'green' | 'rose';

export interface Highlight {
  id: string;
  blockIndex: number;
  start: number;
  end: number;
  quote: string;
  color: HighlightColor;
  note: string;
  createdAt: number;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  publisher: string;
  author: string;
  publishedAt: string;
  savedAt: number;
  area?: Area;
  tags: string[];
  blocks: string[];
  highlights: Highlight[];
  note: string;
  missionIds: string[];
  sourceKind: 'paste' | 'file' | 'web';
}

export interface AiSettings {
  enabled: boolean;
  baseUrl: string;
  model: string;
  apiKey: string;
}

export interface Settings {
  callsign: string;
  ai: AiSettings;
  liveIntel: boolean;
  webCapture: boolean;
  captureProxy: string;
  difficultyMode: 'adaptive' | 'manual';
  manualLevel: Difficulty;
}

export interface HistoryEntry {
  id: string;
  date: number;
  score: number;
  missionId: string;
  missionTitle: string;
  area: Area;
  difficulty: Difficulty;
}

export interface Profile {
  xp: number;
  level: number;
  streak: number;
  lastTrainingDay: string;
  completed: number;
  submitted: number;
  history: HistoryEntry[];
  skill: Record<DimensionId, number>;
  seenKeys: string[];
  lastGeneratedAt: number;
  generated: number;
  recentScores: number[];
  targetDifficulty: Difficulty;
  onboardingDone: boolean;
}

export interface AppData {
  settings: Settings;
  profile: Profile;
}

export interface Toast {
  id: string;
  text: string;
  tone: 'info' | 'good' | 'warn' | 'bad';
}

export interface ScanInfo {
  at: number;
  online: boolean;
  used: string[];
  anchors: number;
  note?: string;
}

export interface LiveAnchor {
  id: string;
  text: string;
  url: string;
  source: string;
  publishedAt: number;
  hints: Area[];
  place?: string;
  lat?: number;
  lon?: number;
}

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
