import type { AnchorSeed, VectorKind, VectorSeed } from '../types';

export interface SourceRef {
  label: string;
  url: string;
  kind: VectorKind;
  source: string;
  query?: string;
}

/**
 * A deliberately small, curated catalog of stable public starting points.
 * Training rule: these are doorways, not evidence. The analyst must read and
 * grade what is behind them.
 */
export const SRC: Record<string, SourceRef> = {
  faaNotam: {
    label: 'FAA NOTAM search',
    url: 'https://notams.aim.faa.gov/notamSearch/',
    kind: 'official',
    source: 'FAA',
  },
  faaAsias: {
    label: 'FAA ASIAS / incident data',
    url: 'https://www.asias.faa.gov/',
    kind: 'dataset',
    source: 'FAA',
  },
  easa: {
    label: 'EASA safety information bulletins',
    url: 'https://www.easa.europa.eu/en/document-library/safety-information-bulletins',
    kind: 'official',
    source: 'EASA',
  },
  icao: {
    label: 'ICAO public resources',
    url: 'https://www.icao.int/',
    kind: 'official',
    source: 'ICAO',
  },
  eurocontrol: {
    label: 'EUROCONTROL network operations',
    url: 'https://www.eurocontrol.int/network-operations',
    kind: 'official',
    source: 'EUROCONTROL',
  },
  noaaVaac: {
    label: 'Volcanic ash advisory centers',
    url: 'https://www.weather.gov/vaac/',
    kind: 'official',
    source: 'NOAA / ICAO VAAC',
  },
  flightradar: {
    label: 'Flightradar24 public tracking',
    url: 'https://www.flightradar24.com/',
    kind: 'dataset',
    source: 'Flightradar24',
  },
  adsbExchange: {
    label: 'ADS-B Exchange',
    url: 'https://globe.adsbexchange.com/',
    kind: 'dataset',
    source: 'ADS-B Exchange',
  },
  gpsjam: {
    label: 'GPSJam interference map',
    url: 'https://gpsjam.org/',
    kind: 'dataset',
    source: 'GPSJam',
  },
  iata: {
    label: 'IATA public guidance',
    url: 'https://www.iata.org/',
    kind: 'official',
    source: 'IATA',
  },
  nhc: {
    label: 'National Hurricane Center',
    url: 'https://www.nhc.noaa.gov/',
    kind: 'official',
    source: 'NOAA NHC',
  },
  portwatch: {
    label: 'IMF PortWatch',
    url: 'https://portwatch.imf.org/',
    kind: 'dataset',
    source: 'IMF PortWatch',
  },
  imfData: {
    label: 'IMF data portal',
    url: 'https://data.imf.org/',
    kind: 'dataset',
    source: 'IMF',
  },
  unctad: {
    label: 'UNCTAD Review of Maritime Transport',
    url: 'https://unctad.org/publication/review-maritime-transport',
    kind: 'reference',
    source: 'UNCTAD',
  },
  marineTraffic: {
    label: 'MarineTraffic vessel tracking',
    url: 'https://www.marinetraffic.com/',
    kind: 'dataset',
    source: 'MarineTraffic',
  },
  equasis: {
    label: 'Equasis vessel records',
    url: 'https://www.equasis.org/',
    kind: 'official',
    source: 'Equasis',
  },
  imo: {
    label: 'International Maritime Organization',
    url: 'https://www.imo.org/',
    kind: 'official',
    source: 'IMO',
  },
  suez: {
    label: 'Suez Canal Authority',
    url: 'https://www.suezcanal.gov.eg/',
    kind: 'official',
    source: 'Suez Canal Authority',
  },
  panamaCanal: {
    label: 'Panama Canal Authority',
    url: 'https://www.pancanal.com/',
    kind: 'official',
    source: 'Panama Canal Authority',
  },
  eia: {
    label: 'US Energy Information Administration',
    url: 'https://www.eia.gov/',
    kind: 'dataset',
    source: 'EIA',
  },
  eiaChokepoints: {
    label: 'EIA world oil transit chokepoints',
    url: 'https://www.eia.gov/international/analysis/special-topics/World_Oil_Transit_Chokepoints',
    kind: 'reference',
    source: 'EIA',
  },
  iea: {
    label: 'International Energy Agency',
    url: 'https://www.iea.org/',
    kind: 'reference',
    source: 'IEA',
  },
  ieaCriticalMinerals: {
    label: 'IEA critical minerals analysis',
    url: 'https://www.iea.org/topics/critical-minerals',
    kind: 'reference',
    source: 'IEA',
  },
  gem: {
    label: 'Global Energy Monitor',
    url: 'https://globalenergymonitor.org/',
    kind: 'ngo',
    source: 'Global Energy Monitor',
  },
  entsoe: {
    label: 'ENTSO-E transparency platform',
    url: 'https://www.entsoe.eu/',
    kind: 'dataset',
    source: 'ENTSO-E',
  },
  comtrade: {
    label: 'UN Comtrade',
    url: 'https://comtradeplus.un.org/',
    kind: 'dataset',
    source: 'UN Comtrade',
  },
  wto: {
    label: 'World Trade Organization',
    url: 'https://www.wto.org/',
    kind: 'official',
    source: 'WTO',
  },
  freightos: {
    label: 'Freightos Baltic Index',
    url: 'https://fbx.freightos.com/',
    kind: 'dataset',
    source: 'Freightos',
  },
  balticExchange: {
    label: 'Baltic Exchange indices',
    url: 'https://www.balticexchange.com/en/index.html',
    kind: 'dataset',
    source: 'Baltic Exchange',
  },
  logisticsCluster: {
    label: 'Logistics Cluster',
    url: 'https://logcluster.org/',
    kind: 'ngo',
    source: 'WFP Logistics Cluster',
  },
  usgsMinerals: {
    label: 'USGS Mineral Commodity Summaries',
    url: 'https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries',
    kind: 'dataset',
    source: 'USGS',
  },
  usgsQuake: {
    label: 'USGS earthquake map',
    url: 'https://earthquake.usgs.gov/earthquakes/map/',
    kind: 'dataset',
    source: 'USGS',
  },
  usgsApi: {
    label: 'USGS event API',
    url: 'https://earthquake.usgs.gov/fdsnws/event/1/',
    kind: 'dataset',
    source: 'USGS',
  },
  reliefweb: {
    label: 'ReliefWeb',
    url: 'https://reliefweb.int/',
    kind: 'ngo',
    source: 'OCHA ReliefWeb',
  },
  ochaHdx: {
    label: 'OCHA Humanitarian Data Exchange',
    url: 'https://data.humdata.org/',
    kind: 'dataset',
    source: 'OCHA HDX',
  },
  unHCR: {
    label: 'UNHCR data portal',
    url: 'https://data.unhcr.org/',
    kind: 'dataset',
    source: 'UNHCR',
  },
  iomDtm: {
    label: 'IOM Displacement Tracking Matrix',
    url: 'https://dtm.iom.int/',
    kind: 'dataset',
    source: 'IOM',
  },
  whoDon: {
    label: 'WHO Disease Outbreak News',
    url: 'https://www.who.int/emergencies/disease-outbreak-news',
    kind: 'official',
    source: 'WHO',
  },
  ecdc: {
    label: 'ECDC communicable disease threats',
    url: 'https://www.ecdc.europa.eu/',
    kind: 'official',
    source: 'ECDC',
  },
  ipc: {
    label: 'IPC food security analysis',
    url: 'https://www.ipcinfo.org/',
    kind: 'ngo',
    source: 'IPC',
  },
  fewsNet: {
    label: 'FEWS NET',
    url: 'https://fews.net/',
    kind: 'ngo',
    source: 'FEWS NET',
  },
  faoGiews: {
    label: 'FAO GIEWS country briefs',
    url: 'https://www.fao.org/giews/en/',
    kind: 'ngo',
    source: 'FAO GIEWS',
  },
  wfpHungerMap: {
    label: 'WFP HungerMap',
    url: 'https://hungermap.wfp.org/',
    kind: 'dataset',
    source: 'WFP',
  },
  gdacs: {
    label: 'GDACS disaster alerts',
    url: 'https://www.gdacs.org/',
    kind: 'dataset',
    source: 'GDACS',
  },
  copernicusEms: {
    label: 'Copernicus Emergency Management Service',
    url: 'https://emergency.copernicus.eu/',
    kind: 'imagery',
    source: 'Copernicus EMS',
  },
  unosat: {
    label: 'UNOSAT',
    url: 'https://unosat.org/',
    kind: 'imagery',
    source: 'UNOSAT',
  },
  worldView: {
    label: 'NASA Worldview',
    url: 'https://worldview.earthdata.nasa.gov/',
    kind: 'imagery',
    source: 'NASA EOSDIS',
  },
  copernicusBrowser: {
    label: 'Copernicus Browser',
    url: 'https://browser.dataspace.copernicus.eu/',
    kind: 'imagery',
    source: 'Copernicus / ESA',
  },
  earthExplorer: {
    label: 'USGS EarthExplorer',
    url: 'https://earthexplorer.usgs.gov/',
    kind: 'imagery',
    source: 'USGS',
  },
  googleEarth: {
    label: 'Google Earth web',
    url: 'https://earth.google.com/web/',
    kind: 'imagery',
    source: 'Google Earth',
  },
  earthObservatory: {
    label: 'NASA Earth Observatory',
    url: 'https://earthobservatory.nasa.gov/',
    kind: 'imagery',
    source: 'NASA',
  },
  firms: {
    label: 'NASA FIRMS fire data',
    url: 'https://firms.modaps.eosdis.nasa.gov/',
    kind: 'dataset',
    source: 'NASA FIRMS',
  },
  osm: {
    label: 'OpenStreetMap',
    url: 'https://www.openstreetmap.org/',
    kind: 'reference',
    source: 'OpenStreetMap',
  },
  overpass: {
    label: 'Overpass Turbo',
    url: 'https://overpass-turbo.eu/',
    kind: 'dataset',
    source: 'OpenStreetMap',
  },
  geonames: {
    label: 'GeoNames',
    url: 'https://www.geonames.org/',
    kind: 'reference',
    source: 'GeoNames',
  },
  sunCalc: {
    label: 'SunCalc shadow tool',
    url: 'https://www.suncalc.org/',
    kind: 'reference',
    source: 'SunCalc',
  },
  mapillary: {
    label: 'Mapillary street-level imagery',
    url: 'https://www.mapillary.com/',
    kind: 'imagery',
    source: 'Mapillary',
  },
  bellingcat: {
    label: 'Bellingcat investigations',
    url: 'https://www.bellingcat.com/',
    kind: 'reference',
    source: 'Bellingcat',
  },
  bellingcatToolkit: {
    label: 'Bellingcat online investigation toolkit',
    url: 'https://bellingcat.gitbook.io/toolkit',
    kind: 'reference',
    source: 'Bellingcat',
  },
  euvsdisinfo: {
    label: 'EUvsDisinfo',
    url: 'https://euvsdisinfo.eu/',
    kind: 'ngo',
    source: 'EU East StratCom Task Force',
  },
  snopes: {
    label: 'Snopes',
    url: 'https://www.snopes.com/',
    kind: 'ngo',
    source: 'Snopes',
  },
  afpFact: {
    label: 'AFP Fact Check',
    url: 'https://factcheck.afp.com/',
    kind: 'ngo',
    source: 'AFP',
  },
  fullFact: {
    label: 'Full Fact',
    url: 'https://fullfact.org/',
    kind: 'ngo',
    source: 'Full Fact',
  },
  googleFactCheck: {
    label: 'Google Fact Check Explorer',
    url: 'https://toolbox.google.com/factcheck/explorer',
    kind: 'reference',
    source: 'Google',
  },
  fotoForensics: {
    label: 'FotoForensics',
    url: 'https://fotoforensics.com/',
    kind: 'reference',
    source: 'FotoForensics',
  },
  googleLens: {
    label: 'Google Lens',
    url: 'https://lens.google/',
    kind: 'reference',
    source: 'Google',
  },
  yandexImages: {
    label: 'Yandex reverse image search',
    url: 'https://yandex.com/images/',
    kind: 'reference',
    source: 'Yandex',
  },
  internetArchive: {
    label: 'Internet Archive Wayback Machine',
    url: 'https://web.archive.org/',
    kind: 'reference',
    source: 'Internet Archive',
  },
  acled: {
    label: 'ACLED conflict data',
    url: 'https://acleddata.com/',
    kind: 'dataset',
    source: 'ACLED',
  },
  ucdp: {
    label: 'UCDP conflict data',
    url: 'https://ucdp.uu.se/',
    kind: 'dataset',
    source: 'Uppsala Conflict Data Program',
  },
  isw: {
    label: 'Institute for the Study of War',
    url: 'https://www.understandingwar.org/',
    kind: 'reference',
    source: 'ISW',
  },
  unDigitalLibrary: {
    label: 'UN Digital Library',
    url: 'https://digitallibrary.un.org/',
    kind: 'official',
    source: 'United Nations',
  },
  unGa: {
    label: 'UN General Assembly',
    url: 'https://www.un.org/en/ga/',
    kind: 'official',
    source: 'United Nations',
  },
  euSanctionsMap: {
    label: 'EU Sanctions Map',
    url: 'https://www.sanctionsmap.eu/',
    kind: 'official',
    source: 'European Union',
  },
  ofac: {
    label: 'OFAC sanctions list',
    url: 'https://ofac.treasury.gov/',
    kind: 'official',
    source: 'US Treasury',
  },
  euCouncil: {
    label: 'Council of the EU press releases',
    url: 'https://www.consilium.europa.eu/',
    kind: 'official',
    source: 'Council of the EU',
  },
  stateDept: {
    label: 'US Department of State',
    url: 'https://www.state.gov/',
    kind: 'official',
    source: 'US State Department',
  },
  ukFcdo: {
    label: 'UK Foreign, Commonwealth & Development Office',
    url: 'https://www.gov.uk/government/organisations/foreign-commonwealth-development-office',
    kind: 'official',
    source: 'UK FCDO',
  },
  sipri: {
    label: 'SIPRI databases',
    url: 'https://www.sipri.org/databases/armstransfers',
    kind: 'dataset',
    source: 'SIPRI',
  },
  opensanctions: {
    label: 'OpenSanctions',
    url: 'https://www.opensanctions.org/',
    kind: 'dataset',
    source: 'OpenSanctions',
  },
  osceOdihr: {
    label: 'OSCE/ODIHR election observation',
    url: 'https://www.osce.org/odihr',
    kind: 'official',
    source: 'OSCE/ODIHR',
  },
  carterCenter: {
    label: 'Carter Center election work',
    url: 'https://www.cartercenter.org/',
    kind: 'ngo',
    source: 'The Carter Center',
  },
  ifes: {
    label: 'IFES election resources',
    url: 'https://www.ifes.org/',
    kind: 'ngo',
    source: 'IFES',
  },
  idea: {
    label: 'International IDEA',
    url: 'https://www.idea.int/',
    kind: 'ngo',
    source: 'International IDEA',
  },
  imfWeo: {
    label: 'IMF World Economic Outlook',
    url: 'https://www.imf.org/en/Publications/WEO',
    kind: 'dataset',
    source: 'IMF',
  },
  worldBank: {
    label: 'World Bank Open Data',
    url: 'https://data.worldbank.org/',
    kind: 'dataset',
    source: 'World Bank',
  },
  bis: {
    label: 'Bank for International Settlements',
    url: 'https://www.bis.org/',
    kind: 'dataset',
    source: 'BIS',
  },
  fred: {
    label: 'FRED economic data',
    url: 'https://fred.stlouisfed.org/',
    kind: 'dataset',
    source: 'Federal Reserve Bank of St. Louis',
  },
  noaaCpc: {
    label: 'NOAA Climate Prediction Center',
    url: 'https://www.cpc.ncep.noaa.gov/',
    kind: 'official',
    source: 'NOAA CPC',
  },
  ecmwf: {
    label: 'ECMWF forecasts',
    url: 'https://www.ecmwf.int/',
    kind: 'dataset',
    source: 'ECMWF',
  },
  wikiCurrent: {
    label: 'Wikipedia current events portal',
    url: 'https://en.wikipedia.org/wiki/Portal:Current_events',
    kind: 'reference',
    source: 'Wikipedia',
  },
  gdelt: {
    label: 'GDELT project',
    url: 'https://www.gdeltproject.org/',
    kind: 'dataset',
    source: 'GDELT',
  },
  reuters: {
    label: 'Reuters',
    url: 'https://www.reuters.com/',
    kind: 'news',
    source: 'Reuters',
  },
  ap: {
    label: 'Associated Press',
    url: 'https://apnews.com/',
    kind: 'news',
    source: 'AP',
  },
  bbc: {
    label: 'BBC News',
    url: 'https://www.bbc.com/news',
    kind: 'news',
    source: 'BBC',
  },
  googleTrends: {
    label: 'Google Trends',
    url: 'https://trends.google.com/',
    kind: 'dataset',
    source: 'Google',
  },
};

export function vector(key: string, note?: string, label?: string): VectorSeed {
  const ref = SRC[key];
  if (!ref) throw new Error(`Unknown source key: ${key}`);
  return {
    label: label ?? ref.label,
    kind: ref.kind,
    url: ref.url,
    query: ref.query,
    note,
  };
}

export function anchor(key: string, label?: string, detail?: string): AnchorSeed {
  const ref = SRC[key];
  if (!ref) throw new Error(`Unknown source key: ${key}`);
  return {
    label: label ?? ref.label,
    source: ref.source,
    url: ref.url,
    detail,
  };
}
