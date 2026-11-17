const BLOCK_TAGS = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DIV',
  'DL',
  'DT',
  'DD',
  'FIELDSSET',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'FORM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HR',
  'LI',
  'MAIN',
  'NAV',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
  'TR',
  'TD',
  'TH',
  'UL',
]);

export function wordCount(text: string): number {
  const matches = text.trim().match(/[A-Za-z0-9][A-Za-z0-9'’\-]*/g);
  return matches ? matches.length : 0;
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"'(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function extractCitations(text: string): string[] {
  const out: string[] = [];
  const re = /\[S(\d+)\]/g;
  let match = re.exec(text);
  while (match) {
    out.push(`S${match[1]}`);
    match = re.exec(text);
  }
  return out;
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function safeHttpUrl(input: string): string {
  const raw = input.trim();
  if (!raw) return '';
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.toString();
  } catch {
    return '';
  }
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenSet(text: string): Set<string> {
  const stop = new Set([
    'the',
    'and',
    'for',
    'with',
    'that',
    'this',
    'from',
    'have',
    'has',
    'are',
    'was',
    'were',
    'will',
    'would',
    'could',
    'should',
    'into',
    'over',
    'after',
    'before',
    'than',
    'then',
    'their',
    'there',
    'been',
    'being',
    'about',
    'against',
    'between',
    'within',
    'without',
    'while',
    'where',
    'when',
    'what',
    'which',
    'who',
    'whom',
    'its',
    'it',
    'is',
    'of',
    'on',
    'in',
    'to',
    'a',
    'an',
    'as',
    'at',
    'by',
    'or',
    'not',
    'no',
  ]);
  return new Set(
    normalizeText(text)
      .split(' ')
      .filter((w) => w.length > 2 && !stop.has(w)),
  );
}

export function jaccard(a: string, b: string): number {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  let intersection = 0;
  for (const item of setA) if (setB.has(item)) intersection += 1;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function overlapCount(a: string, b: string): number {
  const setB = tokenSet(b);
  let count = 0;
  for (const item of tokenSet(a)) if (setB.has(item)) count += 1;
  return count;
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function blocksFromText(input: string): string[] {
  const text = input
    .replace(/\r\n/g, '\n')
    .replace(/\u200b/g, '')
    .replace(/\u00a0/g, ' ');
  const rawBlocks = text
    .split(/\n\s*\n/)
    .map((b) =>
      b
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' '),
    )
    .map((b) => b.replace(/[ \t]+/g, ' ').trim())
    .filter((b) => b.length > 0);

  const out: string[] = [];
  for (const block of rawBlocks) {
    if (block.length <= 1400) {
      out.push(block);
      continue;
    }
    const sentences = splitSentences(block);
    let chunk = '';
    for (const sentence of sentences) {
      if ((chunk + ' ' + sentence).trim().length > 900 && chunk) {
        out.push(chunk.trim());
        chunk = sentence;
      } else {
        chunk = `${chunk} ${sentence}`.trim();
      }
    }
    if (chunk.trim()) out.push(chunk.trim());
  }
  return out;
}

export function markdownToPlain(markdown: string): string {
  let text = markdown.replace(/\r\n/g, '\n');
  text = text.replace(/^---\n[\s\S]*?\n---\n/, '');
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  text = text.replace(/<((?:https?):\/\/[^>]+)>/g, '$1');
  text = text.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  text = text.replace(/^\s{0,3}>\s?/gm, '');
  text = text.replace(/^\s{0,3}[-*+]\s+/gm, '• ');
  text = text.replace(/^\s{0,3}\d+\.\s+/gm, '');
  text = text.replace(/^\s*```.*$/gm, '');
  text = text.replace(/^\s*\|?[\s:|-]{6,}\|?\s*$/gm, '');
  text = text.replace(/\|/g, ' · ');
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, '$1');
  text = text.replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, '$1');
  text = text.replace(/`{1,3}([^`]*)`{1,3}/g, '$1');
  return blocksFromText(text).join('\n\n');
}

export function htmlToPlain(raw: string): string {
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  doc.querySelectorAll('script, style, noscript, svg, iframe, form, nav, footer').forEach((n) => n.remove());
  const chunks: string[] = [];
  const walk = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      chunks.push(node.nodeValue ?? '');
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.tagName === 'BR') {
      chunks.push('\n');
      return;
    }
    const block = BLOCK_TAGS.has(node.tagName);
    if (block) chunks.push('\n\n');
    node.childNodes.forEach(walk);
    if (block) chunks.push('\n\n');
  };
  if (doc.body) walk(doc.body);
  const text = chunks.join('').replace(/[ \t]+/g, ' ');
  return blocksFromText(text).join('\n\n');
}

export function titleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] ?? '';
    const cleaned = decodeURIComponent(last)
      .replace(/\.(html?|php|aspx?|md|txt)$/i, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    if (cleaned && cleaned.length > 2) {
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'Untitled source';
  }
}

export interface ClaimFlag {
  sentence: string;
  term?: string;
}

const CLAIM_SIGNALS = [
  'according to',
  'confirmed',
  'officially',
  'reported that',
  'reports that',
  'announced',
  'stated that',
  'said that',
  'data show',
  'figures show',
];

const ABSOLUTE_TERMS = [
  'clearly',
  'obviously',
  'undoubtedly',
  'certainly',
  'definitely',
  'unquestionably',
  'without a doubt',
  'proves',
  'proven',
  'everyone knows',
  'always',
  'never',
  'impossible',
  'guaranteed',
];

export function unsupportedClaimSentences(text: string): ClaimFlag[] {
  const out: ClaimFlag[] = [];
  for (const sentence of splitSentences(text)) {
    if (/\[S\d+\]/.test(sentence)) continue;
    if (sentence.length < 35) continue;
    const hasSignal = CLAIM_SIGNALS.some((s) => sentence.toLowerCase().includes(s));
    const hasNumbers = /\b\d{1,3}(?:[.,]\d+)?\s?(?:%|percent|people|persons|km|mi|tons|tonnes|bpd|teu|flights|hours|days|million|billion)\b/i.test(
      sentence,
    );
    const hasDate = /\b(?:19|20)\d{2}\b/.test(sentence) || /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(sentence);
    if (hasSignal || hasNumbers || hasDate) out.push({ sentence });
  }
  return out;
}

export function absoluteLanguage(text: string): ClaimFlag[] {
  const out: ClaimFlag[] = [];
  for (const sentence of splitSentences(text)) {
    const lower = sentence.toLowerCase();
    const term = ABSOLUTE_TERMS.find((t) => new RegExp(`\\b${escapeRegExp(t)}\\b`, 'i').test(lower));
    if (term) out.push({ sentence, term });
  }
  return out;
}

export function lineItems(text: string): string[] {
  return text
    .split(/\n|;|•/)
    .map((s) => s.replace(/^[\s\-*\d.)]+/, '').trim())
    .filter((s) => s.length > 0);
}

export function excerptContains(articleText: string, excerpt: string): boolean {
  const needle = normalizeText(excerpt);
  if (needle.length < 24) return false;
  const haystack = normalizeText(articleText);
  if (haystack.includes(needle)) return true;
  const words = needle.split(' ').filter((w) => w.length > 3);
  if (words.length < 6) return false;
  let hits = 0;
  for (const word of words) if (haystack.includes(word)) hits += 1;
  return hits / words.length >= 0.82;
}

export function readingMinutes(blocks: string[]): number {
  const words = blocks.reduce((sum, b) => sum + wordCount(b), 0);
  return Math.max(1, Math.round(words / 220));
}

export function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const area = document.createElement('textarea');
  area.value = text;
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
  return Promise.resolve();
}
