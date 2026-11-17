import type { Archetype } from '../archetypes';
import { anchor, vector } from '../sources';

export const forecastingArchetypes: Archetype[] = [
  {
    id: 'fcst-election',
    area: 'forecasting',
    title: 'Election Outcome Indicators',
    tagline: 'Build a judgment with indicators, not a prediction market hot take.',
    role:
      'You are the political forecasting analyst. You assess probabilities and the indicators that would move them.',
    situation:
      'A national election is approaching. Polling is plentiful but uneven; institutional trust is low; several parties are contesting the result before it is held. The desk needs a short forecast with observable indicators, not a horse-race narrative.\n\n{HOOK}\n\nEstablish the electoral rules, the polling record, and the institutional constraints. Then state explicit scenarios with probabilities and indicators.',
    intent:
      'Produce a calibrated near-term forecast of the outcome and post-election stability, with indicators that would change the judgment.',
    pirs: [
      {
        q: 'What are the electoral rules, thresholds, and timeline that determine the outcome?',
        focus: 'Use the official framework. Rules matter more than polling in many systems.',
      },
      {
        q: 'What is the quality and history of the available polling, and what does it miss?',
        focus: 'Compare pollsters, sample frames, and past error.',
      },
      {
        q: 'What institutional, security, or legal factors could affect the result or its acceptance?',
        focus: 'Include courts, commissions, security forces, and dispute mechanisms.',
      },
      {
        q: 'What are the plausible scenarios, and what probability do you assign to each?',
        focus: 'Use the standard probability yardstick. Scenarios must be mutually distinguishable.',
      },
      {
        q: 'Which indicators over the next 30–90 days would shift the probabilities?',
        focus: 'Make each observable and dated.',
      },
      {
        q: 'What is the main source of uncertainty, and what would falsify your lead scenario?',
        focus: 'State it explicitly, not as a disclaimer.',
      },
    ],
    requirements: [
      'Use standard probability terms with ranges.',
      'Explain the basis for polling confidence and its limits.',
      'Provide at least three scenarios with indicators.',
      'State what would change your judgment and why.',
    ],
    vectors: [
      vector('ifes', 'Use the election guide and official framework references.'),
      vector('idea', 'Compare electoral system design and turnout context.'),
      vector('osceOdihr', 'Check for observation missions and pre-election assessments.'),
      vector('reuters', 'Secondary reporting; use it for chronology and official quotes.', 'News reporting (secondary)'),
      vector('googleTrends', 'Use as a weak, caveated signal of public attention.'),
      vector('wikiCurrent', 'Chronology aid only; verify against official sources.'),
    ],
    anchors: [
      anchor('ifes', 'Upcoming election calendar', 'Choose an election within the next 90 days with a published legal framework.'),
      anchor('osceOdihr', 'Current observation missions', 'Select an active mission with a pre-election statement.'),
    ],
    injects: [
      'Two respected pollsters publish results six points apart. This is a drill inject. Explain how house effects, sampling, and timing could account for the gap.',
      'A leading party announces it will not accept the result if turnout falls below a threshold. This is a drill inject. Assess how that statement changes the scenario space, if at all.',
    ],
    keywords: ['election', 'forecast', 'poll', 'vote', 'scenario', 'indicator', 'political', 'stability'],
    difficulty: [3, 5],
    skillsFocus: ['uncertainty', 'alternatives', 'structure'],
    format: 'Probabilistic election forecast',
  },
  {
    id: 'fcst-conflict',
    area: 'forecasting',
    title: 'Conflict Escalation Forecast',
    tagline: 'Cast a short, disciplined forecast of escalation or de-escalation.',
    role:
      'You are the conflict analyst. You assess behavior and indicators, not the moral character of the parties.',
    situation:
      'A long-running dispute has entered a more volatile phase. Rhetoric is escalating; military movements are reported; negotiations are stalled. Observers disagree about whether this is posturing or preparation.\n\n{HOOK}\n\nEstablish the baseline level of violence and readiness. Then distinguish indicators of deliberate escalation from normal exercise cycles and signaling.',
    intent:
      'Forecast the near-term trajectory with explicit scenarios, indicators, and probabilities.',
    pirs: [
      {
        q: 'What is the current baseline of violence, mobilization, and diplomatic activity?',
        focus: 'Use structured data and dated official statements.',
      },
      {
        q: 'Which recent changes are material, and which are routine or symbolic?',
        focus: 'Compare with the same period in previous years.',
      },
      {
        q: 'What do the parties appear to want, and what constrains them?',
        focus: 'Infer from behavior and statements, and label inference as inference.',
      },
      {
        q: 'What are the plausible escalation and de-escalation scenarios?',
        focus: 'Describe observable paths, not adjectives.',
      },
      {
        q: 'What indicators would distinguish preparation for action from posturing?',
        focus: 'Name logistics, communications, and force-posture indicators.',
      },
      {
        q: 'What would falsify your lead scenario, and how soon would you know?',
        focus: 'Set a review point.',
      },
    ],
    requirements: [
      'State the baseline before forecasting change.',
      'Separate material indicators from rhetoric.',
      'Provide at least three scenarios with probabilities.',
      'Include de-escalation and a falsification test.',
    ],
    vectors: [
      vector('acled', 'Use recent event data to establish the baseline and trend.'),
      vector('ucdp', 'Compare structured conflict data and note lag.'),
      vector('isw', 'Use as secondary analysis; test its claims against primary evidence.'),
      vector('unDigitalLibrary', 'Check Security Council and regional organization records.'),
      vector('bellingcatToolkit', 'Verify circulating imagery and movement claims.'),
      vector('reuters', 'Secondary reporting; trace quotes and movements to official sources.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor('acled', 'Recent conflict-event trends', 'Choose a current dispute with a measurable change in event frequency.'),
      anchor('isw', 'Current conflict assessments', 'Select a current assessment and check its underlying evidence.'),
    ],
    injects: [
      'A party announces a “routine exercise” near the border while canceling leave. This is a drill inject. Explain which parts of the signal are meaningful and what would confirm them.',
      'Diplomatic talks resume with no agenda published. This is a drill inject. Assess whether the resumption should change your escalation probability.',
    ],
    keywords: ['conflict', 'escalation', 'military', 'forecast', 'scenario', 'indicators', 'ceasefire', 'exercise'],
    difficulty: [4, 5],
    skillsFocus: ['alternatives', 'uncertainty', 'evidence'],
    format: 'Escalation forecast',
  },
  {
    id: 'fcst-chokepoint',
    area: 'forecasting',
    title: 'Seasonal Chokepoint Stress',
    tagline: 'Forecast shipping stress before the queue forms.',
    role:
      'You are the maritime risk forecaster. You combine seasonal, operational, and market signals into a bounded outlook.',
    situation:
      'A major chokepoint is entering its seasonal stress period — drought, monsoon, ice, harvest volumes, or peak container demand. Last year produced disruption; operators are positioning early. The desk wants a 3–6 month outlook.\n\n{HOOK}\n\nEstablish the seasonal baseline and the current operating margin. A forecast without a baseline is a guess.',
    intent:
      'Forecast the likelihood of material throughput disruption and identify the leading indicators.',
    pirs: [
      {
        q: 'What is the seasonal baseline for this chokepoint, and how variable is it?',
        focus: 'Use multi-year transit and weather data.',
      },
      {
        q: 'What is the current operating margin — water levels, slot capacity, insurance, backlog?',
        focus: 'Quantify where possible. State the source date.',
      },
      {
        q: 'What are the main stress scenarios, and what would trigger each?',
        focus: 'Tie scenarios to observable thresholds.',
      },
      {
        q: 'Which commodity flows and regions are most exposed under each scenario?',
        focus: 'Use trade and routing data.',
      },
      {
        q: 'What mitigation is available, and how much can it absorb?',
        focus: 'Include cost and time, not just capacity.',
      },
      {
        q: 'Which leading indicators should be monitored weekly, and at what thresholds?',
        focus: 'Give a monitoring dashboard in text.',
      },
    ],
    requirements: [
      'Use a multi-year seasonal baseline.',
      'Quantify current operating margin and source dates.',
      'Provide three scenarios with probabilities and triggers.',
      'Include a weekly indicator watchlist.',
    ],
    vectors: [
      vector('portwatch', 'Use historical transit series and current port calls.'),
      vector('noaaCpc', 'Check seasonal climate outlooks for the relevant basin.'),
      vector('ecmwf', 'Use medium-range and seasonal forecast products where available.'),
      vector('eiaChokepoints', 'Reference normal energy flows and strategic importance.'),
      vector('unctad', 'Use maritime trade baselines and seasonal context.'),
      vector('freightos', 'Check whether freight rates are pricing in stress.'),
    ],
    anchors: [
      anchor('portwatch', 'Chokepoint throughput history', 'Choose a chokepoint with at least three years of transit data.'),
      anchor('noaaCpc', 'Seasonal climate outlook', 'Select a region with a current seasonal precipitation or temperature outlook.'),
    ],
    injects: [
      'Water levels are above last year’s crisis level, but bookings are already down 20 percent. This is a drill inject. Explain how demand and supply signals interact in your forecast.',
      'A carrier announces seasonal surcharges three months early. This is a drill inject. Assess whether it is a leading indicator or a commercial hedge.',
    ],
    keywords: ['shipping', 'seasonal', 'chokepoint', 'canal', 'forecast', 'drought', 'freight', 'scenario'],
    difficulty: [3, 5],
    skillsFocus: ['uncertainty', 'evidence', 'structure'],
    format: 'Seasonal maritime risk outlook',
  },
  {
    id: 'fcst-disaster',
    area: 'forecasting',
    title: 'Disaster Season Risk',
    tagline: 'Forecast hazard exposure and response strain before impact.',
    role:
      'You are the humanitarian risk forecaster. You assess hazard likelihood and exposure, not the inevitability of disaster.',
    situation:
      'A region is entering a known hazard season — cyclone, monsoon, drought, or wildfire. Forecasts disagree on intensity; preparedness funding is lagging; last season exposed response gaps.\n\n{HOOK}\n\nSeparate hazard probability, exposure, and vulnerability. A strong season is not the same as a humanitarian emergency.',
    intent:
      'Produce a seasonal risk outlook with scenarios, exposed populations, and warning indicators.',
    pirs: [
      {
        q: 'What does the official seasonal outlook indicate, and with what confidence and spatial resolution?',
        focus: 'Use the authoritative meteorological product and its uncertainty.',
      },
      {
        q: 'Which populations and critical systems are exposed if a severe event occurs?',
        focus: 'Use population, infrastructure, and access baselines.',
      },
      {
        q: 'What are the current preparedness and response capacity gaps?',
        focus: 'Use agency reporting, not assumptions.',
      },
      {
        q: 'What are the plausible scenarios, and what would trigger each?',
        focus: 'Describe hazard and response conditions together.',
      },
      {
        q: 'What would make a moderate hazard become a humanitarian crisis?',
        focus: 'Focus on vulnerability and response multipliers.',
      },
      {
        q: 'Which indicators should trigger a change in posture, and at what thresholds?',
        focus: 'Name observable thresholds and decision points.',
      },
    ],
    requirements: [
      'Distinguish hazard likelihood from humanitarian impact.',
      'Use official seasonal outlooks with confidence caveats.',
      'Describe exposure and vulnerability separately.',
      'Provide trigger thresholds for response posture changes.',
    ],
    vectors: [
      vector('noaaCpc', 'Use seasonal precipitation and temperature outlooks.'),
      vector('ecmwf', 'Check seasonal forecast products and their skill.'),
      vector('gdacs', 'Use current alerts and historical impact data.'),
      vector('reliefweb', 'Check preparedness and response reporting.'),
      vector('fewsNet', 'Use food-security and livelihood context where relevant.'),
      vector('ochaHdx', 'Use population, access, and infrastructure baselines.'),
    ],
    anchors: [
      anchor('noaaCpc', 'Current seasonal outlooks', 'Choose a region with an active seasonal hazard outlook.'),
      anchor('gdacs', 'Current disaster alerts', 'Select an active hazard season with recent alerts.'),
    ],
    injects: [
      'The seasonal outlook is “near normal,” but shelter capacity is 40 percent below last year. This is a drill inject. Explain how the risk picture changes without changing the hazard forecast.',
      'A forecast update raises the probability of a severe event two weeks before peak season. This is a drill inject. Assess which triggers should change and which should wait for confirmation.',
    ],
    keywords: ['disaster', 'season', 'cyclone', 'monsoon', 'drought', 'forecast', 'preparedness', 'risk'],
    difficulty: [3, 5],
    skillsFocus: ['uncertainty', 'gaps', 'structure'],
    format: 'Seasonal humanitarian risk outlook',
  },
  {
    id: 'fcst-sovereign',
    area: 'forecasting',
    title: 'Sovereign Stress Early Warning',
    tagline: 'Assess debt and currency stress with indicators, not prophecy.',
    role:
      'You are the economic risk analyst. You assess external and fiscal vulnerability and the political constraints on adjustment.',
    situation:
      'A country is under pressure from rising debt service, a weakening currency, and uncertain commodity revenue. The government says it can meet obligations; markets are pricing risk. The desk wants a 6–12 month stress outlook.\n\n{HOOK}\n\nEstablish the external position, debt service, reserves, and political constraints. Market prices are evidence of expectations, not proof of default.',
    intent:
      'Assess the likelihood of a debt-servicing or currency crisis and identify early-warning indicators.',
    pirs: [
      {
        q: 'What is the external and fiscal position — reserves, debt service, current account, revenue concentration?',
        focus: 'Use IMF, World Bank, and official central bank data with dates.',
      },
      {
        q: 'What is priced into markets, and what does that imply about expectations?',
        focus: 'Separate market pricing from fundamentals.',
      },
      {
        q: 'What political and institutional constraints affect adjustment or external support?',
        focus: 'Consider coalition politics, elections, and IMF program conditions.',
      },
      {
        q: 'What are the plausible stress paths over 6–12 months?',
        focus: 'Include a muddle-through scenario, not only crisis or recovery.',
      },
      {
        q: 'Which indicators would provide early warning, and at what thresholds?',
        focus: 'Use reserves, spreads, FX, and auction data.',
      },
      {
        q: 'What would falsify the stress thesis?',
        focus: 'Name specific data or policy actions.',
      },
    ],
    requirements: [
      'Use dated official macroeconomic data.',
      'Separate fundamentals from market expectations.',
      'Provide at least three scenarios with probabilities.',
      'Include early-warning thresholds and a falsification test.',
    ],
    vectors: [
      vector('imfWeo', 'Use macroeconomic projections and note their assumptions.'),
      vector('worldBank', 'Use debt and development indicators.'),
      vector('bis', 'Check cross-border banking and credit data where relevant.'),
      vector('fred', 'Use available market and macroeconomic series.'),
      vector('imfData', 'Pull balance-of-payments and reserve data.'),
      vector('reuters', 'Secondary reporting; trace figures to official releases.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor('imfWeo', 'Current macroeconomic projections', 'Choose a country with a recent IMF assessment and a visible stress indicator.'),
      anchor('fred', 'Current economic and market series', 'Select a series that tracks sovereign or currency stress for the country.'),
    ],
    injects: [
      'The central bank raises rates sharply but reserves continue to fall. This is a drill inject. Explain how you would distinguish temporary defense from a loss of confidence.',
      'A commodity price rises 30 percent, improving the fiscal picture. This is a drill inject. Assess how much of the stress thesis the windfall actually removes.',
    ],
    keywords: ['debt', 'currency', 'sovereign', 'economy', 'reserves', 'stress', 'forecast', 'financial'],
    difficulty: [4, 5],
    skillsFocus: ['uncertainty', 'evidence', 'alternatives'],
    format: 'Sovereign stress outlook',
  },
];
