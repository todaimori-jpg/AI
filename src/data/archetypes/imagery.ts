import type { Archetype } from '../archetypes';
import { anchor, vector } from '../sources';

export const imageryArchetypes: Archetype[] = [
  {
    id: 'img-change',
    area: 'imagery',
    title: 'Imagery Change Detection',
    tagline: 'Compare dated imagery and state what actually changed.',
    role:
      'You are the geospatial analyst. You report observable change with image dates, resolution limits, and alternative interpretations.',
    situation:
      'A site of interest — an airfield, port, industrial facility, or damaged neighborhood — appears different in recently circulated imagery. Commentators are drawing operational conclusions from single frames.\n\n{HOOK}\n\nPick a defensible baseline image and a later image. Record dates, sensors, resolution, and viewing geometry. Then describe change in observable terms before interpreting it.',
    intent:
      'Establish what changed at the site, how confident that judgment is, and what the change does and does not imply.',
    pirs: [
      {
        q: 'What are the image dates, sources, resolutions, and view geometries, and are they comparable?',
        focus: 'Acquisition date is not publication date. State both when possible.',
      },
      {
        q: 'What changes are observable, and can they be measured rather than described impressionistically?',
        focus: 'Use area, length, count, or presence/absence. Note shadows and seasonal effects.',
      },
      {
        q: 'What alternative explanations fit the change — construction, maintenance, damage, seasonal vegetation, imagery processing?',
        focus: 'Test at least three explanations.',
      },
      {
        q: 'What is the confidence in the change assessment, and what limits it?',
        focus: 'Tie confidence to resolution and image quality.',
      },
      {
        q: 'What would the change imply operationally if confirmed, and what additional evidence is needed?',
        focus: 'Do not infer capability from a single visible feature.',
      },
      {
        q: 'What follow-on imagery or records would resolve the remaining ambiguity?',
        focus: 'Name sensor, date window, and expected signature.',
      },
    ],
    requirements: [
      'Include image identification and acquisition dates for every comparison.',
      'Describe changes before interpreting them.',
      'Address resolution and comparability limits explicitly.',
      'Separate observed change from operational inference.',
    ],
    vectors: [
      vector('copernicusBrowser', 'Use Sentinel imagery for a repeat-pass comparison. Record scene IDs and dates.'),
      vector('earthExplorer', 'Search Landsat and other USGS holdings for earlier baselines.'),
      vector('worldView', 'Compare daily true-color imagery and note cloud cover.'),
      vector('googleEarth', 'Check historical imagery, but verify dates in the metadata.'),
      vector('bellingcatToolkit', 'Use methods for chronolocation, measurement, and image provenance.'),
      vector('osm', 'Reference site layout, roads, and facility footprints.'),
    ],
    anchors: [
      anchor('copernicusBrowser', 'Current Sentinel-2 coverage', 'Choose a site with two cloud-free scenes at least 30 days apart.'),
      anchor('earthExplorer', 'USGS imagery archive', 'Pick a site with a historical baseline and a recent scene in the same season.'),
    ],
    injects: [
      'A social media post pairs two images and claims a new runway. The images have no dates, and the shadows differ. This is a drill inject. List the checks before accepting the comparison.',
      'A new structure appears in one image but not another taken two days later. This is a drill inject. Explain how construction pace, cloud cover, and processing could matter.',
    ],
    keywords: ['satellite', 'imagery', 'construction', 'change', 'airfield', 'port', 'damage', 'geospatial'],
    difficulty: [2, 5],
    skillsFocus: ['evidence', 'uncertainty', 'alternatives'],
    format: 'Geospatial change assessment',
  },
  {
    id: 'img-geolocate',
    area: 'imagery',
    title: 'Image Geolocation',
    tagline: 'Test a claimed location against terrain, infrastructure, and light.',
    role:
      'You are the geolocation analyst. Your conclusion must rest on visible, checkable features rather than vibes.',
    situation:
      'A photograph or short video is circulating with a claimed location and date. It may be evidence of a significant event — or recycled from another place and time. The desk needs a location confidence statement.\n\n{HOOK}\n\nExtract candidate features first, then match them against maps, street-level imagery, and independent reports. State what the frame does not show.',
    intent:
      'Assess whether the claimed location and time are supported, and assign confidence to each.',
    pirs: [
      {
        q: 'What distinctive features are visible — terrain, buildings, signage, infrastructure, vehicles, vegetation?',
        focus: 'List them before searching. Include what is absent.',
      },
      {
        q: 'Which candidate locations match the features, and what rules out the closest alternatives?',
        focus: 'Use at least two independent map or imagery sources.',
      },
      {
        q: 'Does the lighting, weather, or shadow direction support the claimed date and time?',
        focus: 'Use shadow tools and meteorological records. State assumptions.',
      },
      {
        q: 'What is the provenance of the image — first uploader, earlier appearances, metadata?',
        focus: 'Reverse-search and archive. A first appearance is not necessarily the origin.',
      },
      {
        q: 'What alternative explanations fit — different location, earlier event, staged content, edited image?',
        focus: 'Test at least two.',
      },
      {
        q: 'What confidence do you assign to location and to time, separately?',
        focus: 'Do not let a strong location match confer time confidence.',
      },
    ],
    requirements: [
      'Give separate confidence statements for location and time.',
      'Cite at least two independent geospatial references.',
      'Include the strongest alternative location or time and why it fails.',
      'Do not use the claimed caption as supporting evidence.',
    ],
    vectors: [
      vector('bellingcatToolkit', 'Use the geolocation workflow: features, candidates, verification, chronolocation.'),
      vector('googleEarth', 'Compare terrain, building footprints, and street layout.'),
      vector('osm', 'Check roads, railways, landmarks, and facility names.'),
      vector('overpass', 'Query nearby infrastructure features (bridges, towers, fuel stations).'),
      vector('sunCalc', 'Test shadow azimuth and elevation for the claimed time.'),
      vector('geonames', 'Resolve place names and nearby settlements.'),
      vector('mapillary', 'Street-level imagery for facade and signage comparison.'),
    ],
    anchors: [
      anchor('wikiCurrent', 'Current events with circulating imagery', 'Choose an image from a current event that has identifiable infrastructure.'),
      anchor('bellingcat', 'Recent geolocation casework', 'Use a published investigation as a method reference, not as your evidence.'),
    ],
    injects: [
      'The video’s claimed location matches a town with the same name in two countries. This is a drill inject. Explain how terrain and infrastructure would discriminate.',
      'The caption says “today,” but the trees are in full leaf while the claimed region is in winter. This is a drill inject. Identify the seasonal and meteorological checks that would support or undermine the claim.',
    ],
    keywords: ['image', 'video', 'geolocation', 'photo', 'location', 'verify', 'map', 'footage'],
    difficulty: [3, 5],
    skillsFocus: ['evidence', 'uncertainty', 'alternatives'],
    format: 'Geolocation assessment',
  },
  {
    id: 'img-terrain',
    area: 'imagery',
    title: 'Terrain and Route Feasibility',
    tagline: 'Test whether a route can actually move the cargo or force imagined.',
    role:
      'You are the terrain analyst. You assess physical feasibility, not intent or political desirability.',
    situation:
      'Planners are considering a ground route for heavy equipment, humanitarian convoys, or commercial freight. The route looks direct on a map, but terrain, bridges, seasonal conditions, and border procedures may make it impractical.\n\n{HOOK}\n\nBuild the route segment by segment. Identify the constraints that would stop the heaviest or most time-sensitive movement first.',
    intent:
      'Assess route feasibility, identify binding constraints, and compare at least one alternative.',
    pirs: [
      {
        q: 'What is the exact route, and what are its segment lengths, surfaces, and border crossings?',
        focus: 'Use coordinates and named crossings. Avoid “via the north.”',
      },
      {
        q: 'What terrain and seasonal conditions constrain movement?',
        focus: 'Check elevation, grades, river crossings, flood plains, and snow or monsoon seasons.',
      },
      {
        q: 'What infrastructure limits exist — bridge capacity, tunnel dimensions, road width, checkpoints?',
        focus: 'Use OSM tags and imagery, but flag unverified attributes.',
      },
      {
        q: 'What alternative routes exist, and how do they compare on distance, time, and risk?',
        focus: 'Include the cost of the comparison, not just the map distance.',
      },
      {
        q: 'What assumptions about permissions or security underpin the route, and how fragile are they?',
        focus: 'Separate physical feasibility from political access.',
      },
      {
        q: 'What field verification would most reduce uncertainty?',
        focus: 'Name specific bridges, junctions, or authorities to check.',
      },
    ],
    requirements: [
      'Describe the route with named segments and coordinates.',
      'Identify the binding constraint, not just a list of risks.',
      'Compare at least one alternative with explicit criteria.',
      'Separate physical feasibility from permissions and security.',
    ],
    vectors: [
      vector('earthExplorer', 'Use elevation and land-cover data for terrain analysis.'),
      vector('googleEarth', 'Inspect route geometry, grades, and crossings in 3D.'),
      vector('osm', 'Check road classification, surface, and bridge tags.'),
      vector('overpass', 'Query bridges, tunnels, weight limits, and border crossings.'),
      vector('mapillary', 'Look for street-level evidence of surface and width.'),
      vector('logisticsCluster', 'Check current access and convoy guidance.'),
    ],
    anchors: [
      anchor('overpass', 'Current route infrastructure data', 'Choose a route with multiple bridges or a border crossing.'),
      anchor('earthExplorer', 'Terrain and elevation data', 'Select a corridor with meaningful elevation or seasonal constraints.'),
    ],
    injects: [
      'A bridge on the route is tagged for 20 tonnes, but the tag has no source date. This is a drill inject. Explain how you would treat the limit and what would verify it.',
      'The shortest route crosses a border that is reportedly closed to commercial traffic. This is a drill inject. Distinguish the physical route from the permitted route.',
    ],
    keywords: ['route', 'terrain', 'bridge', 'road', 'corridor', 'elevation', 'logistics', 'map'],
    difficulty: [3, 5],
    skillsFocus: ['evidence', 'gaps', 'structure'],
    format: 'Route feasibility assessment',
  },
  {
    id: 'img-nightlights',
    area: 'imagery',
    title: 'Night-Lights Change Analysis',
    tagline: 'Use nighttime imagery carefully to assess economic or infrastructure change.',
    role:
      'You are the remote-sensing analyst. You know that night-lights data is suggestive, not self-explanatory.',
    situation:
      'Analysts are citing changes in nighttime lights as evidence of economic recovery, infrastructure damage, or military activity in a region. The claim may be true, but nighttime radiance has many drivers.\n\n{HOOK}\n\nEstablish the sensor, compositing method, and comparison period before interpreting radiance change.',
    intent:
      'Assess whether night-lights changes support the claimed interpretation, and state the main confounders.',
    pirs: [
      {
        q: 'Which night-lights product is being used, and what are its spatial resolution, compositing period, and known artifacts?',
        focus: 'VIIRS, DMSP, and commercial products are not interchangeable.',
      },
      {
        q: 'What change is observed, where, and over what period?',
        focus: 'Quantify the area or radiance change. Note cloud and lunar effects.',
      },
      {
        q: 'What confounders could explain the change — seasonality, power supply, sensor calibration, economic activity, conflict?',
        focus: 'Build a confounder table.',
      },
      {
        q: 'What independent evidence corroborates or contradicts the interpretation?',
        focus: 'Use power data, trade, displacement, or ground reporting.',
      },
      {
        q: 'What would the pattern look like if the claimed explanation were wrong?',
        focus: 'State a falsifying signature.',
      },
      {
        q: 'What confidence do you assign, and what additional analysis would improve it?',
        focus: 'Be explicit about method limits.',
      },
    ],
    requirements: [
      'Name the night-lights product and processing method.',
      'Discuss at least three confounders.',
      'Corroborate with at least one independent data source.',
      'State a falsifying pattern for the lead explanation.',
    ],
    vectors: [
      vector('earthObservatory', 'Use published night-lights comparisons and their methodology notes.'),
      vector('worldView', 'Inspect source imagery and dates where available.'),
      vector('copernicusBrowser', 'Check daytime imagery for construction, damage, or land-use change.'),
      vector('worldBank', 'Use economic and electrification indicators as context.'),
      vector('eia', 'Check power generation and consumption data where relevant.'),
      vector('gdelt', 'Look for event context, with the usual source caveats.'),
    ],
    anchors: [
      anchor('earthObservatory', 'Recent night-lights imagery', 'Choose a published comparison with identifiable dates and method.'),
      anchor('worldView', 'Current satellite imagery', 'Select a region with a recent event and a clear baseline.'),
    ],
    injects: [
      'Night lights brighten across a city after a power plant comes online, while industrial output falls. This is a drill inject. Explain why both can be true and what data would distinguish the drivers.',
      'A border region darkens for three nights around a holiday. This is a drill inject. Assess seasonality and event confounders before treating it as a signal.',
    ],
    keywords: ['night lights', 'satellite', 'imagery', 'economic', 'blackout', 'infrastructure', 'change'],
    difficulty: [3, 5],
    skillsFocus: ['uncertainty', 'alternatives', 'evidence'],
    format: 'Night-lights interpretation assessment',
  },
  {
    id: 'img-burn',
    area: 'imagery',
    title: 'Wildfire Extent and Impact',
    tagline: 'Map a burn scar and separate hazard extent from human impact.',
    role:
      'You are the hazard-mapping analyst. You assess fire extent and exposed assets, not firefighting tactics.',
    situation:
      'A large wildfire is burning near settlements and infrastructure. Officials, media, and satellite-derived products give different area figures. Evacuation and air-quality decisions depend on a defensible picture.\n\n{HOOK}\n\nEstablish the fire perimeter date and method, then intersect with assets. A burn scar is not the same as an active fire front.',
    intent:
      'Establish the best-supported fire extent and impact picture, and identify what is still uncertain.',
    pirs: [
      {
        q: 'What are the reported fire perimeters and areas, and how was each derived?',
        focus: 'Distinguish active-fire detections, burn scars, and official perimeters.',
      },
      {
        q: 'What settlements, infrastructure, and transport routes are exposed or already affected?',
        focus: 'Intersect with asset data. State buffers and assumptions.',
      },
      {
        q: 'How do satellite products and official statements compare, and what explains differences?',
        focus: 'Check timestamps and definitions.',
      },
      {
        q: 'What are the likely near-term fire-weather conditions and their uncertainty?',
        focus: 'Use official forecasts and state the time horizon.',
      },
      {
        q: 'What are the main information gaps affecting evacuation or air-quality decisions?',
        focus: 'Tie gaps to specific decisions.',
      },
      {
        q: 'What indicators would show the fire is contained, expanding, or producing new impacts?',
        focus: 'Name observable signatures.',
      },
    ],
    requirements: [
      'Give dates and methods for each perimeter or area figure.',
      'Separate active fire, burn scar, and smoke impacts.',
      'Quantify exposed assets with stated assumptions.',
      'Include at least two information gaps tied to response decisions.',
    ],
    vectors: [
      vector('firms', 'Use active-fire detections with confidence classes and overpass times.'),
      vector('copernicusEms', 'Check for rapid mapping activations and damage assessments.'),
      vector('worldView', 'Inspect smoke and burn scars; note cloud and overpass timing.'),
      vector('earthExplorer', 'Compare pre-fire and post-fire imagery for burn severity.'),
      vector('reliefweb', 'Use situation reports for response and evacuation context.'),
      vector('gdacs', 'Check the automated alert and reported impact.'),
    ],
    anchors: [
      anchor('firms', 'Current active fire detections', 'Choose a fire cluster with detections over at least three days.'),
      anchor('copernicusEms', 'Current rapid mapping activations', 'Use an active wildfire activation with published extent products.'),
    ],
    injects: [
      'An official perimeter is half the size of a satellite-derived burn scar. This is a drill inject. Explain how timing and definition could produce the difference.',
      'A media map shows the fire reaching a town, but the perimeter timestamp is 12 hours old. This is a drill inject. State how you would present the risk without overstating it.',
    ],
    keywords: ['wildfire', 'fire', 'burn', 'satellite', 'evacuation', 'smoke', 'hazard', 'imagery'],
    difficulty: [2, 4],
    skillsFocus: ['evidence', 'uncertainty', 'gaps'],
    format: 'Wildfire extent and impact assessment',
  },
];
