import type { Archetype } from '../archetypes';
import { anchor, vector } from '../sources';

export const aviationArchetypes: Archetype[] = [
  {
    id: 'avn-airspace',
    area: 'aviation',
    title: 'Airspace Restriction Effects',
    tagline: 'Trace a live airspace closure from the notice to the operational ripple.',
    role:
      'You are the air-mobility analyst on a joint watch floor. You own civil-military airspace friction and its operational effects — not accident investigation.',
    situation:
      'A civil aviation authority has removed a block of airspace from normal use. Airlines, business aviation, and military air mobility are rerouting or absorbing delay. The watch officer wants a first-pass effects estimate before the next coordination call.\n\n{HOOK}\n\nDo not accept the restriction notice at face value. Verify its geometry, altitude bands, effective window, and any exemptions before assessing impact.',
    intent:
      'Determine who is affected, how severely, for how long, and what would cause the disruption to spread.',
    pirs: [
      {
        q: 'What exactly is restricted — lateral and vertical limits, effective window, and exemptions — and which notice is authoritative?',
        focus: 'Start from the primary notice. Quote the limits; do not paraphrase the headline.',
      },
      {
        q: 'Which operators, routes, or missions are most exposed, and how much traffic is actually affected?',
        focus: 'Use counts, reroute distance, or delay data. Avoid adjectives where a number is possible.',
      },
      {
        q: 'What are the likely second-order effects on schedules, crew duty time, and regional connectivity?',
        focus: 'Separate demonstrated effects from plausible ones.',
      },
      {
        q: 'What alternatives exist — alternate routings, airports, slot relief — and what constrains them?',
        focus: 'A workaround that requires unavailable capacity is not a mitigation.',
      },
      {
        q: 'What would cause the restriction to extend or widen? Which observable indicators would show that early?',
        focus: 'Give at least two falsifiable indicators.',
      },
      {
        q: 'How consistent are public accounts of the disruption with the official notices? Where do they diverge?',
        focus: 'Media repetition of a headline is not independent corroboration.',
      },
    ],
    requirements: [
      'Lead with a one-sentence effects judgment and your confidence.',
      'Quantify traffic exposure where the data allows; mark estimates as estimates.',
      'Treat the notice or official bulletin as primary; label media accounts as secondary.',
      'State at least two remaining gaps and one concrete collection action.',
    ],
    vectors: [
      vector('faaNotam', 'Search by area, effective time, and altitude band. Capture the NOTAM number and full text.'),
      vector('eurocontrol', 'Check network-level flow measures and advisories for the affected region.'),
      vector('flightradar', 'Sample live tracks to see whether routings actually changed, not just whether a notice exists.'),
      vector('adsbExchange', 'Cross-check tracks with an independent receiver network.'),
      vector('icao', 'Use for airspace classification and standard terminology.'),
      vector('reuters', 'Secondary reporting only. Follow its links to primary documents.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor(
        'faaNotam',
        'Active airspace restrictions and NOTAMs',
        'Select one restriction that is live now and has a defined geometry and time window. Record the notice number.',
      ),
      anchor(
        'eurocontrol',
        'Current European network restrictions',
        'Use a current advisory or flow measure with a stated cause and area.',
      ),
    ],
    injects: [
      'A second notice extends the restriction by 18 hours, but an airline operations bulletin says normal routings resume sooner. Do not cite either. State which document would be authoritative and what evidence would resolve the conflict.',
      'A regional carrier announces it will suspend two routes for a week, citing the restriction. The statement provides no traffic figures. This is a simulated inject; treat it as a hypothesis to test, not evidence.',
    ],
    keywords: ['airspace', 'notam', 'airport', 'flight', 'airline', 'closure', 'reroute', 'aviation'],
    difficulty: [1, 5],
    skillsFocus: ['sourcing', 'evidence', 'uncertainty'],
    format: 'Operational effects estimate',
  },
  {
    id: 'avn-navigation',
    area: 'aviation',
    title: 'Navigation Integrity Event',
    tagline: 'Separate reported GPS interference from demonstrated operational hazard.',
    role:
      'You are the positioning, navigation, and timing analyst. Your job is to distinguish jamming reports, spoofing indications, and ordinary navigation variance.',
    situation:
      'Pilots and mariners in a region have reported degraded satellite navigation. Authorities may have issued advisories, and crowdsourced interference maps may show a pattern. "Reported interference" and "operational hazard" are different claims.\n\n{HOOK}\n\nEstablish what was observed, by whom, with what equipment, over what area, and for how long before assessing effects.',
    intent:
      'Establish the strength of the interference evidence, then judge the operational exposure and the most likely explanation.',
    pirs: [
      {
        q: 'What is the evidence that interference occurred, and how was it measured or reported?',
        focus: 'Distinguish instrument indications, crew reports, and social media claims.',
      },
      {
        q: 'Does the geographic and temporal pattern support jamming, spoofing, or another explanation?',
        focus: 'Map the pattern. Look for edges, duration, and correlation with known activity.',
      },
      {
        q: 'Which flight or maritime operations are most exposed, and what procedures reduce risk?',
        focus: 'Check operator guidance and airworthiness directives, not only news.',
      },
      {
        q: 'How reliable and independent are the reporting channels? Are they re-reporting the same source?',
        focus: 'Trace at least one claim back to its origin.',
      },
      {
        q: 'What alternative explanations fit the observations — equipment fault, atmospheric conditions, database error, deliberate interference?',
        focus: 'Give each a fair test. Do not construct a strawman.',
      },
      {
        q: 'What indicators would confirm an intentional source rather than an environmental or equipment cause?',
        focus: 'Name observable thresholds and timing, not just "more reports".',
      },
    ],
    requirements: [
      'State the evidentiary basis for interference before assessing impact.',
      'Separate what is measured from what is claimed by crews or media.',
      'Include at least three competing explanations and the evidence that discriminates among them.',
      'Mark unverified reporting clearly and do not launder it into fact.',
    ],
    vectors: [
      vector('gpsjam', 'Crowdsourced interference map. Useful for pattern, not proof. Note its methodology and sample bias.'),
      vector('faaAsias', 'Search for relevant incident reports and service difficulty records.'),
      vector('easa', 'Check safety information bulletins and operator guidance.'),
      vector('icao', 'Reference for navigation performance and advisory terminology.'),
      vector('adsbExchange', 'Examine track anomalies, but remember that ADS-B quality itself depends on navigation.'),
      vector('reuters', 'Secondary reporting. Follow links to official advisories.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor(
        'gpsjam',
        'Current interference reporting',
        'Identify a region with a sustained anomaly in the recent period. Record the dates and the map methodology.',
      ),
      anchor(
        'faaAsias',
        'Recent navigation-related incident records',
        'Select a recent record with a clear event description. Do not infer more than the record states.',
      ),
    ],
    injects: [
      'A notice warns of unreliable GPS within 150 nautical miles for 48 hours. A second source claims the problem ended after 12 hours. This is a drill inject. Explain how a notice cancellation and flight-track evidence would resolve it.',
      'An operator reports a temporary loss of navigation over a region but declines to name the aircraft or route. Treat this as a drill inject and assess how much weight it deserves without corroboration.',
    ],
    keywords: ['gps', 'jamming', 'spoofing', 'navigation', 'interference', 'flight', 'aircraft'],
    difficulty: [2, 5],
    skillsFocus: ['sourcing', 'evidence', 'alternatives'],
    format: 'Navigation integrity assessment',
  },
  {
    id: 'avn-ash-weather',
    area: 'aviation',
    title: 'Ash and Weather Disruption',
    tagline: 'Convert a hazard forecast into an aviation effects estimate.',
    role:
      'You are the aviation hazard analyst supporting a regional operations cell. Your product informs routing and airport decisions, not public warnings.',
    situation:
      'A volcanic ash advisory or severe weather system is affecting a busy air route structure. Operators are making unilateral reroute and cancellation decisions, and public reporting is ahead of the official forecast.\n\n{HOOK}\n\nAnchor the assessment in the hazard advisory and the current operational picture. A hazard that does not intersect traffic is not an aviation crisis.',
    intent:
      'Estimate the operational effect of the hazard over the next 24–72 hours and identify what would change the picture.',
    pirs: [
      {
        q: 'What does the authoritative hazard product show — extent, altitude, movement, and forecast uncertainty?',
        focus: 'Use the official advisory, not a news summary of it.',
      },
      {
        q: 'Which airports, routes, and operators are actually exposed?',
        focus: 'Intersect the hazard geometry with traffic. Do not assume a regional event affects all traffic.',
      },
      {
        q: 'What operational responses are documented, and how do they compare with published guidance?',
        focus: 'Look for notices, operator bulletins, and regulator guidance.',
      },
      {
        q: 'What is the plausible duration and what are the main uncertainties in the forecast?',
        focus: 'Confidence should reflect forecast skill and observation density.',
      },
      {
        q: 'What are the second-order effects on cargo, crews, and connecting networks?',
        focus: 'Keep this proportionate to the evidence.',
      },
      {
        q: 'What indicators would signal a material worsening or an early return to normal?',
        focus: 'Tie each indicator to a specific product or observable.',
      },
    ],
    requirements: [
      'Use the hazard advisory as the primary source and cite its issue time.',
      'Distinguish observed hazard from forecast hazard.',
      'Quantify exposure with airport or route counts where possible.',
      'Provide a 24–72 hour effects judgment with explicit uncertainty.',
    ],
    vectors: [
      vector('noaaVaac', 'Locate the responsible volcanic ash advisory center and the current advisory text.'),
      vector('nhc', 'For tropical cyclone or severe weather products, use the official forecast cone and discussions.'),
      vector('eurocontrol', 'Check for network advisories and flow measures.'),
      vector('flightradar', 'Sample actual reroutes and cancellations around the hazard.'),
      vector('iata', 'Reference for operator guidance and disruption norms.'),
      vector('icao', 'Reference for ash encounter procedures and hazard terminology.'),
    ],
    anchors: [
      anchor(
        'noaaVaac',
        'Current volcanic ash advisories',
        'Choose an active advisory with a defined ash cloud and forecast trajectory.',
      ),
      anchor('nhc', 'Active tropical cyclone advisories', 'Choose a system with a current forecast cone affecting aviation routes.'),
    ],
    injects: [
      'An airline cancels 40 flights but publishes no route-level detail. A second carrier continues operating through the same region. This is a drill inject. Assess what route-level data you would need before drawing an inference about safety.',
      'A regional airport closes for six hours citing ash, while the advisory shows the cloud remaining offshore. This is a drill inject. Identify the documents that would explain the discrepancy.',
    ],
    keywords: ['volcano', 'ash', 'weather', 'cyclone', 'storm', 'aviation', 'airport', 'forecast'],
    difficulty: [2, 4],
    skillsFocus: ['uncertainty', 'sourcing', 'structure'],
    format: 'Hazard effects estimate',
  },
  {
    id: 'avn-capacity',
    area: 'aviation',
    title: 'Airport Capacity Shock',
    tagline: 'Assess how a runway, ATC, or utility outage propagates through a network.',
    role:
      'You are the airport and network analyst. You translate a local infrastructure problem into network-level effects without overstating them.',
    situation:
      'A significant airport has lost part of its operating capacity — a runway, air traffic control facility, or critical utility. The cause may be disputed. Airlines are adjusting schedules while local reporting amplifies the disruption.\n\n{HOOK}\n\nEstablish the capacity loss first. Then trace propagation through schedules, diversions, and crew constraints.',
    intent:
      'Estimate the capacity loss, the network effects, and the recovery trajectory.',
    pirs: [
      {
        q: 'What capacity has been lost, according to the operator or regulator, and for how long?',
        focus: 'Use the airport notice, regulator statement, or operator bulletin.',
      },
      {
        q: 'Which traffic is most affected — carriers, cargo, general aviation, military — and in what proportion?',
        focus: 'Quantify with movements or seat capacity if available.',
      },
      {
        q: 'What is propagating through the network: diversions, cancellations, crew displacement, cargo delay?',
        focus: 'Separate local effects from network effects.',
      },
      {
        q: 'What mitigation is in place and what are its limits?',
        focus: 'Alternate airports have their own constraints. Check them.',
      },
      {
        q: 'How credible and independent are the damage or cause claims circulating publicly?',
        focus: 'Apply source grading. A single local outlet is not corroboration.',
      },
      {
        q: 'What would indicate recovery is ahead of or behind the official timeline?',
        focus: 'Give observable markers and expected timing.',
      },
    ],
    requirements: [
      'Lead with the capacity impact, not the cause narrative.',
      'Cite the primary operational notice for the outage and duration.',
      'Distinguish confirmed effects from modeled or inferred ones.',
      'Provide a recovery indicator set with expected timing.',
    ],
    vectors: [
      vector('faaNotam', 'Look for airport closure, runway, or procedural notices. Capture the effective times.'),
      vector('faaAsias', 'Check incident and service difficulty records where applicable.'),
      vector('iata', 'Reference for airport capacity and disruption terminology.'),
      vector('flightradar', 'Sample arrivals and diversions to test the claimed capacity loss.'),
      vector('easa', 'Check for safety or operational guidance if the event has a regulatory dimension.'),
      vector('reuters', 'Secondary reporting only; trace its claims to the operator statement.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor(
        'faaNotam',
        'Active airport and runway restrictions',
        'Select a current notice that materially reduces capacity at a commercial airport.',
      ),
      anchor(
        'faaAsias',
        'Recent airport incident records',
        'Use a record with a stated operational impact, not only a narrative.',
      ),
    ],
    injects: [
      'The airport says the runway will reopen in 12 hours; an airline schedule update assumes 36. This is a drill inject. State which source governs planning and what evidence would close the gap.',
      'A local outlet reports the outage was caused by sabotage; the operator cites an equipment failure. This is a drill inject. Describe the verification steps before either cause enters your assessment.',
    ],
    keywords: ['airport', 'runway', 'closure', 'air traffic control', 'capacity', 'cancel', 'diversion', 'flight'],
    difficulty: [2, 5],
    skillsFocus: ['evidence', 'uncertainty', 'structure'],
    format: 'Network effects assessment',
  },
  {
    id: 'avn-uas',
    area: 'aviation',
    title: 'UAS Incursion Reconciliation',
    tagline: 'Reconcile conflicting accounts of a drone incursion near a flight corridor.',
    role:
      'You are the counter-UAS information analyst. Your job is not to direct operations; it is to establish what is actually known and what the competing accounts fail to support.',
    situation:
      'Reports describe an unmanned aircraft system near an airport or military flight corridor. Accounts differ on altitude, proximity, and whether flight operations were suspended. Local media, aviation sources, and official statements are not aligned.\n\n{HOOK}\n\nBuild an evidence table before offering an assessment. In this problem set, the most common error is treating a sighting report as a confirmed incursion.',
    intent:
      'Establish the strongest supportable account of what happened and identify the evidence needed to resolve the remaining conflicts.',
    pirs: [
      {
        q: 'What is the strongest evidence that a UAS was present, and what is its provenance?',
        focus: 'Separate sensor data, crew reports, official statements, and social media.',
      },
      {
        q: 'Which factual claims are shared across independent sources, and which appear only once?',
        focus: 'Build a claim-by-source matrix. Note the direction of transmission.',
      },
      {
        q: 'What is the supported effect on flight operations, if any?',
        focus: 'A suspension claim needs a notice, log, or operator confirmation.',
      },
      {
        q: 'What are the competing explanations — UAS, bird, laser, sensor artifact, misidentification, deliberate hoax?',
        focus: 'Test each against the observed details.',
      },
      {
        q: 'How do official statements differ from media accounts, and what explains the difference?',
        focus: 'Consider reporting lag, classification, liability, and incomplete investigation.',
      },
      {
        q: 'What evidence would resolve the main conflicts, and who holds it?',
        focus: 'Name specific records, sensors, or interviews.',
      },
    ],
    requirements: [
      'State clearly what is confirmed, what is assessed, and what is unverified.',
      'Do not repeat a single-source claim as fact, even if widely reported.',
      'Include an explicit evidence table or structured claim comparison.',
      'Rank remaining collection needs by how much they would change the judgment.',
    ],
    vectors: [
      vector('faaAsias', 'Search relevant incident records and note their publication lag.'),
      vector('faaNotam', 'Check for temporary flight restrictions or airport notices issued around the reported time.'),
      vector('adsbExchange', 'Use track data to test airspace activity, with awareness of coverage gaps for small UAS.'),
      vector('bellingcatToolkit', 'Methods for locating, archiving, and comparing user-generated content.'),
      vector('ap', 'Secondary reporting; trace each specific claim to its original source.', 'News reporting (secondary)'),
      vector('reuters', 'Secondary reporting; compare wording and attribution across outlets.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor(
        'faaAsias',
        'Recent UAS-related incident records',
        'Choose one record with a specific location and time. Note what the record does not say.',
      ),
      anchor(
        'faaNotam',
        'Temporary flight restrictions near airports',
        'Identify a current restriction that may be linked to UAS activity. Do not assume the link.',
      ),
    ],
    injects: [
      'A video appears to show a drone hovering near an approach path. The uploader is anonymous and the location is unverified. This is a drill inject. List the five checks you would run before using it, and do not cite it.',
      'An airport says operations were suspended for 30 minutes; an airline says there was no suspension. This is a drill inject. Identify the operational records that would settle the question.',
    ],
    keywords: ['drone', 'uas', 'airport', 'incursion', 'flight', 'aviation', 'video', 'claim'],
    difficulty: [3, 5],
    skillsFocus: ['sourcing', 'alternatives', 'objectivity'],
    format: 'Reconciled incident assessment',
  },
];
