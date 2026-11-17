import { blocksFromText, htmlToPlain, markdownToPlain, safeHttpUrl, titleFromUrl } from './text';

export interface CaptureResult {
  title: string;
  publisher: string;
  author: string;
  publishedAt: string;
  url: string;
  blocks: string[];
}

function proxyUrl(raw: string, proxy: string): string {
  const trimmed = proxy.trim();
  if (!trimmed) return raw;
  if (trimmed.includes('{url}')) return trimmed.replace('{url}', encodeURIComponent(raw));
  return `${trimmed.replace(/\/+$/, '')}/${raw}`;
}

function meta(doc: Document, names: string[]): string {
  for (const name of names) {
    const element =
      doc.querySelector(`meta[property="${name}"]`) ??
      doc.querySelector(`meta[name="${name}"]`) ??
      doc.querySelector(`meta[itemprop="${name}"]`);
    const content = element?.getAttribute('content')?.trim();
    if (content) return content;
  }
  return '';
}

function parseDocument(html: string, url: string): Omit<CaptureResult, 'blocks'> & { body: string } {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const title =
    meta(doc, ['og:title', 'twitter:title']) ||
    doc.querySelector('h1')?.textContent?.trim() ||
    doc.title.trim() ||
    titleFromUrl(url);
  const author = meta(doc, ['author', 'article:author', 'og:article:author']);
  let publishedAt =
    meta(doc, ['article:published_time', 'datePublished', 'pubdate', 'date', 'og:published_time']) ||
    doc.querySelector('time[datetime]')?.getAttribute('datetime') ||
    '';
  if (publishedAt) {
    const parsed = new Date(publishedAt);
    publishedAt = Number.isNaN(parsed.getTime()) ? publishedAt.slice(0, 32) : parsed.toISOString().slice(0, 10);
  }
  const publisher = meta(doc, ['og:site_name', 'application-name']) || new URL(url).hostname.replace(/^www\./, '');
  const main = doc.querySelector('article') ?? doc.querySelector('main') ?? doc.body;
  const body = main ? htmlToPlain(main.innerHTML) : '';
  return { title, publisher, author, publishedAt, url, body };
}

export async function captureFromUrl(
  input: string,
  options: { useProxy: boolean; proxy: string },
): Promise<CaptureResult> {
  const url = safeHttpUrl(input);
  if (!url) throw new Error('That is not a valid http(s) URL.');
  const target = options.useProxy ? proxyUrl(url, options.proxy) : url;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 20000);
  let response: Response;
  try {
    response = await fetch(target, {
      signal: controller.signal,
      headers: { Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9' },
    });
  } catch {
    throw new Error(
      'The page could not be fetched from the browser. Most publishers block cross-origin requests. Paste the article text, or set a capture proxy in Settings.',
    );
  } finally {
    window.clearTimeout(timer);
  }
  if (!response.ok) {
    throw new Error(`The publisher returned HTTP ${response.status}. Paste the text instead.`);
  }
  const contentType = response.headers.get('content-type') ?? '';
  const raw = await response.text();

  if (contentType.includes('application/json')) {
    try {
      const parsed = JSON.parse(raw) as { data?: { content?: string; title?: string } };
      const content = parsed.data?.content ?? '';
      if (content.trim()) {
        return {
          title: parsed.data?.title || titleFromUrl(url),
          publisher: new URL(url).hostname.replace(/^www\./, ''),
          author: '',
          publishedAt: '',
          url,
          blocks: blocksFromText(content),
        };
      }
    } catch {
      // Fall through to plain text handling.
    }
  }

  const looksLikeHtml = /<html|<body|<article|<p[\s>]/i.test(raw.slice(0, 4000)) && !contentType.includes('text/plain');
  let result: CaptureResult;
  if (looksLikeHtml) {
    const parsed = parseDocument(raw, url);
    result = {
      title: parsed.title,
      publisher: parsed.publisher,
      author: parsed.author,
      publishedAt: parsed.publishedAt,
      url,
      blocks: blocksFromText(parsed.body),
    };
  } else {
    result = {
      title: titleFromUrl(url),
      publisher: new URL(url).hostname.replace(/^www\./, ''),
      author: '',
      publishedAt: '',
      url,
      blocks: blocksFromText(markdownToPlain(raw)),
    };
  }
  if (result.blocks.join(' ').trim().length < 240) {
    throw new Error('The page returned too little readable text. Paste the article body instead.');
  }
  return result;
}

export async function readTextFile(file: File): Promise<{ title: string; blocks: string[] }> {
  const raw = await file.text();
  const isHtml = /\.html?$/i.test(file.name) || file.type.includes('html');
  const text = isHtml ? htmlToPlain(raw) : markdownToPlain(raw);
  const title = file.name.replace(/\.(txt|md|markdown|html?)$/i, '').replace(/[-_]+/g, ' ').trim();
  return { title: title || 'Imported document', blocks: blocksFromText(text) };
}
