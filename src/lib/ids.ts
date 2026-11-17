export function uid(prefix = ''): string {
  const part = Math.random().toString(36).slice(2, 10);
  const stamp = Date.now().toString(36).slice(-4);
  return `${prefix}${prefix ? '-' : ''}${part}${stamp}`;
}

export function makeMissionCode(seq: number, when = Date.now()): string {
  const d = new Date(when);
  const yy = String(d.getUTCFullYear()).slice(2);
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `TSK-${yy}${mm}-${String(seq).padStart(3, '0')}`;
}

export function nextSourceLabel(sources: { label: string }[]): string {
  let max = 0;
  for (const s of sources) {
    const match = /^S(\d+)$/.exec(s.label);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `S${max + 1}`;
}
