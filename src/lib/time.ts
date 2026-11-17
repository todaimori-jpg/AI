const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const pad = (n: number) => String(n).padStart(2, '0');

export function fmtDate(ts: number | string | undefined): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function fmtDateTime(ts: number | undefined): string {
  if (!ts) return '—';
  const d = new Date(ts);
  return `${fmtDate(ts)} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}Z`;
}

export function fmtClock(ts: number, withSeconds = false): string {
  const d = new Date(ts);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}${withSeconds ? `:${pad(d.getUTCSeconds())}` : ''}Z`;
}

export function fmtLocal(ts: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ts));
}

export function fmtRelative(ts: number, now = Date.now()): string {
  const diff = Math.round((now - ts) / 1000);
  if (diff < 45) return 'just now';
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.round(diff / 86400)}d ago`;
  return fmtDate(ts);
}

export function countdown(ms: number): { text: string; urgent: boolean; overdue: boolean } {
  const overdue = ms < 0;
  const abs = Math.abs(ms);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const mins = Math.floor((abs % 3600000) / 60000);
  let text: string;
  if (days > 0) text = `${days}D ${pad(hours)}H`;
  else if (hours > 0) text = `${hours}H ${pad(mins)}M`;
  else text = `${mins}M`;
  return { text, urgent: !overdue && abs < 6 * 3600000, overdue };
}

export function hoursBetween(a: number, b: number): number {
  return (b - a) / 3600000;
}

export function toDateInput(ts: number | undefined): string {
  if (!ts) return '';
  const d = new Date(ts);
  const y = d.getFullYear();
  return `${y}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDateInput(value: string): number | undefined {
  if (!value) return undefined;
  const ts = new Date(`${value}T12:00:00Z`).getTime();
  return Number.isNaN(ts) ? undefined : ts;
}

export function utcDateParts(ts = Date.now()): { y: number; m: number; d: number; label: string } {
  const d = new Date(ts);
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth() + 1,
    d: d.getUTCDate(),
    label: `${d.getUTCFullYear()}_${MONTHS_LONG[d.getUTCMonth()]}_${d.getUTCDate()}`,
  };
}

export function dayKey(ts = Date.now()): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fmtHours(hours: number): string {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 24) return `${Math.round(hours)} h`;
  return `${Math.round(hours / 24)} d`;
}

export { MONTHS, MONTHS_LONG };
