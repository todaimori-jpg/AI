export function downloadFile(filename: string, content: string, mime = 'application/octet-stream'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function safeFilename(input: string): string {
  const cleaned = input
    .replace(/[^\w\s.-]+/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 80)
    .replace(/^_+|_+$/g, '');
  return cleaned || 'untitled';
}
