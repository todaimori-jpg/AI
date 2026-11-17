import type { Profile, Settings } from '../types';

export const DEFAULT_SETTINGS: Settings = {
  callsign: 'ANALYST',
  ai: {
    enabled: false,
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    apiKey: '',
  },
  liveIntel: true,
  webCapture: true,
  captureProxy: '',
  difficultyMode: 'adaptive',
  manualLevel: 2,
};

export const DEFAULT_PROFILE: Profile = {
  xp: 0,
  level: 1,
  streak: 0,
  lastTrainingDay: '',
  completed: 0,
  submitted: 0,
  history: [],
  skill: {
    sourcing: 55,
    evidence: 50,
    uncertainty: 45,
    alternatives: 45,
    gaps: 45,
    objectivity: 55,
    structure: 50,
  },
  seenKeys: [],
  lastGeneratedAt: 0,
  generated: 0,
  recentScores: [],
  targetDifficulty: 2,
  onboardingDone: false,
};

export function mergeSettings(input?: Partial<Settings>): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...input,
    ai: { ...DEFAULT_SETTINGS.ai, ...(input?.ai ?? {}) },
  };
}

export function mergeProfile(input?: Partial<Profile>): Profile {
  const target = input?.targetDifficulty ?? DEFAULT_PROFILE.targetDifficulty;
  return {
    ...DEFAULT_PROFILE,
    ...input,
    skill: { ...DEFAULT_PROFILE.skill, ...(input?.skill ?? {}) },
    history: Array.isArray(input?.history) ? input.history : [],
    seenKeys: Array.isArray(input?.seenKeys) ? input.seenKeys : [],
    recentScores: Array.isArray(input?.recentScores) ? input.recentScores : [],
    targetDifficulty: Math.min(5, Math.max(1, Math.round(target))) as Profile['targetDifficulty'],
  };
}
