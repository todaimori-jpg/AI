import type { AiMessage, AiSettings } from '../types';

export class AiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AiError';
    this.status = status;
  }
}

function endpoint(baseUrl: string): string {
  const base = baseUrl.trim().replace(/\/+$/, '');
  if (!base) throw new AiError('No API base URL configured.');
  if (/\/chat\/completions$/i.test(base)) return base;
  return `${base}/chat/completions`;
}

function extractContent(payload: unknown): string {
  const data = payload as {
    choices?: { message?: { content?: unknown } }[];
    error?: { message?: string };
  };
  if (data.error?.message) throw new AiError(data.error.message);
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const parts = content
      .map((part) => (typeof part === 'string' ? part : (part as { text?: string }).text ?? ''))
      .join('');
    if (parts.trim()) return parts;
  }
  throw new AiError('The provider returned an empty response.');
}

export interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  json?: boolean;
  timeoutMs?: number;
}

export async function chatCompletion(
  settings: AiSettings,
  messages: AiMessage[],
  options: ChatOptions = {},
): Promise<string> {
  if (!settings.enabled) throw new AiError('AI supervisor is disabled in settings.');
  if (!settings.apiKey.trim()) throw new AiError('No API key configured.');
  if (!settings.model.trim()) throw new AiError('No model configured.');

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 60000);
  const body: Record<string, unknown> = {
    model: settings.model.trim(),
    messages,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 700,
  };
  if (options.json) body.response_format = { type: 'json_object' };

  try {
    const response = await fetch(endpoint(settings.baseUrl), {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey.trim()}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      let detail = '';
      try {
        const errorPayload = (await response.json()) as { error?: { message?: string }; message?: string };
        detail = errorPayload.error?.message ?? errorPayload.message ?? '';
      } catch {
        // The error body may not be JSON.
      }
      const hints: Record<number, string> = {
        401: 'The API key was rejected.',
        403: 'The provider refused the request.',
        404: 'Endpoint or model not found. Check the base URL and model name.',
        429: 'Rate limited by the provider. Wait and retry.',
      };
      throw new AiError(
        `${hints[response.status] ?? `Provider error ${response.status}.`}${detail ? ` ${detail}` : ''}`,
        response.status,
      );
    }
    const payload = (await response.json()) as unknown;
    return extractContent(payload).trim();
  } catch (error) {
    if (error instanceof AiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AiError('The AI provider timed out.');
    }
    throw new AiError(
      `Could not reach the AI provider. Check the base URL, CORS support, and network connection. (${(error as Error).message})`,
    );
  } finally {
    window.clearTimeout(timer);
  }
}

export function parseJsonLoose<T>(text: string): T | null {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const candidate = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

export async function testAiConnection(settings: AiSettings): Promise<string> {
  const reply = await chatCompletion(
    settings,
    [
      {
        role: 'system',
        content: 'You are a connection test. Reply with exactly the single word READY and nothing else.',
      },
      { role: 'user', content: 'Connection test.' },
    ],
    { maxTokens: 12, temperature: 0, timeoutMs: 30000 },
  );
  return reply.replace(/[^\w ]/g, '').trim().slice(0, 40) || reply.slice(0, 40);
}
