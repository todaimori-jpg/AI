import type { Area, DimensionId, Difficulty } from '../types';
import type { AnchorSeed, VectorSeed } from '../types';
import { aviationArchetypes } from './archetypes/aviation';
import { geopoliticsArchetypes } from './archetypes/geopolitics';
import { logisticsArchetypes } from './archetypes/logistics';
import { humanitarianArchetypes } from './archetypes/humanitarian';
import { imageryArchetypes } from './archetypes/imagery';
import { verificationArchetypes } from './archetypes/verification';
import { forecastingArchetypes } from './archetypes/forecasting';

export interface PirSeed {
  q: string;
  focus: string;
}

export interface Archetype {
  id: string;
  area: Area;
  title: string;
  tagline: string;
  role: string;
  situation: string;
  intent: string;
  pirs: PirSeed[];
  requirements: string[];
  vectors: VectorSeed[];
  anchors: AnchorSeed[];
  injects: string[];
  keywords: string[];
  difficulty: [Difficulty, Difficulty];
  skillsFocus: DimensionId[];
  format: string;
}

export const HOOK_TOKEN = '{HOOK}';

export const ARCHETYPES: Archetype[] = [
  ...aviationArchetypes,
  ...geopoliticsArchetypes,
  ...logisticsArchetypes,
  ...humanitarianArchetypes,
  ...imageryArchetypes,
  ...verificationArchetypes,
  ...forecastingArchetypes,
];

export const archetypeById = new Map(ARCHETYPES.map((a) => [a.id, a]));

export function archetypesForArea(area: Area): Archetype[] {
  return ARCHETYPES.filter((a) => a.area === area);
}
