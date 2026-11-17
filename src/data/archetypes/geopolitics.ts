import type { Archetype } from '../archetypes';
import { anchor, vector } from '../sources';

export const geopoliticsArchetypes: Archetype[] = [
  {
    id: 'geo-access',
    area: 'geopolitics',
    title: 'Access Agreement Analysis',
    tagline: 'Test what a new basing, port, or defense access deal actually changes.',
    role:
      'You are the political-military analyst for a regional desk. You assess agreements and their implementation, not intentions in the abstract.',
    situation:
      'Two governments have announced a security cooperation, basing, or port-access arrangement. Official statements emphasize partnership; regional commentary is split between a major realignment and a modest administrative update. The desk needs a judgment on substance versus signaling.\n\n{HOOK}\n\nRead the actual text or official fact sheet. An announcement is a data point; implementation is the assessment.',
    intent:
      'Determine what the agreement changes in practice, what remains uncertain, and what would show it is or is not being implemented.',
    pirs: [
      {
        q: 'What do the published terms actually obligate each party to do, and what remains unspecified?',
        focus: 'Quote or closely paraphrase the operative language. Distinguish binding text from communiqué language.',
      },
      {
        q: 'Which claims about the agreement are confirmed by primary documents, and which are commentary?',
        focus: 'Build a claims table with the originating document for each.',
      },
      {
        q: 'What domestic, fiscal, legal, or parliamentary constraints could delay or dilute implementation?',
        focus: 'Check ratification requirements, budgets, and host-nation politics.',
      },
      {
        q: 'What competing explanations fit the timing — security demand, domestic politics, hedging, symbolism, bureaucratic inertia?',
        focus: 'Give each explanation a fair test and state the discriminating evidence.',
      },
      {
        q: 'How are neighboring states and regional institutions reacting, and does that reaction change the operating environment?',
        focus: 'Distinguish statements from material responses.',
      },
      {
        q: 'What observable indicators over the next 12 months would show implementation, erosion, or reversal?',
        focus: 'Make the indicators specific and dated where possible.',
      },
    ],
    requirements: [
      'Use primary texts or official fact sheets; label commentary as commentary.',
      'Separate announced terms from implemented reality.',
      'Address at least one plausible alternative explanation for the timing.',
      'Include dated indicators of implementation or reversal.',
    ],
    vectors: [
      vector('stateDept', 'Search official releases and fact sheets for the agreement text.'),
      vector('ukFcdo', 'Compare another government’s public framing and any published documents.'),
      vector('unDigitalLibrary', 'Check for related treaty registration, Security Council, or General Assembly records.'),
      vector('sipri', 'Use arms transfer and military expenditure data to test material significance.'),
      vector('reuters', 'Secondary reporting; use it to locate primary documents, not as the anchor.', 'News reporting (secondary)'),
      vector('ap', 'Secondary reporting; compare attribution across outlets.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor(
        'stateDept',
        'Recent security cooperation announcements',
        'Pick one current announcement with a published fact sheet or statement. Read the primary text first.',
      ),
      anchor(
        'ukFcdo',
        'Recent defence and diplomatic agreements',
        'Choose an agreement with a published text, joint statement, or parliamentary record.',
      ),
    ],
    injects: [
      'A senior official says the agreement permits “rotational presence,” but the published text is silent on duration and numbers. This is a drill inject. Explain how you would bound the uncertainty without over-reading silence.',
      'A neighboring state announces consultations in response to the deal, without specifying measures. This is a drill inject. Identify what would distinguish signaling from a material response.',
    ],
    keywords: ['agreement', 'basing', 'defense', 'treaty', 'military', 'access', 'diplomatic', 'minister'],
    difficulty: [2, 5],
    skillsFocus: ['sourcing', 'evidence', 'alternatives'],
    format: 'Political-military assessment',
  },
  {
    id: 'geo-sanctions',
    area: 'geopolitics',
    title: 'Sanctions Designation Effects',
    tagline: 'Assess what a new designation can and cannot be expected to change.',
    role:
      'You are the sanctions analyst. You evaluate designations, exposure, adaptation, and second-order effects — not whether the policy is wise.',
    situation:
      'A government or coalition has announced a new tranche of sanctions against entities in a strategic sector. Officials describe the measures as significant; target-state media calls them symbolic. Markets and implementing firms need a practical read.\n\n{HOOK}\n\nStart with the legal instruments and named entities. Then trace exposure and likely adaptation. Do not assume that announcement equals enforcement.',
    intent:
      'Estimate the operational and behavioral effect of the designation, including evasion risk and unintended spillovers.',
    pirs: [
      {
        q: 'What exactly is designated — entities, individuals, sectors, transactions — under which legal authority?',
        focus: 'Cite the official listing and effective date. Check for differing scope across jurisdictions.',
      },
      {
        q: 'What is the target’s documented exposure to the constrained activity, market, or technology?',
        focus: 'Use trade, ownership, and corporate records. Avoid assuming total dependence.',
      },
      {
        q: 'Which sanctions claims come from the issuing government, and what independent evidence supports them?',
        focus: 'A designation rationale is an allegation unless corroborated.',
      },
      {
        q: 'How might the target adapt, and what would that adaptation look like in observable data?',
        focus: 'Consider rerouting, intermediaries, substitution, and ownership changes.',
      },
      {
        q: 'What are the plausible humanitarian, market, or third-country spillovers, and how well supported are they?',
        focus: 'Separate anticipated from demonstrated effects.',
      },
      {
        q: 'What indicators over the next two quarters would show meaningful effect versus evasion or irrelevance?',
        focus: 'Choose indicators the data can actually show.',
      },
    ],
    requirements: [
      'Cite the official legal instrument for each designation you discuss.',
      'Distinguish stated intent from observed effect.',
      'Include at least one alternative explanation for unchanged behavior.',
      'Mark any target-state or advocacy claims as interested sources.',
    ],
    vectors: [
      vector('ofac', 'Locate the specific designation and its legal basis. Record the effective date.'),
      vector('euSanctionsMap', 'Compare scope and timing across jurisdictions.'),
      vector('opensanctions', 'Use for entity resolution and ownership links; verify against primary records.'),
      vector('comtrade', 'Test trade exposure before and after the measure, with lag caveats.'),
      vector('imfData', 'Check macroeconomic and financial indicators where relevant.'),
      vector('reuters', 'Secondary reporting; trace specific claims to listings or company statements.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor('ofac', 'Recent OFAC actions', 'Select a current designation with a published press release and named entities.'),
      anchor('euSanctionsMap', 'Current EU restrictive measures', 'Choose a live sanctions regime with an updated legal annex.'),
    ],
    injects: [
      'A target entity announces a “routine restructuring” two weeks after designation. This is a drill inject. Describe the ownership records and timing evidence you would examine before calling it evasion.',
      'A third-country bank freezes an account linked to a designated entity but publishes no details. This is a drill inject. Assess how much evidentiary weight the action deserves.',
    ],
    keywords: ['sanctions', 'designation', 'export control', 'trade', 'entity', 'financial', 'government'],
    difficulty: [2, 5],
    skillsFocus: ['sourcing', 'evidence', 'alternatives'],
    format: 'Sanctions effects assessment',
  },
  {
    id: 'geo-election',
    area: 'geopolitics',
    title: 'Election Contested Result',
    tagline: 'Compare observation findings, official results, and competing fraud claims.',
    role:
      'You are the governance analyst supporting a regional desk. You assess the integrity and political trajectory of an election without taking sides in the outcome.',
    situation:
      'A national election result has been announced. The opposition alleges irregularities; the electoral commission defends the count; international observers have issued preliminary findings with qualifications. Public narratives are hardening faster than the evidence.\n\n{HOOK}\n\nWork from the official results, observer statements, and documented incidents. Treat every fraud claim as a hypothesis requiring evidence, including claims that suit your initial instinct.',
    intent:
      'Establish what the evidence supports about process integrity, what remains unresolved, and the likely near-term political trajectory.',
    pirs: [
      {
        q: 'What did official observers actually find, and what did they explicitly not assess?',
        focus: 'Quote the observation statement. Note the difference between preliminary and final findings.',
      },
      {
        q: 'Which specific irregularities are documented, by whom, and at what scale?',
        focus: 'Distinguish isolated incidents from systematic patterns.',
      },
      {
        q: 'How credible and independent are the sources making fraud or integrity claims?',
        focus: 'Check funding, access, partisanship, and methodology.',
      },
      {
        q: 'What do the numbers support — turnout anomalies, result shifts, or nothing conclusive?',
        focus: 'Show your arithmetic if you use it. Avoid statistical claims you cannot defend.',
      },
      {
        q: 'What competing explanations fit the evidence — fraud, administrative error, turnout effects, opposition overreach, external influence?',
        focus: 'Give each a fair test and state what would falsify it.',
      },
      {
        q: 'What are the likely near-term trajectories, and which indicators would distinguish them?',
        focus: 'Focus on institutions, courts, security forces, and elite behavior.',
      },
    ],
    requirements: [
      'Do not declare fraud or its absence without evidence; state what is supported.',
      'Cite observer statements and official results directly.',
      'Include at least three competing explanations and their discriminating evidence.',
      'Provide near-term indicators with rough timing.',
    ],
    vectors: [
      vector('osceOdihr', 'Find the observation mission’s statements and methodology. Note the limited scope of preliminary findings.'),
      vector('carterCenter', 'Compare another observation mission’s public assessment, if one exists.'),
      vector('ifes', 'Reference for electoral framework and process standards.'),
      vector('idea', 'Use for comparative election and turnout context.'),
      vector('reuters', 'Secondary reporting; check sourcing for specific fraud claims.', 'News reporting (secondary)'),
      vector('wikiCurrent', 'Use for event chronology, then verify every item against a primary source.'),
    ],
    anchors: [
      anchor('osceOdihr', 'Recent election observation statements', 'Choose a current mission with a published preliminary statement.'),
      anchor('ifes', 'Current election resources', 'Use an active election case with a published legal framework or results record.'),
    ],
    injects: [
      'An opposition party releases a spreadsheet it says proves turnout fraud in three districts. The spreadsheet has no provenance. This is a drill inject. State the checks you would run before using it.',
      'A foreign ministry congratulates the winner before observers issue findings. This is a drill inject. Assess what the timing does and does not tell you.',
    ],
    keywords: ['election', 'vote', 'observation', 'parliament', 'opposition', 'fraud', 'turnout', 'government'],
    difficulty: [3, 5],
    skillsFocus: ['evidence', 'alternatives', 'objectivity'],
    format: 'Election integrity and trajectory assessment',
  },
  {
    id: 'geo-incident',
    area: 'geopolitics',
    title: 'Border Incident Narratives',
    tagline: 'Reconcile competing state accounts of a border or maritime incident.',
    role:
      'You are the regional incident analyst. You establish what happened with the evidence available and explain the narrative contest separately.',
    situation:
      'Two states blame each other for an incident at a contested border or maritime area. Casualty and damage figures differ; each side has released selected imagery or video. Regional organizations are calling for restraint.\n\n{HOOK}\n\nBuild a chronology and a claim-by-claim assessment. Treat official statements as interested sources, not neutral facts.',
    intent:
      'Establish the best-supported account of the incident, assess escalation risk, and identify what evidence would resolve the key disputes.',
    pirs: [
      {
        q: 'What is the best-supported sequence of events, and how precise can the timeline be?',
        focus: 'Use independent evidence and consistent official details. Note time-zone issues.',
      },
      {
        q: 'Which claims are independently corroborated, which are single-source, and which are contradicted?',
        focus: 'Build a claims matrix. Note each side’s interests.',
      },
      {
        q: 'What does the released imagery or video actually show, and what does it not show?',
        focus: 'Check geolocation, timing, and provenance before interpretation.',
      },
      {
        q: 'What are the competing explanations for the trigger and the severity?',
        focus: 'Include accident, local initiative, signaling, and deliberate escalation.',
      },
      {
        q: 'What does the incident imply for deterrence, force posture, and the next diplomatic move?',
        focus: 'Keep implications tied to observable behavior.',
      },
      {
        q: 'What are the indicators of escalation or de-escalation over the next two weeks?',
        focus: 'Specify military, diplomatic, and information indicators.',
      },
    ],
    requirements: [
      'Separate the event assessment from the narrative analysis.',
      'Mark all state claims as interested-source claims.',
      'Address at least two competing explanations for the trigger.',
      'Include de-escalation as well as escalation indicators.',
    ],
    vectors: [
      vector('acled', 'Check incident data for corroborating reports and location patterns.'),
      vector('ucdp', 'Compare with structured conflict-event coding.'),
      vector('bellingcatToolkit', 'Methods for geolocating and verifying released imagery.'),
      vector('unDigitalLibrary', 'Look for Security Council or General Assembly records and statements.'),
      vector('isw', 'Use as secondary analysis; test its claims against primary evidence.'),
      vector('reuters', 'Secondary reporting; compare how each side’s claims are attributed.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor('acled', 'Recent conflict events in a contested area', 'Select an event with a specific date and location. Note the coding lag.'),
      anchor('unDigitalLibrary', 'Recent Security Council or regional statements', 'Choose a current incident with competing official accounts.'),
    ],
    injects: [
      'One side releases drone footage it says proves the other fired first; the metadata is stripped. This is a drill inject. List the geolocation and chronolocation steps before drawing a conclusion.',
      'A regional organization issues a statement that names no responsible party. This is a drill inject. Assess what the omission might indicate and what it cannot prove.',
    ],
    keywords: ['border', 'incident', 'military', 'ceasefire', 'clash', 'maritime', 'casualties', 'statement'],
    difficulty: [3, 5],
    skillsFocus: ['sourcing', 'alternatives', 'objectivity'],
    format: 'Incident and escalation assessment',
  },
  {
    id: 'geo-vote',
    area: 'geopolitics',
    title: 'Multilateral Vote Analysis',
    tagline: 'Read a UN or coalition vote for what it reveals about alignment and follow-through.',
    role:
      'You are the multilateral affairs analyst. You separate the symbolic politics of a vote from its operational consequences.',
    situation:
      'A multilateral body has voted on a resolution addressing a contested security or humanitarian issue. The vote count is public; explanations for abstentions and reversals are not. Commentators are treating the outcome as a decisive signal.\n\n{HOOK}\n\nStart with the resolution text, then the vote record, then national statements. A vote is a position, not yet a behavior.',
    intent:
      'Explain the alignment pattern, assess practical significance, and identify indicators of follow-through or reversal.',
    pirs: [
      {
        q: 'What does the resolution actually call for, and what is binding versus hortatory?',
        focus: 'Quote operative paragraphs. Do not rely on the headline.',
      },
      {
        q: 'What was the vote breakdown, and which abstentions or absences are substantively significant?',
        focus: 'Check procedural context and prior votes on similar texts.',
      },
      {
        q: 'What do official explanations of vote say, and how consistent are they with prior behavior?',
        focus: 'Compare statements with the same state’s earlier votes and material actions.',
      },
      {
        q: 'What competing explanations account for the alignment — security ties, trade dependence, domestic politics, bureaucratic caution, signaling?',
        focus: 'Test at least two and state the discriminating evidence.',
      },
      {
        q: 'What practical effect is plausible, given enforcement mechanisms and implementers?',
        focus: 'Identify who must act for the resolution to matter.',
      },
      {
        q: 'What indicators would show follow-through, selective implementation, or reversal?',
        focus: 'Tie indicators to specific institutions or reports.',
      },
    ],
    requirements: [
      'Cite the resolution text and the official vote record.',
      'Distinguish declaratory positions from material behavior.',
      'Explain at least two competing drivers of the alignment pattern.',
      'Assess practical effect, not just political symbolism.',
    ],
    vectors: [
      vector('unDigitalLibrary', 'Locate the resolution text, vote record, and related documents.'),
      vector('unGa', 'Check General Assembly records and statements where applicable.'),
      vector('sipri', 'Use arms transfer and expenditure data to test alignment claims.'),
      vector('comtrade', 'Check trade dependence where it is offered as an explanation.'),
      vector('reuters', 'Secondary reporting; trace quotes to official statements.', 'News reporting (secondary)'),
      vector('wikiCurrent', 'Chronology aid only; verify against the official record.'),
    ],
    anchors: [
      anchor('unDigitalLibrary', 'Recent UN resolutions and vote records', 'Choose a current resolution with a recorded vote and published text.'),
      anchor('unGa', 'Current General Assembly session', 'Use a live resolution or debate with published national statements.'),
    ],
    injects: [
      'A state that abstained issues a statement claiming it supported the resolution’s “objectives.” This is a drill inject. Explain how you would classify the position without over-reading the rhetoric.',
      'A key implementer announces it will not enforce the measure. This is a drill inject. Assess the likely effect on the resolution’s practical significance.',
    ],
    keywords: ['united nations', 'resolution', 'vote', 'abstain', 'security council', 'diplomatic', 'coalition', 'sanctions'],
    difficulty: [3, 5],
    skillsFocus: ['evidence', 'alternatives', 'structure'],
    format: 'Multilateral alignment assessment',
  },
];
