import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileText,
  MessageSquare,
  Radio,
  RefreshCw,
  Target,
} from 'lucide-react';
import { AREAS } from '../lib/constants';
import { fmtDate, fmtDateTime, fmtRelative } from '../lib/time';
import { latestReview, reportProgress } from '../lib/status';
import { downloadKilnDeck } from '../lib/kiln';
import { useActions, useAppState, useBusy, useMission, useNow } from '../store/StoreProvider';
import { AreaTag, CountdownChip, DifficultyMeter, EmptyState, LinkRow, PriorityTag, StatusTag } from '../components/ui';
import { SituationMap } from '../components/SituationMap';
import { ReportEditor } from './ReportEditor';
import { SupervisorChat } from './SupervisorChat';
import { ReviewBoard } from './ReviewBoard';

type Tab = 'brief' | 'report' | 'chat' | 'updates' | 'review';

export function MissionView() {
  const { id } = useParams<{ id: string }>();
  const mission = useMission(id);
  const actions = useActions();
  const state = useAppState();
  const now = useNow(30000);
  const [tab, setTab] = useState<Tab>('brief');
  const updateBusy = useBusy(`update:${mission?.id ?? ''}`);

  if (!mission) {
    return (
      <div className="page">
        <div className="panel">
          <EmptyState
            icon={<Target />}
            title="Tasking not found"
            sub="It may have been declined or removed. The board keeps active and filed missions."
            action={
              <Link to="/missions" className="btn btn-primary">
                Mission board
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const review = latestReview(mission);
  const progress = reportProgress(mission);
  const unacknowledged = mission.updates.filter((update) => !update.acknowledged).length;
  const isOpen = mission.status === 'offered';
  const canReview = mission.status === 'submitted' || mission.status === 'reviewed';

  const tabs: { id: Tab; label: string; badge?: number | string; show: boolean }[] = [
    { id: 'brief', label: 'Brief', show: true },
    { id: 'report', label: 'Report', badge: `${progress.percent}%`, show: true },
    { id: 'chat', label: 'Supervisor', badge: mission.messages.length || undefined, show: !isOpen },
    { id: 'updates', label: 'Updates', badge: unacknowledged || undefined, show: !isOpen },
    { id: 'review', label: 'Review', badge: review ? review.score : undefined, show: !isOpen && Boolean(review) },
  ];

  return (
    <div className="page">
      <div className="mission-head">
        <div className="mission-head-main">
          <Link to="/missions" className="vector-link" style={{ marginBottom: 8 }}>
            <ArrowLeft size={11} /> Mission board
          </Link>
          <div className="row" style={{ gap: 7, flexWrap: 'wrap', marginBottom: 6 }}>
            <span className="mission-code">{mission.code}</span>
            <PriorityTag priority={mission.priority} />
            <AreaTag area={mission.area} />
            <DifficultyMeter difficulty={mission.difficulty} showLabel />
            <StatusTag mission={mission} />
          </div>
          <h1>
            {mission.title} <span className="mission-codename">/ {mission.codename}</span>
          </h1>
          <div className="mission-head-sub">{mission.tagline}</div>
          <div className="head-meta">
            <span>ISSUED {fmtDate(mission.createdAt)}</span>
            <span>·</span>
            <span>
              {mission.attempts > 0 ? `${mission.attempts} ATTEMPT(S)` : 'NO ATTEMPTS'} · REVISION{' '}
              {mission.report.revision}
            </span>
            <span>·</span>
            <span>{fmtRelative(mission.report.updatedAt, now)} DRAFT UPDATE</span>
          </div>
        </div>
        <div className="stack" style={{ alignItems: 'stretch', gap: 8, minWidth: 190 }}>
          <CountdownChip mission={mission} />
          {isOpen ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                actions.acceptMission(mission.id);
                setTab('brief');
              }}
            >
              <Target size={14} /> Accept tasking
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-cyan"
              onClick={() => {
                downloadKilnDeck(mission, state.profile, state.settings.callsign);
                actions.toast('KILN briefing deck exported. Open the .kiln file in KILN.', 'good');
              }}
            >
              <Download size={14} /> KILN deck
            </button>
          )}
          {mission.anchor?.url ? (
            <a className="btn btn-sm" href={mission.anchor.url} target="_blank" rel="noreferrer noopener">
              <ExternalLink size={12} /> Open anchor
            </a>
          ) : null}
        </div>
      </div>

      <div className="tabs">
        {tabs
          .filter((entry) => entry.show)
          .map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`tab${tab === entry.id ? ' active' : ''}`}
              onClick={() => setTab(entry.id)}
            >
              {entry.label}
              {entry.badge !== undefined ? <span className="tab-badge">{entry.badge}</span> : null}
            </button>
          ))}
      </div>

      {tab === 'brief' ? (
        <div className="grid grid-sidebar">
          <div className="stack" style={{ gap: 16 }}>
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Situation</div>
                  <div className="panel-sub">Exercise context and the problem you were given</div>
                </div>
                <div className="panel-head-actions">
                  <Radio size={14} className="dim" />
                </div>
              </div>
              <div className="panel-body">
                <div className="situation">{mission.situation}</div>

                {mission.anchor ? (
                  <div className={`anchor-box ${mission.anchor.kind}`} style={{ marginTop: 16 }}>
                    <div className="row-between" style={{ marginBottom: 4 }}>
                      <span className="anchor-source">
                        {mission.anchor.kind === 'live' ? 'LIVE LEAD' : 'COLLECTION POINT'} · {mission.anchor.source}
                      </span>
                      {mission.anchor.publishedAt ? (
                        <span className="mono tiny dim">{fmtDate(mission.anchor.publishedAt)}</span>
                      ) : null}
                    </div>
                    <div className="anchor-text">“{mission.anchor.label}”</div>
                    {mission.anchor.detail ? <div className="anchor-note">{mission.anchor.detail}</div> : null}
                    {mission.anchor.url ? (
                      <div style={{ marginTop: 6 }}>
                        <LinkRow url={mission.anchor.url} label="Open the original lead" />
                      </div>
                    ) : null}
                    {mission.anchor.place ? (
                      <div className="mono tiny dim" style={{ marginTop: 6 }}>
                        LOCATION: {mission.anchor.place}
                        {typeof mission.anchor.lat === 'number' && typeof mission.anchor.lon === 'number'
                          ? ` · ${mission.anchor.lat.toFixed(2)}, ${mission.anchor.lon.toFixed(2)}`
                          : ''}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="brief-section" style={{ marginTop: 18 }}>
                  <div className="section-label">Supervisor's intent</div>
                  <p className="text-sm muted" style={{ lineHeight: 1.65 }}>
                    {mission.intent}
                  </p>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Intelligence questions</div>
                  <div className="panel-sub">Answer every one in the report</div>
                </div>
                <span className="tag tag-dim">{mission.pirs.length} PIR</span>
              </div>
              <div className="panel-body">
                <div className="pir-list">
                  {mission.pirs.map((pir, index) => (
                    <div className="pir-item" key={pir.id}>
                      <span className="pir-index">{index + 1}</span>
                      <div>
                        <div className="pir-question">{pir.question}</div>
                        {pir.focus ? <div className="pir-focus">{pir.focus}</div> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Deliverable</div>
                  <div className="panel-sub">
                    {mission.deliverable.format} · {mission.deliverable.maxWords} words maximum
                  </div>
                </div>
                <FileText size={14} className="dim" />
              </div>
              <div className="panel-body">
                <ul className="requirements">
                  {mission.deliverable.requirements.map((requirement) => (
                    <li key={requirement}>{requirement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="feed-side">
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Tasking data</div>
                  <div className="panel-sub">{AREAS[mission.area].blurb}</div>
                </div>
              </div>
              <div className="panel-body tight">
                <div className="stat-line">
                  <span>Area</span>
                  <strong>{AREAS[mission.area].label}</strong>
                </div>
                <div className="stat-line">
                  <span>Priority</span>
                  <strong>{mission.priority}</strong>
                </div>
                <div className="stat-line">
                  <span>Difficulty</span>
                  <strong>{mission.difficulty}/5</strong>
                </div>
                <div className="stat-line">
                  <span>Due</span>
                  <strong>{fmtDate(mission.dueAt)}</strong>
                </div>
                <div className="stat-line">
                  <span>Report ready</span>
                  <strong>{progress.percent}%</strong>
                </div>
                {review ? (
                  <div className="stat-line">
                    <span>Last score</span>
                    <strong>
                      {review.score} · {review.grade}
                    </strong>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Situation map</div>
                  <div className="panel-sub">Anchor position and tasking geography</div>
                </div>
              </div>
              <div className="panel-body flush">
                <SituationMap missions={[mission]} leads={[]} height={300} />
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Research vectors</div>
                  <div className="panel-sub">Start with the primary record</div>
                </div>
              </div>
              <div className="panel-body">
                <div className="vector-list">
                  {mission.vectors.map((vector) => (
                    <div className="vector" key={vector.id}>
                      <span className="vector-icon">{vector.kind === 'imagery' ? '◈' : '›'}</span>
                      <div className="vector-body">
                        <div className="vector-label">{vector.label}</div>
                        {vector.note ? <div className="vector-note">{vector.note}</div> : null}
                        {vector.url ? <LinkRow url={vector.url} label="Open collection point" /> : null}
                        {vector.query ? (
                          <div className="mono tiny dim" style={{ marginTop: 4 }}>
                            QUERY: {vector.query}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-body tight">
                <div className="callout cyan">
                  <strong>Training context.</strong> The role, deadline and injects are simulated. Only the public
                  sources are real. Never cite a training inject as evidence.
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {tab === 'report' ? <ReportEditor mission={mission} onSubmitted={() => setTab('review')} /> : null}

      {tab === 'chat' ? <SupervisorChat mission={mission} /> : null}

      {tab === 'updates' ? (
        <div className="stack" style={{ gap: 14 }}>
          <div className="row-between">
            <div>
              <div className="panel-title">Developments</div>
              <div className="panel-sub">
                Live public-source leads and clearly labelled training injects
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={updateBusy}
              onClick={() => void actions.requestUpdate(mission.id)}
            >
              <RefreshCw size={13} className={updateBusy ? 'spin' : ''} />
              {updateBusy ? 'Requesting' : 'Request update'}
            </button>
          </div>

          {mission.updates.length === 0 ? (
            <div className="panel">
              <EmptyState
                icon={<Bell />}
                title="No developments yet"
                sub="Request an update to pull a live lead relevant to this area or generate a simulated exercise inject. Live leads stay unverified until you open them."
              />
            </div>
          ) : (
            [...mission.updates].reverse().map((update) => (
              <article className={`update-card${update.kind === 'inject' ? ' inject' : ''}`} key={update.id}>
                <div className="update-head">
                  <span className={`tag ${update.kind === 'live' ? 'tag-cyan' : 'tag-amber'}`}>
                    {update.classification}
                  </span>
                  <span className="mono tiny dim">{fmtDateTime(update.at)}</span>
                  {update.acknowledged ? (
                    <span className="tag tag-green">
                      <CheckCircle2 size={10} /> ACKNOWLEDGED
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => actions.acknowledgeUpdate(mission.id, update.id)}
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
                <div className="update-title">{update.title}</div>
                <div className="update-body" style={{ whiteSpace: 'pre-wrap' }}>
                  {update.body}
                </div>
                {update.url ? (
                  <div style={{ marginTop: 6 }}>
                    <LinkRow url={update.url} label="Open the original reporting" />
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === 'review' ? (
        <ReviewBoard mission={mission} review={review} onRevise={() => setTab('report')} />
      ) : null}

      {isOpen ? (
        <div className="callout" style={{ marginTop: 18 }}>
          <strong>This tasking is not started.</strong> Accept it to open the report, supervisor channel and update
          feed. Unaccepted taskings do not consume a deadline.
        </div>
      ) : null}

      {canReview ? (
        <div className="row" style={{ marginTop: 16, gap: 8 }}>
          <span className="mono tiny dim">
            FILED {mission.submittedAt ? fmtDateTime(mission.submittedAt) : '—'}
          </span>
          <span className="mono tiny dim">·</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTab('review')}>
            <ClipboardCheck size={12} /> Open review
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTab('chat')}>
            <MessageSquare size={12} /> Supervisor
          </button>
        </div>
      ) : null}
    </div>
  );
}
