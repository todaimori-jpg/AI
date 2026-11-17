import type { Archetype } from '../archetypes';
import { anchor, vector } from '../sources';

export const verificationArchetypes: Archetype[] = [
  {
    id: 'ver-viral',
    area: 'verification',
    title: 'Viral Claim Trace',
    tagline: 'Follow a circulating claim back to its earliest evidence.',
    role:
      'You are the open-source verification analyst. You are expected to find the origin, not merely label something “unverified.”',
    situation:
      'A claim, photo, or short video is spreading rapidly in connection with a current event. It is being cited as proof by partisans on multiple sides. The desk needs a provenance assessment and a clear statement of what the item can and cannot establish.\n\n{HOOK}\n\nFind the earliest instance, examine the original file where possible, and test whether the content matches the claimed time and place.',
    intent:
      'Determine the origin and authenticity of the claim, and grade the evidence behind it.',
    pirs: [
      {
        q: 'What exactly is being claimed, in its strongest form, and by whom?',
        focus: 'Quote the claim precisely. Note whether it is being used as proof or as allegation.',
      },
      {
        q: 'What is the earliest documented instance, and what did that instance claim?',
        focus: 'Use archive and reverse-image tools. Capture timestamps and URLs.',
      },
      {
        q: 'Does the content itself support the claimed time, place, and event?',
        focus: 'Check visible features, shadows, language, weather, and contextual details.',
      },
      {
        q: 'Has the content been altered, cropped, or repurposed from an earlier event?',
        focus: 'Compare with earlier versions and originals.',
      },
      {
        q: 'What independent evidence corroborates or contradicts the claim?',
        focus: 'Independent means a separate chain of collection, not republication.',
      },
      {
        q: 'What is your final provenance assessment and confidence, and what remains unresolved?',
        focus: 'Give separate judgments for authenticity, location, and time.',
      },
    ],
    requirements: [
      'Document your search path and the earliest instance found.',
      'Separate authenticity, location, and time judgments.',
      'Do not treat a fact-check article as primary evidence; trace its links.',
      'State a clear confidence level and the main unresolved question.',
    ],
    vectors: [
      vector('googleFactCheck', 'Search for existing fact checks, then verify their underlying evidence.'),
      vector('snopes', 'Check whether the claim has already been examined; note its sources.'),
      vector('afpFact', 'Search regional fact checks for the same image or claim.'),
      vector('fullFact', 'Check for a relevant verification.'),
      vector('googleLens', 'Reverse-image search the visual content.'),
      vector('yandexImages', 'Run a second reverse-image search; results differ by index.'),
      vector('internetArchive', 'Check archived versions and earliest captures.'),
      vector('bellingcatToolkit', 'Use verification workflows for provenance and chronolocation.'),
    ],
    anchors: [
      anchor('googleFactCheck', 'Recent fact checks', 'Select a current claim with a published fact check, then examine the original evidence.'),
      anchor('snopes', 'Recent claim analyses', 'Choose a current claim and trace it to the earliest source cited.'),
    ],
    injects: [
      'A fact-check labels the image “miscaptioned” but does not identify the original event. This is a drill inject. Explain what additional provenance work you would do before repeating the label.',
      'The earliest post you can find is from an anonymous account, two days after the event. This is a drill inject. State what an earlier origin would look like and how you would search for it.',
    ],
    keywords: ['viral', 'claim', 'photo', 'video', 'fake', 'misinformation', 'source', 'verify'],
    difficulty: [2, 5],
    skillsFocus: ['sourcing', 'evidence', 'uncertainty'],
    format: 'Claim provenance assessment',
  },
  {
    id: 'ver-document',
    area: 'verification',
    title: 'Document Authentication',
    tagline: 'Assess a purported leak through format, custody, and consistency.',
    role:
      'You are the document forensics analyst. You assess authenticity, not whether the document’s contents are politically convenient.',
    situation:
      'A document described as an internal government or corporate record has been published online. It contains sensitive claims and is being treated as authentic by some outlets and as a forgery by the accused institution.\n\n{HOOK}\n\nExamine the document’s form, issuance trail, and internal consistency. A correct-looking logo is not proof of authenticity.',
    intent:
      'Determine whether the document is likely authentic, fabricated, or indeterminate, and explain the basis.',
    pirs: [
      {
        q: 'What does the document purport to be, who issued it, and what specific claims does it make?',
        focus: 'Summarize only what the text says. Do not adopt its claims.',
      },
      {
        q: 'What does its format reveal — letterhead, numbering, classification markings, fonts, metadata, signatures?',
        focus: 'Compare with known genuine examples from the issuer.',
      },
      {
        q: 'What is the chain of custody, and what does the publisher say about how it obtained the document?',
        focus: 'Trace publication history and any earlier versions.',
      },
      {
        q: 'Is the content internally consistent and consistent with known facts, timelines, and procedures?',
        focus: 'Look for anachronisms, wrong office names, or impossible sequences.',
      },
      {
        q: 'What independent evidence corroborates any part of the document?',
        focus: 'Corroboration of one claim does not authenticate the whole document.',
      },
      {
        q: 'What competing explanations fit — authentic, altered authentic document, fabricated, misattributed?',
        focus: 'Assign confidence to each.',
      },
    ],
    requirements: [
      'Assess the document as evidence; do not repeat its claims as fact.',
      'Compare format and content with known authentic examples.',
      'Explain chain-of-custody weaknesses.',
      'Give a final likelihood judgment with explicit confidence.',
    ],
    vectors: [
      vector('bellingcatToolkit', 'Use document and metadata verification methods.'),
      vector('internetArchive', 'Check publication history and earlier captures.'),
      vector('googleFactCheck', 'See whether the document has already been assessed; verify the basis.'),
      {
        label: 'Issuing authority records',
        kind: 'official',
        note: 'Find the issuing office’s public registers, numbering conventions, and sample documents. Use the official site, not a copy.',
      },
      {
        label: 'Official document examples',
        kind: 'reference',
        note: 'Collect two or three genuine documents from the same office and period for format comparison.',
      },
      vector('reuters', 'Secondary reporting; check whether it independently verified the document.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor('googleFactCheck', 'Recent document-verification cases', 'Choose a current document dispute with a published assessment.'),
      anchor('bellingcat', 'Recent document investigations', 'Use a published case as a method reference, not as evidence.'),
    ],
    injects: [
      'The document carries a classification marking that the issuing office did not use at the claimed date. This is a drill inject. Explain how strong that discrepancy is and what would undermine it.',
      'One paragraph of the document is corroborated by an independent record. This is a drill inject. Assess how much that raises your confidence in the rest of the document.',
    ],
    keywords: ['document', 'leak', 'authentic', 'forgery', 'metadata', 'claim', 'records', 'verification'],
    difficulty: [3, 5],
    skillsFocus: ['sourcing', 'evidence', 'alternatives'],
    format: 'Document authenticity assessment',
  },
  {
    id: 'ver-casualties',
    area: 'verification',
    title: 'Casualty Figure Reconciliation',
    tagline: 'Explain why counts diverge before choosing a number.',
    role:
      'You are the incident data analyst. You reconcile conflicting counts and communicate the uncertainty without minimizing harm.',
    situation:
      'An incident has produced widely different casualty figures from government, opposition, medical, and international sources. Each number is being used to support a narrative. The desk needs a defensible range and an explanation of the divergence.\n\n{HOOK}\n\nRecord each figure with its source, definition, cut-off time, and method. Then compare coverage rather than arguing about which side is trustworthy in the abstract.',
    intent:
      'Produce a bounded casualty estimate, explain the gaps between sources, and identify what would narrow the range.',
    pirs: [
      {
        q: 'What figures exist, who produced them, and what do they count — killed, injured, missing, bodies recovered?',
        focus: 'A table is mandatory. Definitions matter as much as numbers.',
      },
      {
        q: 'What methods and coverage underlie each figure — hospital records, body counts, family reports, remote estimates?',
        focus: 'State the access each source had.',
      },
      {
        q: 'What explains the divergence — timing, definition, access, double-counting, or political incentive?',
        focus: 'Test at least three explanations.',
      },
      {
        q: 'What independent verification exists, and how credible is it?',
        focus: 'Look for records with a separate collection chain.',
      },
      {
        q: 'What range is defensible now, and what would change it?',
        focus: 'Present a range with a clear basis, not a midpoint guess.',
      },
      {
        q: 'What are the main collection gaps, and which would most narrow the range?',
        focus: 'Prioritize feasible verification.',
      },
    ],
    requirements: [
      'Tabulate every figure with source, definition, and timestamp.',
      'Explain at least three reasons for divergence.',
      'Present a range rather than a single number.',
      'Avoid language that minimizes or sensationalizes harm.',
    ],
    vectors: [
      vector('acled', 'Check coded event data and its methodology and lag.'),
      vector('ucdp', 'Compare with another structured conflict dataset.'),
      vector('reliefweb', 'Collect situation reports and note publication times.'),
      vector('ochaHdx', 'Use health-facility and population baselines where available.'),
      vector('bellingcat', 'Look for verified incident documentation, not aggregate claims.'),
      vector('reuters', 'Secondary reporting; trace each figure to its original source.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor('acled', 'Recent conflict-event data', 'Select a current event with reported fatalities and note the data lag.'),
      anchor('reliefweb', 'Current incident situation reports', 'Choose an incident with at least two official casualty figures.'),
    ],
    injects: [
      'A hospital reports 60 dead; a local authority reports 25; an armed group reports 100. This is a drill inject. Explain how catchment, coercion, and counting rules could produce the spread.',
      'A figure is revised downward two days later without explanation. This is a drill inject. Assess how you would treat the revision and what you would ask the source.',
    ],
    keywords: ['casualties', 'killed', 'figures', 'conflict', 'incident', 'verification', 'deaths', 'reporting'],
    difficulty: [3, 5],
    skillsFocus: ['uncertainty', 'sourcing', 'objectivity'],
    format: 'Casualty reconciliation assessment',
  },
  {
    id: 'ver-synthetic',
    area: 'verification',
    title: 'Synthetic Media Assessment',
    tagline: 'Assess whether audiovisual content is likely generated or manipulated.',
    role:
      'You are the media forensics analyst. You assess the artifact and its provenance, not whether the message is plausible.',
    situation:
      'A short video or audio clip attributed to a public figure is spreading during a sensitive moment. Supporters treat it as authentic; opponents call it synthetic. The clip is designed to be emotionally convincing.\n\n{HOOK}\n\nExamine provenance first, then the artifact. Do not rely on a single “AI detector” score.',
    intent:
      'Assess the likelihood that the content is authentic, manipulated, or synthetic, and state the limits of the assessment.',
    pirs: [
      {
        q: 'What is the clip, where did it first appear, and what does the publisher claim about its origin?',
        focus: 'Establish provenance before looking at the content.',
      },
      {
        q: 'What audiovisual anomalies are present, and how specific are they?',
        focus: 'Describe observable artifacts. Avoid generic “looks fake” claims.',
      },
      {
        q: 'What do available forensic or detection tools indicate, and what are their error rates and limits?',
        focus: 'A detector score is supporting evidence, not proof.',
      },
      {
        q: 'Does the content fit the speaker’s known behavior, schedule, and context?',
        focus: 'Check official calendars, prior statements, and location.',
      },
      {
        q: 'What alternative explanations fit — authentic, edited, impersonation, synthetic, out of context?',
        focus: 'Include the mundane explanations.',
      },
      {
        q: 'What confidence do you assign, and what additional evidence would be decisive?',
        focus: 'State what cannot be determined from the clip alone.',
      },
    ],
    requirements: [
      'Establish provenance before artifact analysis.',
      'Do not present a detector score as a conclusion.',
      'Include at least three alternative explanations.',
      'State explicitly what the clip cannot prove even if authentic.',
    ],
    vectors: [
      vector('bellingcatToolkit', 'Use provenance and forensic workflows for audiovisual media.'),
      vector('fotoForensics', 'Use error-level analysis for image derivatives, with awareness of limits.'),
      vector('googleLens', 'Search for earlier versions or matching source material.'),
      vector('googleFactCheck', 'Check for existing assessments and their evidence.'),
      vector('internetArchive', 'Establish the earliest publication and modifications.'),
      vector('euvsdisinfo', 'Check whether the narrative has been tracked, but verify independently.'),
    ],
    anchors: [
      anchor('bellingcat', 'Recent synthetic-media investigations', 'Choose a current case with a published methodology.'),
      anchor('googleFactCheck', 'Recent media-verification cases', 'Select a current audiovisual claim with an assessment.'),
    ],
    injects: [
      'A detection tool reports an 84% probability of manipulation, with no explanation. This is a drill inject. Explain how you would use the score without outsourcing your judgment.',
      'The speaker’s lips and audio drift by 80 milliseconds in one segment. This is a drill inject. Assess whether that is diagnostic of synthesis or could be a normal encoding artifact.',
    ],
    keywords: ['deepfake', 'video', 'audio', 'synthetic', 'manipulated', 'media', 'forensics', 'claim'],
    difficulty: [4, 5],
    skillsFocus: ['alternatives', 'uncertainty', 'evidence'],
    format: 'Synthetic media assessment',
  },
  {
    id: 'ver-narrative',
    area: 'verification',
    title: 'Narrative Divergence Audit',
    tagline: 'Compare how different information ecosystems describe the same event.',
    role:
      'You are the information environment analyst. You map claims and framing, not the political sympathies of audiences.',
    situation:
      'A single event is being described in sharply different ways across state media, independent outlets, and social platforms. Each narrative contains some verifiable facts and some unsupported claims.\n\n{HOOK}\n\nBuild a claim matrix across sources. Identify what is shared, what is omitted, and what is invented. Then separate narrative analysis from event assessment.',
    intent:
      'Map the narrative contest, identify factual convergence, and assess the likely purpose and reach of each framing.',
    pirs: [
      {
        q: 'What are the core factual claims in each narrative, and which are independently verifiable?',
        focus: 'Use a claim matrix. Do not treat framing as a factual claim unless it is one.',
      },
      {
        q: 'What does each narrative emphasize, omit, or reframe?',
        focus: 'Quote representative language. Avoid parody.',
      },
      {
        q: 'Which claims originated where, and how did they travel across outlets and platforms?',
        focus: 'Trace the earliest instance and the direction of repetition.',
      },
      {
        q: 'What audiences and purposes does each narrative appear designed for?',
        focus: 'Be careful not to overclaim intent.',
      },
      {
        q: 'What does the evidence support about the underlying event?',
        focus: 'Keep this section separate from the narrative analysis.',
      },
      {
        q: 'What indicators would show the narrative gaining or losing influence?',
        focus: 'Use observable reach or official adoption, not vibes.',
      },
    ],
    requirements: [
      'Keep event assessment separate from narrative analysis.',
      'Use a claim matrix with originating sources.',
      'Include direct quotations for framing claims.',
      'Avoid attributing intent without evidence.',
    ],
    vectors: [
      vector('euvsdisinfo', 'Use as a tracking source, then verify its claims independently.'),
      vector('gdelt', 'Examine coverage volume and source spread over time.'),
      vector('reuters', 'Compare attribution and factual claims across outlets.', 'News reporting (secondary)'),
      vector('bbc', 'Compare framing and sourcing with other outlets.', 'News reporting (secondary)'),
      vector('internetArchive', 'Capture page versions and earlier headlines.'),
      vector('googleTrends', 'Use search interest as a rough reach indicator, with caveats.'),
    ],
    anchors: [
      anchor('euvsdisinfo', 'Recent disinformation tracking', 'Select a current narrative case and verify the underlying event independently.'),
      anchor('gdelt', 'Current global coverage data', 'Choose an event with measurable coverage spread across multiple source countries.'),
    ],
    injects: [
      'Two outlets use identical sentences but attribute them to different officials. This is a drill inject. Explain how you would trace the original statement.',
      'A narrative appears in state media first, then in anonymous social accounts, then in a mainstream outlet. This is a drill inject. Assess what the sequence does and does not prove.',
    ],
    keywords: ['narrative', 'media', 'disinformation', 'state media', 'framing', 'claim', 'coverage', 'information'],
    difficulty: [3, 5],
    skillsFocus: ['objectivity', 'evidence', 'alternatives'],
    format: 'Information environment assessment',
  },
];
