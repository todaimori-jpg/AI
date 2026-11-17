import type {
  AiMessage,
  AiSettings,
  Article,
  DimensionId,
  Mission,
  Review,
  ReviewFinding,
  Severity,
  SupervisorMessage,
} from '../types';
import { DEADLINE_HOURS, DIMENSIONS, MIN_SOURCES, confidenceMeta, dimensionMeta } from './constants';
import { requiredAlternatives } from './generator';
import { evaluateMission } from './evaluator';
import { chatCompletion, parseJsonLoose, AiError } from './ai';
import { countdown, fmtDate, fmtDateTime } from './time';
import { hashString } from './rng';
import { truncate, wordCount } from './text';
import { uid } from './ids';

const filledSources = (mission: Mission) =>
  mission.report.sources.filter((s) => s.title.trim() || s.url.trim() || s.articleId);

const filledAlternatives = (mission: Mission) =>
  mission.report.alternatives.filter((a) => a.hypothesis.trim().length >= 8);

const unansweredPirs = (mission: Mission) =>
  mission.pirs.filter((pir) => (mission.report.answers[pir.id] ?? '').trim().length < 60);

function deadlineLine(mission: Mission): string {
  const c = countdown(mission.dueAt - Date.now());
  if (c.overdue) return `You are ${c.text} PAST the deadline. Submit what you have with explicit gaps.`;
  return `Deadline in ${c.text}${c.urgent ? ' — this is now a time problem, not a collection problem.' : '.'}`;
}

function firstUsefulVector(mission: Mission): string {
  const vector = mission.vectors.find((v) => v.url) ?? mission.vectors[0];
  if (!vector) return 'the primary source named in your tasking';
  return `${vector.label}${vector.url ? ` (${vector.url})` : ''}`;
}

export function buildIntro(mission: Mission): string {
  const hours = DEADLINE_HOURS[mission.difficulty];
  const minSources = MIN_SOURCES[mission.difficulty];
  const alt = requiredAlternatives(mission.difficulty);
  return [
    `Tasking is live. ${mission.code} / ${mission.codename} — the clock starts now: ${hours} hours.`,
    `Start with ${firstUsefulVector(mission)}. Confirm the specific case, the date, and the locator before you read commentary about it.`,
    `For a passable product I need: every one of the ${mission.pirs.length} questions answered, at least ${minSources} distinct sources with ${alt} seriously tested alternatives, and every key judgment carrying a confidence and a citation.`,
    `First question: ${mission.pirs[0]?.question ?? mission.intent}`,
  ].join('\n\n');
}

function actions(mission: Mission): string[] {
  const out: string[] = [];
  const sources = filledSources(mission);
  const minSources = MIN_SOURCES[mission.difficulty];
  const alts = filledAlternatives(mission);
  const altRequired = requiredAlternatives(mission.difficulty);
  const report = mission.report;

  if (sources.length < minSources) {
    out.push(
      `Log sources. You have ${sources.length}; the tasking requires ${minSources}. Start with ${firstUsefulVector(mission)}.`,
    );
  }
  if (!report.bluf.trim()) {
    out.push('Write the BLUF: one judgment, its confidence, and why the consumer should care. Do not open with background.');
  }
  if (report.judgments.filter((j) => j.text.trim()).length < 2) {
    out.push('Draft at least two key judgments. Each needs a citation tag and a confidence level.');
  }
  const missing = unansweredPirs(mission);
  if (missing.length > 0) {
    out.push(`Answer PIR ${mission.pirs.findIndex((p) => p.id === missing[0].id) + 1}: “${missing[0].question}”`);
  }
  if (alts.length < altRequired) {
    out.push(
      `Build ${altRequired - alts.length} more alternative${altRequired - alts.length === 1 ? '' : 's'}. For each, state the best evidence for it and the evidence against it.`,
    );
  }
  if (!report.gaps.trim()) {
    out.push('Write the gaps section. Name what you could not verify and the exact collection step that would close it.');
  }
  if (!report.indicators.trim()) {
    out.push('Add at least two observable indicators that would change your judgment, with a time window.');
  }
  if (!report.methods.trim()) {
    out.push('Add a short methods note: collection path, verification method, and how you assigned confidence.');
  }
  if (out.length === 0) {
    out.push('Run the pre-submission audit, fix the highest-severity item, then submit. Do not gold-plate it.');
  }
  return out.slice(0, 3);
}

export function draftAudit(mission: Mission, articles: Article[]): string {
  const review = evaluateMission(mission, articles);
  if (wordCount(mission.report.bluf + mission.report.gaps + mission.report.methods) < 30 && filledSources(mission).length === 0) {
    return [
      'There is not enough on the page to audit. That is not a criticism; it is a sequencing problem.',
      '',
      'Do this first: pick the case, read the primary record, and log three sources with what each one establishes. Then write a two-sentence BLUF. Bring it back and I will tear into the reasoning.',
      '',
      `Start here: ${firstUsefulVector(mission)}`,
    ].join('\n');
  }
  const top = review.findings.filter((f) => f.severity !== 'note').slice(0, 3);
  const lines = [
    `DRAFT AUDIT — ${review.score}/100 (${review.gradeLabel}). This is the mechanical tradecraft check, not the final review.`,
    '',
  ];
  if (top.length === 0) {
    lines.push('No structural defects detected. The remaining risk is substantive: whether the evidence actually supports the lead judgment.');
  } else {
    lines.push('Priority fixes:');
    top.forEach((finding, index) => {
      lines.push(
        `${index + 1}. [${dimensionMeta(finding.dimension).short}] ${finding.message}${finding.task ? ` — ${finding.task}` : ''}`,
      );
    });
  }
  if (review.strengths.length > 0) {
    lines.push('', `Holding up: ${review.strengths[0]}`);
  }
  lines.push('', deadlineLine(mission));
  return lines.join('\n');
}

function sourceAdvice(mission: Mission, articles: Article[]): string {
  const linked = articles.filter((a) => a.missionIds.includes(mission.id));
  const vectors = mission.vectors.slice(0, 3);
  const lines = [
    `Your evidence base currently has ${filledSources(mission).length} logged source${filledSources(mission).length === 1 ? '' : 's'} and ${linked.length} offline article${linked.length === 1 ? '' : 's'} linked to this mission.`,
    '',
    'Source discipline for this tasking:',
    `1. ${vectors[0]?.label ?? 'Primary record'}${vectors[0]?.url ? ` — ${vectors[0].url}` : ''}. ${vectors[0]?.note ?? 'Start upstream.'}`,
  ];
  if (vectors[1]) lines.push(`2. ${vectors[1].label}${vectors[1].url ? ` — ${vectors[1].url}` : ''}. ${vectors[1].note ?? ''}`);
  lines.push(
    '',
    'For each source, record what it establishes, not just that it exists. Grade the source, mark whether it is primary or secondary, and state whether you verified it. Repetition of the same wire item by five outlets is one source, not five.',
    '',
    'Which of your sources is closest to a primary record? That is where the next hour should go.',
  );
  return lines.join('\n');
}

function challengeClaim(): string {
  return [
    'That is a claim, not yet evidence. Before it enters the assessment, answer three things:',
    '1. Who is the original source, and how would I check it independently?',
    '2. What is the date and location, and does the content actually establish them?',
    '3. Is this an observation, an inference, or repetition of someone else’s inference?',
    '',
    'If it is your inference, label it. If it is someone else’s, cite the primary record underneath it. Then tell me whether it changes your lead judgment and why.',
  ].join('\n');
}

function probe(mission: Mission, seed: string): string {
  const probes = [
    'What single piece of evidence would overturn your lead judgment? If you cannot name it, you have a belief, not an assessment.',
    'Which of your sources has the weakest provenance, and what did you do to compensate for it?',
    'What are you treating as a fact that is actually an assumption? Be specific.',
    'If the opposite of your BLUF were true, what would the reporting and data look like? Do you actually see that pattern, or are you pattern-matching?',
    'Which intelligence question cannot be answered with open sources, and what is your collection plan for it?',
    'What changed your confidence between your first read and now? If nothing did, explain why the evidence is that consistent.',
    'Where is the seam between what the source says and what you concluded? Quote both.',
  ];
  const index = hashString(seed + mission.id) % probes.length;
  const base = probes[index];
  return `${base}\n\n${deadlineLine(mission)}`;
}

export function offlineSupervisorReply(mission: Mission, articles: Article[], userText: string): string {
  const text = userText.trim();
  const lower = text.toLowerCase();
  const sources = filledSources(mission);

  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(lower)) {
    return `I am here. ${deadlineLine(mission)} The tasking is ${mission.code} / ${mission.codename}. ${actions(mission)[0]} What is your first question?`;
  }

  if (/\b(review|grade|score|feedback|rate my|assess (my|the) (draft|report)|how am i doing)\b/.test(lower)) {
    return draftAudit(mission, articles);
  }

  if (/\b(what should i|next step|where do i start|help|stuck|what now|how do i proceed)\b/.test(lower)) {
    return `Do these in order:\n\n${actions(mission).map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n${deadlineLine(mission)}`;
  }

  if (/\b(source|sources|citation|cite|reference|evidence|verify|provenance)\b/.test(lower)) {
    return sourceAdvice(mission, articles);
  }

  if (/\b(deadline|time left|how long|due)\b/.test(lower)) {
    return `${deadlineLine(mission)}\n\nIf collection is incomplete, the right move is an honest product with explicit gaps, not a late perfect one. What do you still need that you cannot get in the remaining time?`;
  }

  if (/\b(inject|update|new reporting|sitrep|development)\b/.test(lower)) {
    return 'Use REQUEST UPDATE on the tasking panel. I will add a verified public-source item if one exists, or an explicitly labeled training inject if you need a decision exercise. I will not invent reporting in this chat.';
  }

  if (/\b(confidence|certain|likely|probability|yardstick)\b/.test(lower)) {
    const level = confidenceMeta('likely');
    return `Use the standard yardstick, not mood words. For example, “likely” means ${level.range}, with a stated basis. Confidence is about the strength of the evidence and the soundness of the reasoning, not how strongly you feel.\n\nWhat is the evidence base for the confidence you chose? Name the sources and the gap that keeps it from being higher.`;
  }

  if (/\b(alternative|hypothesis|competing explanation|ach)\b/.test(lower)) {
    return `Alternatives are tests, not decorations. For each one: state the hypothesis, the best evidence for it, the evidence against it, and whether it is more or less likely than your lead. If every alternative you list is obviously weaker, you have not done the analysis.\n\nWhat is the strongest alternative you have not written down yet?`;
  }

  if (/\b(task|tasking|brief|pir|question|clarify|what am i (doing|looking for))\b/.test(lower)) {
    return [
      `The tasking is ${mission.code} / ${mission.codename}: ${mission.tagline}`,
      '',
      `Intent: ${mission.intent}`,
      `Deliverable: ${mission.deliverable.format}, maximum ${mission.deliverable.maxWords} words.`,
      `Questions: ${mission.pirs.length}. First: “${mission.pirs[0]?.question}”`,
      '',
      'Ask me about a specific question, source, or judgment. I will not do the collection for you, but I will tell you where your reasoning is thin.',
    ].join('\n');
  }

  if (text.length > 120 && !/\[S\d+\]/.test(text) && !/https?:\/\//.test(text) && !text.endsWith('?')) {
    return challengeClaim();
  }

  if (text.endsWith('?') && /\b(why|how)\b/.test(lower) && sources.length < MIN_SOURCES[mission.difficulty]) {
    return `Before I answer that, ground it: you are still below the source minimum (${sources.length} of ${MIN_SOURCES[mission.difficulty]}). Additional analysis on a thin base will not survive review.\n\n${actions(mission)[0]}`;
  }

  return probe(mission, text || String(Date.now()));
}

function clip(text: string, max: number): string {
  const value = (text ?? '').trim();
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function missionContext(mission: Mission, articles: Article[]): string {
  const report = mission.report;
  const linkedArticles = articles.filter(
    (a) => a.missionIds.includes(mission.id) || report.sources.some((s) => s.articleId === a.id),
  );
  const sections: string[] = [];
  sections.push(
    [
      'TRAINING CONTEXT',
      `Exercise role: all-source analyst trainee. Supervisor: you. This is an open-source exercise, not a real operation.`,
      `Mission: ${mission.code} / ${mission.codename} — ${mission.title} (${mission.area}, difficulty ${mission.difficulty}/5).`,
      `Tasking intent: ${mission.intent}`,
      `Situation: ${clip(mission.situation, 1200)}`,
      `Deadline: ${fmtDateTime(mission.dueAt)} (current time ${fmtDateTime(Date.now())}).`,
      `Deliverable: ${mission.deliverable.format}; max ${mission.deliverable.maxWords} words; minimum ${MIN_SOURCES[mission.difficulty]} sources; ${requiredAlternatives(mission.difficulty)} alternatives.`,
      `Intelligence questions:\n${mission.pirs.map((p, i) => `${i + 1}. ${p.question}${p.focus ? ` (Focus: ${p.focus})` : ''}`).join('\n')}`,
      `Collection vectors:\n${mission.vectors.slice(0, 7).map((v) => `- ${v.label}${v.url ? ` — ${v.url}` : ''}${v.note ? ` (${v.note})` : ''}`).join('\n')}`,
    ].join('\n'),
  );

  if (mission.anchor) {
    sections.push(
      `ANCHOR: ${mission.anchor.kind.toUpperCase()} — ${mission.anchor.label}\nSource: ${mission.anchor.source}${mission.anchor.url ? ` (${mission.anchor.url})` : ''}\nNote: ${mission.anchor.detail ?? ''}`,
    );
  }

  if (mission.updates.length > 0) {
    sections.push(
      `SUPERVISOR UPDATES / INJECTS:\n${mission.updates
        .slice(-3)
        .map((u) => `- [${u.classification}] ${u.title}: ${clip(u.body, 350)}`)
        .join('\n')}`,
    );
  }

  const sourceLines = filledSources(mission)
    .slice(0, 8)
    .map(
      (s) =>
        `- [${s.label}] ${s.title || '(untitled)'} — ${s.publisher || 'unknown publisher'}${s.url ? ` — ${s.url}` : ''}; type ${s.type}; reliability ${s.reliability}${s.credibility}; verification ${s.verification}${s.excerpt ? `; excerpt: “${clip(s.excerpt, 240)}”` : ''}`,
    );
  sections.push(`ANALYST SOURCE REGISTER:\n${sourceLines.length ? sourceLines.join('\n') : '(empty)'}`);

  if (linkedArticles.length > 0) {
    sections.push(
      `OFFLINE EVIDENCE LIBRARY (analyst-saved excerpts; you cannot open URLs):\n${linkedArticles
        .slice(0, 4)
        .map((a) => `- ${a.title} (${a.publisher || 'unknown'}, saved ${fmtDate(a.savedAt)}): ${clip(a.blocks.slice(0, 3).join(' '), 500)}`)
        .join('\n')}`,
    );
  }

  sections.push(
    [
      'DRAFT REPORT',
      `BLUF: ${report.bluf || '(empty)'}`,
      `Key judgments:\n${report.judgments.filter((j) => j.text.trim()).map((j, i) => `${i + 1}. [${confidenceMeta(j.confidence).label}] ${j.text}`).join('\n') || '(empty)'}`,
      `PIR answers:\n${mission.pirs.map((p, i) => `${i + 1}. ${clip(report.answers[p.id] ?? '', 700) || '(empty)'}`).join('\n')}`,
      `Alternatives:\n${report.alternatives.filter((a) => a.hypothesis.trim()).map((a, i) => `${i + 1}. ${a.hypothesis}\n   For: ${clip(a.supporting, 300) || '(empty)'}\n   Against: ${clip(a.contradicting, 300) || '(empty)'}\n   Assessment: ${clip(a.assessment, 200) || '(empty)'}`).join('\n') || '(empty)'}`,
      `Gaps: ${clip(report.gaps, 600) || '(empty)'}`,
      `Indicators: ${clip(report.indicators, 500) || '(empty)'}`,
      `Methods: ${clip(report.methods, 600) || '(empty)'}`,
    ].join('\n'),
  );

  return sections.join('\n\n');
}

export function aiSystemPrompt(mission: Mission, articles: Article[]): string {
  return [
    'You are the supervising all-source intelligence analyst for a training exercise. You are demanding, specific, and fair. The trainee does the research; you provide direction, challenge, and critique.',
    '',
    'NON-NEGOTIABLE RULES:',
    '- Never invent facts, events, dates, sources, quotations, or URLs. You cannot browse the web in this app. Do not claim to have opened, read, or verified any link. Sources are unverified unless the context explicitly says otherwise.',
    '- Do not write the substantive analysis or do the research for the trainee. Give direction, methods, and critique. If asked to do the work, refuse and give a collection approach.',
    '- If you introduce a hypothetical, label it exactly “TRAINING INJECT — SIMULATED” and state it is not citable evidence.',
    '- Enforce the public ODNI analytic standards: source quality, expressions of uncertainty, separation of information from judgment, alternatives, customer relevance, logical argument, and objectivity.',
    '- Quote the trainee’s exact words when criticizing. Identify unsupported claims, single-source assertions, missing disconfirming evidence, and confidence that exceeds the evidence.',
    '- Be concise: normally under 250 words. A full draft review may run to 500. Ask at most one focused question per turn unless giving a structured review.',
    '- Do not flatter. Do not pad. No headings unless the trainee asked for a formal review.',
    '',
    'You are coaching tradecraft, not performing a persona.',
    '',
    missionContext(mission, articles),
  ].join('\n');
}

export interface SupervisorTurn {
  mode: 'ai' | 'offline';
  text: string;
  error?: string;
}

export async function supervisorTurn(
  settings: AiSettings,
  mission: Mission,
  articles: Article[],
  priorMessages: SupervisorMessage[],
  userText: string,
): Promise<SupervisorTurn> {
  if (!settings.enabled || !settings.apiKey.trim()) {
    return { mode: 'offline', text: offlineSupervisorReply(mission, articles, userText) };
  }
  const history: AiMessage[] = priorMessages
    .filter((m) => m.kind !== 'system')
    .slice(-14)
    .map((m) => ({
      role: m.role === 'analyst' ? 'user' : 'assistant',
      content: clip(m.text, 1600),
    }));
  try {
    const text = await chatCompletion(
      settings,
      [
        { role: 'system', content: aiSystemPrompt(mission, articles) },
        ...history,
        { role: 'user', content: userText },
      ],
      { maxTokens: 800, temperature: 0.35, timeoutMs: 60000 },
    );
    return { mode: 'ai', text };
  } catch (error) {
    const message = error instanceof AiError ? error.message : (error as Error).message;
    const fallback = offlineSupervisorReply(mission, articles, userText);
    return {
      mode: 'offline',
      text: `${fallback}\n\n[AI supervisor unavailable: ${message}. Using the offline tradecraft engine.]`,
      error: message,
    };
  }
}

export interface AiReviewPayload {
  narrative: string;
  strengths: string[];
  findings: ReviewFinding[];
}

const DIMENSION_IDS = new Set(DIMENSIONS.map((d) => d.id));
const SEVERITIES = new Set<Severity>(['critical', 'major', 'minor', 'note']);

export async function aiReview(
  settings: AiSettings,
  mission: Mission,
  articles: Article[],
  audit: Review,
): Promise<AiReviewPayload | null> {
  if (!settings.enabled || !settings.apiKey.trim()) return null;
  const deterministic = audit.findings
    .slice(0, 12)
    .map((f) => `- [${f.severity}/${f.dimension}] ${f.message}`)
    .join('\n');
  const prompt = [
    'Review the analyst’s draft as the supervising analyst. Return JSON only with this shape:',
    '{"narrative":"<=250 words, direct feedback to the analyst","strengths":["specific strengths"],"findings":[{"dimension":"sourcing|evidence|uncertainty|alternatives|gaps|objectivity|structure","severity":"critical|major|minor|note","message":"specific critique","evidence":"exact quote from the draft, if any","task":"concrete revision task"}]}',
    '',
    'Rules: do not repeat the mechanical findings listed below unless you can add substance; do not invent facts or sources; do not claim to have verified links; do not rewrite the report. Focus on whether the evidence actually supports the key judgments, whether the alternatives are real tests, and whether confidence is calibrated. Maximum 6 findings, ordered by importance.',
    '',
    'MECHANICAL AUDIT ALREADY RUN:',
    `Score: ${audit.score}/100. Dimension scores: ${DIMENSIONS.map((d) => `${d.short} ${audit.dimensions[d.id]}`).join(', ')}.`,
    deterministic || '(no mechanical findings)',
    '',
    missionContext(mission, articles),
  ].join('\n');

  const raw = await chatCompletion(
    settings,
    [
      {
        role: 'system',
        content: 'You are a rigorous intelligence tradecraft reviewer. Output valid JSON only. Never fabricate sources or claim to have accessed URLs.',
      },
      { role: 'user', content: prompt },
    ],
    { maxTokens: 1100, temperature: 0.25, json: true, timeoutMs: 75000 },
  );
  const parsed = parseJsonLoose<{
    narrative?: unknown;
    strengths?: unknown;
    findings?: unknown;
  }>(raw);
  if (!parsed) return null;
  const narrative = typeof parsed.narrative === 'string' ? parsed.narrative.trim() : '';
  if (!narrative) return null;
  const strengths = Array.isArray(parsed.strengths)
    ? parsed.strengths.filter((s): s is string => typeof s === 'string').slice(0, 5)
    : [];
  const rawFindings = Array.isArray(parsed.findings) ? parsed.findings : [];
  const findings: ReviewFinding[] = [];
  for (const item of rawFindings.slice(0, 6)) {
    const record = item as Record<string, unknown>;
    const dimension =
      typeof record.dimension === 'string' && DIMENSION_IDS.has(record.dimension as DimensionId)
        ? (record.dimension as DimensionId)
        : 'evidence';
    const severity =
      typeof record.severity === 'string' && SEVERITIES.has(record.severity as Severity)
        ? (record.severity as Severity)
        : 'minor';
    const message = typeof record.message === 'string' ? record.message.trim() : '';
    if (!message) continue;
    findings.push({
      id: uid('f'),
      dimension,
      severity,
      message: truncate(message, 500),
      evidence: typeof record.evidence === 'string' ? truncate(record.evidence, 300) : undefined,
      task: typeof record.task === 'string' ? truncate(record.task, 300) : undefined,
      origin: 'supervisor',
    });
  }
  return { narrative, strengths, findings };
}
