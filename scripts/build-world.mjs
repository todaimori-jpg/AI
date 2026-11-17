import fs from 'node:fs';

const source = JSON.parse(fs.readFileSync('scripts/tmp/ne-countries.geojson', 'utf8'));
const round = (value) => Math.round(value * 10) / 10;

const ALIASES = {
  'United States of America': ['United States', 'USA', 'U.S.', 'US'],
  'United Kingdom': ['UK', 'U.K.', 'Britain', 'Great Britain'],
  Russia: ['Russian Federation'],
  'South Korea': ['Republic of Korea', 'Korea, South'],
  'North Korea': ["Democratic People's Republic of Korea", 'DPRK'],
  'Dem. Rep. Congo': ['Democratic Republic of the Congo', 'DR Congo', 'DRC'],
  'Central African Rep.': ['Central African Republic'],
  'S. Sudan': ['South Sudan'],
  'Eq. Guinea': ['Equatorial Guinea'],
  'W. Sahara': ['Western Sahara'],
  'Bosnia and Herz.': ['Bosnia and Herzegovina', 'Bosnia'],
  'Czechia': ['Czech Republic'],
  'Dominican Rep.': ['Dominican Republic'],
  'Solomon Is.': ['Solomon Islands'],
  'Falkland Is.': ['Falkland Islands'],
  'Fr. S. Antarctic Lands': ['French Southern Territories'],
  'Timor-Leste': ['East Timor'],
  'Côte d’Ivoire': ['Ivory Coast', "Cote d'Ivoire"],
  Türkiye: ['Turkey'],
  'Myanmar': ['Burma'],
  'Lao PDR': ['Laos'],
  'Dem. Rep. Korea': ['North Korea'],
  'Korea': ['South Korea'],
  'United Arab Emirates': ['UAE'],
  'Cabo Verde': ['Cape Verde'],
  'Eswatini': ['Swaziland'],
  'North Macedonia': ['Macedonia'],
  'Antigua and Barb.': ['Antigua and Barbuda'],
  'St. Vin. and Gren.': ['Saint Vincent and the Grenadines'],
  'St. Kitts and Nevis': ['Saint Kitts and Nevis'],
  'São Tomé and Principe': ['Sao Tome and Principe'],
  'Trinidad and Tobago': [],
};

const features = source.features.map((feature) => {
  const p = feature.properties;
  const name = p.NAME_EN && p.NAME_EN !== p.NAME ? p.NAME_EN : p.NAME;
  const aliases = new Set([p.NAME, p.NAME_LONG, p.ADMIN, p.NAME_CIAWF, p.NAME_SORT, ...(ALIASES[name] ?? []), ...(ALIASES[p.NAME] ?? [])]);
  if (p.ISO_A2 && p.ISO_A2 !== '-99' && (p.ISO_A2.length > 2 || ['US', 'UK'].includes(p.ISO_A2))) aliases.add(p.ISO_A2);
  const cleanAliases = [...aliases].filter(
    (a) => typeof a === 'string' && (a.length >= 3 || ['US', 'UK'].includes(a)) && a !== name,
  );
  const geom = feature.geometry;
  const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const rings = [];
  for (const polygon of polygons) {
    for (const ring of polygon) {
      if (ring.length < 4) continue;
      const flat = [];
      for (const [lon, lat] of ring) {
        flat.push(round(lon), round(lat));
      }
      rings.push(flat);
    }
  }
  return {
    name,
    label: [round(p.LABEL_X), round(p.LABEL_Y)],
    aliases: cleanAliases,
    rings,
  };
}).filter((c) => c.rings.length > 0);

const header = `// Generated from Natural Earth 1:110m admin-0 boundaries (public domain).
// Regenerate with: node scripts/build-world.mjs
export interface WorldCountry {
  name: string;
  label: [number, number];
  aliases: string[];
  rings: number[][];
}

export const WORLD_COUNTRIES: WorldCountry[] = `;

fs.writeFileSync('src/data/world.ts', `${header}${JSON.stringify(features)};\n`);
console.log(`Wrote ${features.length} countries, ${(fs.statSync('src/data/world.ts').size / 1024).toFixed(1)} KB`);
