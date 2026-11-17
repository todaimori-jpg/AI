import type { Archetype } from '../archetypes';
import { anchor, vector } from '../sources';

export const logisticsArchetypes: Archetype[] = [
  {
    id: 'log-chokepoint',
    area: 'logistics',
    title: 'Chokepoint Restriction Effects',
    tagline: 'Assess how a canal or strait restriction propagates through trade.',
    role:
      'You are the maritime logistics analyst. You assess flows, alternatives, and costs — not the politics of the restriction itself.',
    situation:
      'A major maritime chokepoint is operating below normal capacity because of weather, infrastructure, security risk, or a regulatory measure. Shippers are announcing surcharges and reroutes; regional officials are minimizing the impact.\n\n{HOOK}\n\nEstablish the operational restriction and the baseline flow before assessing effects. A chokepoint headline without a throughput comparison is not analysis.',
    intent:
      'Quantify the disruption, trace the most exposed flows, and assess how long the effects could persist.',
    pirs: [
      {
        q: 'What exactly is constrained — transit slots, draft, speed, insurance, route closure — and under whose authority?',
        focus: 'Use the canal authority, port state, or insurer notice. Quote the operating parameter.',
      },
      {
        q: 'How far has throughput or transit volume moved from its recent baseline?',
        focus: 'Use PortWatch or another dataset. State the comparison period.',
      },
      {
        q: 'Which commodity flows and destination markets are most exposed?',
        focus: 'Combine vessel mix, commodity data, and trade values.',
      },
      {
        q: 'What alternative routes or modes exist, and how much capacity can they actually absorb?',
        focus: 'A longer route is not free capacity. Include time, cost, and insurance.',
      },
      {
        q: 'What are the second-order effects on inventories, prices, and regional supply chains?',
        focus: 'Keep the chain of effects explicit and proportionate.',
      },
      {
        q: 'What indicators would show normalization, sustained disruption, or a shift to a new routing equilibrium?',
        focus: 'Name observable data and timing.',
      },
    ],
    requirements: [
      'Quantify the restriction and compare with a stated baseline.',
      'Cite the operating authority or a structured dataset, not only shipping news.',
      'Explain at least one alternative route and its limiting factors.',
      'Provide dated indicators for recovery or persistence.',
    ],
    vectors: [
      vector('portwatch', 'Use port and chokepoint transit series. Record the comparison window.'),
      vector('eiaChokepoints', 'Reference for the strategic importance and normal flow of oil chokepoints.'),
      vector('unctad', 'Use for maritime trade context and baseline volumes.'),
      vector('marineTraffic', 'Sample vessel behavior and reroutes. Note coverage limits.'),
      vector('suez', 'Check official transit statistics and operating notices.'),
      vector('panamaCanal', 'Check official transit restrictions and slot auctions.'),
      vector('freightos', 'Compare freight rate movement with the claimed disruption.'),
    ],
    anchors: [
      anchor('portwatch', 'Current chokepoint and port throughput', 'Choose a chokepoint with a visible deviation from its recent baseline.'),
      anchor('suez', 'Current Suez Canal operating status', 'Use the latest official transit statistics or notices.'),
    ],
    injects: [
      'A major carrier announces a reroute “until further notice” while the authority says normal operations continue. This is a drill inject. Explain how you would determine which reflects actual behavior.',
      'Insurance premiums double but transit counts remain stable. This is a drill inject. Assess what that combination might indicate and what data would resolve it.',
    ],
    keywords: ['shipping', 'chokepoint', 'strait', 'canal', 'port', 'vessel', 'trade', 'supply chain'],
    difficulty: [2, 5],
    skillsFocus: ['sourcing', 'evidence', 'uncertainty'],
    format: 'Supply-chain effects assessment',
  },
  {
    id: 'log-port',
    area: 'logistics',
    title: 'Port Congestion Shock',
    tagline: 'Separate a queue from a capacity crisis.',
    role:
      'You are the port operations analyst. You distinguish temporary congestion from a structural bottleneck and assess the downstream cost.',
    situation:
      'A major container or bulk port is reporting elevated waiting times after a labor action, weather event, or sudden volume surge. Carriers are announcing surcharges, and inland shippers report delays that may or may not be connected.\n\n{HOOK}\n\nDefine the congestion metric and its baseline. A photograph of ships offshore is not a throughput analysis.',
    intent:
      'Determine the severity, cause, and likely duration of congestion, and identify the supply chains most exposed.',
    pirs: [
      {
        q: 'What congestion metric is elevated, by how much, and against what baseline?',
        focus: 'Use arrival waiting time, berth occupancy, or TEU throughput. State units.',
      },
      {
        q: 'What is the best-supported cause, and which causes are still speculative?',
        focus: 'Test labor, weather, volume, equipment, and scheduling explanations.',
      },
      {
        q: 'Which carriers, commodity flows, and inland connections are most affected?',
        focus: 'Trace from berth to rail, road, and warehouse.',
      },
      {
        q: 'How are carriers and shippers adapting, and what are the limits of those adaptations?',
        focus: 'Diversion to another port creates a second constraint.',
      },
      {
        q: 'What is the plausible duration, and what would cause the backlog to worsen?',
        focus: 'Look at arrivals, labor status, and inland clearance capacity.',
      },
      {
        q: 'What indicators would show the queue clearing or becoming structural?',
        focus: 'Specify thresholds and the data source for each.',
      },
    ],
    requirements: [
      'Define the congestion metric and comparison period.',
      'Use at least one structured dataset, not only port statements.',
      'Trace effects beyond the port gate to inland logistics.',
      'State how long the disruption would need to last to change your judgment.',
    ],
    vectors: [
      vector('portwatch', 'Compare port calls, waiting times, and throughput over a defined window.'),
      vector('marineTraffic', 'Inspect vessel queues and anchorage patterns; note AIS coverage limits.'),
      vector('freightos', 'Check rate movement as a market signal, with attribution caution.'),
      vector('balticExchange', 'Reference for dry bulk and container indices.'),
      vector('imo', 'Reference for port and maritime regulatory context.'),
      vector('logisticsCluster', 'Use for humanitarian cargo implications where relevant.'),
    ],
    anchors: [
      anchor('portwatch', 'Port throughput and congestion indicators', 'Select a port with a measurable deviation over the last 30 days.'),
      anchor('marineTraffic', 'Current vessel queues', 'Use a specific port and record the observation time.'),
    ],
    injects: [
      'A port authority says waiting times are “normal,” while vessel tracking shows a growing anchorage. This is a drill inject. Identify what definitional difference could explain the gap.',
      'Two carriers impose congestion surcharges; a third does not. This is a drill inject. Assess what that divergence might signal and what you would check next.',
    ],
    keywords: ['port', 'congestion', 'shipping', 'container', 'cargo', 'terminal', 'vessel', 'freight'],
    difficulty: [2, 4],
    skillsFocus: ['evidence', 'uncertainty', 'structure'],
    format: 'Port disruption assessment',
  },
  {
    id: 'log-minerals',
    area: 'logistics',
    title: 'Critical Mineral Controls',
    tagline: 'Trace an export control from policy text to industrial consequence.',
    role:
      'You are the strategic materials analyst. You assess dependency and substitution, not the legality or wisdom of the measure.',
    situation:
      'A major producer has tightened export controls on a mineral or processed material used in defense, energy, or electronics supply chains. Buyers are announcing reviews; prices are moving on speculation as well as fact.\n\n{HOOK}\n\nEstablish the legal scope and the actual dependency before predicting shortages. Export controls are often narrower than headlines suggest.',
    intent:
      'Determine which supply chains are genuinely exposed, what substitution or stockpiling is possible, and what would signal real constraint.',
    pirs: [
      {
        q: 'What exactly does the control cover — raw material, processed product, technology, destination, end use?',
        focus: 'Use the official measure. Identify effective dates and licensing criteria.',
      },
      {
        q: 'How dependent are relevant supply chains on this source, by volume and by processing stage?',
        focus: 'Mine-by-stage dependency matters. A raw-material share is not a refined-product share.',
      },
      {
        q: 'What substitution, recycling, or stockpiling options exist, and on what timeline?',
        focus: 'Give realistic lead times, not theoretical alternatives.',
      },
      {
        q: 'What market response is documented versus speculative?',
        focus: 'Separate price moves, contract changes, and announced intentions.',
      },
      {
        q: 'Which downstream sectors or countries are most exposed, and how would constraint appear?',
        focus: 'Trace to specific products and production steps.',
      },
      {
        q: 'What indicators over 3–12 months would show successful adaptation or genuine shortage?',
        focus: 'Name trade, inventory, price, and production indicators.',
      },
    ],
    requirements: [
      'Cite the official control measure and its scope.',
      'Distinguish raw-material dependency from processing dependency.',
      'Include substitution timelines and their limits.',
      'Separate observed market effects from speculation.',
    ],
    vectors: [
      vector('comtrade', 'Quantify trade flows by partner and product category. Note reporting lag.'),
      vector('usgsMinerals', 'Use production, reserve, and import-dependency data.'),
      vector('ieaCriticalMinerals', 'Reference for clean-energy mineral demand and concentration.'),
      vector('wto', 'Check trade policy notifications and dispute records.'),
      vector('fred', 'Look for price and industrial production series where available.'),
      vector('reuters', 'Secondary reporting; trace company claims to filings or statements.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor('usgsMinerals', 'Current mineral commodity data', 'Choose a mineral with recent production and trade data.'),
      anchor('comtrade', 'Current commodity trade records', 'Select a mineral flow with a clear recent change in reported trade.'),
    ],
    injects: [
      'A buyer announces a “strategic stockpile” but discloses no tonnage. This is a drill inject. Assess how much reassurance the announcement provides.',
      'Prices spike while customs data show no change in volume. This is a drill inject. Explain the possible explanations and the data that would distinguish them.',
    ],
    keywords: ['minerals', 'export control', 'supply chain', 'semiconductor', 'rare earth', 'trade', 'commodity', 'industry'],
    difficulty: [3, 5],
    skillsFocus: ['sourcing', 'evidence', 'structure'],
    format: 'Strategic materials assessment',
  },
  {
    id: 'log-corridor',
    area: 'logistics',
    title: 'Corridor Disruption',
    tagline: 'Assess a rail or road corridor outage against real alternatives.',
    role:
      'You are the surface logistics analyst. You map the corridor, the flows, and the true cost of going around it.',
    situation:
      'A rail line, bridge, or road corridor carrying commercial and possibly humanitarian cargo has been disrupted by conflict, weather, structural failure, or administrative action. Officials describe the closure as temporary; shippers are already seeking alternatives.\n\n{HOOK}\n\nEstablish the physical interruption and the volume it carried before assessing alternatives. A detour on a map may not be a viable route for the cargo in question.',
    intent:
      'Estimate the capacity lost, the viable alternatives, and the humanitarian or economic consequences.',
    pirs: [
      {
        q: 'What is physically interrupted, where exactly, and what traffic did it carry?',
        focus: 'Use maps, operator notices, and trade data. Separate passenger from freight.',
      },
      {
        q: 'What alternative routes or modes exist, and what are their hard constraints?',
        focus: 'Check bridge weight limits, border crossings, gauge changes, and seasonal conditions.',
      },
      {
        q: 'Which cargo and destinations are most exposed, including humanitarian flows?',
        focus: 'Distinguish substitutable bulk cargo from time-sensitive or specialized cargo.',
      },
      {
        q: 'What are the cost and time penalties of the alternatives, and who absorbs them?',
        focus: 'Use documented rates or stated schedules, not guesses.',
      },
      {
        q: 'How does the security or weather environment affect repair and rerouting?',
        focus: 'An inaccessible repair site changes the timeline.',
      },
      {
        q: 'What indicators would show restoration, permanent rerouting, or cascading failure?',
        focus: 'Name operator reports, border data, and market signals.',
      },
    ],
    requirements: [
      'Map the interruption and cite an operator or official notice.',
      'Quantify the lost capacity or flow if data exists.',
      'Test at least two alternatives against physical constraints.',
      'Address humanitarian or civilian effects explicitly.',
    ],
    vectors: [
      vector('osm', 'Inspect the route, nearby crossings, and settlement pattern.'),
      vector('overpass', 'Query bridges, rail lines, and border crossings in the affected area.'),
      vector('comtrade', 'Check trade flows that plausibly use the corridor.'),
      vector('logisticsCluster', 'Look for humanitarian cargo and access updates.'),
      vector('wikiCurrent', 'Chronology aid; verify against operator or official sources.'),
      vector('reuters', 'Secondary reporting; trace operational claims to operators.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor('logisticsCluster', 'Current logistics cluster updates', 'Choose a live corridor or access constraint with an operational update.'),
      anchor('wikiCurrent', 'Recent transport infrastructure events', 'Select a current transport disruption with a verifiable location.'),
    ],
    injects: [
      'A railway says service will resume in 48 hours, but a bridge inspection report is not public. This is a drill inject. Identify the evidence that would make the timeline credible.',
      'A neighboring country offers a transit corridor but publishes no capacity figures. This is a drill inject. Explain how you would test the offer without assuming good faith or bad faith.',
    ],
    keywords: ['rail', 'road', 'corridor', 'bridge', 'transport', 'cargo', 'humanitarian', 'border'],
    difficulty: [2, 5],
    skillsFocus: ['sourcing', 'evidence', 'alternatives'],
    format: 'Corridor disruption assessment',
  },
  {
    id: 'log-energy',
    area: 'logistics',
    title: 'Energy Infrastructure Outage',
    tagline: 'Assess an outage’s market and civilian effects beyond the headline.',
    role:
      'You are the energy infrastructure analyst. You assess physical flows and market effects, not the politics of the operator or state.',
    situation:
      'A pipeline, LNG terminal, refinery, or major grid asset has gone offline. Spot prices are moving; officials are reassuring the public. The cause and repair timeline are contested.\n\n{HOOK}\n\nEstablish the asset, capacity, and alternative flows. A large outage with ample storage is a different problem from a smaller outage at peak demand.',
    intent:
      'Estimate the supply or grid impact, the likely duration, and the most exposed consumers or industries.',
    pirs: [
      {
        q: 'What asset is offline, what capacity did it provide, and what is the confirmed cause?',
        focus: 'Use the operator notice or regulator statement. Separate confirmed facts from speculation.',
      },
      {
        q: 'What alternative supply, storage, or grid paths exist, and how much can they cover?',
        focus: 'Quantify. Name the interconnectors, inventories, or substitute terminals.',
      },
      {
        q: 'Which consumers or industries are most exposed, and what does that mean for output?',
        focus: 'Distinguish firm contracts from interruptible demand.',
      },
      {
        q: 'What repair timeline is supported, and what could extend it?',
        focus: 'Look for operator milestones, parts, access, and safety constraints.',
      },
      {
        q: 'How are markets reacting, and which reactions are speculative rather than physical?',
        focus: 'Separate price moves from actual flow changes.',
      },
      {
        q: 'What indicators would show restoration, substitution, or a wider grid or supply crisis?',
        focus: 'Tie each to a data source and time window.',
      },
    ],
    requirements: [
      'State the asset, capacity, and confirmed cause before discussing effects.',
      'Quantify alternative supply or grid headroom.',
      'Distinguish market speculation from physical shortage.',
      'Include a repair-timeline judgment with explicit uncertainty.',
    ],
    vectors: [
      vector('eia', 'Check inventories, flows, and price data for the relevant market.'),
      vector('iea', 'Use for market context and emergency stock mechanisms.'),
      vector('gem', 'Check infrastructure and project records for capacity and ownership.'),
      vector('entsoe', 'For European grid data, check load, generation, and cross-border flows.'),
      vector('portwatch', 'Check whether the outage affects maritime energy flows.'),
      vector('reuters', 'Secondary reporting; trace operator claims to notices.', 'News reporting (secondary)'),
    ],
    anchors: [
      anchor('eia', 'Current energy system data', 'Select a market or asset with a current, measurable disruption.'),
      anchor('gem', 'Energy infrastructure records', 'Choose an asset with verifiable capacity and ownership data.'),
    ],
    injects: [
      'The operator says repairs will take “several days,” but a regulator opens an incident review. This is a drill inject. Explain what the review does and does not imply about the timeline.',
      'Spot prices double while storage remains above the five-year average. This is a drill inject. Assess the likely drivers and what would make the price move a real shortage signal.',
    ],
    keywords: ['pipeline', 'lng', 'refinery', 'energy', 'grid', 'outage', 'oil', 'gas'],
    difficulty: [3, 5],
    skillsFocus: ['uncertainty', 'evidence', 'structure'],
    format: 'Energy disruption assessment',
  },
];
