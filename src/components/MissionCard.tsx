import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarClock, Radio, Star, X } from 'lucide-react';
import type { Mission } from '../types';
import {
  AreaTag,
  ConfirmModal,
  CountdownChip,
  DifficultyMeter,
  PriorityTag,
  ProgressBar,
  StatusTag,
} from './ui';
import { useActions, useAppState, useNow } from '../store/StoreProvider';
import { reportProgress, sourceSummary, statusLabel } from '../lib/status';
import { fmtDate, fmtRelative } from '../lib/time';

export function MissionCard({ mission }: { mission: Mission }) {
  const actions = useActions();
  const state = useAppState();
  const now = useNow(30000);
  const navigate = useNavigate();
  const [declining, setDeclining] = useState(false);
  const progress = reportProgress(mission);
  const sources = sourceSummary(mission);

  const open = () => navigate(`/mission/${mission.id}`);

  return (
    <article className={`mission-card priority-${mission.priority}`}>
      <div className="mission-card-top">
        <span className="mission-code">{mission.code}</span>
        <PriorityTag priority={mission.priority} />
        <AreaTag area={mission.area} />
        <DifficultyMeter difficulty={mission.difficulty} />
        {mission.status !== 'offered' ? <StatusTag mission={mission} /> : null}
        <span className="mission-code" style={{ marginLeft: 'auto' }}>
          {mission.status === 'offered' ? `ISSUED ${fmtRelative(mission.createdAt, now)}` : `DUE ${fmtDate(mission.dueAt)}`}
        </span>
      </div>

      <Link to={`/mission/${mission.id}`} style={{ textDecoration: 'none' }} onClick={(event) => event.stopPropagation()}>
        <div className="mission-title">
          {mission.title} <span className="mission-codename">/ {mission.codename}</span>
        </div>
        <div className="mission-tagline">{mission.tagline}</div>
      </Link>

      <div className="mission-meta">
        <span>
          <Radio size={10} style={{ verticalAlign: '-1px', marginRight: 4 }} />
          {mission.anchor?.kind === 'live' ? 'LIVE LEAD' : 'STANDING POINT'}
        </span>
        <span>
          <strong>{mission.pirs.length}</strong> questions
        </span>
        <span>
          <strong>{sources.count}</strong>/{sources.minimum} sources
        </span>
        <span>
          <strong>{mission.deliverable.maxWords}</strong> word limit
        </span>
        {mission.attempts > 0 ? (
          <span>
            <strong>{mission.attempts}</strong> attempt{mission.attempts === 1 ? '' : 's'}
          </span>
        ) : null}
      </div>

      {mission.status !== 'offered' ? (
        <div style={{ marginTop: 12 }}>
          <div className="row-between tiny mono dim" style={{ marginBottom: 4 }}>
            <span>{statusLabel(mission)}</span>
            <span>{progress.percent}% READY</span>
          </div>
          <ProgressBar percent={progress.percent} tone={mission.status === 'submitted' ? 'cyan' : ''} />
        </div>
      ) : null}

      <div className="mission-actions">
        {mission.status === 'offered' ? (
          <>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                actions.acceptMission(mission.id);
                open();
              }}
              disabled={state.scanning}
            >
              <Star size={13} /> Accept tasking
            </button>
            <button type="button" className="btn" onClick={open}>
              Read brief <ArrowRight size={13} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              title="Decline tasking"
              aria-label="Decline tasking"
              onClick={() => setDeclining(true)}
            >
              <X size={14} />
            </button>
            <span className="mission-link" style={{ color: 'var(--dim)' }}>
              <CalendarClock size={11} /> Due {fmtDate(mission.dueAt)} after acceptance
            </span>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-cyan" onClick={open}>
              {mission.status === 'accepted' ? 'Resume work' : 'Open review'}
              <ArrowRight size={13} />
            </button>
            {mission.status === 'accepted' ? <CountdownChip mission={mission} /> : null}
            <span className="mission-link" onClick={open} role="presentation">
              {mission.code}
            </span>
          </>
        )}
      </div>

      <ConfirmModal
        open={declining}
        title="Decline tasking"
        confirmLabel="Decline"
        tone="danger"
        onCancel={() => setDeclining(false)}
        onConfirm={() => {
          setDeclining(false);
          actions.declineMission(mission.id);
        }}
      >
        <p>
          <strong>{mission.code} / {mission.codename}</strong> will be removed from the board and will not be offered again.
        </p>
        <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 12.5 }}>
          Declining costs nothing. Accepting and abandoning does: the unfinished mission stays on your board.
        </p>
      </ConfirmModal>
    </article>
  );
}
