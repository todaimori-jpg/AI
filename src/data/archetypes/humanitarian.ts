import type { Archetype } from '../archetypes';
import { anchor, vector } from '../sources';

export const humanitarianArchetypes: Archetype[] = [
  {
    id: 'hum-earthquake',
    area: 'humanitarian',
    title: 'Earthquake Information Gaps',
    tagline: 'Turn a seismic event into a defensible picture of impact and unknowns.',
    role:
      'You are the humanitarian information analyst supporting a response planning cell. You do not produce public messaging; you identify what is known, what is missing, and what to collect first.',
    situation:
      'A significant earthquake has struck a populated region. Initial casualty figures conflict, local communications are degraded, and international responders are preparing. The planning cell needs an information-gap assessment within hours, not a final damage survey.\n\n{HOOK}\n\nStart with the physical event, exposure, and access. Treat early casualty figures as provisional until their method is clear.',
    intent:
      'Establish the plausible scale of impact, identify the most decision-relevant information gaps, and prioritize collection.',
    pirs: [
      {
        q: 'What are the confirmed seismic parameters, and how do they constrain plausible impact?',
        focus: 'Use USGS or the national seismic network. Note depth and rupture geometry.',
      },
      {
        q: 'Which population centers, critical facilities, and transport routes are plausibly exposed?',
        focus: 'Intersect shaking, terrain, and settlement data. Do not equate proximity with damage.',
      },
      {
        q: 'What casualty and displacement figures exist, who produced them, and how were they derived?',
        focus: 'Build a table of figures, sources, methods, and timestamps.',
      },
      {
        q: 'What access constraints are documented, and which are assumed rather than verified?',
        focus: 'Distinguish road damage from reports of road damage.',
      },
      {
        q: 'What are the highest-priority information gaps for the next 12–24 hours?',
        focus: 'Rank by decision impact, not by how easy the information is to obtain.',
      },
      {
        q: 'What indicators would show the response is overwhelmed or stabilizing?',
        focus: 'Tie indicators to observable response capacity and access.',
      },
    ],
    requirements: [
      'Separate confirmed seismic and exposure data from inferred impact.',
      'Do not present a single unverified casualty figure as fact.',
      'Rank information gaps by decision relevance.',
      'Provide a 12–24 hour collection plan with named sources or methods.',
    ],
    vectors: [
      vector('usgsQuake', 'Use the event page for magnitude, depth, location, and shaking products.'),
      vector('usgsApi', 'Pull structured event data if you need precise coordinates and times.'),
      vector('gdacs', 'Check the automated alert level and its stated methodology.'),
      vector('reliefweb', 'Look for initial situation reports and who produced them.'),
      vector('copernicusEms', 'Check whether a rapid mapping activation exists.'),
      vector('ochaHdx', 'Use population and infrastructure baseline data for exposure estimates.'),
      vector('iomDtm', 'Check for displacement baseline data if available.'),
    ],
    anchors: [
      anchor('usgsQuake', 'Recent significant earthquakes', 'Choose a current event with a USGS event page. Record magnitude, depth, and time.'),
      anchor('reliefweb', 'Current earthquake situation reports', 'Find a recent earthquake response with at least one official situation report.'),
    ],
    injects: [
      'A local official reports 400 dead while a national agency reports 90. Both figures lack a stated method. This is a drill inject. Explain how you would present the range without choosing a number you cannot defend.',
      'A major access road is reported closed, but no agency has surveyed it. This is a drill inject. Identify the imagery or local source that would upgrade the report.',
    ],
    keywords: ['earthquake', 'disaster', 'casualties', 'damage', 'relief', 'humanitarian', 'access', 'displacement'],
    difficulty: [2, 5],
    skillsFocus: ['uncertainty', 'sourcing', 'gaps'],
    format: 'Information-gap assessment',
  },
  {
    id: 'hum-flood',
    area: 'humanitarian',
    title: 'Flood Displacement Triangulation',
    tagline: 'Reconcile hazard data, population estimates, and displacement reporting.',
    role:
      'You are the displacement analyst for a humanitarian response. Your job is to triangulate estimates and expose their assumptions.',
    situation:
      'Severe flooding or a tropical cyclone has affected a river basin or coastal region. Government and agency displacement figures differ widely; some are pre-crisis projections, some are field counts, and some are political statements.\n\n{HOOK}\n\nTrace each estimate to its method and cut-off time. A larger number is not automatically a better number.',
    intent:
      'Produce a defensible displacement and exposure range, identify its main uncertainties, and prioritize verification.',
    pirs: [
      {
        q: 'What is the current hazard extent and forecast, and which areas remain at risk?',
        focus: 'Use the authoritative meteorological or hydrological product.',
      },
      {
        q: 'Which population estimates and displacement figures exist? Who produced each and how?',
        focus: 'Build a comparison table with method, date, and geography.',
      },
      {
        q: 'What explains the differences between estimates — definitions, timing, access, or politics?',
        focus: 'Test at least three explanations.',
      },
      {
        q: 'Where are displaced people going, and what access or protection constraints are documented?',
        focus: 'Distinguish planned evacuation from spontaneous displacement.',
      },
      {
        q: 'What is the most decision-relevant information gap for the next 24–48 hours?',
        focus: 'Tie the gap to a specific response decision.',
      },
      {
        q: 'What indicators would show displacement is stabilizing, growing, or becoming protracted?',
        focus: 'Name observable movement, shelter, and access data.',
      },
    ],
    requirements: [
      'Present a range, not a single unqualified displacement figure.',
      'Explain at least three reasons estimates diverge.',
      'Distinguish hazard exposure from actual displacement.',
      'Rank gaps by their effect on response planning.',
    ],
    vectors: [
      vector('nhc', 'Use official track and rainfall forecasts for tropical systems.'),
      vector('gdacs', 'Check the alert level and reported impact, noting its automated basis.'),
      vector('reliefweb', 'Collect situation reports and note their publication times.'),
      vector('unHCR', 'Check displacement and protection data where available.'),
      vector('iomDtm', 'Use DTM assessments and methodology notes.'),
      vector('copernicusEms', 'Look for flood extent mapping activations.'),
      vector('ochaHdx', 'Use population baselines and administrative boundaries.'),
    ],
    anchors: [
      anchor('gdacs', 'Current flood and cyclone alerts', 'Choose an active event with a reported impact and affected countries.'),
      anchor('reliefweb', 'Current flood response updates', 'Select a response with competing displacement estimates.'),
    ],
    injects: [
      'A government reports 80,000 displaced; an agency field team counts 22,000 in accessible areas only. This is a drill inject. Explain how access coverage explains the gap and how you would report it.',
      'A forecast predicts another 150 mm of rain, but hydrological models disagree on the basin response. This is a drill inject. State how you would bound the plausible range.',
    ],
    keywords: ['flood', 'cyclone', 'displacement', 'storm', 'evacuation', 'shelter', 'humanitarian', 'rainfall'],
    difficulty: [2, 5],
    skillsFocus: ['uncertainty', 'evidence', 'gaps'],
    format: 'Displacement estimate and gaps',
  },
  {
    id: 'hum-food',
    area: 'humanitarian',
    title: 'Food Security Risk',
    tagline: 'Assess a food-security classification and what could move it.',
    role:
      'You are the food security analyst. You evaluate evidence behind classification and the likely trajectory, not the political framing of hunger.',
    situation:
      'A region is approaching a new food-security assessment period. One agency warns of famine risk; a government disputes the methodology. Access constraints limit field data, and commodity prices are volatile.\n\n{HOOK}\n\nEstablish the classification, the evidence behind it, and the assumptions that could change it. Famine determinations have specific technical criteria; do not use the term loosely.',
    intent:
      'Assess the current food-security picture, the credibility of competing claims, and the indicators that would drive a change in phase.',
    pirs: [
      {
        q: 'What is the current classification, by area and population, and which technical criteria drive it?',
        focus: 'Use IPC or a comparable framework. Define the phase and the evidence base.',
      },
      {
        q: 'What are the main drivers — conflict, displacement, prices, harvest, access, aid — and how well documented are they?',
        focus: 'Separate structural drivers from shocks.',
      },
      {
        q: 'How credible are the competing assessments, and where do their methods diverge?',
        focus: 'Compare coverage, sampling, and assumptions.',
      },
      {
        q: 'What would need to change for the classification to worsen or improve?',
        focus: 'Name thresholds, not general trends.',
      },
      {
        q: 'Which populations are least visible in the data, and why?',
        focus: 'Access constraints often hide the worst outcomes.',
      },
      {
        q: 'What indicators over the next 1–3 months would confirm the trajectory?',
        focus: 'Use price, harvest, displacement, and access indicators.',
      },
    ],
    requirements: [
      'Use technical food-security terminology correctly and define it.',
      'Explain the evidence and assumptions behind any famine-risk claim.',
      'Include the least-visible populations in the analysis.',
      'Provide dated indicators for improvement or deterioration.',
    ],
    vectors: [
      vector('ipc', 'Use current IPC analyses and their confidence statements.'),
      vector('fewsNet', 'Check current food-security outlooks and assumptions.'),
      vector('faoGiews', 'Use country briefs for harvest and market context.'),
      vector('wfpHungerMap', 'Reference for food insecurity and price data.'),
      vector('ochaHdx', 'Use market, population, and access baselines.'),
      vector('reliefweb', 'Use situation reports for operational context.'),
    ],
    anchors: [
      anchor('ipc', 'Current IPC analyses', 'Choose a live analysis with a defined phase and population estimate.'),
      anchor('fewsNet', 'Current food security outlooks', 'Select a region with a forward-looking scenario and stated assumptions.'),
    ],
    injects: [
      'A government rejects a famine-risk analysis but publishes no alternative data. This is a drill inject. Explain how you would treat the rejection in your source assessment.',
      'Market prices fall sharply, but access to the market is restricted for the worst-affected group. This is a drill inject. Assess why price data alone may mislead.',
    ],
    keywords: ['food', 'famine', 'hunger', 'crop', 'drought', 'nutrition', 'humanitarian', 'prices'],
    difficulty: [3, 5],
    skillsFocus: ['sourcing', 'uncertainty', 'gaps'],
    format: 'Food-security risk assessment',
  },
  {
    id: 'hum-outbreak',
    area: 'humanitarian',
    title: 'Outbreak Reporting Verification',
    tagline: 'Test case counts, lab confirmation, and the shape of an outbreak.',
    role:
      'You are the public health information analyst. You assess the quality of outbreak reporting and its operational implications.',
    situation:
      'A cluster of severe illness has been reported in a region with limited laboratory capacity. Case counts are rising in media reports; official updates are infrequent. Neighboring states are considering travel measures.\n\n{HOOK}\n\nEstablish the case definition, laboratory status, and surveillance quality before interpreting the trend. A rising count can reflect spread, better detection, or revised definitions.',
    intent:
      'Determine what the evidence supports about the outbreak’s scale, spread, and trajectory, and what remains unknown.',
    pirs: [
      {
        q: 'What is the case definition, and how many cases and deaths meet it, by official source?',
        focus: 'Compare definitions across sources. A change in definition can explain a jump.',
      },
      {
        q: 'Which cases are laboratory-confirmed, and what is the testing capacity and backlog?',
        focus: 'Separate suspected from confirmed. Note specimen referral times.',
      },
      {
        q: 'What does the geographic and temporal pattern suggest about spread and detection?',
        focus: 'Look for reporting artifacts and surveillance gaps.',
      },
      {
        q: 'How credible are unofficial or media accounts, and what are their likely sources?',
        focus: 'Trace claims to health workers, local officials, or anonymous posts.',
      },
      {
        q: 'What is the response capacity — treatment, isolation, vaccination, risk communication?',
        focus: 'Use official and agency assessments, not aspirations.',
      },
      {
        q: 'What indicators would show containment, expansion, or a change in severity?',
        focus: 'Name surveillance and capacity thresholds.',
      },
    ],
    requirements: [
      'Distinguish suspected, probable, and confirmed cases.',
      'Explain how surveillance quality affects the trend.',
      'Mark unofficial claims and their provenance.',
      'Provide explicit uncertainty about severity and spread.',
    ],
    vectors: [
      vector('whoDon', 'Use official Disease Outbreak News and note the publication date.'),
      vector('ecdc', 'Check the communicable disease threat report for regional context.'),
      vector('reliefweb', 'Use health cluster and situation reports for operational detail.'),
      vector('ochaHdx', 'Use population, access, and health-facility baselines.'),
      vector('reuters', 'Secondary reporting; check whether it cites a health authority.', 'News reporting (secondary)'),
      vector('bbc', 'Secondary reporting; compare attribution and case figures.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor('whoDon', 'Current Disease Outbreak News', 'Choose an active outbreak with an official case count and date.'),
      anchor('ecdc', 'Current communicable disease threats', 'Select a current outbreak with a regional risk assessment.'),
    ],
    injects: [
      'A local hospital reports twice as many cases as the national health ministry. This is a drill inject. Explain how catchment, definition, and reporting lag could account for the difference.',
      'A neighboring country announces screening at borders without a public health rationale. This is a drill inject. Assess what the measure does and does not imply about the outbreak.',
    ],
    keywords: ['outbreak', 'disease', 'health', 'cases', 'epidemic', 'vaccination', 'who', 'illness'],
    difficulty: [3, 5],
    skillsFocus: ['sourcing', 'uncertainty', 'evidence'],
    format: 'Outbreak verification assessment',
  },
  {
    id: 'hum-displacement',
    area: 'humanitarian',
    title: 'Displacement and Access Constraints',
    tagline: 'Establish movement patterns when access to the affected area is limited.',
    role:
      'You are the protection and displacement analyst. You combine imperfect data without pretending the uncertainty has disappeared.',
    situation:
      'Conflict or instability has displaced civilians across a region. Estimates come from border counts, local authorities, remote sensing, and partner organizations with different access. Some routes are closed to humanitarian workers.\n\n{HOOK}\n\nMap the movement and the access constraints together. Displacement figures without coverage caveats are misleading.',
    intent:
      'Produce a bounded displacement estimate, identify protection and access risks, and prioritize information collection.',
    pirs: [
      {
        q: 'What displacement estimates exist, and what methods and coverage do they reflect?',
        focus: 'Use a comparison table with dates and geographic scope.',
      },
      {
        q: 'What are the main movement routes and destinations, and how confident are you in each?',
        focus: 'Cross-check border counts, local reports, and transport data.',
      },
      {
        q: 'Where is humanitarian access constrained, and what is the effect on the evidence base?',
        focus: 'Name the specific access barrier and who controls it.',
      },
      {
        q: 'What protection risks are documented, and which are inferred?',
        focus: 'Be careful with allegations; note the source and its access.',
      },
      {
        q: 'What does the available evidence imply about likely near-term movement?',
        focus: 'Tie the judgment to drivers, not momentum.',
      },
      {
        q: 'What collection would most improve the picture in the next 72 hours?',
        focus: 'Prioritize feasible methods under access constraints.',
      },
    ],
    requirements: [
      'Present a bounded estimate with coverage caveats.',
      'Separate documented protection incidents from inferred risk.',
      'Explain how access constraints bias the data.',
      'Prioritize collection methods that are feasible now.',
    ],
    vectors: [
      vector('unHCR', 'Use registration, border, and protection data with dates.'),
      vector('iomDtm', 'Check DTM assessments and their methodology.'),
      vector('reliefweb', 'Use situation reports and access updates.'),
      vector('acled', 'Use conflict-event data to contextualize movement, with coding caveats.'),
      vector('ochaHdx', 'Use administrative boundaries and population baselines.'),
      vector('logisticsCluster', 'Check access and transport constraints.'),
    ],
    anchors: [
      anchor('unHCR', 'Current displacement data', 'Select a live displacement situation with a dated update.'),
      anchor('iomDtm', 'Current DTM assessments', 'Choose an assessment with a stated methodology and coverage.'),
    ],
    injects: [
      'A border crossing reports 12,000 arrivals in a week; a partner reports 30,000. This is a drill inject. Explain how counting methods and double-counting could produce the gap.',
      'A route is declared open by authorities, but an aid convoy has not used it. This is a drill inject. Identify what “open” would need to mean operationally.',
    ],
    keywords: ['refugee', 'displaced', 'migration', 'border', 'access', 'protection', 'humanitarian', 'conflict'],
    difficulty: [3, 5],
    skillsFocus: ['uncertainty', 'gaps', 'objectivity'],
    format: 'Displacement and access assessment',
  },
];
