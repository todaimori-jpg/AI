import type {
  Article,
  DimensionId,
  EvidenceSource,
  Mission,
  Review,
  ReviewFinding,
  Severity,
  SourceAudit,
} from '../types';
import {
  CONFIDENCE_LEVELS,
  DIMENSIONS,
  MIN_SOURCES,
  dimensionMeta,
  gradeForScore,
} from './constants';
import { hoursBetween } from './time';
import {
  absoluteLanguage,
  domainOf,
  excerptContains,
  extractCitations,
  jaccard,
  lineItems,
  safeHttpUrl,
  splitSentences,
  truncate,
  unsupportedClaimSentences,
  wordCount,
} from './text';
import { requiredAlternatives } from './generator';
import { uid } from './ids';

interface Deductions {
  [key: string]: number;
}

function sourceFilled(source: EvidenceSource): boolean {
  return Boolean(source.title.trim() || source.url.trim() || source.articleId);
}

function primaryish(source: EvidenceSource): boolean {
  return ['primary', 'official', 'dataset', 'imagery'].includes(source.type);
}

export function missionWordCount(mission: Mission): number {
  const r = mission.report;
  return wordCount(
    [
      r.bluf,
      ...r.judgments.map((j) => j.text),
      ...Object.values(r.answers),
      ...r.alternatives.flatMap((a) => [a.hypothesis, a.supporting, a.contradicting, a.assessment]),
      r.gaps,
      r.indicators,
      r.methods,
    ].join(' '),
  );
}

export function evaluateMission(mission: Mission, articles: Article[], now = Date.now()): Review {
  const report = mission.report;
  const deductions: Deductions = Object.fromEntries(DIMENSIONS.map((d) => [d.id, 0]));
  const findings: ReviewFinding[] = [];
  const strengths: string[] = [];

  const add = (
    dimension: DimensionId,
    points: number,
    severity: Severity,
    message: string,
    evidence?: string,
    task?: string,
  ) => {
    deductions[dimension] = (deductions[dimension] ?? 0) + points;
    findings.push({
      id: uid('f'),
      dimension,
      severity,
      message,
      evidence: evidence ? truncate(evidence, 260) : undefined,
      task,
      origin: 'audit',
    });
  };

  const sources = report.sources.filter(sourceFilled);
  const minSources = MIN_SOURCES[mission.difficulty];

  // ── SOURCING ─────────────────────────────────────────────────────────────
  if (sources.length === 0) {
    add(
      'sourcing',
      58,
      'critical',
      'No usable sources are logged. An assessment without a source base cannot be audited.',
      undefined,
      'Add at least the tasking minimum of distinct sources, with locators and a short note on what each establishes.',
    );
  } else if (sources.length < minSources) {
    const deficit = minSources - sources.length;
    add(
      'sourcing',
      10 + deficit * 8,
      'major',
      `The source base has ${sources.length} distinct source${sources.length === 1 ? '' : 's'}; this tasking requires at least ${minSources}.`,
      undefined,
      'Add independent sources. Do not pad the count with republished copies of the same reporting.',
    );
  } else {
    strengths.push(`Source base meets the tasking minimum (${sources.length} sources).`);
  }

  const primaryCount = sources.filter(primaryish).length;
  if (sources.length > 0 && primaryCount === 0) {
    add(
      'sourcing',
      14,
      'major',
      'No primary, official, dataset, or imagery source is present. The analysis rests on secondary accounts.',
      undefined,
      'Collect at least one original record: a notice, filing, dataset, official statement, or image you can inspect yourself.',
    );
  } else if (sources.length >= 3 && primaryCount / sources.length < 0.34) {
    add(
      'sourcing',
      6,
      'minor',
      `Only ${primaryCount} of ${sources.length} sources are primary, official, dataset, or imagery.`,
      undefined,
      'Move upstream from reporting about a document to the document itself.',
    );
  }

  const typeCount = new Set(sources.map((s) => s.type)).size;
  if (sources.length >= 2 && typeCount === 1) {
    add(
      'sourcing',
      7,
      'minor',
      'All sources share a single source type. This suggests a narrow collection path, not corroboration.',
      undefined,
      'Seek at least one source from a different collection discipline (official record, dataset, imagery, NGO, academic).',
    );
  }

  const domains = new Map<string, number>();
  sources.forEach((s) => {
    const domain = domainOf(s.url);
    if (domain) domains.set(domain, (domains.get(domain) ?? 0) + 1);
  });
  if (sources.length >= 3 && domains.size === 1 && [...domains.values()][0] === sources.length) {
    add(
      'sourcing',
      11,
      'major',
      `Every source resolves to the same domain (${[...domains.keys()][0]}). That is one publishing chain, not independent corroboration.`,
      undefined,
      'Find an independent collection chain: an official record, a different publisher, or a dataset.',
    );
  }

  const urlCounts = new Map<string, number>();
  sources.forEach((s) => {
    if (s.url) urlCounts.set(s.url, (urlCounts.get(s.url) ?? 0) + 1);
  });
  const duplicateUrls = [...urlCounts.entries()].filter(([, count]) => count > 1);
  if (duplicateUrls.length > 0) {
    add(
      'sourcing',
      5 * Math.min(2, duplicateUrls.length),
      'minor',
      'The same locator is logged more than once. Duplicate citations inflate the apparent source count.',
      duplicateUrls[0][0],
      'Merge duplicate entries and add genuinely separate sources.',
    );
  }

  const ungraded = sources.filter((s) => s.reliability === '?' || s.credibility === '?').length;
  if (sources.length > 0 && ungraded / sources.length > 0.5) {
    add(
      'sourcing',
      5,
      'minor',
      `${ungraded} of ${sources.length} sources have no reliability or credibility grading.`,
      undefined,
      'Apply the Admiralty-style source and information grading, or explain why a source cannot be graded.',
    );
  }

  const noLocator = sources.filter((s) => !s.url.trim() && !s.articleId).length;
  if (noLocator > 0) {
    add(
      'sourcing',
      Math.min(18, noLocator * 6),
      'major',
      `${noLocator} source${noLocator === 1 ? ' has' : 's have'} no locator (URL or saved article). The claim cannot be checked.`,
      undefined,
      'Add a URL or link the source to a saved offline article with an excerpt.',
    );
  }

  const invalidUrls = sources.filter((s) => s.url.trim() && !safeHttpUrl(s.url));
  if (invalidUrls.length > 0) {
    add(
      'sourcing',
      6,
      'major',
      `${invalidUrls.length} source locator${invalidUrls.length === 1 ? ' is' : 's are'} not a valid http(s) URL.`,
      invalidUrls[0]?.url,
      'Correct the locator or remove the source.',
    );
  }

  const unverifiedCount = sources.filter((s) => s.verification === 'unverified').length;
  if (unverifiedCount > 0) {
    findings.push({
      id: uid('f'),
      dimension: 'sourcing',
      severity: 'note',
      message: `${unverifiedCount} source${unverifiedCount === 1 ? ' is' : 's are'} explicitly marked UNVERIFIED. That is honest tradecraft; the report must not lean on them for its key judgments.`,
      task: 'Confirm each unverified source or downgrade the judgments that depend on it.',
      origin: 'audit',
    });
    strengths.push('Unverified sources are labeled rather than laundered into fact.');
  }

  if (sources.length >= minSources && primaryCount > 0 && typeCount >= 2) {
    strengths.push('Source mix includes primary material and more than one collection discipline.');
  }

  // ── EVIDENCE & LOGIC ─────────────────────────────────────────────────────
  const labels = new Set(sources.map((s) => s.label));
  const judgments = report.judgments.filter((j) => j.text.trim().length > 0);
  const answers = mission.pirs
    .map((pir) => ({ pir, text: report.answers[pir.id] ?? '' }))
    .filter((entry) => entry.text.trim().length > 0);
  const bluf = report.bluf.trim();

  const allCitations = new Set<string>();
  [bluf, ...judgments.map((j) => j.text), ...answers.map((a) => a.text), ...report.alternatives.flatMap((a) => [a.hypothesis, a.supporting, a.contradicting, a.assessment])].forEach(
    (text) => extractCitations(text).forEach((tag) => allCitations.add(tag)),
  );
  const unresolved = [...allCitations].filter((tag) => !labels.has(tag));

  if (unresolved.length > 0) {
    add(
      'evidence',
      Math.min(24, unresolved.length * 8),
      'critical',
      `Citation tag${unresolved.length === 1 ? '' : 's'} ${unresolved.join(', ')} do not resolve to a logged source.`,
      undefined,
      'Add the missing source or correct the tag. Every [S#] must point to a numbered source in the source register.',
    );
  }

  if (judgments.length > 0) {
    const uncited = judgments.filter((j) => extractCitations(j.text).length === 0);
    if (uncited.length > 0) {
      add(
        'evidence',
        Math.min(30, uncited.length * 10),
        'major',
        `${uncited.length} key judgment${uncited.length === 1 ? ' has' : 's have'} no inline citation.`,
        uncited[0].text,
        'Attach specific source tags to each judgment, or rephrase it as an assumption.',
      );
    } else if (unresolved.length === 0) {
      strengths.push('Every key judgment is traceable to at least one cited source.');
    }
  }

  if (bluf.length > 40 && extractCitations(bluf).length === 0) {
    add(
      'evidence',
      4,
      'minor',
      'The BLUF makes its central claim without a citation.',
      bluf,
      'Add a source tag for the factual basis, or state clearly that the BLUF is an analytic judgment resting on the judgments below.',
    );
  }

  const uncitedAnswers = answers.filter((a) => a.text.trim().length >= 80 && extractCitations(a.text).length === 0);
  if (uncitedAnswers.length > 0) {
    add(
      'evidence',
      Math.min(20, uncitedAnswers.length * 7),
      'major',
      `${uncitedAnswers.length} intelligence-question answer${uncitedAnswers.length === 1 ? '' : 's'} contain substantive claims without citations.`,
      uncitedAnswers[0].text,
      'Cite the evidence in each answer. A long uncited answer reads as opinion.',
    );
  }

  const proseForClaims = [bluf, ...judgments.map((j) => j.text), ...answers.map((a) => a.text)].join('\n');
  const unsupported = unsupportedClaimSentences(proseForClaims).slice(0, 5);
  if (unsupported.length > 0) {
    add(
      'evidence',
      Math.min(15, unsupported.length * 3),
      'minor',
      `${unsupported.length} factual claim${unsupported.length === 1 ? '' : 's'} contain dates, figures, or attribution language but no citation.`,
      unsupported[0].sentence,
      'Cite the claim or remove the unsupported specificity.',
    );
  }

  // ── UNCERTAINTY ──────────────────────────────────────────────────────────
  if (judgments.length >= 3) {
    const distinct = new Set(judgments.map((j) => j.confidence)).size;
    if (distinct === 1) {
      add(
        'uncertainty',
        7,
        'minor',
        `All ${judgments.length} key judgments use the same confidence level. Uniform confidence usually signals uncalibrated analysis.`,
        undefined,
        'Differentiate confidence where the evidence warrants it, and explain the basis for each.',
      );
    } else {
      strengths.push('Confidence levels are differentiated across judgments.');
    }
  }

  const methodsText = report.methods.trim();
  if (!/confiden/i.test(methodsText) || wordCount(methodsText) < 30) {
    add(
      'uncertainty',
      6,
      'minor',
      'The methods section does not explain how confidence was assigned.',
      methodsText,
      'Explain what drives confidence: source quality, corroboration, gaps, and the soundness of the inference.',
    );
  }

  const vague = /\b(maybe|probably|possibly)\b/gi;
  let vagueCount = 0;
  judgments.forEach((j) => {
    const matches = j.text.match(vague);
    if (matches) vagueCount += matches.length;
  });
  if (vagueCount > 0) {
    add(
      'uncertainty',
      Math.min(6, vagueCount * 2),
      'minor',
      'Vague likelihood words (maybe / probably / possibly) appear in key judgments.',
      undefined,
      'Use the standard yardstick terms (likely, very likely, roughly even chance, etc.).',
    );
  }

  judgments.forEach((judgment) => {
    const lower = judgment.text.toLowerCase();
    const mentioned = CONFIDENCE_LEVELS.filter((level) => lower.includes(level.label));
    if (mentioned.length > 0 && !mentioned.some((level) => level.id === judgment.confidence)) {
      add(
        'uncertainty',
        3,
        'minor',
        'A judgment uses probability language that conflicts with the selected confidence level.',
        judgment.text,
        'Make the language and the confidence selector say the same thing.',
      );
    }
    if (['almost-certain', 'very-likely'].includes(judgment.confidence) && sources.length < Math.max(3, minSources)) {
      add(
        'uncertainty',
        5,
        'major',
        'A very high confidence level is asserted on a thin source base.',
        judgment.text,
        'Lower the confidence or add corroborating evidence.',
      );
    }
  });

  // ── ALTERNATIVES ─────────────────────────────────────────────────────────
  const altRequired = requiredAlternatives(mission.difficulty);
  const alternatives = report.alternatives.filter((a) => a.hypothesis.trim().length >= 8);
  if (alternatives.length === 0) {
    add(
      'alternatives',
      32,
      'critical',
      'No competing hypotheses are analyzed. This is a single-story assessment.',
      undefined,
      `Analyze at least ${altRequired} plausible alternatives with supporting and contradicting evidence.`,
    );
  } else {
    if (alternatives.length < altRequired) {
      add(
        'alternatives',
        (altRequired - alternatives.length) * 8,
        'major',
        `Only ${alternatives.length} alternative${alternatives.length === 1 ? ' is' : 's are'} analyzed; this tasking requires ${altRequired}.`,
        undefined,
        'Add alternatives that a reasonable consumer would ask about.',
      );
    }
    alternatives.forEach((alt) => {
      if (alt.supporting.trim().length < 20) {
        add(
          'alternatives',
          4,
          'minor',
          `The alternative “${truncate(alt.hypothesis, 80)}” has thin supporting evidence.`,
          alt.supporting,
          'State the best evidence for this hypothesis, even if you ultimately reject it.',
        );
      }
      if (alt.contradicting.trim().length < 20) {
        add(
          'alternatives',
          6,
          'major',
          `The alternative “${truncate(alt.hypothesis, 80)}” has no serious disconfirming evidence.`,
          alt.contradicting,
          'Identify the evidence that argues against this hypothesis and explain why it matters.',
        );
      }
      if (alt.assessment.trim().length < 10) {
        add(
          'alternatives',
          3,
          'minor',
          `The alternative “${truncate(alt.hypothesis, 80)}” has no comparative assessment.`,
          alt.assessment,
          'State whether the hypothesis is more or less likely than your lead, and why.',
        );
      }
    });
    for (let i = 0; i < alternatives.length; i += 1) {
      for (let j = i + 1; j < alternatives.length; j += 1) {
        if (jaccard(alternatives[i].hypothesis, alternatives[j].hypothesis) > 0.66) {
          add(
            'alternatives',
            5,
            'minor',
            'Two listed alternatives are substantively the same hypothesis.',
            `${alternatives[i].hypothesis} / ${alternatives[j].hypothesis}`,
            'Replace the duplicate with a genuinely distinct explanation.',
          );
        }
      }
    }
    if (alternatives.every((a) => a.supporting.trim().length >= 20 && a.contradicting.trim().length >= 20)) {
      strengths.push('Alternatives include both supporting and disconfirming evidence.');
    }
  }

  // ── GAPS & COLLECTION ────────────────────────────────────────────────────
  const gapsText = report.gaps.trim();
  if (!gapsText) {
    add(
      'gaps',
      26,
      'critical',
      'The gaps section is empty. Every assessment has boundaries; state them.',
      undefined,
      'List at least two remaining information gaps and the concrete collection action for each.',
    );
  } else {
    const gaps = lineItems(gapsText);
    if (gaps.length < 2) {
      add(
        'gaps',
        7,
        'minor',
        'Only one gap or collection item is listed.',
        gapsText,
        'Separate distinct unknowns and give each its own collection action.',
      );
    }
    const thin = gaps.filter((g) => g.length < 25);
    if (thin.length > 0) {
      add(
        'gaps',
        Math.min(9, thin.length * 3),
        'minor',
        'Some gap entries are too short to guide collection.',
        thin[0],
        'Name the missing information, why it matters, and how you would collect it.',
      );
    }
    if (!/(collect|verify|request|obtain|query|check|interview|monitor|imagery|report|survey|contact|task|assess)/i.test(gapsText)) {
      add(
        'gaps',
        4,
        'minor',
        'The gaps section does not include a concrete collection action.',
        gapsText,
        'Add a named source, method, or request that would close the gap.',
      );
    } else {
      strengths.push('Gaps are paired with collection actions.');
    }
  }

  const indicatorsText = report.indicators.trim();
  if (!indicatorsText) {
    add(
      'gaps',
      14,
      'major',
      'No indicators are provided. The consumer cannot tell what would change your judgment.',
      undefined,
      'Add at least two observable indicators with a rough time window.',
    );
  } else {
    const indicators = lineItems(indicatorsText);
    if (indicators.length < 2) {
      add(
        'gaps',
        5,
        'minor',
        'Only one indicator is provided.',
        indicatorsText,
        'Add indicators that could disconfirm the lead judgment, not only ones that confirm it.',
      );
    }
    if (!/(if|when|within|by |threshold|before|after|reaches|falls|exceeds|crosses)/i.test(indicatorsText)) {
      add(
        'gaps',
        3,
        'minor',
        'Indicators are not stated in observable, testable terms.',
        indicatorsText,
        'Rephrase each indicator as an observable condition and a time window.',
      );
    }
  }

  // ── OBJECTIVITY ──────────────────────────────────────────────────────────
  const proseAll = [
    bluf,
    ...judgments.map((j) => j.text),
    ...answers.map((a) => a.text),
    ...report.alternatives.map((a) => a.hypothesis),
    report.gaps,
    report.indicators,
    report.methods,
  ].join('\n');
  const absolutes = absoluteLanguage(proseAll).slice(0, 4);
  absolutes.forEach((flag) => {
    add(
      'objectivity',
      4,
      'minor',
      `Absolutist or conclusory language${flag.term ? ` (“${flag.term}”)` : ''} weakens analytic credibility.`,
      flag.sentence,
      'Replace with a calibrated judgment and the evidence that supports it.',
    );
  });
  const firstPerson = proseAll.match(/\bI (think|believe|feel)\b|\bin my opinion\b/gi);
  if (firstPerson && firstPerson.length > 0) {
    add(
      'objectivity',
      Math.min(6, firstPerson.length * 3),
      'minor',
      'First-person opinion language is present. Write as an analyst, not a commentator.',
      firstPerson[0],
      'State the judgment and its basis; remove “I think” framing.',
    );
  }
  if (absolutes.length === 0 && (!firstPerson || firstPerson.length === 0)) {
    strengths.push('Language is measured and avoids absolutist claims.');
  }

  // ── STRUCTURE & TIMELINESS ───────────────────────────────────────────────
  if (!bluf) {
    add(
      'structure',
      32,
      'critical',
      'The BLUF is empty. The consumer has no bottom line.',
      undefined,
      'Write one to three sentences: the judgment, its confidence, and why it matters.',
    );
  } else {
    const blufWords = wordCount(bluf);
    if (blufWords > 150) {
      add(
        'structure',
        7,
        'minor',
        `The BLUF runs ${blufWords} words. It is doing background work.`,
        bluf,
        'Compress it to the bottom line and move context into the analysis.',
      );
    }
    if (splitSentences(bluf).length > 4) {
      add(
        'structure',
        3,
        'minor',
        'The BLUF contains too many sentences for a bottom line.',
        bluf,
        'Aim for one to three sentences.',
      );
    }
    if (/^(background|context|since|in recent (weeks|months|years))/i.test(bluf)) {
      add(
        'structure',
        5,
        'minor',
        'The BLUF opens with background rather than a judgment.',
        bluf,
        'Lead with what you assess, then support it.',
      );
    }
  }

  if (judgments.length === 0) {
    add(
      'structure',
      25,
      'critical',
      'No key judgments are listed. The report has no explicit analytic bottom line.',
      undefined,
      'Add at least two key judgments with confidence levels and citations.',
    );
  }

  const unanswered = mission.pirs.filter((pir) => (report.answers[pir.id] ?? '').trim().length < 60);
  if (unanswered.length > 0) {
    add(
      'structure',
      Math.min(20, unanswered.length * 5),
      'major',
      `${unanswered.length} intelligence question${unanswered.length === 1 ? ' is' : 's are'} unanswered or effectively empty.`,
      unanswered[0].question,
      'Answer every tasking question or state explicitly why it cannot be answered.',
    );
  }

  if (missionWordCount(mission) < 200) {
    add(
      'structure',
      8,
      'minor',
      'The report is very short for the tasking.',
      undefined,
      'Add the reasoning, source basis, and alternative analysis the consumer needs.',
    );
  }
  const wc = missionWordCount(mission);
  if (wc > mission.deliverable.maxWords * 1.2) {
    add(
      'structure',
      6,
      'minor',
      `The report is ${wc} words against a ${mission.deliverable.maxWords}-word tasking limit.`,
      undefined,
      'Cut repetition and background; protect the judgments and evidence.',
    );
  }
  if (!report.methods.trim()) {
    add(
      'structure',
      4,
      'minor',
      'No methods note. The consumer cannot see how the assessment was built.',
      undefined,
      'Describe collection, verification, and analytic method in a short paragraph.',
    );
  }

  const submittedAt = mission.submittedAt ?? now;
  const lateHours = mission.dueAt ? Math.max(0, hoursBetween(mission.dueAt, submittedAt)) : 0;
  const onTime = lateHours <= 0;
  if (!onTime) {
    add(
      'structure',
      Math.min(20, 4 + lateHours * 0.8),
      'major',
      `Submitted ${lateHours.toFixed(1)} hours past the tasking deadline.`,
      undefined,
      'If collection is incomplete, submit what you have with explicit gaps rather than missing the deadline silently.',
    );
  } else {
    strengths.push('Delivered against the tasking deadline.');
  }

  // ── SOURCE AUDIT ─────────────────────────────────────────────────────────
  const sourceAudit: SourceAudit[] = sources.map((source) => {
    const linked = source.articleId ? articles.find((a) => a.id === source.articleId) : undefined;
    const unverifiedNote = source.verification === 'unverified' ? ' Marked UNVERIFIED by the analyst.' : '';
    if (linked && source.excerpt.trim().length >= 24) {
      const found = excerptContains(linked.blocks.join('\n\n'), source.excerpt);
      return {
        label: source.label,
        title: source.title || linked.title,
        status: found ? 'excerpt-found' : 'excerpt-missing',
        note: found
          ? `The excerpt was located in the saved article “${linked.title}.”${unverifiedNote}`
          : `The excerpt could not be matched to the saved article. Check the quotation and page.${unverifiedNote}`,
      };
    }
    if (linked) {
      return {
        label: source.label,
        title: source.title || linked.title,
        status: 'excerpt-found',
        note: `Linked to the offline article “${linked.title}” with no excerpt supplied.${unverifiedNote}`,
      };
    }
    const normalized = safeHttpUrl(source.url);
    if (normalized) {
      return {
        label: source.label,
        title: source.title,
        status: 'pattern-only',
        note: `Locator is well-formed (${domainOf(normalized)}). The supervisor cannot open external links in this environment, so content is not independently verified.${unverifiedNote}`,
      };
    }
    return {
      label: source.label,
      title: source.title,
      status: 'not-accessed',
      note: `No usable locator or offline copy. The claim is not independently checkable.${unverifiedNote}`,
    };
  });

  if (sourceAudit.some((s) => s.status === 'excerpt-missing')) {
    add(
      'sourcing',
      8,
      'major',
      'At least one cited excerpt could not be found in its linked offline article.',
      undefined,
      'Correct the quotation or link the source to the right article. Misquotation is a critical tradecraft failure.',
    );
  }

  // ── SCORE ────────────────────────────────────────────────────────────────
  const dimensions = Object.fromEntries(
    DIMENSIONS.map((d) => [d.id, Math.max(0, Math.min(100, Math.round(100 - (deductions[d.id] ?? 0))))]),
  ) as Record<DimensionId, number>;

  const score = Math.round(
    DIMENSIONS.reduce((sum, d) => sum + dimensions[d.id] * d.weight, 0) / 100,
  );
  const grade = gradeForScore(score);

  const severityOrder: Record<Severity, number> = { critical: 0, major: 1, minor: 2, note: 3 };
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    id: uid('rev'),
    submittedAt,
    onTime,
    lateByHours: Math.round(lateHours * 10) / 10,
    score,
    grade: grade.grade,
    gradeLabel: grade.label,
    dimensions,
    findings: findings.slice(0, 40),
    strengths: Array.from(new Set(strengths)).slice(0, 6),
    sourceAudit,
    attempt: mission.attempts || 1,
    wordCount: wc,
  };
}

export function dimensionLabel(id: DimensionId): string {
  return dimensionMeta(id).label;
}
