import { useEffect, useMemo, useRef, useState, type DragEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  Check,
  Download,
  ExternalLink,
  FileText,
  Highlighter,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { Area, Article, Highlight, HighlightColor } from '../types';
import { AREAS, HIGHLIGHT_COLORS } from '../lib/constants';
import { blocksFromText, copyText, domainOf, safeHttpUrl, titleFromUrl, wordCount } from '../lib/text';
import { captureFromUrl, readTextFile, type CaptureResult } from '../lib/capture';
import { downloadFile, safeFilename } from '../lib/download';
import { uid } from '../lib/ids';
import { fmtDate, fmtRelative } from '../lib/time';
import { useActions, useAppState, useNow } from '../store/StoreProvider';
import { ConfirmModal, EmptyState } from '../components/ui';

type AddMode = 'paste' | 'url' | 'file';

interface PendingSource {
  title: string;
  publisher: string;
  publishedAt: string;
  url: string;
  blocks: string[];
  sourceKind: Article['sourceKind'];
}

interface SelectionPop {
  blockIndex: number;
  start: number;
  end: number;
  quote: string;
  x: number;
  y: number;
}

export function LibraryView() {
  const state = useAppState();
  const actions = useActions();
  const navigate = useNavigate();
  const now = useNow(60000);
  const { id } = useParams<{ id?: string }>();
  const [query, setQuery] = useState('');
  const [area, setArea] = useState<'all' | Area>('all');
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const article = state.articles.find((item) => item.id === id) ?? null;

  const articles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.articles
      .filter((item) => area === 'all' || item.area === area)
      .filter((item) => {
        if (!needle) return true;
        return `${item.title} ${item.publisher} ${item.tags.join(' ')} ${item.blocks[0] ?? ''}`
          .toLowerCase()
          .includes(needle);
      });
  }, [state.articles, query, area]);

  const areasPresent = useMemo(() => {
    const present = new Set<Area>();
    for (const item of state.articles) if (item.area) present.add(item.area);
    return (Object.keys(AREAS) as Area[]).filter((key) => present.has(key));
  }, [state.articles]);

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <div className="eyebrow">Evidence library · offline reading</div>
          <h1 className="page-title">Library</h1>
          <p className="page-sub">
            Save articles and documents here to read them without a connection. Highlight the passages you will rely
            on, attach notes, and push the saved copy straight into a mission source register.
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className={`btn ${adding ? '' : 'btn-primary'}`}
            onClick={() => setAdding((value) => !value)}
          >
            {adding ? <X size={14} /> : <Plus size={14} />}
            {adding ? 'Close capture' : 'Add source'}
          </button>
        </div>
      </div>

      {adding ? <AddPanel onClose={() => setAdding(false)} /> : null}

      {state.articles.length === 0 && !adding ? (
        <div className="panel">
          <EmptyState
            icon={<BookOpen />}
            title="The library is empty"
            sub="Save a public article, official record or dataset here. Pasted text, uploaded files and fetched pages are stored on this device with their highlights and notes."
            action={
              <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
                <Plus size={14} /> Add your first source
              </button>
            }
          />
        </div>
      ) : (
        <div className="library-layout">
          <div className="ref-side">
            <div className="panel" style={{ marginBottom: 10 }}>
              <div className="panel-body tight">
                <div className="ref-search">
                  <Search size={14} />
                  <input
                    className="input"
                    value={query}
                    placeholder="Search the library…"
                    aria-label="Search the library"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  {query ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      aria-label="Clear search"
                      onClick={() => setQuery('')}
                    >
                      <X size={13} />
                    </button>
                  ) : null}
                </div>
                {areasPresent.length > 0 ? (
                  <div className="filters" style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className={`filter-chip${area === 'all' ? ' active' : ''}`}
                      onClick={() => setArea('all')}
                    >
                      All
                    </button>
                    {areasPresent.map((key) => (
                      <button
                        key={key}
                        type="button"
                        className={`filter-chip${area === key ? ' active' : ''}`}
                        onClick={() => setArea(key)}
                      >
                        {AREAS[key].short}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="library-list">
              {articles.map((item) => (
                <Link
                  key={item.id}
                  to={`/library/${item.id}`}
                  className={`article-card${item.id === id ? ' active' : ''}`}
                >
                  <div className="article-card-title">{item.title}</div>
                  <div className="article-card-meta">
                    <span>{item.publisher || 'UNKNOWN PUBLISHER'}</span>
                    <span>·</span>
                    <span>{fmtRelative(item.savedAt, now)}</span>
                    {item.highlights.length > 0 ? (
                      <>
                        <span>·</span>
                        <span className="amber">{item.highlights.length} MARKS</span>
                      </>
                    ) : null}
                    {item.missionIds.length > 0 ? (
                      <>
                        <span>·</span>
                        <span className="cyan">LINKED</span>
                      </>
                    ) : null}
                  </div>
                </Link>
              ))}
              {articles.length === 0 ? (
                <div className="ref-list-empty">
                  <BookOpen size={18} />
                  <span>No saved sources match.</span>
                  <small>Clear the search or the area filter.</small>
                </div>
              ) : null}
            </div>
          </div>

          <div className="ref-main">
            {article ? (
              <Reader
                key={article.id}
                article={article}
                onDeleted={() => {
                  actions.deleteArticle(article.id);
                  setConfirmDelete(false);
                  navigate('/library');
                }}
                confirmOpen={confirmDelete}
                setConfirmOpen={setConfirmDelete}
              />
            ) : (
              <div className="panel">
                <EmptyState
                  icon={<FileText />}
                  title="Select a saved source"
                  sub="Pick a document from the list to read it, highlight passages and keep notes. Everything here is readable offline."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddPanel({ onClose }: { onClose: () => void }) {
  const actions = useActions();
  const state = useAppState();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AddMode>('paste');
  const [pending, setPending] = useState<PendingSource | null>(null);
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [url, setUrl] = useState('');
  const [area, setArea] = useState<'none' | Area>('none');
  const [tags, setTags] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const resetPending = () => {
    setPending(null);
    setError(null);
  };

  const fetchUrl = async () => {
    if (busy) return;
    const target = safeHttpUrl(url);
    if (!target) {
      setError('Enter a valid http(s) URL.');
      return;
    }
    setBusy(true);
    setError(null);
    resetPending();
    try {
      const result: CaptureResult = await captureFromUrl(target, {
        useProxy: Boolean(state.settings.captureProxy.trim()),
        proxy: state.settings.captureProxy,
      });
      setPending({ ...result, sourceKind: 'web' });
      setTitle(result.title);
      setPublisher(result.publisher);
      setPublishedAt(result.publishedAt);
      setUrl(result.url);
    } catch (captureError) {
      setError((captureError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const ingestFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const result = await readTextFile(file);
      setPending({
        title: result.title,
        publisher: '',
        publishedAt: '',
        url: '',
        blocks: result.blocks,
        sourceKind: 'file',
      });
      setTitle(result.title);
      setError(null);
    } catch (fileError) {
      setError((fileError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    const blocks = mode === 'paste' ? blocksFromText(text) : pending?.blocks ?? [];
    if (blocks.length === 0 || blocks.join(' ').trim().length < 80) {
      setError(
        mode === 'paste'
          ? 'Paste at least a paragraph of readable article text.'
          : 'Fetch or upload a source before saving it.',
      );
      return;
    }
    const cleanUrl = safeHttpUrl(url || pending?.url || '');
    const saved: Article = {
      id: uid('art'),
      title: title.trim() || pending?.title || (cleanUrl ? titleFromUrl(cleanUrl) : '') || 'Untitled source',
      url: cleanUrl,
      publisher: publisher.trim() || pending?.publisher || (cleanUrl ? domainOf(cleanUrl) : ''),
      author: '',
      publishedAt: publishedAt.trim() || pending?.publishedAt || '',
      savedAt: Date.now(),
      area: area === 'none' ? undefined : area,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8),
      blocks,
      highlights: [],
      note: '',
      missionIds: [],
      sourceKind: mode === 'paste' ? 'paste' : mode === 'file' ? 'file' : 'web',
    };
    actions.addArticle(saved);
    actions.toast(`${saved.title} saved offline.`, 'good');
    onClose();
    navigate(`/library/${saved.id}`);
  };

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="panel-head">
        <div>
          <div className="panel-title">Add an offline source</div>
          <div className="panel-sub">Paste text, upload a file, or fetch a page through your capture proxy</div>
        </div>
        <div className="panel-head-actions">
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Close capture" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="panel-body">
        <div className="filters" style={{ marginTop: 0, marginBottom: 12 }}>
          <button
            type="button"
            className={`filter-chip${mode === 'paste' ? ' active' : ''}`}
            onClick={() => {
              setMode('paste');
              resetPending();
            }}
          >
            Paste text
          </button>
          <button
            type="button"
            className={`filter-chip${mode === 'url' ? ' active' : ''}`}
            onClick={() => {
              setMode('url');
              resetPending();
            }}
          >
            From URL
          </button>
          <button
            type="button"
            className={`filter-chip${mode === 'file' ? ' active' : ''}`}
            onClick={() => {
              setMode('file');
              resetPending();
            }}
          >
            From file
          </button>
        </div>

        {mode === 'paste' ? (
          <div className="field">
            <label className="label">Article or document text</label>
            <textarea
              className="textarea"
              rows={7}
              value={text}
              placeholder="Paste the readable body of the source. Headings, paragraphs and blank lines are preserved as blocks."
              onChange={(event) => setText(event.target.value)}
            />
            <div className="editor-count">{wordCount(text)} words</div>
          </div>
        ) : null}

        {mode === 'url' ? (
          <div className="stack" style={{ gap: 8 }}>
            <div className="row" style={{ gap: 8 }}>
              <input
                className="input"
                value={url}
                placeholder="https://…"
                aria-label="Source URL"
                onChange={(event) => setUrl(event.target.value)}
              />
              <button type="button" className="btn btn-cyan" disabled={busy} onClick={() => void fetchUrl()}>
                {busy ? <Loader2 size={13} className="spin" /> : <RefreshCw size={13} />}
                {busy ? 'Fetching' : 'Fetch & preview'}
              </button>
            </div>
            <p className="hint">
              Many publishers block browser cross-origin requests. If the fetch fails, paste the article text instead,
              or set a capture proxy in Settings.
            </p>
          </div>
        ) : null}

        {mode === 'file' ? (
          <label
            className={`drop-zone${dragging ? ' drag' : ''}`}
            onDragOver={(event: DragEvent<HTMLLabelElement>) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event: DragEvent<HTMLLabelElement>) => {
              event.preventDefault();
              setDragging(false);
              void ingestFile(event.dataTransfer.files[0]);
            }}
          >
            <Upload size={18} style={{ marginBottom: 6 }} />
            <div>{busy ? 'Reading file…' : 'Drop a .txt, .md or .html file here, or click to browse'}</div>
            <input
              type="file"
              accept=".txt,.md,.markdown,.html,.htm,text/plain,text/markdown,text/html"
              style={{ display: 'none' }}
              onChange={(event) => void ingestFile(event.target.files?.[0])}
            />
          </label>
        ) : null}

        {pending ? (
          <div className="callout cyan" style={{ marginTop: 12 }}>
            <strong>Captured {pending.blocks.length} blocks</strong> · {wordCount(pending.blocks.join(' '))} words.
            Review the metadata, then save it to the library.
          </div>
        ) : null}

        {error ? (
          <div className="callout rose" style={{ marginTop: 12 }}>
            {error}
          </div>
        ) : null}

        <div className="form-grid" style={{ marginTop: 12 }}>
          <div className="field">
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="field">
            <label className="label">Publisher</label>
            <input className="input" value={publisher} onChange={(event) => setPublisher(event.target.value)} />
          </div>
          <div className="field">
            <label className="label">Published</label>
            <input
              className="input"
              value={publishedAt}
              placeholder="YYYY-MM-DD"
              onChange={(event) => setPublishedAt(event.target.value)}
            />
          </div>
          <div className="field">
            <label className="label">Area</label>
            <select className="select" value={area} onChange={(event) => setArea(event.target.value as 'none' | Area)}>
              <option value="none">Unassigned</option>
              {(Object.keys(AREAS) as Area[]).map((key) => (
                <option key={key} value={key}>
                  {AREAS[key].label}
                </option>
              ))}
            </select>
          </div>
          <div className="field full">
            <label className="label">Tags</label>
            <input
              className="input"
              value={tags}
              placeholder="Comma-separated, e.g. shipping, red sea, tariffs"
              onChange={(event) => setTags(event.target.value)}
            />
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={save}>
            <Check size={13} /> Save to library
          </button>
        </div>
      </div>
    </div>
  );
}

function Reader({
  article,
  onDeleted,
  confirmOpen,
  setConfirmOpen,
}: {
  article: Article;
  onDeleted: () => void;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
}) {
  const actions = useActions();
  const state = useAppState();
  const [pop, setPop] = useState<SelectionPop | null>(null);
  const [noteDraft, setNoteDraft] = useState(article.note);
  const [focused, setFocused] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNoteDraft(article.note);
    setPop(null);
  }, [article.id, article.note]);

  const missions = state.missions.filter(
    (mission) => mission.status !== 'offered' && mission.status !== 'archived',
  );
  const linked = state.missions.filter((mission) => article.missionIds.includes(mission.id));

  const onMouseUp = (event: ReactMouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setPop(null);
      return;
    }
    const range = selection.getRangeAt(0);
    const elementOf = (node: Node): HTMLElement | null =>
      node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
    const startBlock = elementOf(range.startContainer)?.closest('[data-block]');
    const endBlock = elementOf(range.endContainer)?.closest('[data-block]');
    if (!startBlock || startBlock !== endBlock) {
      setPop(null);
      return;
    }
    const blockIndex = Number(startBlock.getAttribute('data-block'));
    const leading = document.createRange();
    leading.selectNodeContents(startBlock);
    leading.setEnd(range.startContainer, range.startOffset);
    const start = leading.toString().length;
    const end = start + range.toString().length;
    const quote = (startBlock.textContent ?? '').slice(start, end);
    if (quote.trim().length < 3) {
      setPop(null);
      return;
    }
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPop({
      blockIndex,
      start,
      end,
      quote,
      x: Math.max(4, Math.min(rect.width - 190, event.clientX - rect.left + 8)),
      y: Math.min(rect.height - 46, event.clientY - rect.top + 18),
    });
  };

  const applyHighlight = (color: HighlightColor) => {
    if (!pop) return;
    actions.addHighlight(article.id, {
      blockIndex: pop.blockIndex,
      start: pop.start,
      end: pop.end,
      quote: pop.quote,
      color,
      note: '',
    });
    setPop(null);
    window.getSelection()?.removeAllRanges();
    actions.toast('Passage marked. Add a note in the margin panel.', 'good');
  };

  const copyForMission = async () => {
    const excerpts = article.highlights
      .map((highlight) => `“${highlight.quote}”${highlight.note ? ` — ${highlight.note}` : ''}`)
      .join('\n');
    const text = [article.title, article.publisher, article.url, '', excerpts || (article.blocks[0] ?? '')].join('\n');
    await copyText(text);
    actions.toast('Source details copied.', 'good');
  };

  const exportMarkdown = () => {
    const lines = [
      `# ${article.title}`,
      '',
      `- Publisher: ${article.publisher || 'unknown'}`,
      `- Published: ${article.publishedAt || 'unknown'}`,
      `- URL: ${article.url || 'n/a'}`,
      `- Saved: ${fmtDate(article.savedAt)}`,
      `- Tags: ${article.tags.length ? article.tags.join(', ') : 'none'}`,
      '',
    ];
    if (article.note.trim()) lines.push('## Reading note', '', article.note.trim(), '');
    lines.push('## Body', '', ...article.blocks.flatMap((block) => [block, '']));
    if (article.highlights.length > 0) {
      lines.push('## Highlights', '');
      for (const highlight of article.highlights) {
        lines.push(`- [${highlight.color}] “${highlight.quote}”${highlight.note ? ` — ${highlight.note}` : ''}`);
      }
      lines.push('');
    }
    downloadFile(`${safeFilename(article.title)}.md`, lines.join('\n'), 'text/markdown');
    actions.toast('Source exported as Markdown.', 'good');
  };

  const saveNote = () => {
    actions.updateArticle(article.id, { note: noteDraft });
    actions.toast('Reading note saved.', 'good');
  };

  const blockHighlights = (index: number): Highlight[] =>
    article.highlights.filter((highlight) => highlight.blockIndex === index);

  return (
    <div className="reader-wrap">
      <div className="reader">
        <div className="reader-head">
          <div className="row-between" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div>
              <div className="reader-title">{article.title}</div>
              <div className="reader-meta">
                <span>{article.publisher || 'UNKNOWN PUBLISHER'}</span>
                <span>·</span>
                <span>{article.publishedAt || fmtDate(article.savedAt)}</span>
                <span>·</span>
                <span>SAVED {fmtDate(article.savedAt)}</span>
                {article.area ? (
                  <>
                    <span>·</span>
                    <span className="cyan">{AREAS[article.area].label}</span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="row" style={{ gap: 6 }}>
              {article.url ? (
                <a className="btn btn-sm" href={article.url} target="_blank" rel="noreferrer noopener">
                  <ExternalLink size={12} /> Original
                </a>
              ) : null}
              <button type="button" className="btn btn-sm" onClick={() => void copyForMission()}>
                <Link2 size={12} /> Copy
              </button>
              <button type="button" className="btn btn-sm" onClick={exportMarkdown}>
                <Download size={12} /> .md
              </button>
            </div>
          </div>
          {article.tags.length > 0 ? (
            <div className="chips" style={{ marginTop: 10 }}>
              {article.tags.map((tag) => (
                <span key={tag} className="tag tag-dim">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="reader-body">
          <div
            className="article-text"
            ref={wrapRef}
            onMouseUp={onMouseUp}
            onMouseDown={() => setPop(null)}
          >
            {article.blocks.map((block, index) => (
              <p className="article-block" data-block={index} key={index}>
                {renderBlock(block, blockHighlights(index), (highlight) => {
                  setFocused(highlight.id);
                  document.getElementById(`hl-${highlight.id}`)?.scrollIntoView({ block: 'nearest' });
                })}
              </p>
            ))}
            {pop ? (
              <div className="hl-pop" style={{ left: pop.x, top: pop.y }} role="menu" aria-label="Highlight colour">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className={`hl-swatch ${color.id}`}
                    title={color.label}
                    aria-label={color.label}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={() => applyHighlight(color.id)}
                  />
                ))}
              </div>
            ) : null}
          </div>
          {article.blocks.length === 0 ? <p className="hint">This source has no readable blocks.</p> : null}
        </div>

        <div className="reader-tools" style={{ borderLeft: 0, borderRight: 0, borderBottom: 0 }}>
          <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
            <Highlighter size={14} className="amber" />
            <div>
              <div className="section-label" style={{ margin: 0 }}>
                How to mark
              </div>
              <p className="hint">
                Select a passage with the mouse, then choose a colour. <strong>Amber</strong> key fact,{' '}
                <strong>cyan</strong> context, <strong>green</strong> corroborates, <strong>rose</strong> contradicts.
                Marks are stored with the saved copy.
              </p>
            </div>
          </div>
        </div>
      </div>

      <aside className="stack" style={{ gap: 14 }}>
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Attach to a mission</div>
              <div className="panel-sub">Library items can seed a source register entry</div>
            </div>
          </div>
          <div className="panel-body tight">
            {missions.length === 0 ? (
              <p className="hint">
                No open mission to attach. Accept a tasking from the <Link to="/missions">mission board</Link>.
              </p>
            ) : (
              <>
                <select
                  className="select"
                  value=""
                  aria-label="Link this source to a mission"
                  onChange={(event) => {
                    if (event.target.value) actions.linkArticle(article.id, event.target.value);
                  }}
                >
                  <option value="">Link to mission…</option>
                  {missions
                    .filter((mission) => !article.missionIds.includes(mission.id))
                    .map((mission) => (
                      <option key={mission.id} value={mission.id}>
                        {mission.code} · {mission.title}
                      </option>
                    ))}
                </select>
                {linked.length > 0 ? (
                  <div className="stack" style={{ gap: 8, marginTop: 10 }}>
                    {linked.map((mission) => (
                      <div className="ref-note-row" key={mission.id}>
                        <Link to={`/mission/${mission.id}`} className="ref-note-title">
                          {mission.code}
                        </Link>
                        <span className="ref-note-body">{mission.title}</span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          title="Add as a graded source"
                          aria-label={`Add ${article.title} to ${mission.code}`}
                          onClick={() => {
                            const source = actions.addSourceFromArticle(mission.id, article.id);
                            if (source) {
                              actions.toast(
                                `Added as ${source.label} to ${mission.code}. Grade it in the report editor.`,
                                'good',
                              );
                            }
                          }}
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          title="Unlink from mission"
                          aria-label={`Unlink from ${mission.code}`}
                          onClick={() => actions.linkArticle(article.id, mission.id)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Reading note</div>
              <div className="panel-sub">What this source can and cannot prove</div>
            </div>
          </div>
          <div className="panel-body">
            <textarea
              className="textarea"
              rows={4}
              value={noteDraft}
              placeholder="Note provenance, the date it was written, and the one claim you would use it for."
              onChange={(event) => setNoteDraft(event.target.value)}
            />
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                disabled={noteDraft === article.note}
                onClick={saveNote}
              >
                <Check size={12} /> Save note
              </button>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Highlights</div>
              <div className="panel-sub">{article.highlights.length} marks on this source</div>
            </div>
          </div>
          <div className="panel-body tight">
            {article.highlights.length === 0 ? (
              <p className="hint">Select a passage in the text to mark it. Each mark can carry its own note.</p>
            ) : (
              <div className="highlight-list">
                {article.highlights.map((highlight) => (
                  <div
                    className={`highlight-item ${highlight.color}${focused === highlight.id ? ' focused' : ''}`}
                    key={highlight.id}
                    id={`hl-${highlight.id}`}
                  >
                    <div className="highlight-quote">“{highlight.quote}”</div>
                    <textarea
                      className="textarea"
                      rows={2}
                      defaultValue={highlight.note}
                      placeholder="Why does this matter?"
                      style={{ marginTop: 6, minHeight: 44, fontSize: 11.5 }}
                      onBlur={(event) => actions.updateHighlight(article.id, highlight.id, { note: event.target.value })}
                    />
                    <div className="row-between" style={{ marginTop: 4 }}>
                      <span className="mono tiny dim">{highlight.color.toUpperCase()}</span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        aria-label="Delete highlight"
                        onClick={() => actions.deleteHighlight(article.id, highlight.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-body tight">
            <button
              type="button"
              className="btn btn-danger btn-wide"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 size={13} /> Remove saved source
            </button>
          </div>
        </div>
      </aside>

      <ConfirmModal
        open={confirmOpen}
        title="Remove saved source"
        confirmLabel="Remove"
        tone="danger"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={onDeleted}
      >
        <p>
          <strong>{article.title}</strong> and its {article.highlights.length} highlight(s) will be deleted from this
          device.
        </p>
        <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 12.5 }}>
          Source register entries already added to a mission stay in the report, but they will lose their offline copy.
        </p>
      </ConfirmModal>
    </div>
  );
}

function renderBlock(text: string, highlights: Highlight[], onSelect: (highlight: Highlight) => void): ReactNode[] {
  const sorted = [...highlights]
    .filter((highlight) => highlight.start < text.length && highlight.end > 0)
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const highlight of sorted) {
    const start = Math.max(cursor, Math.min(highlight.start, text.length));
    const end = Math.max(start, Math.min(highlight.end, text.length));
    if (start > cursor) parts.push(text.slice(cursor, start));
    if (end > start) {
      parts.push(
        <mark
          key={highlight.id}
          className={`hl hl-${highlight.color}`}
          title={highlight.note || 'Click to find the note'}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(highlight);
          }}
        >
          {text.slice(start, end)}
        </mark>,
      );
    }
    cursor = Math.max(cursor, end);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  if (parts.length === 0) parts.push(text);
  return parts;
}
