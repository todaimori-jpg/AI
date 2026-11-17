import type { Mission, Profile, Review } from '../types';
import { confidenceMeta, DEADLINE_HOURS, DIMENSIONS } from './constants';
import { requiredAlternatives } from './generator';
import { latestReview } from './status';
import { fmtDate } from './time';
import { downloadFile, safeFilename } from './download';

/**
 * KILN deck export.
 *
 * KILN (todaimori-jpg/kiln) is a browser-native node studio. A .kiln file is a
 * JSON patch: { kiln, title, res, fps, bpm, length, network, ops[] }. Slides
 * are rows in a Table DAT read by Text TOPs; a Count CHOP driven by keyboard
 * and buttons selects the row. This module builds that patch from the final
 * report so a supervisor can open the deck directly in KILN and present it.
 */

interface KilnOp {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  parent: string;
  inputs: (string | null)[];
  p: Record<string, unknown>;
  e: Record<string, string>;
  flags: { bypass: boolean; display: boolean; lock: boolean };
  color: null;
  comment: string;
}

interface Slide {
  kicker: string;
  title: string;
  body: string;
  meta: string;
}

const KILN_VERSION = '1.0.0';
const MONO = 'JetBrains Mono';
const SANS = 'Geist';
const SERIF = 'Instrument Serif';

function clean(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\{/g, '｛')
    .replace(/\}/g, '｝')
    .replace(/\u0000/g, '')
    .trim();
}

function clip(text: string, max: number): string {
  const value = text.trim();
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function chunk(text: string, max = 900): string[] {
  const cleaned = clean(text);
  if (!cleaned) return [''];
  if (cleaned.length <= max) return [cleaned];
  const paragraphs = cleaned.split(/\n{2,}/);
  const out: string[] = [];
  let current = '';
  const flush = () => {
    if (current.trim()) out.push(current.trim());
    current = '';
  };
  for (const para of paragraphs) {
    if (para.length > max) {
      flush();
      const sentences = para.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        if ((current + ' ' + sentence).trim().length > max && current) flush();
        current = `${current} ${sentence}`.trim();
        if (current.length > max) {
          out.push(current.slice(0, max));
          current = current.slice(max);
        }
      }
      flush();
      continue;
    }
    if ((current + '\n\n' + para).trim().length > max && current) flush();
    current = `${current}\n\n${para}`.trim();
  }
  flush();
  return out.length > 0 ? out : [''];
}

function judgementLine(mission: Mission, index: number): string {
  const judgment = mission.report.judgments[index];
  const meta = confidenceMeta(judgment.confidence);
  return `${index + 1}. [${meta.short} · ${meta.range}] ${clean(judgment.text)}`;
}

function sourceLine(mission: Mission, index: number): string {
  const source = mission.report.sources[index];
  const grade =
    source.reliability === '?' && source.credibility === '?'
      ? 'ungraded'
      : `${source.reliability}${source.credibility}`;
  const byline = [source.publisher, source.publishedAt].filter(Boolean).join(', ');
  return `${source.label} · ${grade} · ${clean(source.title || 'Untitled source')}${byline ? ` — ${clean(byline)}` : ''}\n${source.url}`;
}

function sourceSlides(mission: Mission): Slide[] {
  const sources = mission.report.sources.filter((s) => s.title.trim() || s.url.trim() || s.articleId);
  if (sources.length === 0) {
    return [
      {
        kicker: 'EVIDENCE',
        title: 'No sources were filed',
        body:
          'The source register is empty. A report without a register cannot be audited: there is nothing to open, date, or grade. This deck is a presentation of the filing copy, not an endorsement of it.',
        meta: 'SOURCE REGISTER',
      },
    ];
  }
  const out: Slide[] = [];
  const perSlide = 5;
  for (let start = 0; start < sources.length; start += perSlide) {
    const slice = sources.slice(start, start + perSlide);
    out.push({
      kicker: `EVIDENCE // ${start + 1}–${start + slice.length} OF ${sources.length}`,
      title: start === 0 ? 'Source register' : 'Source register, continued',
      body: slice
        .map((_, offset) => sourceLine(mission, start + offset))
        .join('\n\n'),
      meta: 'ADMIRALTY GRADE SHOWN WHERE ASSIGNED',
    });
  }
  return out;
}

function buildSlides(mission: Mission, profile: Profile, review?: Review): Slide[] {
  const slides: Slide[] = [];
  const report = mission.report;

  slides.push({
    kicker: 'ALL-SOURCE INTELLIGENCE // TRAINING EXERCISE',
    title: clean(mission.title),
    body: [
      `${mission.codename} · ${mission.code}`,
      clean(mission.tagline),
      '',
      `Anchor: ${clip(mission.anchor?.label ?? 'Standing collection point', 240)}`,
    ].join('\n'),
    meta: `${mission.priority} · DIFFICULTY ${mission.difficulty}/5 · ISSUED ${fmtDate(mission.createdAt)} · FILED ${fmtDate(report.updatedAt)}`,
  });

  const situation = mission.situation.split(/\n{2,}/).filter((para) => !/^LIVE LEAD —/.test(para.trim()));
  const situationText = situation.length > 1 ? situation.slice(1).join('\n\n') : mission.situation;
  const situationChunks = chunk(situationText, 950);
  situationChunks.forEach((part, index) => {
    slides.push({
      kicker: index === 0 ? 'SITUATION' : 'SITUATION // CONTINUED',
      title: index === 0 ? 'Why this tasking exists' : 'Situation, continued',
      body: part,
      meta: `INTENT: ${clip(mission.intent, 170)}`,
    });
  });

  slides.push({
    kicker: 'BOTTOM LINE UP FRONT',
    title: 'BLUF',
    body: report.bluf.trim() || 'The filing copy contains no BLUF. Present this as an acknowledged gap, not as a finding.',
    meta: 'ONE JUDGMENT, CONFIDENCE, AND WHY IT MATTERS',
  });

  const judgments = report.judgments.filter((judgment) => judgment.text.trim().length > 0);
  const judgmentChunks = judgments.length
    ? chunk(judgments.map((_, index) => judgementLine(mission, index)).join('\n\n'), 950)
    : ['No key judgments were written in the filing copy.'];
  judgmentChunks.forEach((part, index) => {
    slides.push({
      kicker: 'KEY JUDGMENTS',
      title: index === 0 ? 'What I judge, and how firmly' : 'Key judgments, continued',
      body: part,
      meta: 'PROBABILITY YARDSTICK APPLIED TO EVERY JUDGMENT',
    });
  });

  mission.pirs.forEach((pir, index) => {
    const answer = report.answers[pir.id] ?? '';
    const parts = chunk(answer.trim() || 'No answer was filed for this intelligence question.', 820);
    parts.forEach((part, partIndex) => {
      slides.push({
        kicker: `PIR ${index + 1} OF ${mission.pirs.length}${partIndex > 0 ? ' // CONTINUED' : ''}`,
        title: clip(clean(pir.question), 96),
        body: part,
        meta: partIndex === 0 ? clip(clean(pir.focus ?? ''), 180) : '',
      });
    });
  });

  const alternatives = report.alternatives.filter((alt) => alt.hypothesis.trim().length > 0);
  const altRequired = requiredAlternatives(mission.difficulty);
  if (alternatives.length === 0) {
    slides.push({
      kicker: 'ANALYSIS OF ALTERNATIVES',
      title: 'No competing hypotheses were tested',
      body: `The tasking asked for at least ${altRequired} alternatives. None were filed. A single-explanation product is a warning sign, not a finding.`,
      meta: 'ODNI STANDARD 4',
    });
  } else {
    alternatives.forEach((alt, index) => {
      const body = [
        `HYPOTHESIS\n${clean(alt.hypothesis)}`,
        `EVIDENCE FOR\n${clean(alt.supporting) || '—'}`,
        `EVIDENCE AGAINST\n${clean(alt.contradicting) || '—'}`,
        `ASSESSMENT\n${clean(alt.assessment) || '—'}`,
      ].join('\n\n');
      chunk(body, 950).forEach((part, partIndex) => {
        slides.push({
          kicker: `ALTERNATIVE ${index + 1} OF ${alternatives.length}`,
          title: partIndex === 0 ? 'Competing explanation' : 'Competing explanation, continued',
          body: part,
          meta: `REQUIRED: ${altRequired} · ASSESSED: ${alternatives.length}`,
        });
      });
    });
  }

  if (report.gaps.trim()) {
    chunk(report.gaps, 950).forEach((part) => {
      slides.push({
        kicker: 'INTELLIGENCE GAPS',
        title: 'What I still do not know',
        body: part,
        meta: 'GAPS MUST BECOME COLLECTION TASKS',
      });
    });
  }

  if (report.indicators.trim()) {
    chunk(report.indicators, 950).forEach((part) => {
      slides.push({
        kicker: 'INDICATORS & WARNING',
        title: 'What would change the judgment',
        body: part,
        meta: 'SPECIFIC, OBSERVABLE, TIME-BOUND',
      });
    });
  }

  if (report.methods.trim()) {
    chunk(report.methods, 950).forEach((part) => {
      slides.push({
        kicker: 'METHODS & PROVENANCE',
        title: 'How this was collected and checked',
        body: part,
        meta: 'REPRODUCIBLE COLLECTION',
      });
    });
  }

  slides.push(...sourceSlides(mission));

  if (review) {
    const dimensions = DIMENSIONS.map(
      (dimension) => `${dimension.label}: ${review.dimensions[dimension.id]}/100`,
    ).join('   ·   ');
    const findings = review.findings.slice(0, 6).map(
      (finding) => `[${finding.severity.toUpperCase()}] ${clean(finding.message)}${finding.task ? `\n   Task: ${clean(finding.task)}` : ''}`,
    );
    slides.push({
      kicker: `SUPERVISOR REVIEW // ATTEMPT ${review.attempt}`,
      title: `${review.score}/100 — ${review.gradeLabel}`,
      body: [
        `GRADE ${review.grade} · ${review.onTime ? 'ON TIME' : `LATE BY ${Math.round(review.lateByHours)}H`}`,
        '',
        dimensions,
        '',
        findings.length ? findings.join('\n\n') : 'No findings were recorded.',
      ].join('\n'),
      meta: `WORD COUNT ${review.wordCount} · ${review.findings.length} FINDING(S)`,
    });
    const strengths = review.findings.length === 0 && review.strengths.length > 0;
    if (strengths) {
      slides.push({
        kicker: 'SUPERVISOR REVIEW',
        title: 'What held up',
        body: review.strengths.map((strength) => `· ${clean(strength)}`).join('\n'),
        meta: 'KEEP THESE HABITS',
      });
    }
  }

  slides.push({
    kicker: 'END OF BRIEFING',
    title: 'Prepared for supervisor review',
    body: [
      `${mission.code} · ${mission.codename}`,
      `Time allowance: ${DEADLINE_HOURS[mission.difficulty]} hours · revision ${report.revision}`,
      `Training record: level ${profile.level}, ${profile.completed} completed mission(s)`,
      '',
      'All roles, deadlines and injected developments in this deck are simulated training context. Only the cited public sources are real. Sources marked UNVERIFIED have not been checked against the original record.',
    ].join('\n'),
    meta: 'UNCLASSIFIED // OPEN SOURCE // TRAINING EXERCISE',
  });

  return slides;
}

export interface KilnDeckOptions {
  callsign?: string;
}

export function buildKilnDeck(mission: Mission, profile: Profile, options: KilnDeckOptions = {}): Record<string, unknown> {
  const review = latestReview(mission);
  const slides = buildSlides(mission, profile, review);
  const count = slides.length;
  const callsign = clean((options.callsign ?? '').toUpperCase() || 'ANALYST');

  const ops: KilnOp[] = [];
  let serial = 0;
  const id = () => `stn${(serial += 1).toString(36)}`;
  const add = (
    type: string,
    name: string,
    x: number,
    y: number,
    p: Record<string, unknown> = {},
    e: Record<string, string> = {},
    flags: Partial<KilnOp['flags']> = {},
    comment = '',
  ): KilnOp => {
    const op: KilnOp = {
      id: id(),
      type,
      name,
      x,
      y,
      parent: 'root',
      inputs: [],
      p,
      e,
      flags: { bypass: false, display: false, lock: false, ...flags },
      color: null,
      comment,
    };
    ops.push(op);
    return op;
  };
  const wire = (from: KilnOp, to: KilnOp, index = 0) => {
    while (to.inputs.length <= index) to.inputs.push(null);
    to.inputs[index] = from.id;
  };
  const byName = (name: string): KilnOp => {
    const found = ops.find((op) => op.name === name);
    if (!found) throw new Error(`KILN deck: missing op ${name}`);
    return found;
  };

  const table: string[][] = [
    ['kicker', 'title', 'body', 'meta'],
    ...slides.map((slide) => [clean(slide.kicker), clean(slide.title), slide.body, clean(slide.meta)]),
  ];

  add('tableDAT', 'slides', 0, 4, { table }, {}, {}, 'One row per slide. Edit this table to edit the deck.');
  add('keyboardinCHOP', 'keyboard1', 0, 2, { keys: 'arrowright arrowleft' });
  add('buttonCOMP', 'btnNext', 1, 3, { label: 'Next →' });
  add('buttonCOMP', 'btnPrev', 2, 3, { label: '← Prev' });
  add(
    'constantCHOP',
    'steps',
    1,
    2,
    { name0: 'next', name1: 'prev' },
    {
      value0: "max(op('keyboard1')['arrowright'], op('btnNext')[0])",
      value1: "max(op('keyboard1')['arrowleft'], op('btnPrev')[0])",
    },
  );
  const steps = byName('steps');
  const countOp = add('countCHOP', 'slide', 2, 2, { limit: 'loop', min: 1, max: count });
  wire(steps, countOp);
  const lag = add('lagCHOP', 'slidelag', 3, 2, { up: 0.35, down: 0.35 });
  wire(countOp, lag);

  const ramp = add(
    'rampTOP',
    'bg',
    0,
    0,
    { c1: '#06090a', c2: '#101c1e', c3: '#f2b45a', mid: 0.72 },
    { angle: "100 + op('slidelag')[0]*18" },
  );
  const grain = add('noiseTOP', 'grain', 0, 1, {
    period: 1.4,
    speed: 0.04,
    color1: '#000000',
    color2: '#222a2c',
  });
  const bg = add('compositeTOP', 'bgcomp', 1, 0, { operation: 'screen' });
  wire(ramp, bg, 0);
  wire(grain, bg, 1);

  const ring = add(
    'circleTOP',
    'ring',
    1,
    1,
    { ring: 0.0022, color: '#f2b45a', cy: 0.02, soft: 0.02 },
    { radius: "0.34 + sin(t*0.4)*0.006", cx: "1.22 - op('slidelag')[0]*0.026" },
  );

  const transition = "clamp(1 - abs(op('slide')[0]-op('slidelag')[0])*1.8, 0, 1)";
  const kicker = add(
    'textTOP',
    'kicker',
    2,
    1,
    {
      dat: 'slides',
      colI: 0,
      font: MONO,
      size: 1.7,
      weight: '500',
      upper: true,
      tracking: 0.22,
      color: '#f2b45a',
      alignx: 'left',
      aligny: 'top',
      wrap: 76,
      px: 0.16,
      py: -0.015,
      alpha: 0.9,
    },
    { row: "op('slide')[0]", alpha: transition },
  );
  const title = add(
    'textTOP',
    'title',
    2,
    0,
    {
      dat: 'slides',
      colI: 1,
      font: SERIF,
      weight: '400',
      size: 5.4,
      color: '#f4f0e8',
      alignx: 'left',
      aligny: 'top',
      wrap: 74,
      px: 0.16,
      py: -0.16,
      leading: 1.06,
    },
    { row: "op('slide')[0]", reveal: transition },
  );
  const body = add(
    'textTOP',
    'body',
    3,
    1,
    {
      dat: 'slides',
      colI: 2,
      font: SANS,
      weight: '400',
      size: 2.35,
      color: '#d8d3ca',
      alignx: 'left',
      aligny: 'top',
      wrap: 74,
      px: 0.16,
      py: -0.46,
      leading: 1.5,
      alpha: 0.96,
    },
    { row: "op('slide')[0]", alpha: transition },
  );
  const footer = add(
    'textTOP',
    'meta',
    3,
    0,
    {
      dat: 'slides',
      colI: 3,
      font: MONO,
      size: 1.15,
      weight: '400',
      upper: true,
      tracking: 0.12,
      color: '#7d8f92',
      alignx: 'left',
      aligny: 'bottom',
      wrap: 70,
      px: 0.16,
      py: -0.02,
    },
    { row: "op('slide')[0]" },
  );
  const page = add('textTOP', 'pagenum', 4, 1, {
    text: `{round(op('slide')[0])} / ${count}`,
    font: MONO,
    size: 1.5,
    color: '#f2b45a',
    alignx: 'right',
    aligny: 'bottom',
    wrap: 92,
    px: 0.16,
    py: -0.02,
    alpha: 0.7,
  });

  const slideComp = add('compositeTOP', 'slidecomp', 4, 0, { operation: 'over' });
  [bg, ring, kicker, title, body, footer, page].forEach((op, index) => wire(op, slideComp, index));

  const film = add('filmTOP', 'film', 5, 0, { grain: 0.035, vignette: 0.42 });
  wire(slideComp, film);
  const out = add('outTOP', 'out', 6, 0, {}, {}, { display: true });
  wire(film, out);

  add(
    'textDAT',
    'briefing',
    5,
    2,
    {
      text: [
        `STATION briefing deck — ${mission.code} / ${mission.codename}`,
        `Prepared by ${callsign}. ${count} slides.`,
        '',
        'Present: press P (or F1) for perform mode; arrow keys or Next/Prev step the deck.',
        'Edit copy in the slides Table DAT — one row per slide.',
        'Every slide is generated from the filed report; this deck is not an endorsement of the judgments.',
      ].join('\n'),
    },
  );

  return {
    kiln: KILN_VERSION,
    title: `STATION — ${mission.code} ${mission.codename}`,
    res: { w: 1920, h: 1080 },
    fps: 60,
    bpm: 120,
    length: 30,
    network: 'root',
    ops,
  };
}

export function downloadKilnDeck(mission: Mission, profile: Profile, callsign?: string): void {
  const deck = buildKilnDeck(mission, profile, { callsign });
  const filename = `${safeFilename(`STATION_${mission.code}_${mission.codename}`)}.kiln`;
  downloadFile(filename, JSON.stringify(deck, null, 1), 'application/json');
}
