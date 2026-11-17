import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookMarked,
  Check,
  Download,
  Eye,
  EyeOff,
  HardDrive,
  KeyRound,
  Loader2,
  PlugZap,
  Server,
  Trash2,
  Upload,
} from 'lucide-react';
import type { Difficulty } from '../types';
import { DIFFICULTY_LABELS, RANKS, rankForXp } from '../lib/constants';
import { deleteReferenceNote, readReferenceNotes } from '../lib/reference';
import { downloadFile } from '../lib/download';
import { fmtDate } from '../lib/time';
import { useActions, useAppState, useBusy } from '../store/StoreProvider';
import { ConfirmModal } from '../components/ui';

export function SettingsView() {
  const state = useAppState();
  const actions = useActions();
  const aiBusy = useBusy('ai-test');
  const [showKey, setShowKey] = useState(false);
  const [notes, setNotes] = useState(() => readReferenceNotes());
  const [resetOpen, setResetOpen] = useState(false);
  const [resetText, setResetText] = useState('');
  const [resetting, setResetting] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ name: string; json: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const rank = rankForXp(state.profile.xp);

  const exportWorkspace = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`STATION_workspace_${stamp}.json`, actions.exportData(), 'application/json');
    actions.toast('Workspace exported. The API key is excluded.', 'good');
  };

  const pickImport = () => fileRef.current?.click();

  const readImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const json = await file.text();
      setPendingImport({ name: file.name, json });
    } catch (error) {
      actions.toast(`Could not read that file: ${(error as Error).message}`, 'bad');
    }
  };

  const confirmImport = async () => {
    if (!pendingImport) return;
    setImporting(true);
    const ok = await actions.importData(pendingImport.json);
    setImporting(false);
    setPendingImport(null);
    if (ok) {
      setNotes(readReferenceNotes());
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <div className="eyebrow">Station configuration</div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">
            Identity, optional AI supervision, collection and capture controls, and workspace ownership. Everything is
            stored in this browser; nothing is uploaded unless you configure an AI provider or fetch a page.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Analyst identity</div>
              <div className="panel-sub">Shown on the top bar, messages and exported briefings</div>
            </div>
            <span className="tag tag-amber">{rank.title}</span>
          </div>
          <div className="panel-body">
            <div className="field">
              <label className="label" htmlFor="callsign">
                Callsign
              </label>
              <input
                id="callsign"
                className="input"
                value={state.settings.callsign}
                maxLength={18}
                onChange={(event) =>
                  actions.updateSettings({ callsign: event.target.value.toUpperCase().slice(0, 18) })
                }
              />
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label" htmlFor="difficulty">
                Tasking difficulty
              </label>
              <select
                id="difficulty"
                className="select"
                value={state.settings.difficultyMode}
                onChange={(event) =>
                  actions.updateSettings({ difficultyMode: event.target.value as 'adaptive' | 'manual' })
                }
              >
                <option value="adaptive">Adaptive — follows your recent scores</option>
                <option value="manual">Manual — hold a fixed level</option>
              </select>
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label" htmlFor="manual-level">
                Manual level
              </label>
              <select
                id="manual-level"
                className="select"
                value={state.settings.manualLevel}
                disabled={state.settings.difficultyMode !== 'manual'}
                onChange={(event) =>
                  actions.updateSettings({ manualLevel: Number(event.target.value) as Difficulty })
                }
              >
                {([1, 2, 3, 4, 5] as Difficulty[]).map((level) => (
                  <option key={level} value={level}>
                    {level}/5 · {DIFFICULTY_LABELS[level]}
                  </option>
                ))}
              </select>
            </div>
            <div className="status-line" style={{ marginTop: 12 }}>
              <span>Rank progress</span>
              <strong>
                {state.profile.xp} XP
                {rank.next ? ` / ${RANKS[rank.index + 1].xp}` : ' · max'}
              </strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">AI supervisor</div>
              <div className="panel-sub">Optional written reads and chat. The offline engine works without it.</div>
            </div>
            <span className={`tag ${state.settings.ai.enabled ? 'tag-cyan' : 'tag-dim'}`}>
              {state.settings.ai.enabled ? 'ENABLED' : 'OFFLINE ONLY'}
            </span>
          </div>
          <div className="panel-body">
            <label className="checkline">
              <input
                type="checkbox"
                checked={state.settings.ai.enabled}
                onChange={(event) => actions.updateAi({ enabled: event.target.checked })}
              />
              Use an external AI provider for supervisor chat and review reads
            </label>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <div className="field">
                <label className="label" htmlFor="ai-base">
                  Base URL
                </label>
                <input
                  id="ai-base"
                  className="input mono"
                  value={state.settings.ai.baseUrl}
                  placeholder="https://api.openai.com/v1"
                  onChange={(event) => actions.updateAi({ baseUrl: event.target.value })}
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="ai-model">
                  Model
                </label>
                <input
                  id="ai-model"
                  className="input mono"
                  value={state.settings.ai.model}
                  placeholder="gpt-4o-mini"
                  onChange={(event) => actions.updateAi({ model: event.target.value })}
                />
              </div>
              <div className="field full">
                <label className="label" htmlFor="ai-key">
                  <KeyRound size={11} /> API key
                </label>
                <div className="row" style={{ gap: 6 }}>
                  <input
                    id="ai-key"
                    className="input mono"
                    type={showKey ? 'text' : 'password'}
                    value={state.settings.ai.apiKey}
                    placeholder="sk-…"
                    autoComplete="off"
                    onChange={(event) => actions.updateAi({ apiKey: event.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                    onClick={() => setShowKey((value) => !value)}
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-cyan"
                disabled={aiBusy || !state.settings.ai.enabled || !state.settings.ai.apiKey.trim()}
                onClick={() => void actions.testAi()}
              >
                {aiBusy ? <Loader2 size={13} className="spin" /> : <PlugZap size={13} />}
                {aiBusy ? 'Testing' : 'Test connection'}
              </button>
              <span className="hint">
                The key is stored locally and excluded from exports. Requests go straight to the base URL you set.
              </span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Collection & capture</div>
              <div className="panel-sub">Live leads and fetching pages into the library</div>
            </div>
            <Server size={14} className="dim" />
          </div>
          <div className="panel-body">
            <label className="checkline">
              <input
                type="checkbox"
                checked={state.settings.liveIntel}
                onChange={(event) => actions.updateSettings({ liveIntel: event.target.checked })}
              />
              Scan current public feeds for live tasking leads
            </label>
            <p className="hint" style={{ margin: '4px 0 12px 24px' }}>
              When off, taskings use standing collection points. Existing leads stay cached on this device.
            </p>
            <label className="checkline">
              <input
                type="checkbox"
                checked={state.settings.webCapture}
                onChange={(event) => actions.updateSettings({ webCapture: event.target.checked })}
              />
              Allow fetching article pages into the offline library
            </label>
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label" htmlFor="capture-proxy">
                Capture proxy (optional)
              </label>
              <input
                id="capture-proxy"
                className="input mono"
                value={state.settings.captureProxy}
                placeholder="https://your-proxy.example.com/?url={url}"
                onChange={(event) => actions.updateSettings({ captureProxy: event.target.value })}
              />
              <p className="hint">
                Most publishers block cross-origin browser requests. Use a proxy that accepts{' '}
                <span className="inline-code">{'{url}'}</span> or appends the URL to the path. Pasting text always
                works without one.
              </p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Workspace data</div>
              <div className="panel-sub">Portable JSON, local storage, hard reset</div>
            </div>
            <HardDrive size={14} className="dim" />
          </div>
          <div className="panel-body">
            <div className="status-line">
              <span>Storage</span>
              <strong>{state.storageMode === 'idb' ? 'INDEXEDDB' : 'LOCALSTORAGE'}</strong>
            </div>
            <div className="status-line">
              <span>Taskings</span>
              <strong>{state.missions.length}</strong>
            </div>
            <div className="status-line">
              <span>Saved articles</span>
              <strong>{state.articles.length}</strong>
            </div>
            <div className="status-line">
              <span>Filed reviews</span>
              <strong>{state.profile.completed}</strong>
            </div>
            <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button type="button" className="btn" onClick={exportWorkspace}>
                <Download size={13} /> Export JSON
              </button>
              <button type="button" className="btn" onClick={pickImport}>
                <Upload size={13} /> Import JSON
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                style={{ display: 'none' }}
                onChange={(event) => void readImport(event.target.files?.[0])}
              />
            </div>
            <div className="divider" />
            <button
              type="button"
              className="btn btn-danger btn-wide"
              onClick={() => {
                setResetText('');
                setResetOpen(true);
              }}
            >
              <Trash2 size={13} /> Reset the station
            </button>
            <p className="hint" style={{ marginTop: 8 }}>
              Reset deletes taskings, reports, saved articles, reference notes and progress on this device. The API key
              is cleared too.
            </p>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">My reference notes</div>
            <div className="panel-sub">
              {notes.length
                ? `${notes.length} note(s) saved in the desk reference`
                : 'No desk notes yet. Open any reference entry and keep a working definition.'}
            </div>
          </div>
          <Link to="/reference" className="btn btn-sm">
            <BookMarked size={12} /> Open desk
          </Link>
        </div>
        <div className="panel-body tight">
          {notes.length === 0 ? (
            <p className="hint">
              Reference notes are personal working definitions. They are stored on this device and never treated as
              evidence.
            </p>
          ) : (
            notes.map((saved) => (
              <div className="ref-note-row" key={saved.term}>
                <Link to={`/reference/${encodeURIComponent(saved.term)}`} className="ref-note-title">
                  {saved.term}
                </Link>
                <span className="ref-note-body">{saved.body}</span>
                <span className="mono tiny dim">{fmtDate(saved.updatedAt)}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label={`Delete note for ${saved.term}`}
                  onClick={() => {
                    deleteReferenceNote(saved.term);
                    setNotes(readReferenceNotes());
                    actions.toast('Reference note deleted.', 'info');
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">Offline & install</div>
            <div className="panel-sub">This station is a local-first web app</div>
          </div>
          <Check size={14} className="green" />
        </div>
        <div className="panel-body">
          <p className="text-sm muted">
            The app shell and built-in reference are cached for offline use once loaded. Installed as a browser app, it
            opens without a connection and keeps unfinished taskings, saved articles, highlights and drafts on this
            device. Live lead scans and online reference lookups need a connection and degrade gracefully without one.
          </p>
          <p className="hint" style={{ marginTop: 8 }}>
            To install: use your browser’s menu and choose “Install app” or “Add to home screen”. On desktop Chrome and
            Edge the install control appears in the address bar when the app is served over HTTPS or localhost.
          </p>
          <div className="callout" style={{ marginTop: 12 }}>
            <strong>Training use only.</strong> Roles, deadlines and injects are simulated. Public sources are real; no
            real intelligence product is created here.
          </div>
        </div>
      </div>

      <ConfirmModal
        open={resetOpen}
        title="Reset the station"
        confirmLabel="Erase everything"
        tone="danger"
        busy={resetting}
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          if (resetText !== 'RESET') {
            actions.toast('Type RESET to confirm the wipe.', 'warn');
            return;
          }
          setResetting(true);
          void actions.resetAll().then(() => {
            setNotes(readReferenceNotes());
            setResetting(false);
            setResetOpen(false);
          });
        }}
      >
        <p>
          This erases the mission board, reports, saved articles, highlights, desk notes, progress and history on this
          device. It cannot be undone.
        </p>
        <p style={{ marginTop: 8 }}>Type <span className="inline-code">RESET</span> to confirm.</p>
        <input
          className="input mono"
          style={{ marginTop: 10 }}
          value={resetText}
          placeholder="RESET"
          aria-label="Type RESET to confirm"
          onChange={(event) => setResetText(event.target.value)}
        />
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(pendingImport)}
        title="Replace this workspace?"
        confirmLabel="Import and replace"
        tone="danger"
        busy={importing}
        onCancel={() => setPendingImport(null)}
        onConfirm={() => void confirmImport()}
      >
        <p>
          Importing <strong>{pendingImport?.name}</strong> replaces the current taskings, articles, profile and settings.
          Your existing API key is kept.
        </p>
        <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 12.5 }}>
          Export the current workspace first if you want a copy.
        </p>
      </ConfirmModal>
    </div>
  );
}
