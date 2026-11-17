import type { Mission, Review } from '../types';
import { MIN_SOURCES } from './constants';
import { requiredAlternatives } from './generator';
import { wordCount } from './text';

export interface ProgressSection {
  key: string;
  label: string;
  done: boolean;
  detail: string;
}

export interface MissionProgress {
  percent: number;
  sections: ProgressSection[];
}

const filled = (value: string, min: number) => value.trim().length >= min;

export function reportProgress(mission: Mission): MissionProgress {
  const report = mission.report;
  const minSources = MIN_SOURCES[mission.difficulty];
  const sourceCount = report.sources.filter((s) => s.title.trim() || s.url.trim() || s.articleId).length;
  const answered = mission.pirs.filter((pir) => filled(report.answers[pir.id] ?? '', 60)).length;
  const judgments = report.judgments.filter((j) => filled(j.text, 20)).length;
  const alternatives = report.alternatives.filter((a) => filled(a.hypothesis, 8)).length;
  const altRequired = requiredAlternatives(mission.difficulty);

  const sections: ProgressSection[] = [
    {
      key: 'sources',
      label: 'Sources',
      done: sourceCount >= minSources,
      detail: `${sourceCount}/${minSources}`,
    },
    {
      key: 'bluf',
      label: 'BLUF',
      done: filled(report.bluf, 40),
      detail: filled(report.bluf, 40) ? `${wordCount(report.bluf)} words` : 'not written',
    },
    {
      key: 'judgments',
      label: 'Key judgments',
      done: judgments >= 2,
      detail: `${judgments} written`,
    },
    {
      key: 'pirs',
      label: 'PIR answers',
      done: answered === mission.pirs.length,
      detail: `${answered}/${mission.pirs.length}`,
    },
    {
      key: 'alternatives',
      label: 'Alternatives',
      done: alternatives >= altRequired,
      detail: `${alternatives}/${altRequired}`,
    },
    {
      key: 'gaps',
      label: 'Gaps & indicators',
      done: filled(report.gaps, 40) && filled(report.indicators, 30),
      detail: filled(report.gaps, 40) && filled(report.indicators, 30) ? 'complete' : 'incomplete',
    },
    {
      key: 'methods',
      label: 'Methods',
      done: filled(report.methods, 60),
      detail: filled(report.methods, 60) ? 'complete' : 'not written',
    },
  ];
  const weights: Record<string, number> = {
    sources: 20,
    bluf: 15,
    judgments: 15,
    pirs: 20,
    alternatives: 15,
    gaps: 10,
    methods: 5,
  };
  const percent = Math.round(
    sections.reduce((sum, section) => sum + (section.done ? weights[section.key] : 0), 0),
  );
  return { percent, sections };
}

export function latestReview(mission: Mission): Review | undefined {
  return mission.reviews[mission.reviews.length - 1];
}

export function sourceSummary(mission: Mission): {
  count: number;
  minimum: number;
  primary: number;
  unverified: number;
  cited: number;
} {
  const sources = mission.report.sources.filter((s) => s.title.trim() || s.url.trim() || s.articleId);
  return {
    count: sources.length,
    minimum: MIN_SOURCES[mission.difficulty],
    primary: sources.filter((s) => s.type === 'primary' || s.type === 'official' || s.type === 'dataset').length,
    unverified: sources.filter((s) => s.verification === 'unverified').length,
    cited: sources.filter((s) => s.reliability !== '?').length,
  };
}

export function missionWordCount(mission: Mission): number {
  const report = mission.report;
  return (
    wordCount(report.bluf) +
    report.judgments.reduce((sum, j) => sum + wordCount(j.text), 0) +
    Object.values(report.answers).reduce((sum, a) => sum + wordCount(a), 0) +
    report.alternatives.reduce(
      (sum, a) => sum + wordCount(a.hypothesis) + wordCount(a.supporting) + wordCount(a.contradicting) + wordCount(a.assessment),
      0,
    ) +
    wordCount(report.gaps) +
    wordCount(report.indicators) +
    wordCount(report.methods)
  );
}

export function statusLabel(mission: Mission): string {
  if (mission.status === 'offered') return 'OFFERED';
  if (mission.status === 'accepted') return mission.submittedAt ? 'SUBMITTED' : 'IN PROGRESS';
  if (mission.status === 'submitted') return 'UNDER REVIEW';
  if (mission.status === 'reviewed') return latestReview(mission)?.grade === 'F' ? 'REVISION REQUIRED' : 'REVIEWED';
  return 'ARCHIVED';
}

export function activeMissions(missions: Mission[]): Mission[] {
  return missions.filter((m) => m.status === 'accepted' || m.status === 'submitted');
}
