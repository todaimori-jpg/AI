import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowUpRight,
  BookMarked,
  BookOpen,
  Check,
  Copy,
  Globe,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';
import { FEATURED_TERMS } from '../data/reference';
import type { ReferenceEntry } from '../data/reference';
import {
  cachedLookup,
  countsForTab,
  deleteReferenceNote,
  entryForTerm,
  lookupOnline,
  readRecentTerms,
  readReferenceNotes,
  referenceNoteFor,
  rememberTerm,
  saveReferenceNote,
  searchReference,
  type OnlineLookup,
  type ReferenceNote,
  type ReferenceTab,
} from '../lib/reference';
import { copyText, normalizeText } from '../lib/text';
import { useActions, useAppState } from '../store/StoreProvider';

const TABS: { id: ReferenceTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'dictionary', label: 'Dictionary' },
  { id: 'thesaurus', label: 'Thesaurus' },
  { id: 'encyclopedia', label: 'Encyclopedia' },
];

export function ReferenceView() {
  const { term } = useParams<{ term?: string }>();
  const navigate = useNavigate();
  const actions = useActions();
  const state = useAppState();
  const selectedTerm = term ?? '';
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<ReferenceTab>('all');
  const [browse, setBrowse] = useState(false);
  const [notes, setNotes] = useState<ReferenceNote[]>(() => readReferenceNotes());
  const [recents, setRecents] = useState<string[]>(() => readRecentTerms());
  const [note, setNote] = useState('');
  const [online, setOnline] = useState<OnlineLookup | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const entry = selectedTerm ? entryForTerm(selectedTerm) : undefined;
  const results = useMemo(() => searchReference(query, tab), [query, tab]);
  const savedNote = notes.find((item) => normalizeText(item.term) === normalizeText(selectedTerm));
  const activeMission = state.missions.find((m) => m.status === 'accepted' || m.status === 'submitted');

  useEffect(() => {
    const clean = selectedTerm.trim();
    if (!clean) {
      setNote('');
      setOnline(null);
      setLookupError(null);
      return;
    }
    setNote(referenceNoteFor(clean)?.body ?? '');
    setOnline(cachedLookup(clean));
    setLookupError(null);
    rememberTerm(clean);
    setRecents(readRecentTerms());
  }, [selectedTerm]);

  const open = (target: string) => {
    setQuery('');
    navigate(`/reference/${encodeURIComponent(target)}`);
  };

  const lookUp = async (target = selectedTerm) => {
    const clean = target.trim();
    if (!clean || lookupBusy) return;
    setLookupBusy(true);
    setLookupError(null);
    try {
      const result = await lookupOnline(clean);
      setOnline(result);
      if (result.error) actions.toast(result.error, 'warn');
    } catch (error) {
      setLookupError((error as Error).message);
    } finally {
      setLookupBusy(false);
    }
  };

  const persistNote = () => {
    if (!selectedTerm.trim()) return;
    saveReferenceNote(selectedTerm, note);
    setNotes(readReferenceNotes());
    actions.toast(note.trim() ? 'Reference note saved on this device.' : 'Reference note cleared.', 'good');
  };

  const removeNote = () => {
    deleteReferenceNote(selectedTerm);
    setNote('');
    setNotes(readReferenceNotes());
    actions.toast('Reference note deleted.', 'info');
  };

  const copyDefinition = async (label: string, text: string) => {
    await copyText(`${label} — ${text}`);
    actions.toast('Copied to clipboard.', 'good');
  };

  const noteDirty = note.trim() !== (savedNote?.body ?? '');
  const showList = Boolean(selectedTerm) || Boolean(query.trim()) || tab !== 'all' || browse;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <div className="eyebrow">Desk reference · dictionary · thesaurus · encyclopedia</div>
          <h1 className="page-title">Reference desk</h1>
          <p className="page-sub">
            A built-in, offline reference for the working vocabulary of the station. Every entry carries a definition,
            an alternate-word set and an analytic note. Live lookups are optional enrichment; the desk itself never
            needs a connection.
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn"
            onClick={() => {
              const pool = searchReference('', 'all');
              const pick = pool[Math.floor(Math.random() * Math.max(1, pool.length))];
              if (pick) open(pick.term);
            }}
          >
            <Sparkles size={14} /> Random entry
          </button>
          {activeMission ? (
            <Link to={`/mission/${activeMission.id}`} className="btn btn-cyan">
              <MessageSquare size={14} /> Open mission
            </Link>
          ) : null}
        </div>
      </div>

      <div className={`ref-layout${selectedTerm ? ' has-selection' : ''}`}>
        <div className="ref-side">
          <div className="panel">
            <div className="panel-body tight">
              <form
                className="ref-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (results[0]) open(results[0].term);
                  else if (query.trim()) open(query.trim());
                }}
              >
                <Search size={14} />
                <input
                  className="input"
                  value={query}
                  placeholder="Search the desk…"
                  aria-label="Search the reference desk"
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query ? (
                  <button type="button" className="btn btn-ghost btn-icon" aria-label="Clear search" onClick={() => setQuery('')}>
                    <X size={13} />
                  </button>
                ) : null}
              </form>

              <div className="ref-tabs" role="tablist" aria-label="Reference lens">
                {TABS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === item.id}
                    className={`ref-tab${tab === item.id ? ' active' : ''}`}
                    onClick={() => setTab(item.id)}
                  >
                    {item.label}
                    <span>{countsForTab(item.id)}</span>
                  </button>
                ))}
              </div>

              {recents.length > 0 && !query ? (
                <div className="ref-recent">
                  <div className="section-label">Recent lookups</div>
                  <div className="chips">
                    {recents.map((recent) => (
                      <button key={recent} type="button" className="filter-chip" onClick={() => open(recent)}>
                        {recent}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {!showList ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 10 }}
                  onClick={() => setBrowse(true)}
                >
                  Browse all {countsForTab('all')} entries
                </button>
              ) : null}
            </div>
          </div>

          {showList ? (
            <>
              <div className="ref-list-head row-between">
                <span className="section-label">{query ? 'Matches' : 'Desk entries'}</span>
                <span className="mono tiny dim">{results.length}</span>
              </div>
              <div className="ref-list" role="list">
                {results.map((item) => (
                  <button
                    key={item.term}
                    type="button"
                    role="listitem"
                    className={`ref-item${normalizeText(item.term) === normalizeText(selectedTerm) ? ' active' : ''}`}
                    onClick={() => open(item.term)}
                  >
                    <span className="ref-item-term">
                      {item.term}
                      {notes.some((saved) => normalizeText(saved.term) === normalizeText(item.term)) ? (
                        <StickyNote size={10} className="ref-item-note" />
                      ) : null}
                    </span>
                    <span className="ref-item-meta">
                      {item.partOfSpeech} · {item.domain}
                    </span>
                  </button>
                ))}
                {results.length === 0 ? (
                  <div className="ref-list-empty">
                    <BookOpen size={18} />
                    <span>No built-in entry matches “{query}”.</span>
                    <small>Press Enter to open it and run a live lookup, or save a note of your own.</small>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        <div className="ref-main">
          {entry ? (
            <EntryDetail
              entry={entry}
              note={note}
              saved={Boolean(savedNote)}
              dirty={noteDirty}
              online={online}
              lookupBusy={lookupBusy}
              lookupError={lookupError}
              onNote={setNote}
              onSaveNote={persistNote}
              onDeleteNote={removeNote}
              onLookUp={() => void lookUp(entry.term)}
              onOpen={open}
              onCopy={copyDefinition}
            />
          ) : selectedTerm ? (
            <UnknownEntry
              term={selectedTerm}
              note={note}
              saved={Boolean(savedNote)}
              dirty={noteDirty}
              online={online}
              lookupBusy={lookupBusy}
              lookupError={lookupError}
              onNote={setNote}
              onSaveNote={persistNote}
              onDeleteNote={removeNote}
              onLookUp={() => void lookUp(selectedTerm)}
            />
          ) : (
            <DeskOverview
              notes={notes}
              recents={recents}
              onOpen={open}
              onLookUp={(value) => {
                open(value);
                void lookUp(value);
              }}
              onDelete={(value) => {
                deleteReferenceNote(value);
                setNotes(readReferenceNotes());
                actions.toast('Reference note deleted.', 'info');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function OnlinePanel({
  term,
  online,
  busy,
  error,
  onLookUp,
}: {
  term: string;
  online: OnlineLookup | null;
  busy: boolean;
  error: string | null;
  onLookUp: () => void;
}) {
  const hasContent = Boolean(online && (online.definitions.length || online.synonyms.length || online.encyclopedia));
  return (
    <section className="ref-online">
      <div className="row-between" style={{ marginBottom: 8 }}>
        <div className="section-label" style={{ margin: 0 }}>
          Live enrichment · optional
        </div>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={onLookUp}>
          {busy ? <Loader2 size={12} className="spin" /> : <Globe size={12} />}
          {busy ? 'Looking up' : online ? 'Refresh' : 'Look up online'}
        </button>
      </div>

      {error ? <div className="callout rose">{error}</div> : null}

      {!online && !error && !busy ? (
        <p className="hint">
          The built-in entry above is complete offline. Look up “{term}” online for current dictionary, synonym and
          encyclopedia material. Results cache on this device for later offline reading.
        </p>
      ) : null}

      {online?.error ? <div className="callout" style={{ marginBottom: 10 }}>{online.error}</div> : null}

      {busy && !online ? <div className="ref-online-loading">Querying dictionary, thesaurus and encyclopedia…</div> : null}

      {online && hasContent ? (
        <div className="stack" style={{ gap: 12 }}>
          {online.definitions.length > 0 ? (
            <div>
              <div className="ref-chip-label">LIVE DICTIONARY</div>
              <ol className="ref-live-list">
                {online.definitions.map((definition, index) => (
                  <li key={`${definition.definition.slice(0, 24)}-${index}`}>
                    <span className="ref-pos">{definition.partOfSpeech || 'entry'}</span>
                    {definition.definition}
                    {definition.example ? <em className="ref-live-example">“{definition.example}”</em> : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {online.synonyms.length > 0 ? (
            <div>
              <div className="ref-chip-label">LIVE SYNONYMS</div>
              <div className="ref-chips">
                {online.synonyms.map((synonym) => (
                  <span key={synonym} className="ref-chip syn">
                    {synonym}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {online.antonyms.length > 0 ? (
            <div>
              <div className="ref-chip-label">LIVE ANTONYMS</div>
              <div className="ref-chips">
                {online.antonyms.map((antonym) => (
                  <span key={antonym} className="ref-chip ant">
                    {antonym}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {online.encyclopedia ? (
            <div className="ref-live-wiki">
              {online.encyclopedia.thumbnail ? (
                <img src={online.encyclopedia.thumbnail} alt="" loading="lazy" />
              ) : null}
              <div>
                <div className="ref-chip-label">LIVE ENCYCLOPEDIA · {online.encyclopedia.title}</div>
                <p>{online.encyclopedia.extract}</p>
                <a
                  className="vector-link"
                  href={online.encyclopedia.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <ArrowUpRight size={11} /> Read the full article
                </a>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function NoteEditor({
  note,
  saved,
  dirty,
  onNote,
  onSave,
  onDelete,
  hint,
}: {
  note: string;
  saved: boolean;
  dirty: boolean;
  onNote: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
  hint: string;
}) {
  return (
    <section className="ref-notes">
      <div className="section-label">My reference note</div>
      <textarea
        className="textarea"
        rows={4}
        value={note}
        placeholder={hint}
        onChange={(event) => onNote(event.target.value)}
      />
      <div className="row" style={{ gap: 8, marginTop: 8 }}>
        <button type="button" className="btn btn-sm btn-primary" disabled={!dirty} onClick={onSave}>
          <Check size={12} /> Save note
        </button>
        {saved ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onDelete}>
            <Trash2 size={12} /> Delete
          </button>
        ) : null}
        {saved && !dirty ? <span className="mono tiny dim">SAVED ON THIS DEVICE</span> : null}
      </div>
      <p className="hint" style={{ marginTop: 6 }}>
        Notes stay in this browser. They are not evidence and must never be cited in a report.
      </p>
    </section>
  );
}

function EntryDetail({
  entry,
  note,
  saved,
  dirty,
  online,
  lookupBusy,
  lookupError,
  onNote,
  onSaveNote,
  onDeleteNote,
  onLookUp,
  onOpen,
  onCopy,
}: {
  entry: ReferenceEntry;
  note: string;
  saved: boolean;
  dirty: boolean;
  online: OnlineLookup | null;
  lookupBusy: boolean;
  lookupError: string | null;
  onNote: (value: string) => void;
  onSaveNote: () => void;
  onDeleteNote: () => void;
  onLookUp: () => void;
  onOpen: (term: string) => void;
  onCopy: (label: string, text: string) => void;
}) {
  return (
    <article className="panel ref-entry">
      <div className="ref-hero">
        <div>
          <div className="ref-word">{entry.term}</div>
          <div className="ref-hero-meta">
            <span className="ref-pos">{entry.partOfSpeech}</span>
            <span className="tag tag-cyan">{entry.domain}</span>
            <span className="tag tag-dim">{entry.focus === 'concept' ? 'CONCEPT' : 'WORD'}</span>
            {entry.aliases?.length ? (
              <span className="mono tiny dim">ALSO {entry.aliases.join(' · ')}</span>
            ) : null}
          </div>
        </div>
        <div className="ref-hero-actions">
          <button type="button" className="btn btn-sm" onClick={() => onCopy(entry.term, entry.definition)}>
            <Copy size={12} /> Copy
          </button>
        </div>
      </div>

      <div className="ref-body">
        <section>
          <div className="ref-lens">
            <BookOpen size={12} /> Dictionary
          </div>
          <p className="ref-def">{entry.definition}</p>
        </section>

        <section>
          <div className="ref-lens">
            <BookMarked size={12} /> Thesaurus
          </div>
          <div className="ref-chips">
            {entry.synonyms.map((synonym) => (
              <button key={synonym} type="button" className="ref-chip syn" onClick={() => onOpen(synonym)}>
                {synonym}
              </button>
            ))}
          </div>
          {entry.antonyms?.length ? (
            <>
              <div className="ref-chip-label" style={{ marginTop: 10 }}>
                ANTONYMS
              </div>
              <div className="ref-chips">
                {entry.antonyms.map((antonym) => (
                  <button key={antonym} type="button" className="ref-chip ant" onClick={() => onOpen(antonym)}>
                    {antonym}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </section>

        <section>
          <div className="ref-lens">
            <Sparkles size={12} /> Encyclopedia note
          </div>
          <p className="ref-enc">{entry.encyclopedia}</p>
          {entry.source ? <div className="ref-source">SOURCE · {entry.source}</div> : null}
        </section>

        {entry.seeAlso?.length ? (
          <section>
            <div className="ref-chip-label">SEE ALSO</div>
            <div className="ref-chips">
              {entry.seeAlso.map((related) => (
                <button key={related} type="button" className="ref-see" onClick={() => onOpen(related)}>
                  {related}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <OnlinePanel term={entry.term} online={online} busy={lookupBusy} error={lookupError} onLookUp={onLookUp} />

        <NoteEditor
          note={note}
          saved={saved}
          dirty={dirty}
          onNote={onNote}
          onSave={onSaveNote}
          onDelete={onDeleteNote}
          hint="How will you use this term in the current product? What does it let you claim, and what does it not?"
        />
      </div>
    </article>
  );
}

function UnknownEntry({
  term,
  note,
  saved,
  dirty,
  online,
  lookupBusy,
  lookupError,
  onNote,
  onSaveNote,
  onDeleteNote,
  onLookUp,
}: {
  term: string;
  note: string;
  saved: boolean;
  dirty: boolean;
  online: OnlineLookup | null;
  lookupBusy: boolean;
  lookupError: string | null;
  onNote: (value: string) => void;
  onSaveNote: () => void;
  onDeleteNote: () => void;
  onLookUp: () => void;
}) {
  return (
    <article className="panel ref-entry">
      <div className="ref-hero">
        <div>
          <div className="ref-word">{term}</div>
          <div className="ref-hero-meta">
            <span className="tag tag-amber">NOT IN THE BUILT-IN DESK</span>
          </div>
        </div>
      </div>
      <div className="ref-body">
        <div className="callout">
          This term has no curated station entry yet. You can run a live lookup and keep a personal note against it.
          Built-in tradecraft entries never depend on a connection.
        </div>
        <OnlinePanel term={term} online={online} busy={lookupBusy} error={lookupError} onLookUp={onLookUp} />
        <NoteEditor
          note={note}
          saved={saved}
          dirty={dirty}
          onNote={onNote}
          onSave={onSaveNote}
          onDelete={onDeleteNote}
          hint="Record the working definition you are using so the term means the same thing across your report."
        />
      </div>
    </article>
  );
}

function DeskOverview({
  notes,
  recents,
  onOpen,
  onLookUp,
  onDelete,
}: {
  notes: ReferenceNote[];
  recents: string[];
  onOpen: (term: string) => void;
  onLookUp: (term: string) => void;
  onDelete: (term: string) => void;
}) {
  const [word, setWord] = useState('');
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Three lenses, one desk</div>
            <div className="panel-sub">Definitions, alternate words and the analytic context behind them</div>
          </div>
          <span className="tag tag-dim">{countsForTab('all')} ENTRIES</span>
        </div>
        <div className="panel-body">
          <div className="grid grid-3">
            <div className="ref-lens-card">
              <BookOpen size={16} className="cyan" />
              <strong>Dictionary</strong>
              <span>What the term means in this line of work, not just in general English.</span>
            </div>
            <div className="ref-lens-card">
              <BookMarked size={16} className="amber" />
              <strong>Thesaurus</strong>
              <span>Synonyms and antonyms so judgments do not repeat one word until it loses force.</span>
            </div>
            <div className="ref-lens-card">
              <Sparkles size={16} className="green" />
              <strong>Encyclopedia</strong>
              <span>How the concept behaves in practice, including the mistakes it invites.</span>
            </div>
          </div>
          <p className="hint" style={{ marginTop: 12 }}>
            The desk works offline. When you are online you can enrich any term with live dictionary, synonym and
            encyclopedia material; lookups cache locally for fourteen days.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Featured entries</div>
            <div className="panel-sub">Start here if you are new to the desk</div>
          </div>
        </div>
        <div className="panel-body">
          <div className="ref-featured">
            {FEATURED_TERMS.map((name) => {
              const featured = entryForTerm(name);
              if (!featured) return null;
              return (
                <button key={name} type="button" className="ref-feature" onClick={() => onOpen(featured.term)}>
                  <span className="ref-feature-term">{featured.term}</span>
                  <span className="ref-feature-def">{featured.definition}</span>
                  <span className="ref-feature-meta">
                    {featured.partOfSpeech} · {featured.domain}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Look up any word</div>
            <div className="panel-sub">Uncurated terms still get a live lookup and a personal note</div>
          </div>
        </div>
        <div className="panel-body">
          <form
            className="row"
            style={{ gap: 8 }}
            onSubmit={(event) => {
              event.preventDefault();
              if (word.trim()) onLookUp(word.trim());
            }}
          >
            <input
              className="input"
              value={word}
              placeholder="Type a word or phrase…"
              aria-label="Look up an arbitrary word"
              onChange={(event) => setWord(event.target.value)}
            />
            <button type="submit" className="btn btn-cyan" disabled={!word.trim()}>
              <Globe size={13} /> Look up
            </button>
          </form>
        </div>
      </div>

      {notes.length > 0 ? (
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">My reference notes</div>
              <div className="panel-sub">{notes.length} saved on this device</div>
            </div>
          </div>
          <div className="panel-body tight">
            {notes.slice(0, 6).map((saved) => (
              <div className="ref-note-row" key={saved.term}>
                <button type="button" className="ref-note-title" onClick={() => onOpen(saved.term)}>
                  {saved.term}
                </button>
                <span className="ref-note-body">{saved.body}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label={`Delete note for ${saved.term}`}
                  onClick={() => onDelete(saved.term)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {recents.length > 0 ? (
        <div className="panel">
          <div className="panel-body tight">
            <div className="section-label">Recent lookups</div>
            <div className="chips">
              {recents.map((recent) => (
                <button key={recent} type="button" className="filter-chip" onClick={() => onOpen(recent)}>
                  {recent}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
