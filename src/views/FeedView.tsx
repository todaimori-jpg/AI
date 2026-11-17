import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Compass,
  Crosshair,
  DownloadCloud,
  Radar,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import type { Area } from '../types';
import { AREAS } from '../lib/constants';
import { reportProgress, activeMissions } from '../lib/status';
import { fmtDateTime, fmtRelative } from '../lib/time';
import { useActions, useAppState, useNow } from '../store/StoreProvider';
import { EmptyState, ProgressBar, ScanBars } from '../components/ui';
import { MissionCard } from '../components/MissionCard';

type Filter = 'all' | Area;

export function FeedView() {
  const state = useAppState();
  const actions = useActions();
  const now = useNow(30000);
  const [filter, setFilter] = useState<Filter>('all');

  const offers = state.missions.filter((m) => m.status === 'offered');
  const active = activeMissions(state.missions);
  const filtered = useMemo(
    () => (filter === 'all' ? offers : offers.filter((m) => m.area === filter)),
    [offers, filter],
  );
  const areasPresent = useMemo(() => {
    const set = new Set(offers.map((m) => m.area));
    return (Object.keys(AREAS) as Area[]).filter((area) => set.has(area));
  }, [offers]);
  const canGenerate = offers.length < 6 && !state.scanning;
  const avgScore = state.profile.recentScores.length
    ? Math.round(state.profile.recentScores.reduce((a, b) => a + b, 0) / state.profile.recentScores.length)
    : null;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <div className="eyebrow">Watch floor · tasking feed</div>
          <h1 className="page-title">Mission feed</h1>
          <p className="page-sub">
            Fresh open-source taskings built around current public reporting, records, datasets and imagery. Accept one,
            do the research yourself, and report back with evidence.
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canGenerate}
            onClick={() => void actions.generateMission({ announce: true })}
          >
            <Compass size={14} /> Find a mission
          </button>
          <button
            type="button"
            className="btn"
            disabled={!canGenerate}
            onClick={() => void actions.generateMission({ count: 2, forceScan: true, announce: true })}
          >
            <Radar size={14} /> Deep scan
          </button>
        </div>
      </div>

      {state.scanning ? (
        <div className="scan-strip" style={{ marginBottom: 16 }}>
          <ScanBars />
          {state.scanningDetail || 'Scanning'} · public feeds, records and standing collection points
        </div>
      ) : null}

      <div className="feed-layout">
        <div>
          {!state.scanning && offers.length > 0 ? (
            <div className="row-between" style={{ marginBottom: 10 }}>
              <div className="filters" style={{ margin: 0 }}>
                <button
                  type="button"
                  className={`filter-chip${filter === 'all' ? ' active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All areas
                </button>
                {areasPresent.map((area) => (
                  <button
                    key={area}
                    type="button"
                    className={`filter-chip${filter === area ? ' active' : ''}`}
                    onClick={() => setFilter(area)}
                  >
                    {AREAS[area].short}
                  </button>
                ))}
              </div>
              <span className="mono tiny dim">
                {filtered.length} OPEN · {offers.length}/6 SLOTS
              </span>
            </div>
          ) : null}

          <div className="feed-list">
            {filtered.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>

          {!state.scanning && filtered.length === 0 ? (
            <div className="panel">
              <EmptyState
                icon={<Radar />}
                title={offers.length === 0 ? 'No open taskings' : 'No taskings in this area'}
                sub={
                  offers.length === 0
                    ? 'The board is clear. Run a scan against current public sources to generate a new tasking, or resume an unfinished mission from your watch.'
                    : 'Switch the area filter, or generate another tasking from the current public-source scan.'
                }
                action={
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() =>
                      void actions.generateMission({
                        announce: true,
                        area: filter === 'all' ? undefined : filter,
                      })
                    }
                  >
                    <Compass size={14} /> Find a mission
                  </button>
                }
              />
            </div>
          ) : null}

          {state.scanning && offers.length === 0 ? (
            <div className="panel">
              <EmptyState
                icon={<Radar className="spin" />}
                title="Building first taskings"
                sub="Reading current public reporting and matching it to standing exercise archetypes. This takes a few seconds; offline, it uses cached leads and standing collection points."
              />
            </div>
          ) : null}

          {state.profile.completed === 0 && offers.length > 0 ? (
            <div className="panel" style={{ marginTop: 16 }}>
              <div className="panel-head">
                <div>
                  <div className="panel-title">How the exercise works</div>
                  <div className="panel-sub">You are the analyst. The supervisor is the reviewer, not the researcher.</div>
                </div>
              </div>
              <div className="panel-body">
                <div className="grid grid-2">
                  <div className="stack" style={{ gap: 10 }}>
                    <div className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
                      <span className="pir-index">1</span>
                      <p className="text-sm muted">
                        Accept a tasking. It contains a situation, intelligence questions, collection vectors, a
                        deliverable and a deadline.
                      </p>
                    </div>
                    <div className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
                      <span className="pir-index">2</span>
                      <p className="text-sm muted">
                        Go to the original sources. Save what you need in the Library, highlight it, and log it in your
                        source register with a locator and grade.
                      </p>
                    </div>
                  </div>
                  <div className="stack" style={{ gap: 10 }}>
                    <div className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
                      <span className="pir-index">3</span>
                      <p className="text-sm muted">
                        Write the assessment: BLUF, key judgments with confidence, answers, alternatives, gaps,
                        indicators and methods.
                      </p>
                    </div>
                    <div className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
                      <span className="pir-index">4</span>
                      <p className="text-sm muted">
                        Submit. The review applies public analytic standards, flags unsupported claims, and gives
                        specific revision tasks. Revise or accept.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="callout cyan" style={{ marginTop: 14 }}>
                  <strong>Training exercise.</strong> All roles, injects and deadlines are simulated. Only the public
                  sources you find are real. Never cite a training inject as evidence.
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="feed-side">
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Your watch</div>
                <div className="panel-sub">{active.length ? 'Unfinished work is preserved' : 'No open work'}</div>
              </div>
              <div className="panel-head-actions">
                <Activity size={14} className="dim" />
              </div>
            </div>
            <div className="panel-body tight">
              {active.length === 0 ? (
                <p className="text-sm dim" style={{ padding: '6px 2px' }}>
                  Accept a tasking and it will appear here until you file it. Nothing is lost when you close the app.
                </p>
              ) : (
                <div className="stack" style={{ gap: 10 }}>
                  {active.map((mission) => {
                    const progress = reportProgress(mission);
                    return (
                      <Link
                        key={mission.id}
                        to={`/mission/${mission.id}`}
                        className="article-card"
                        style={{ display: 'block' }}
                      >
                        <div className="row-between" style={{ marginBottom: 2 }}>
                          <span className="mission-code">{mission.code}</span>
                          <span className="tag tag-dim">{mission.priority}</span>
                        </div>
                        <div className="article-card-title">{mission.title}</div>
                        <div className="row-between tiny mono dim" style={{ marginTop: 6, marginBottom: 4 }}>
                          <span>{mission.status === 'submitted' ? 'UNDER REVIEW' : 'IN PROGRESS'}</span>
                          <span>{progress.percent}%</span>
                        </div>
                        <ProgressBar percent={progress.percent} tone={mission.status === 'submitted' ? 'cyan' : ''} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Board status</div>
                <div className="panel-sub">Current training cycle</div>
              </div>
            </div>
            <div className="panel-body tight">
              <div className="stat-line">
                <span>Open taskings</span>
                <strong>{offers.length}</strong>
              </div>
              <div className="stat-line">
                <span>Active missions</span>
                <strong>{active.length}</strong>
              </div>
              <div className="stat-line">
                <span>Completed</span>
                <strong>{state.profile.completed}</strong>
              </div>
              <div className="stat-line">
                <span>Average score</span>
                <strong>{avgScore ?? '—'}</strong>
              </div>
              <div className="stat-line">
                <span>Source library</span>
                <strong>{state.articles.length} articles</strong>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Collection status</div>
                <div className="panel-sub">{state.settings.liveIntel ? 'Live public-source scan' : 'Live scan disabled'}</div>
              </div>
              <div className="panel-head-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  title="Refresh public-source scan"
                  aria-label="Refresh public-source scan"
                  disabled={state.scanning || !state.settings.liveIntel}
                  onClick={() => void actions.generateMission({ announce: false, forceScan: true })}
                >
                  <RefreshCw size={13} className={state.scanning ? 'spin' : ''} />
                </button>
              </div>
            </div>
            <div className="panel-body tight">
              <div className="stat-line">
                <span>Last scan</span>
                <strong>{state.scan ? fmtRelative(state.scan.at, now) : 'not yet'}</strong>
              </div>
              <div className="stat-line">
                <span>Leads cached</span>
                <strong>{state.scan?.anchors ?? 0}</strong>
              </div>
              <div className="stat-line">
                <span>Feeds</span>
                <strong>{state.scan?.used.length ? state.scan.used.join(', ') : 'standing points'}</strong>
              </div>
              {state.scan ? (
                <p className="hint" style={{ marginTop: 8 }}>
                  {state.scan.note ?? `Scanned ${fmtDateTime(state.scan.at)}. Leads remain unverified until you open the original.`}
                </p>
              ) : (
                <p className="hint" style={{ marginTop: 8 }}>
                  The first tasking triggers a scan. Offline, the board uses cached leads and standing collection points.
                </p>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-body tight">
              <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                <ShieldCheck size={14} className="amber" />
                <span className="mono tiny" style={{ letterSpacing: '0.12em', color: 'var(--ink-soft)' }}>
                  TRADECRAFT RULE
                </span>
              </div>
              <p className="hint">
                A lead is not a source. A source is not a judgment. Open the primary record, date it, and say what it
                proves before you build on it.
              </p>
            </div>
          </div>

          <div className="panel">
            <div className="panel-body tight">
              <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                <DownloadCloud size={14} className="cyan" />
                <span className="mono tiny" style={{ letterSpacing: '0.12em', color: 'var(--ink-soft)' }}>
                  WORK OFFLINE
                </span>
              </div>
              <p className="hint">
                Save articles to the Library and they stay readable without a connection. Highlights, notes, drafts and
                the mission file are stored on this device.
              </p>
              <Link to="/library" className="btn btn-sm" style={{ marginTop: 10 }}>
                Open library <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {state.profile.completed === 0 && offers.length === 0 && active.length === 0 && !state.scanning ? (
        <div className="panel" style={{ marginTop: 18 }}>
          <EmptyState
            icon={<Crosshair />}
            title="Station is ready"
            sub="Generate a first tasking, or import a previous workspace from Settings."
          />
        </div>
      ) : null}
    </div>
  );
}
