import { useEffect, type ReactNode } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldAlert,
  X,
  XCircle,
} from 'lucide-react';
import type { Area, Difficulty, Mission, Priority } from '../types';
import { AREAS, DIFFICULTY_LABELS, PRIORITIES, GRADE_TONES } from '../lib/constants';
import { countdown } from '../lib/time';
import { statusLabel } from '../lib/status';
import { useAppState, useNow } from '../store/StoreProvider';

export function Mark({ className = 'brand-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeOpacity="0.28" />
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeOpacity="0.55" />
      <circle cx="24" cy="24" r="2.4" fill="currentColor" />
      <path d="M24 3v9M24 36v9M3 24h9M36 24h9" stroke="currentColor" strokeOpacity="0.75" />
      <path d="M24 24 38.5 12.5" stroke="currentColor" strokeOpacity="0.9" strokeWidth="1.2" />
      <path d="M24 24a14 14 0 0 0 9.6-4" stroke="currentColor" strokeWidth="2.2" />
      <path d="m40 8-1.2 4.6L34.2 11.4Z" fill="currentColor" />
      <circle cx="31.5" cy="17" r="1.3" fill="currentColor" opacity="0.9" />
      <circle cx="16" cy="31" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="33" cy="32" r="0.9" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function ClassificationBar() {
  return (
    <div className="classification-bar">
      <span>UNCLASSIFIED</span>
      <span>//</span>
      <strong>OPEN SOURCE // TRAINING EXERCISE</strong>
      <span>//</span>
      <span>NO REAL INTELLIGENCE</span>
    </div>
  );
}

export function ScanBars() {
  return (
    <span className="scan-bars" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export function AreaTag({ area }: { area: Area }) {
  return <span className="tag tag-cyan">{AREAS[area].label}</span>;
}

export function PriorityTag({ priority }: { priority: Priority }) {
  const tone = priority === 'IMMEDIATE' ? 'tag-red' : priority === 'PRIORITY' ? 'tag-amber' : 'tag-dim';
  return <span className={`tag ${tone}`}>{PRIORITIES[priority].label}</span>;
}

export function DifficultyMeter({ difficulty, showLabel = false }: { difficulty: Difficulty; showLabel?: boolean }) {
  return (
    <span className="row" style={{ gap: 6 }} title={`Difficulty ${difficulty} of 5`}>
      <span className="row" style={{ gap: 2, alignItems: 'flex-end', height: 12 }} aria-hidden="true">
        {[1, 2, 3, 4, 5].map((level) => (
          <span
            key={level}
            style={{
              width: 3,
              height: 4 + level * 1.6,
              background: level <= difficulty ? 'var(--amber)' : 'var(--line-bright)',
            }}
          />
        ))}
      </span>
      {showLabel ? (
        <span className="tiny mono dim">
          {difficulty}/5 · {DIFFICULTY_LABELS[difficulty]}
        </span>
      ) : null}
    </span>
  );
}

export function StatusTag({ mission }: { mission: Mission }) {
  const label = statusLabel(mission);
  const tone =
    mission.status === 'offered'
      ? 'tag-cyan'
      : mission.status === 'submitted'
        ? 'tag-amber'
        : mission.status === 'reviewed'
          ? 'tag-green'
          : mission.status === 'archived'
            ? 'tag-dim'
            : 'tag-amber';
  return <span className={`tag ${tone}`}>{label}</span>;
}

export function GradeTag({ score, grade }: { score: number; grade: string }) {
  const tone = GRADE_TONES[grade] ?? 'tag-dim';
  return (
    <span className={`tag ${tone}`}>
      {grade} · {score}
    </span>
  );
}

export function CountdownChip({ mission }: { mission: Mission }) {
  const now = useNow();
  if (mission.status === 'submitted') {
    return (
      <div className="countdown">
        <span className="countdown-label">Status</span>
        <span className="countdown-value" style={{ fontSize: 15 }}>
          UNDER REVIEW
        </span>
      </div>
    );
  }
  if (mission.status === 'reviewed' || mission.status === 'archived') {
    return (
      <div className="countdown">
        <span className="countdown-label">Status</span>
        <span className="countdown-value" style={{ fontSize: 15 }}>
          {statusLabel(mission)}
        </span>
      </div>
    );
  }
  const state = countdown(mission.dueAt - now);
  return (
    <div className={`countdown${state.overdue ? ' overdue' : state.urgent ? ' urgent' : ''}`}>
      <span className="countdown-label">{state.overdue ? 'Overdue by' : 'Time remaining'}</span>
      <span className="countdown-value">{state.text}</span>
    </div>
  );
}

export function ProgressBar({ percent, tone = '' }: { percent: number; tone?: 'cyan' | 'green' | '' }) {
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className={`progress-fill ${tone}`} style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
    </div>
  );
}

export function Meter({ label, value, tone }: { label: string; value: number; tone?: 'good' | 'mid' | 'bad' }) {
  const resolved = tone ?? (value >= 80 ? 'good' : value >= 60 ? 'mid' : 'bad');
  return (
    <div className="skill-row">
      <div className="skill-label">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="dim-track">
        <div className={`dim-fill ${resolved}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  sub,
  action,
}: {
  icon?: ReactNode;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      {icon ? <div className="empty-icon">{icon}</div> : null}
      <div className="empty-title">{title}</div>
      {sub ? <div className="empty-sub">{sub}</div> : null}
      {action ? <div style={{ marginTop: 14 }}>{action}</div> : null}
    </div>
  );
}

export function Toasts() {
  const state = useAppState();
  if (state.toasts.length === 0) return null;
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {state.toasts.map((toast) => {
        const Icon =
          toast.tone === 'good'
            ? CheckCircle2
            : toast.tone === 'warn'
              ? AlertTriangle
              : toast.tone === 'bad'
                ? XCircle
                : Info;
        return (
          <div key={toast.id} className={`toast ${toast.tone}`}>
            <Icon className="toast-icon" size={15} />
            <div>{toast.text}</div>
          </div>
        );
      })}
    </div>
  );
}

export function ConfirmModal({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  tone = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  tone?: 'primary' | 'danger';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <ShieldAlert size={15} className="amber" />
          <div className="modal-title">{title}</div>
          <button type="button" className="btn btn-ghost btn-icon" style={{ marginLeft: 'auto' }} onClick={onCancel} aria-label="Close">
            <X size={15} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LinkRow({ url, label }: { url: string; label?: string }) {
  return (
    <a className="vector-link" href={url} target="_blank" rel="noreferrer noopener">
      <ChevronRight size={11} />
      {label ?? url}
    </a>
  );
}
