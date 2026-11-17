export type ReferenceFocus = 'word' | 'concept';

export interface ReferenceEntry {
  term: string;
  aliases?: string[];
  focus: ReferenceFocus;
  partOfSpeech: string;
  domain: string;
  definition: string;
  synonyms: string[];
  antonyms?: string[];
  encyclopedia: string;
  seeAlso?: string[];
  source?: string;
}

/**
 * The built-in desk reference. Every entry carries three lenses:
 * a dictionary definition, a thesaurus set, and an encyclopedia note.
 * Curated for the working vocabulary of the station; it is deliberately
 * opinionated about intelligence tradecraft rather than a general dictionary.
 */
export const REFERENCE_ENTRIES: ReferenceEntry[] = [
  {
    term: 'All-source intelligence',
    aliases: ['all source', 'all-source', 'multi-source'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'Analysis that integrates information from multiple collection disciplines and open sources, weighing each source on its own merits before forming a judgment.',
    synonyms: ['multi-source analysis', 'integrated analysis', 'fusion analysis'],
    antonyms: ['single-source reporting', 'mono-source analysis'],
    encyclopedia:
      'All-source work is not the act of piling sources together. It is the discipline of asking what each source can and cannot prove, then explaining why the combination supports a judgment. A dozen outlets repeating one wire story is still single-source reporting. The test is independence: would these sources fail in the same way? If so, they add confidence in the claim only once, not a dozen times.',
    seeAlso: ['Corroboration', 'Source reliability', 'Open-source intelligence'],
    source: 'ODNI analytic standards',
  },
  {
    term: 'BLUF',
    aliases: ['bottom line up front', 'bottom-line-up-front'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'A writing convention that puts the conclusion, its confidence, and its significance in the first sentence or two, before background and evidence.',
    synonyms: ['bottom line', 'executive summary', 'lead judgment', 'headline finding'],
    antonyms: ['buried lede', 'chronological narrative'],
    encyclopedia:
      'A BLUF is a promise to the reader that they can stop after two sentences and still know what you think and how firmly. It should contain a judgment, not a topic sentence. “This report examines port disruption” is not a BLUF. “The closure is likely to last under two weeks, based on the operator’s own repair notice” is. The rest of the product exists to make that sentence auditable.',
    seeAlso: ['Key judgment', 'Estimative language', 'Confidence level'],
    source: 'ICD 203 / ODNI style guidance',
  },
  {
    term: 'Priority intelligence requirement',
    aliases: ['PIR', 'priority intelligence requirements'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'A question the commander or decision-maker needs answered to make a specific decision; PIRs drive collection and prioritization.',
    synonyms: ['intelligence requirement', 'standing question', 'decision question'],
    antonyms: ['nice-to-know', 'background interest'],
    encyclopedia:
      'A good PIR names a decision, a time frame, and the level of confidence needed. It is answerable with evidence and can be shown to be answered badly. In this station, every PIR must be addressed explicitly; leaving one blank is not neutral, because the consumer will assume the silence means “no concern.”',
    seeAlso: ['Essential element of information', 'Collection plan', 'Intelligence gap'],
  },
  {
    term: 'Essential element of information',
    aliases: ['EEI', 'essential elements of information'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'The specific facts or indicators that must be collected to answer a priority intelligence requirement.',
    synonyms: ['information requirement', 'collection objective', 'specific information requirement'],
    encyclopedia:
      'EEIs sit beneath PIRs and make them collectable. If a PIR is “will the corridor stay open?”, the EEIs are the operator notices, convoy movements, insurance rates, and official statements that would tell you. An EEI that cannot be observed is a wish, not a requirement.',
    seeAlso: ['Priority intelligence requirement', 'Collection plan', 'Indicator'],
  },
  {
    term: 'Analysis of competing hypotheses',
    aliases: ['ACH', 'competing hypotheses'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'A structured technique that lists plausible explanations, then tests each against the same evidence, looking for disconfirming rather than confirming data.',
    synonyms: ['hypothesis testing', 'alternative analysis', 'disconfirming analysis'],
    antonyms: ['single-explanation analysis', 'satisficing'],
    encyclopedia:
      'ACH is a safeguard against the natural tendency to build a case for the first explanation that fits. The discipline is to ask which hypothesis survives the evidence that should not exist under it. A hypothesis with three pieces of support and one unexplained contradiction is weaker than a rival with two pieces of support and no contradictions. The technique is only as good as the alternatives you are willing to write down.',
    seeAlso: ['Alternative explanation', 'Confirmation bias', 'Mirror-imaging'],
    source: 'Heuer, Psychology of Intelligence Analysis',
  },
  {
    term: 'Admiralty grading',
    aliases: ['Admiralty code', 'source grading', 'NATO source rating'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Sources & verification',
    definition:
      'A two-part rating of a source: reliability (A–F) and information credibility (1–6), written as a pair such as B2.',
    synonyms: ['source rating', 'reliability and credibility grading', 'A-F / 1-6'],
    encyclopedia:
      'Reliability describes the source’s track record; credibility describes this specific item. They are not the same. A usually reliable ministry (B) can pass on a claim it has not checked (3 or 4). A dubious channel (D) can still publish a document you can authenticate (1). Grading is a claim about provenance and corroboration, not a vibe about the outlet.',
    seeAlso: ['Source reliability', 'Corroboration', 'Provenance'],
  },
  {
    term: 'Probability yardstick',
    aliases: ['confidence yardstick', 'estimative probability', 'probability terms'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'A fixed set of probability terms mapped to numeric ranges so that “likely” means the same thing across a product and between analysts.',
    synonyms: ['probability lexicon', 'estimative scale', 'confidence scale'],
    encyclopedia:
      'This station uses: almost no chance (1–5%), very unlikely (5–20%), unlikely (20–40%), roughly even chance (40–60%), likely (60–80%), very likely (80–95%), almost certain (95–99%). The ranges are not a measurement; they force a judgment to be stated precisely enough to be wrong. “Could” and “may” are not on the scale because they carry no information.',
    seeAlso: ['Confidence level', 'Estimative language', 'BLUF'],
    source: 'ODNI Standard 2',
  },
  {
    term: 'Confidence level',
    aliases: ['analytic confidence', 'confidence assessment'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'An explicit statement of how much weight the analyst places in a judgment, based on source quality, corroboration, and the soundness of the reasoning.',
    synonyms: ['degree of confidence', 'assessed confidence', 'certainty rating'],
    antonyms: ['unqualified assertion', 'false certainty'],
    encyclopedia:
      'Confidence is not the same as probability. A judgment can be “very likely” and still held with only moderate confidence if the evidence base is thin. State both when they diverge. Confidence should fall when sources are single, stale, or dependent, and rise when independent collection agrees.',
    seeAlso: ['Probability yardstick', 'Source reliability', 'Corroboration'],
  },
  {
    term: 'Corroboration',
    aliases: ['corroborate', 'corroborating evidence'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Sources & verification',
    definition:
      'Independent evidence that supports the same fact or judgment, ideally from a different collection path or origin.',
    synonyms: ['confirmation', 'independent confirmation', 'support', 'verification'],
    antonyms: ['contradiction', 'single-source claim', 'repudiation'],
    encyclopedia:
      'Corroboration requires independence. Two reporters quoting the same official, or a dozen accounts reposting one video, are one source with many outputs. Ask what the second source knows that the first could not have supplied. If the answer is nothing, you have volume, not corroboration.',
    seeAlso: ['All-source intelligence', 'Single-source reporting', 'Provenance'],
  },
  {
    term: 'Provenance',
    aliases: ['source provenance', 'chain of origin'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Sources & verification',
    definition:
      'The documented origin and custody history of a piece of evidence: who made it, when, where, and how it reached you.',
    synonyms: ['origin', 'lineage', 'custody trail', 'source history'],
    encyclopedia:
      'Provenance is the difference between evidence and a rumour with a screenshot. For an image, that means the first upload, not the most popular repost. For a document, it means the issuing office, the signature, the metadata, and the version history. If you cannot describe how you got it, you cannot grade it.',
    seeAlso: ['Chain of custody', 'Geolocation', 'Admiralty grading'],
  },
  {
    term: 'Attribution',
    aliases: ['attribute', 'attribution problem'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Sources & verification',
    definition:
      'The process of identifying the actor responsible for an action, and stating the confidence and evidence behind that identification.',
    synonyms: ['identification', 'ascription', 'responsibility assessment'],
    encyclopedia:
      'Attribution is a spectrum, not a binary. You may establish that a unit fired a weapon without establishing who ordered it, or that a network carried out an attack without establishing state direction. Say which link you have proved. Conflating technical access, operational control, and political responsibility is one of the most common analytic failures.',
    seeAlso: ['Provenance', 'Confidence level', 'Disinformation'],
  },
  {
    term: 'Indications and warning',
    aliases: ['I&W', 'indications & warning', 'warning intelligence'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Forecasting',
    definition:
      'A structured watch for observable developments that would signal an impending change, such as mobilization, port closure, or a diplomatic withdrawal.',
    synonyms: ['early warning', 'warning indicators', 'signature analysis'],
    encyclopedia:
      'I&W works backwards from a feared event: what would have to be true, and observable, in the days before it? The indicators must be specific enough to be collected and unlikely enough to be informative. “Tensions rise” is not an indicator. “Both sides cancel scheduled leave” is.',
    seeAlso: ['Indicator', 'Scenario', 'Intelligence gap'],
  },
  {
    term: 'Indicator',
    aliases: ['indicators', 'observable'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Forecasting',
    definition:
      'A specific, observable development that would change the probability of a hypothesis or signal that a scenario is unfolding.',
    synonyms: ['signpost', 'marker', 'signal', 'observable'],
    antonyms: ['noise', 'irrelevance'],
    encyclopedia:
      'A useful indicator is observable by someone, within a stated time, and would actually move your judgment. It should also have a dark twin: what would you expect to see if the hypothesis were false? Indicators that only ever confirm are decoration. Write them with thresholds and dates.',
    seeAlso: ['Indications and warning', 'Probability yardstick', 'Scenario'],
  },
  {
    term: 'Intelligence gap',
    aliases: ['gap', 'information gap', 'knowledge gap'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'A specific piece of information that is missing, material to the judgment, and potentially collectable.',
    synonyms: ['collection gap', 'information shortfall', 'unknown'],
    antonyms: ['known', 'established fact'],
    encyclopedia:
      'A gap is not “more research is needed.” It names the missing fact and what would fill it: an operator notice, a vessel track, an imagery pass, a named official’s statement. A gap you cannot act on belongs in the limitations paragraph, not the collection plan. Gaps also protect the reader: they mark where the product is standing on inference rather than evidence.',
    seeAlso: ['Collection plan', 'Essential element of information', 'Confidence level'],
  },
  {
    term: 'Collection plan',
    aliases: ['collection strategy', 'collection management'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'A prioritized list of what to collect, from which sources, by when, and how the result will be validated.',
    synonyms: ['collection strategy', 'research plan', 'sourcing plan'],
    encyclopedia:
      'A collection plan is a schedule, not a bibliography. It should start with the primary record and only then move to commentary, because commentary tells you what someone thinks the record says. Give each line a source, a question it answers, and a check for authenticity. If two lines are not independent, plan for a third.',
    seeAlso: ['Intelligence gap', 'Research vector', 'Priority intelligence requirement'],
  },
  {
    term: 'Open-source intelligence',
    aliases: ['OSINT', 'open source intelligence'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Sources & verification',
    definition:
      'Intelligence derived from publicly available information, collected and analysed lawfully and with attention to provenance and bias.',
    synonyms: ['public-source intelligence', 'open-source research', 'OSINT'],
    antonyms: ['classified collection', 'closed-source reporting'],
    encyclopedia:
      'OSINT is a discipline, not a search engine. Public does not mean true, current, or independent. The work is in establishing what a document actually is, who benefits from it being public, and whether the accounts describing it have their own agenda. Save the original, timestamp it, and record the URL you actually opened.',
    seeAlso: ['Provenance', 'Geolocation', 'Reverse image search'],
  },
  {
    term: 'Geospatial intelligence',
    aliases: ['GEOINT', 'geospatial intelligence'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Geospatial',
    definition:
      'Analysis of imagery, terrain, and geospatial data to describe physical activity, change, and its significance at a specific place and time.',
    synonyms: ['imagery and mapping analysis', 'geospatial analysis', 'GEOINT'],
    encyclopedia:
      'The analytic value of GEOINT comes from pairing an observation with a question. A new apron at an airfield is a fact; whether it changes sortie capacity is a judgment. Always ask for the date of the image, the resolution, the angle, and what is outside the frame. A single image is a snapshot, not a trend.',
    seeAlso: ['Imagery intelligence', 'Remote sensing', 'Geolocation'],
  },
  {
    term: 'Imagery intelligence',
    aliases: ['IMINT', 'imagery analysis'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Geospatial',
    definition:
      'The interpretation of visual imagery, often overhead or aerial, to identify objects, activity, and change.',
    synonyms: ['imagery analysis', 'photo interpretation', 'IMINT'],
    encyclopedia:
      'Good imagery analysis separates observation from inference. “Twelve vehicles are parked in a compound” is observation. “A brigade is staging” is inference and needs pattern-of-life evidence. Beware the seductive single frame: shadows, cloud, season, and resolution can manufacture or hide change.',
    seeAlso: ['Geospatial intelligence', 'Remote sensing', 'Burn scar'],
  },
  {
    term: 'Geolocation',
    aliases: ['geolocate', 'geolocating'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Geospatial',
    definition:
      'Establishing where a piece of media or an event occurred by matching visible features to terrain, imagery, and independently dated references.',
    synonyms: ['location verification', 'place confirmation', 'geo-location'],
    encyclopedia:
      'Geolocation is an argument built from constraints: road geometry, building rooflines, signs in a specific language, a distinctive tower, the position of the sun. Two independent features are the minimum; three is better. A match that could plausibly be several places is not a geolocation. State the features you used so someone else can check them.',
    seeAlso: ['Chronolocation', 'Provenance', 'Satellite imagery'],
  },
  {
    term: 'Chronolocation',
    aliases: ['chronolocate', 'time verification'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Geospatial',
    definition:
      'Establishing when a piece of media was captured, using shadows, weather, seasonal cues, metadata, or corroborating events.',
    synonyms: ['time verification', 'timestamp analysis', 'temporal geolocation'],
    encyclopedia:
      'Time is often easier to fake than place. Old footage is recycled with a new caption; a shadow can be consistent with a date but not unique to it. Combine at least two independent time signals, and always compare with the first known upload rather than the most shared copy.',
    seeAlso: ['Geolocation', 'Provenance', 'Disinformation'],
  },
  {
    term: 'Reverse image search',
    aliases: ['reverse image lookup', 'image search'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Sources & verification',
    definition:
      'Searching with an image rather than words to find earlier or alternate copies, which can expose recycled or misattributed material.',
    synonyms: ['image provenance search', 'visual search', 'source tracing'],
    encyclopedia:
      'The goal is not to find the image; it is to find the earliest instance. Sort results by date, check archived versions, and look for crops that reveal the original frame. A reverse search that returns nothing is not proof of authenticity, only a lack of an earlier indexed copy.',
    seeAlso: ['Provenance', 'Chronolocation', 'Disinformation'],
  },
  {
    term: 'Chain of custody',
    aliases: ['evidence chain', 'custody chain'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Sources & verification',
    definition:
      'A record of who handled a piece of evidence, when, and what was done to it, so its integrity can be defended later.',
    synonyms: ['evidence trail', 'handling record', 'integrity log'],
    encyclopedia:
      'For open-source work the chain is usually a timestamped URL, a saved copy, and a note of any transformation such as cropping or translation. If you annotate an image, keep the original. If you quote a document, keep the page and the access date. The point is that someone else can reconstruct your path without trusting your memory.',
    seeAlso: ['Provenance', 'Corroboration', 'Open-source intelligence'],
  },
  {
    term: 'Disinformation',
    aliases: ['disinfo', 'information manipulation'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Sources & verification',
    definition:
      'False or misleading information spread deliberately to deceive, often as part of a coordinated campaign with an intended audience and effect.',
    synonyms: ['deliberate deception', 'information warfare', 'influence operation', 'falsehood campaign'],
    antonyms: ['accurate reporting', 'correction'],
    encyclopedia:
      'Disinformation is defined by intent and coordination, which are hard to prove from a single post. Distinguish the claim, the network, and the sponsor. You may be able to show that accounts coordinated without being able to show who paid them. Say exactly which layer you have evidence for.',
    seeAlso: ['Misinformation', 'Attribution', 'Mirror-imaging'],
  },
  {
    term: 'Misinformation',
    aliases: ['false information', 'misleading information'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Sources & verification',
    definition:
      'False or misleading information spread without necessarily intending to deceive, often by people who believe it.',
    synonyms: ['error', 'false claim', 'inaccurate reporting', 'rumour'],
    antonyms: ['accurate information', 'verified fact'],
    encyclopedia:
      'The distinction from disinformation is intent, which is usually invisible at the point of sharing. For analysis, the more useful question is how the claim travelled and who amplified it. A false rumour can do the work of a campaign without anyone orchestrating it.',
    seeAlso: ['Disinformation', 'Corroboration', 'Attribution'],
  },
  {
    term: 'Mirror-imaging',
    aliases: ['mirror imaging', 'projection bias'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'Assuming another actor thinks, values, or calculates the way you would, rather than reasoning from that actor’s own constraints and history.',
    synonyms: ['projection', 'ethnocentric assumption', 'self-referential analysis'],
    antonyms: ['cultural empathy', 'actor-centred analysis'],
    encyclopedia:
      'Mirror-imaging often appears as a prediction that a rational actor “must” de-escalate because that is what you would do. The corrective is to write down the actor’s objectives, decision style, and domestic constraints from their own statements and behaviour, then ask what a rational move looks like from inside that frame.',
    seeAlso: ['Confirmation bias', 'Analysis of competing hypotheses', 'Key assumptions check'],
  },
  {
    term: 'Confirmation bias',
    aliases: ['confirmatory bias', 'myside bias'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'The tendency to seek, notice, and remember evidence that supports an existing belief while discounting evidence that does not.',
    synonyms: ['selective evidence', 'belief perseverance', 'cherry-picking'],
    antonyms: ['disconfirming search', 'open-mindedness'],
    encyclopedia:
      'The remedy is procedural, not attitudinal. Pre-commit to what would count as disconfirming evidence, actively search for it, and record it even when it does not change your mind. “I considered the opposite” is not a method; a documented search for the strongest contrary case is.',
    seeAlso: ['Analysis of competing hypotheses', 'Anchoring', 'Disinformation'],
  },
  {
    term: 'Anchoring',
    aliases: ['anchoring bias', 'anchor effect'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'Over-reliance on the first number, claim, or framing encountered, which then distorts later estimates.',
    synonyms: ['first-impression bias', 'initial value bias', 'framing effect'],
    encyclopedia:
      'In intelligence work the anchor is often the first report or the most confident briefer. Re-estimate from an independent source before looking at the original number again. If two estimates differ, ask what each is measuring rather than splitting the difference.',
    seeAlso: ['Confirmation bias', 'Probability yardstick', 'Red teaming'],
  },
  {
    term: 'Red teaming',
    aliases: ['red team', 'adversarial review'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'A deliberate adversarial review that argues against the product, looking for omitted explanations, weak evidence, and failure modes.',
    synonyms: ['devil’s advocacy', 'adversarial analysis', 'challenge review'],
    antonyms: ['consensus review', 'rubber-stamping'],
    encyclopedia:
      'A red team is useful only if it is tasked to win. It should produce the strongest case against the judgment, not a list of caveats. In this station, the supervisor plays this role: the review board is not a grade, it is an attack surface for your reasoning.',
    seeAlso: ['Analysis of competing hypotheses', 'Key assumptions check', 'Objectivity'],
  },
  {
    term: 'Key assumptions check',
    aliases: ['assumptions check', 'key assumptions'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'A structured review that surfaces the unstated assumptions a judgment depends on, then tests whether each is supported.',
    synonyms: ['assumption audit', 'premise testing', 'foundational review'],
    encyclopedia:
      'Most broken estimates fail at an assumption nobody wrote down: that a port stays open, that a government retains control, that a supplier can reroute. List the assumptions that must hold for your judgment to be true, mark which are evidenced and which are inherited, and state what happens if the weakest one fails.',
    seeAlso: ['Analysis of competing hypotheses', 'Red teaming', 'Intelligence gap'],
  },
  {
    term: 'Estimative language',
    aliases: ['estimative wording', 'words of estimative probability'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'The controlled vocabulary used to express likelihood and confidence, so a reader knows what “likely” or “unlikely” commits the analyst to.',
    synonyms: ['probability language', 'analytic phrasing', 'confidence wording'],
    antonyms: ['vague hedging', 'false precision'],
    encyclopedia:
      'Avoid the middle-voice hedge: “could potentially possibly.” It protects the writer and informs no one. Choose a term from the yardstick, attach it to a specific judgment, and use the same term consistently. If you cannot choose, you do not yet have a judgment.',
    seeAlso: ['Probability yardstick', 'Confidence level', 'BLUF'],
  },
  {
    term: 'Analytic tradecraft',
    aliases: ['tradecraft', 'analysis standards'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'The disciplined methods and standards used to turn information into defensible judgments: sourcing, reasoning, uncertainty, alternatives, and review.',
    synonyms: ['intelligence analysis', 'analytic method', 'professional practice'],
    encyclopedia:
      'Tradecraft is what makes an assessment auditable. It is not a writing style. It is the set of choices that let another analyst see where the evidence ends, where inference begins, what was considered and rejected, and what would change the conclusion. The standards on the review board are a subset of that discipline, not a scoring game.',
    seeAlso: ['Objectivity', 'Analysis of competing hypotheses', 'Confidence level'],
  },
  {
    term: 'Objectivity',
    aliases: ['analytic objectivity', 'impartiality'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'The practice of forming judgments from evidence and method rather than from advocacy, institutional preference, or the desire for a particular conclusion.',
    synonyms: ['impartiality', 'neutrality', 'independence', 'even-handedness'],
    antonyms: ['advocacy', 'politicization', 'wishful thinking'],
    encyclopedia:
      'Objectivity does not mean having no view. It means being able to state what evidence would change your view, and treating contrary evidence with the same care as supporting evidence. Watch for language that argues: “clearly,” “obviously,” “must.” The reader should be able to disagree with your conclusion without feeling that you have campaigned for it.',
    seeAlso: ['Analytic tradecraft', 'Confirmation bias', 'Red teaming'],
    source: 'ODNI objectivity and independence',
  },
  {
    term: 'Source reliability',
    aliases: ['reliability', 'source rating'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Sources & verification',
    definition:
      'An assessment of how consistently a source has provided accurate information, independent of whether any particular claim is true.',
    synonyms: ['track record', 'trustworthiness', 'source dependability'],
    antonyms: ['unreliability', 'fabrication'],
    encyclopedia:
      'Reliability is a property of the source, not the claim. A reliable source can be wrong about a specific fact; an unreliable source can hand you a verifiable document. Grade the source and the item separately, and explain the basis for the grade rather than treating a letter as a personality judgement.',
    seeAlso: ['Admiralty grading', 'Provenance', 'Corroboration'],
  },
  {
    term: 'Single-source reporting',
    aliases: ['single source', 'one-source claim'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Sources & verification',
    definition:
      'A claim supported by only one independent source, which cannot be corroborated across collection paths.',
    synonyms: ['unconfirmed report', 'one-source reporting', 'uncorroborated claim'],
    antonyms: ['corroborated reporting', 'multi-source confirmation'],
    encyclopedia:
      'Single-source reporting is not automatically false; it is automatically fragile. It should be labelled, its access described, and its role in the judgment made explicit. Never let a single source carry a key judgment quietly. If it must, say why no second source exists.',
    seeAlso: ['Corroboration', 'All-source intelligence', 'Confidence level'],
  },
  {
    term: 'Remote sensing',
    aliases: ['earth observation', 'satellite observation'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Geospatial',
    definition:
      'Observing the Earth from aircraft or satellites using sensors that record reflected or emitted energy, often across visible, infrared, or radar bands.',
    synonyms: ['earth observation', 'overhead collection', 'satellite monitoring'],
    encyclopedia:
      'Different sensors answer different questions. Optical imagery shows structures and smoke but not through cloud; synthetic aperture radar sees through cloud and at night but is harder to interpret; thermal detects heat. Sentinel and Landsat offer free, regularly dated passes, which makes them excellent for change detection if you check resolution and revisit time.',
    seeAlso: ['Geospatial intelligence', 'Satellite imagery', 'Burn scar'],
  },
  {
    term: 'Satellite imagery',
    aliases: ['satellite image', 'overhead imagery'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Geospatial',
    definition:
      'Imagery collected by Earth-observing satellites, used to identify infrastructure, activity, damage, and change over time.',
    synonyms: ['overhead imagery', 'space-based imagery', 'Earth observation imagery'],
    encyclopedia:
      'Commercial and public constellations differ enormously in resolution and revisit rate. A 10-metre image can show a new runway but not a vehicle; a 30-centimetre image can show one. Always record the provider, acquisition date, and whether the image has been processed or sharpened. Compare like with like, and use the shadow length and direction as a date check.',
    seeAlso: ['Geospatial intelligence', 'Remote sensing', 'Imagery intelligence'],
  },
  {
    term: 'Burn scar',
    aliases: ['fire scar', 'burned area'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Geospatial',
    definition:
      'The area of land visibly scorched or otherwise altered by fire, detectable in optical and radar imagery after the event.',
    synonyms: ['fire perimeter', 'burned area', 'scorched footprint'],
    encyclopedia:
      'Burn scars are one of the most reliable satellite change signals: a sharp, dated boundary that persists for months. Pair the scar with active-fire detections and wind data to reconstruct spread. The scar shows where fire went, not when a settlement was evacuated or how many people were affected.',
    seeAlso: ['Remote sensing', 'Satellite imagery', 'Wildfire perimeter'],
  },
  {
    term: 'NOTAM',
    aliases: ['notice to airmen', 'notice to air missions'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Aviation',
    definition:
      'A notice filed with aviation authorities to alert pilots and operators to a hazard, restriction, or change in an aerodrome or airspace.',
    synonyms: ['airspace notice', 'flight advisory', 'airmission notice'],
    encyclopedia:
      'NOTAMs are operational, not explanatory. They tell you a runway is closed or a navigation signal is unreliable, often with terse abbreviations and a validity window. They are excellent primary evidence for a restriction’s existence and timing, but they rarely explain why. Read the whole NOTAM, including the end date; many routine closures are maintenance, not crisis.',
    seeAlso: ['Airspace closure', 'Load factor', 'Provenance'],
  },
  {
    term: 'Airspace closure',
    aliases: ['airspace restriction', 'no-fly zone', 'airspace shutdown'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Aviation',
    definition:
      'A formal restriction on aircraft operating in a defined volume of airspace, for reasons ranging from conflict to weather or VIP movement.',
    synonyms: ['airspace restriction', 'flight ban', 'airspace shutdown'],
    antonyms: ['open airspace', 'unrestricted operations'],
    encyclopedia:
      'Ask three questions: what volume, for how long, and who is exempt? A closure can be a safety measure, a political signal, or a routine exercise. The operational effect depends on rerouting options, alternate airports, and notice time. A NOTAM is the evidence; the effect on traffic is a separate judgment.',
    seeAlso: ['NOTAM', 'Chokepoint', 'Load factor'],
  },
  {
    term: 'Load factor',
    aliases: ['passenger load factor', 'PLF'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Aviation',
    definition:
      'The share of available seat-kilometres actually sold, calculated as revenue passenger-kilometres divided by available seat-kilometres.',
    synonyms: ['seat occupancy', 'capacity utilisation', 'passenger fill rate'],
    antonyms: ['empty capacity', 'excess capacity'],
    encyclopedia:
      'Load factor is the airline industry’s core efficiency measure, but a high number is not automatically good: it can mean demand is strong or that capacity has been cut. Compare it with yield and capacity growth. A route with 90% load factor and collapsing yield may still be losing money.',
    seeAlso: ['Airspace closure', 'Port congestion', 'TEU'],
  },
  {
    term: 'Automatic identification system',
    aliases: ['AIS', 'AIS tracking'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Maritime & logistics',
    definition:
      'A maritime transponder system that broadcasts a vessel’s identity, position, course, and speed for collision avoidance and traffic monitoring.',
    synonyms: ['vessel tracking', 'AIS signal', 'maritime transponder'],
    encyclopedia:
      'AIS is self-reported and can be switched off, spoofed, or misconfigured. A gap in a track is a data point, not proof of concealment: coverage, equipment, and crew error all matter. Use AIS to establish patterns and anomalies, then corroborate with imagery, port records, or insurance data before alleging a dark vessel.',
    seeAlso: ['Dark vessel', 'Chokepoint', 'Provenance'],
  },
  {
    term: 'Dark vessel',
    aliases: ['dark ship', 'AIS dark', 'going dark'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Maritime & logistics',
    definition:
      'A vessel that stops transmitting AIS or is otherwise absent from tracking while continuing to operate.',
    synonyms: ['AIS gap', 'covert vessel', 'untracked ship'],
    encyclopedia:
      '“Going dark” is common in sanctioned trade and evasive shipping, but also happens near piracy zones and during equipment failure. The analytic claim should be precise: the vessel’s AIS stopped between these coordinates and resumed there, and here is the independent evidence of what it did in between. Without that, you have an anomaly, not a violation.',
    seeAlso: ['Automatic identification system', 'Shadow fleet', 'Sanctions'],
  },
  {
    term: 'Shadow fleet',
    aliases: ['parallel fleet', 'ghost fleet'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Maritime & logistics',
    definition:
      'A group of ageing tankers and other vessels operating outside conventional insurance, ownership, and tracking arrangements to move sanctioned goods.',
    synonyms: ['parallel fleet', 'sanctions-evasion fleet', 'dark fleet'],
    encyclopedia:
      'Shadow fleets are identified by clusters of behaviour: frequent flag changes, opaque ownership, ship-to-ship transfers, AIS gaps, and unusual insurance. No single marker is conclusive. The intelligence question is usually less “is this ship shadow?” than “what volume is moving, through which chokepoint, and what does that mean for price and enforcement?”',
    seeAlso: ['Dark vessel', 'Sanctions', 'Chokepoint'],
  },
  {
    term: 'Chokepoint',
    aliases: ['strategic chokepoint', 'maritime chokepoint'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Maritime & logistics',
    definition:
      'A narrow passage through which a large share of trade must pass, making it strategically important and vulnerable to disruption.',
    synonyms: ['bottleneck', 'strategic passage', 'constriction'],
    antonyms: ['open corridor', 'redundant route'],
    encyclopedia:
      'A chokepoint matters because alternatives are costly, not because the passage is narrow. Quantify the share of relevant trade, the available bypass capacity, and the time and cost of rerouting. The Strait of Hormuz, Bab el-Mandeb, Suez, Panama, and Malacca are the classic cases, but a rail bridge or a single port can be a chokepoint too.',
    seeAlso: ['Port congestion', 'TEU', 'Airspace closure'],
  },
  {
    term: 'TEU',
    aliases: ['twenty-foot equivalent unit', 'twenty foot equivalent'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Maritime & logistics',
    definition:
      'A standard unit of container capacity equal to one twenty-foot container; forty-foot containers count as two TEU.',
    synonyms: ['container unit', 'box capacity'],
    encyclopedia:
      'TEU measures capacity, not cargo value or weight. A port’s TEU throughput says little about its economic importance without knowing what is inside the boxes. When comparing port disruptions, check whether figures are throughput, capacity, or dwell time; mixing them produces impressive but meaningless percentages.',
    seeAlso: ['Port congestion', 'Chokepoint', 'Force majeure'],
  },
  {
    term: 'Port congestion',
    aliases: ['congestion', 'berth backlog', 'vessel queue'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Maritime & logistics',
    definition:
      'A condition in which vessels wait to berth or cargo waits to move because port capacity is overwhelmed by arrivals, labour disruption, or inland transport failure.',
    synonyms: ['berth queue', 'backlog', 'bottleneck'],
    antonyms: ['free-flowing port', 'clear berths'],
    encyclopedia:
      'Congestion is measured with several different clocks: vessels at anchor, waiting time, berth productivity, container dwell, and rail departures. A queue can grow while throughput stays normal if arrivals spike, or shrink while trade collapses. Use at least two measures, and compare with the same month in prior years to separate seasonality from stress.',
    seeAlso: ['TEU', 'Chokepoint', 'Force majeure'],
  },
  {
    term: 'Force majeure',
    aliases: ['force-majeure', 'act of God clause'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Maritime & logistics',
    definition:
      'A contract clause excusing a party from performance when an extraordinary event beyond its control prevents fulfilment.',
    synonyms: ['contractual excusal', 'impossibility clause', 'relief event'],
    encyclopedia:
      'Invoking force majeure is a legal move, not a description of reality. Whether a disruption qualifies depends on the contract, the jurisdiction, and the notice given. For analysts, a force-majeure notice is useful evidence that an operator expects prolonged disruption and is positioning legally; it is not proof that the disruption was unforeseeable or that the excuse will hold.',
    seeAlso: ['Port congestion', 'Sanctions', 'Chokepoint'],
  },
  {
    term: 'Sanctions',
    aliases: ['economic sanctions', 'sanction'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Geopolitics',
    definition:
      'Coercive measures imposed by states or international bodies to restrict trade, finance, travel, or technology with a target, usually to change behaviour.',
    synonyms: ['restrictive measures', 'embargo', 'economic pressure'],
    antonyms: ['normalisation', 'sanctions relief'],
    encyclopedia:
      'Sanctions are not a single event. Distinguish designation from enforcement, and primary from secondary measures. The interesting analytic questions are who actually complies, how goods reroute, and what the target loses. A new designation list is evidence of intent; it does not by itself show that trade has stopped.',
    seeAlso: ['Shadow fleet', 'Attribution', 'Chokepoint'],
  },
  {
    term: 'Ceasefire',
    aliases: ['cease-fire', 'truce'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Geopolitics',
    definition:
      'A negotiated or imposed halt to fighting, which may be temporary, partial, monitored, or conditional.',
    synonyms: ['truce', 'armistice', 'cessation of hostilities'],
    antonyms: ['escalation', 'offensive'],
    encyclopedia:
      'A ceasefire is a process, not a switch. Ask who signed, what geography it covers, what happens to forces during the pause, and who monitors violations. Most failures are visible in the first 72 hours as small violations that go unanswered. “Ceasefire announced” and “violence stopped” are different claims.',
    seeAlso: ['Escalate', 'Indicator', 'Humanitarian corridor'],
  },
  {
    term: 'Humanitarian corridor',
    aliases: ['aid corridor', 'safe corridor'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Humanitarian',
    definition:
      'A designated route and time window agreed by parties to allow civilians, aid, or both to move safely through an active conflict area.',
    synonyms: ['safe passage', 'aid route', 'evacuation corridor'],
    encyclopedia:
      'Corridors are only as real as compliance. Verify the route, the hours, the parties who guaranteed it, and whether aid actually moved. Announcements often serve political purposes independent of implementation. Track convoys, checkpoint behaviour, and civilian reports rather than the communiqué alone.',
    seeAlso: ['Ceasefire', 'Displacement', 'Food security'],
  },
  {
    term: 'Displacement',
    aliases: ['displaced persons', 'internal displacement', 'refugees'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Humanitarian',
    definition:
      'The forced movement of people from their homes, whether across a border (refugees) or within a country (internally displaced persons).',
    synonyms: ['forced migration', 'population movement', 'evacuation'],
    antonyms: ['return', 'resettlement'],
    encyclopedia:
      'Counts are usually estimates, often stale, and politically contested. Distinguish stock (people currently displaced) from flow (new arrivals per period). Look for triangulation across registration data, shelter counts, satellite-detected camp growth, and movement tracking. A single agency figure is a starting point, not a census.',
    seeAlso: ['Humanitarian corridor', 'Food security', 'Intelligence gap'],
  },
  {
    term: 'Food security',
    aliases: ['food insecurity', 'hunger risk'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Humanitarian',
    definition:
      'Reliable access to sufficient, safe, nutritious food for an active and healthy life, determined by availability, access, utilisation, and stability.',
    synonyms: ['nutrition security', 'food access', 'hunger risk'],
    antonyms: ['food sovereignty', 'food sufficiency'],
    encyclopedia:
      'Food security is not the same as food supply. A market can be full while people cannot afford to buy. Analyse availability (production, imports, stocks), access (prices, incomes, conflict), and utilisation (water, health, nutrition). A production shortfall matters only through the access pathways it changes.',
    seeAlso: ['IPC phase', 'Displacement', 'Humanitarian corridor'],
  },
  {
    term: 'IPC phase',
    aliases: ['IPC', 'Integrated Food Security Phase Classification'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Humanitarian',
    definition:
      'A five-phase scale used to classify food insecurity, from Phase 1 (minimal) through Phase 5 (famine), based on evidence and consensus.',
    synonyms: ['food security phase', 'famine classification', 'IPC scale'],
    encyclopedia:
      'Phase 5 requires specific evidence thresholds, not just alarming reports. The classification is an assessment with assumptions and geographic scope, often released months after the survey period. Cite the phase, the population, the area, and the projection date. “Famine-like conditions” is not an IPC phase and should not be treated as one.',
    seeAlso: ['Food security', 'Displacement', 'Intelligence gap'],
  },
  {
    term: 'Earthquake magnitude',
    aliases: ['magnitude', 'moment magnitude', 'Richter scale'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Humanitarian',
    definition:
      'A logarithmic measure of the energy released at an earthquake’s source, commonly reported as moment magnitude (Mw).',
    synonyms: ['seismic magnitude', 'moment magnitude', 'M scale'],
    encyclopedia:
      'Magnitude is not impact. A shallow M6 near a dense city can kill more than a deep M7 offshore. Impact depends on depth, distance, building stock, soil, time of day, and response capacity. Initial magnitudes are often revised; use the network’s latest published figure and say which agency produced it.',
    seeAlso: ['Tsunami advisory', 'Displacement', 'Remote sensing'],
  },
  {
    term: 'Tsunami advisory',
    aliases: ['tsunami warning', 'tsunami watch'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Humanitarian',
    definition:
      'A public notice that a tsunami may affect coastlines, graded by expected wave height and arrival time, often issued after a large offshore earthquake.',
    synonyms: ['wave warning', 'coastal hazard notice', 'tsunami bulletin'],
    encyclopedia:
      'Advisory levels differ by country and can change quickly. The key facts are source earthquake, expected arrival times by coast, and wave height ranges. A small advisory can still produce dangerous currents. Distinguish the hazard notice from observed inundation; both are useful, but they answer different questions.',
    seeAlso: ['Earthquake magnitude', 'Displacement', 'Indications and warning'],
  },
  {
    term: 'Wildfire perimeter',
    aliases: ['fire perimeter', 'fireline'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Humanitarian',
    definition:
      'The mapped outer boundary of a wildfire at a given time, distinguishing burned area from active or unburned land.',
    synonyms: ['fire boundary', 'burn perimeter', 'fire footprint'],
    encyclopedia:
      'Perimeters are snapshots produced by different methods (infrared, satellite, ground survey) with different accuracy. A growing perimeter can mean spread or better mapping. Compare successive perimeters with wind, fuel, and terrain, and treat the space inside as burned with unburned patches, not uniformly destroyed.',
    seeAlso: ['Burn scar', 'Remote sensing', 'Indications and warning'],
  },
  {
    term: 'Scenario',
    aliases: ['scenarios', 'scenario analysis'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Forecasting',
    definition:
      'A plausible, internally consistent account of how a situation could develop, used to structure uncertainty rather than predict a single future.',
    synonyms: ['future case', 'alternative future', 'planning scenario'],
    encyclopedia:
      'Scenarios should be mutually exclusive enough to be distinguishable and concrete enough to be observed. Name the drivers, the branching events, and the indicators that tell you which scenario is unfolding. A good set includes an uncomfortable option you would rather not write down.',
    seeAlso: ['Indicator', 'Analysis of competing hypotheses', 'Indications and warning'],
  },
  {
    term: 'Anomaly',
    aliases: ['anomalies', 'outlier', 'irregularity'],
    focus: 'word',
    partOfSpeech: 'noun',
    domain: 'Language',
    definition:
      'Something that deviates from an established pattern or expectation, especially in a way that may indicate a change or problem.',
    synonyms: ['irregularity', 'deviation', 'outlier', 'inconsistency', 'aberration'],
    antonyms: ['norm', 'regularity', 'conformity'],
    encyclopedia:
      'An anomaly is a signal to investigate, not a conclusion. First check the data: coverage gaps, sensor error, reporting lag, and changed definitions can manufacture anomalies. Only after excluding measurement artefacts does a deviation become evidence about behaviour.',
    seeAlso: ['Indicator', 'Indications and warning', 'Provenance'],
  },
  {
    term: 'Assess',
    aliases: ['assessed', 'assessing', 'assessment'],
    focus: 'word',
    partOfSpeech: 'verb',
    domain: 'Language',
    definition:
      'To evaluate evidence and form a judgment about a situation, its causes, or its likely development.',
    synonyms: ['evaluate', 'judge', 'appraise', 'estimate', 'gauge'],
    antonyms: ['ignore', 'assume', 'speculate'],
    encyclopedia:
      'In intelligence writing, “assess” is a commitment: the analyst has weighed evidence and is offering a judgment. Do not use it to soften a fact (“we assess the bridge is closed”) or to inflate a guess. A fact is reported; an assessment is owned.',
    seeAlso: ['BLUF', 'Confidence level', 'Estimative language'],
  },
  {
    term: 'Likely',
    aliases: ['probability likely'],
    focus: 'word',
    partOfSpeech: 'adjective',
    domain: 'Language',
    definition:
      'Having a high probability of being true or occurring; in this station, 60–80% on the probability yardstick.',
    synonyms: ['probable', 'expected', 'anticipated', 'favoured'],
    antonyms: ['unlikely', 'improbable', 'doubtful'],
    encyclopedia:
      '“Likely” is not a synonym for “maybe.” It commits you to the 60–80% band. If you mean something broader, use a different term from the yardstick. Pair it with a sentence explaining the basis, or the reader cannot tell whether you are estimating from evidence or from mood.',
    seeAlso: ['Probability yardstick', 'Estimative language', 'Confidence level'],
  },
  {
    term: 'Corroborate',
    aliases: ['corroborated', 'corroborating'],
    focus: 'word',
    partOfSpeech: 'verb',
    domain: 'Language',
    definition:
      'To strengthen a claim with independent evidence that supports it.',
    synonyms: ['confirm', 'substantiate', 'verify', 'support', 'bear out'],
    antonyms: ['contradict', 'refute', 'undermine'],
    encyclopedia:
      'Use “corroborate” only when the second evidence is genuinely independent. A second outlet quoting the same anonymous official does not corroborate the official; it repeats them. If you cannot explain why the sources could not share a common origin, the correct word is “repeat.”',
    seeAlso: ['Corroboration', 'Single-source reporting', 'All-source intelligence'],
  },
  {
    term: 'Credible',
    aliases: ['credibility', 'credibly'],
    focus: 'word',
    partOfSpeech: 'adjective',
    domain: 'Language',
    definition:
      'Worthy of belief or trust, based on evidence, expertise, access, and a record of accuracy.',
    synonyms: ['believable', 'trustworthy', 'reliable', 'authoritative', 'plausible'],
    antonyms: ['dubious', 'untrustworthy', 'implausible'],
    encyclopedia:
      'Credible is a claim about trust, not about whether you agree. A credible source can report something inconvenient; an incredible one can occasionally be right. Say what makes the source credible in this instance—access, documents, a track record—rather than using the word as a substitute for evidence.',
    seeAlso: ['Source reliability', 'Admiralty grading', 'Corroborate'],
  },
  {
    term: 'Verify',
    aliases: ['verified', 'verification', 'verifying'],
    focus: 'word',
    partOfSpeech: 'verb',
    domain: 'Language',
    definition:
      'To establish the truth or accuracy of a claim by checking it against independent, reliable evidence.',
    synonyms: ['confirm', 'validate', 'substantiate', 'check', 'authenticate'],
    antonyms: ['assume', 'accept', 'disprove'],
    encyclopedia:
      'Verification is a finding, not a feeling. Say what you checked, against what, and on what date. “Verified by the ministry” means the ministry said it; “verified against the ministry’s own signed notice” means something stronger. If the primary record is unavailable, the honest status is unverified.',
    seeAlso: ['Provenance', 'Corroboration', 'Reverse image search'],
  },
  {
    term: 'Ambiguous',
    aliases: ['ambiguity', 'ambiguous evidence'],
    focus: 'word',
    partOfSpeech: 'adjective',
    domain: 'Language',
    definition:
      'Open to more than one interpretation, or not sufficiently clear to support a single conclusion.',
    synonyms: ['equivocal', 'unclear', 'indeterminate', 'open-ended', 'polysemous'],
    antonyms: ['unequivocal', 'clear', 'definitive'],
    encyclopedia:
      'Ambiguity is a property of evidence, not a failure of nerve. The analytic response is to say which interpretations remain live and what would discriminate between them. Do not resolve ambiguity by picking the most dramatic reading, or by averaging incompatible ones into mush.',
    seeAlso: ['Analysis of competing hypotheses', 'Indicator', 'Confidence level'],
  },
  {
    term: 'Escalate',
    aliases: ['escalated', 'escalation', 'de-escalate'],
    focus: 'word',
    partOfSpeech: 'verb',
    domain: 'Language',
    definition:
      'To increase the intensity, scope, or severity of a conflict or coercive action; de-escalation is the reverse.',
    synonyms: ['intensify', 'expand', 'heighten', 'step up', 'worsen'],
    antonyms: ['de-escalate', 'reduce', 'calm', 'stand down'],
    encyclopedia:
      'Escalation is a direction, not a level. Specify the dimension—geographic scope, force size, target type, rhetoric, economic measures—because one can rise while another falls. “Tensions escalated” is usually a headline, not an assessment. Name the observable change.',
    seeAlso: ['Ceasefire', 'Indicator', 'Sanctions'],
  },
  {
    term: 'Mitigate',
    aliases: ['mitigated', 'mitigation'],
    focus: 'word',
    partOfSpeech: 'verb',
    domain: 'Language',
    definition:
      'To reduce the severity, likelihood, or impact of a risk or harmful event.',
    synonyms: ['reduce', 'lessen', 'alleviate', 'soften', 'moderate'],
    antonyms: ['aggravate', 'worsen', 'exacerbate'],
    encyclopedia:
      'Mitigation implies a specific mechanism and a measurable effect. “Mitigations are in place” is empty. Ask who is doing what, by when, and what residual risk remains. Distinguish mitigation (reduce impact) from prevention (reduce likelihood) and adaptation (live with the change).',
    seeAlso: ['Indicator', 'Scenario', 'Food security'],
  },
  {
    term: 'Plausible',
    aliases: ['plausibility'],
    focus: 'word',
    partOfSpeech: 'adjective',
    domain: 'Language',
    definition:
      'Seeming reasonable or believable, but not yet established by evidence.',
    synonyms: ['believable', 'credible', 'conceivable', 'feasible', 'tenable'],
    antonyms: ['implausible', 'incredible', 'far-fetched'],
    encyclopedia:
      'Plausible is the weakest positive judgment in the analyst’s vocabulary: it means the explanation could be true, not that it is supported. Use it for alternatives you have not eliminated. Never let “plausible” quietly become “likely” between drafts.',
    seeAlso: ['Speculative', 'Analysis of competing hypotheses', 'Confidence level'],
  },
  {
    term: 'Speculative',
    aliases: ['speculation', 'speculate'],
    focus: 'word',
    partOfSpeech: 'adjective',
    domain: 'Language',
    definition:
      'Based on conjecture rather than firm evidence; a hypothesis advanced without adequate support.',
    synonyms: ['conjectural', 'unsubstantiated', 'guesswork', 'hypothetical', 'tentative'],
    antonyms: ['evidence-based', 'established', 'verified'],
    encyclopedia:
      'Speculation is legitimate as an explicitly labelled alternative, not as a finding. If you write it, mark it as a hypothesis and say what evidence would raise it. The danger is laundering speculation through confident prose until the reader cannot tell it from the sourced judgments.',
    seeAlso: ['Plausible', 'Analysis of competing hypotheses', 'Objectivity'],
  },
  {
    term: 'Significant',
    aliases: ['significance', 'significantly'],
    focus: 'word',
    partOfSpeech: 'adjective',
    domain: 'Language',
    definition:
      'Important enough to affect a decision, judgment, or outcome; in statistics, unlikely to be due to chance at a stated threshold.',
    synonyms: ['material', 'consequential', 'important', 'noteworthy', 'substantial'],
    antonyms: ['trivial', 'negligible', 'immaterial'],
    encyclopedia:
      'Significant to whom, for what decision, and compared with what baseline? A 2% export change can be operationally significant for a single terminal and irrelevant nationally. In quantitative work, statistical significance is not the same as substantive importance; report the effect size.',
    seeAlso: ['Indicator', 'Assess', 'Intelligence gap'],
  },
  {
    term: 'Alternative explanation',
    aliases: ['alternatives', 'competing explanation'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'A rival account of the same evidence that would lead to a different judgment or response.',
    synonyms: ['competing hypothesis', 'rival explanation', 'counter-explanation'],
    antonyms: ['single explanation', 'assumed causation'],
    encyclopedia:
      'An alternative must be a real rival, not a straw man. State the evidence that supports it, the evidence that counts against it, and why it is less or more persuasive than your lead judgment. If your alternative is obviously absurd, you have not tested your own.',
    seeAlso: ['Analysis of competing hypotheses', 'Red teaming', 'Plausible'],
  },
  {
    term: 'Key judgment',
    aliases: ['key judgements', 'judgment'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'A consequential analytic conclusion, stated with a confidence level and traceable to cited evidence.',
    synonyms: ['finding', 'analytic conclusion', 'assessment'],
    encyclopedia:
      'A key judgment should be falsifiable and decision-relevant. If nothing would change it, it is an assumption. If no decision turns on it, it is commentary. Each judgment needs a confidence and a citation; otherwise the reader cannot tell what it rests on.',
    seeAlso: ['BLUF', 'Confidence level', 'Alternative explanation'],
  },
  {
    term: 'Research vector',
    aliases: ['collection vector', 'vector'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'A specific, named route into the evidence: an official register, dataset, imagery archive, report series, or named document collection.',
    synonyms: ['lead', 'collection route', 'source path'],
    encyclopedia:
      'A vector is a place to start, not a source you have used. In this station, tasking supplies vectors so that the research is real and checkable. Open the vector, find the specific case or record, then grade what you actually retrieved. A vector you never opened is not evidence.',
    seeAlso: ['Collection plan', 'Open-source intelligence', 'Anchor'],
  },
  {
    term: 'Anchor',
    aliases: ['collection point', 'live lead'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Tradecraft',
    definition:
      'The dated public report or standing collection point from which a tasking begins, provided for orientation rather than as verified evidence.',
    synonyms: ['starting point', 'lead', 'seed'],
    encyclopedia:
      'An anchor tells you why the tasking exists and where to look first. It may be incomplete, recycled, or wrong. Verify it against the original before it enters the source register, and say in the product whether it survived verification. Never cite a standing collection point as if it were a finding.',
    seeAlso: ['Research vector', 'Provenance', 'Single-source reporting'],
  },
  {
    term: 'Provenance check',
    aliases: ['authenticity check', 'source check'],
    focus: 'concept',
    partOfSpeech: 'noun',
    domain: 'Sources & verification',
    definition:
      'A structured test of whether a piece of evidence is what it claims to be, from where and when it claims, without later alteration.',
    synonyms: ['authenticity review', 'origin check', 'integrity check'],
    encyclopedia:
      'A provenance check covers four things: origin (who made it), time (when), place (where), and integrity (has it been altered or decontextualised). For documents, compare versions and metadata; for media, find the first upload and match visible features. Record the checks you ran, including those that were inconclusive.',
    seeAlso: ['Provenance', 'Chain of custody', 'Chronolocation'],
  },
];

export const REFERENCE_DOMAINS = Array.from(new Set(REFERENCE_ENTRIES.map((entry) => entry.domain))).sort();

export const FEATURED_TERMS = [
  'BLUF',
  'Probability yardstick',
  'Corroboration',
  'Analysis of competing hypotheses',
  'Geolocation',
  'Admiralty grading',
  'Chokepoint',
  'Disinformation',
];
