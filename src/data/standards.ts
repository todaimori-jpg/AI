export interface StandardEntry {
  n: number;
  title: string;
  detail: string;
}

/** Publicly described ODNI analytic standards, summarized for training use. */
export const ODNI_STANDARDS: StandardEntry[] = [
  {
    n: 1,
    title: 'Source quality and credibility',
    detail:
      'Properly describes the quality and credibility of underlying sources, data, and methodologies. The reader should know what evidence exists, how it was collected, and how good it is.',
  },
  {
    n: 2,
    title: 'Expressions of uncertainty',
    detail:
      'Properly expresses and explains uncertainties associated with major analytic judgments. Use consistent probability language, separate likelihood from confidence, and explain the basis for both.',
  },
  {
    n: 3,
    title: 'Intelligence information vs. judgment',
    detail:
      'Properly distinguishes between underlying intelligence information and analysts’ assumptions and judgments. Do not present an inference as an observed fact.',
  },
  {
    n: 4,
    title: 'Analysis of alternatives',
    detail:
      'Incorporates analysis of alternatives. Competing hypotheses should be evaluated with evidence for and against, not used as decorative caveats.',
  },
  {
    n: 5,
    title: 'Customer relevance and implications',
    detail:
      'Demonstrates customer relevance and addresses implications. State what decision the assessment informs and what would change it.',
  },
  {
    n: 6,
    title: 'Clear and logical argumentation',
    detail:
      'Uses clear and logical argumentation. The bottom line should be visible, the structure should follow the logic, and the writing should be readable.',
  },
  {
    n: 7,
    title: 'Change and consistency',
    detail:
      'Explains change to or consistency of analytic judgments. If new evidence changes a judgment, say so and explain why; if it does not, explain why not.',
  },
  {
    n: 8,
    title: 'Accuracy',
    detail:
      'Makes accurate judgments and assessments. Tradecraft cannot rescue a factually wrong product; check figures, dates, names, and quotations.',
  },
  {
    n: 9,
    title: 'Effective visuals',
    detail:
      'Incorporates effective visual information where appropriate. Maps, imagery, and charts should clarify the analysis and carry the provenance needed to read them.',
  },
];

export const OBJECTIVITY_PRINCIPLES = [
  {
    title: 'Objective',
    detail: 'Assess the evidence and the customer’s question, not the preferred conclusion.',
  },
  {
    title: 'Independent of political consideration',
    detail: 'Do not bend judgments toward a policy outcome, faction, or audience.',
  },
  {
    title: 'Timely',
    detail: 'Deliver against the decision timeline; an overdue perfect product is often useless.',
  },
  {
    title: 'All available sources',
    detail: 'Actively seek disconfirming and inconvenient evidence, not only what is easy to find.',
  },
  {
    title: 'Proper analytic tradecraft',
    detail: 'Source grading, confidence language, alternatives, and clear reasoning are part of the product.',
  },
];

export const PROBABILITY_YARDSTICK_NOTE =
  'Likelihood ranges follow the public ODNI probability yardstick: almost no chance (01–05%), very unlikely (05–20%), unlikely (20–40%), roughly even chance (40–60%), likely (60–80%), very likely (80–95%), almost certain (95–99%). Confidence reflects the strength of the evidence base and the soundness of the reasoning, not how strongly you feel about the judgment.';

export const TRAINING_DISCLAIMER =
  'STATION is an independent training tool. It references publicly available analytic standards and public sources for educational purposes. It is not affiliated with, endorsed by, or a substitute for the Office of the Director of National Intelligence, any intelligence community element, or any government. All missions are training exercises using open sources. Simulated injects are clearly labeled and must never be cited as evidence.';
