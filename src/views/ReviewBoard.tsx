import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { CheckCircle2, Download, FileText, RotateCcw, Sparkles } from 'lucide-react';
import type { Mission, Review } from '../types';
import { DIMENSIONS, GRADE_TONES, confidenceMeta, dimensionMeta } from '../lib/constants';
import { gradeForScore } from '../lib/constants';
import { latestReview } from '../lib/status';
import { fmtDateTime } from '../lib/time';
import { useActions, useAppState, useBusy } from '../store/StoreProvider';
import { downloadKilnDeck } from '../lib/kiln';

export function ReviewBoard({
  mission,
  review,
  onRevise,
}: {
  mission: Mission;
  review?: Review;
  onRevise: () => void;
}) {
  const actions = useActions();
  const state = useAppState();
  const busy = useBusy(`review:${mission.id}`);
  const latest = review ?? latestReview(mission);

  if (!latest) {
    return (
      <div className="empty">
        <div className="empty-title">No review on file</div>
        <div className="empty-sub">Submit the report to generate the deterministic audit.</div>
      </div>
    );
  }

  const tone = GRADE_TONES[latest.grade] ?? 'tag-dim';
  const grade = gradeForScore(latest.score);
  const aiReady = state.settings.ai.enabled && state.settings.ai.apiKey.trim().length > 0;
  const canAccept = !latest.accepted;
  const canRevise = !latest.accepted;

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="review-hero">
        <div
          className="score-ring"
          style={{ '--score': latest.score, '--ring-color': 'var(--amber)' } as CSSProperties}
        >
          <div className="score-inner">
            <div className="score-number">{latest.score}</div>
            <div className="score-of">OF 100</div>
          </div>
        </div>
        <div className="review-summary">
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <span className={`tag ${tone}`}>
              {latest.grade} · {latest.gradeLabel}
            </span>
            <span className="tag tag-dim">ATTEMPT {latest.attempt}</span>
            <span className={`tag ${latest.onTime ? 'tag-green' : 'tag-rose'}`}>
              {latest.onTime ? 'ON TIME' : `LATE ${Math.round(latest.lateByHours)}H`}
            </span>
            {latest.accepted ? <span className="tag tag-green">FILED</span> : null}
          </div>
          <h2 style={{ marginTop: 8 }}>{grade.label}</h2>
          <p>
            {latest.findings.length} finding(s), {latest.findings.filter((finding) => finding.severity === 'critical').length}{' '}
            critical. Submitted {fmtDateTime(latest.submittedAt)}. {latest.wordCount} words against a{' '}
            {mission.deliverable.maxWords}-word target.
          </p>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {canAccept ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => actions.acceptReview(mission.id)}>
                <CheckCircle2 size={13} /> Accept review & bank XP
              </button>
            ) : null}
            {canRevise ? (
              <button type="button" className="btn btn-sm" onClick={() => { actions.reviseMission(mission.id); onRevise(); }}>
                <RotateCcw size={13} /> Open revision post
              </button>
            ) : null}
            {aiReady ? (
              <button
                type="button"
                className="btn btn-cyan btn-sm"
                disabled={busy || latest.aiStatus === 'pending'}
                onClick={() => void actions.runAiReview(mission.id)}
              >
                <Sparkles size={13} />
                {latest.aiStatus === 'pending' ? 'Supervisor reading…' : latest.aiNarrative ? 'Re-run AI read' : 'Request AI read'}
              </button>
            ) : (
              <Link to="/settings" className="btn btn-ghost btn-sm">
                Configure AI supervisor
              </Link>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => downloadKilnDeck(mission, state.profile, state.settings.callsign)}
            >
              <Download size={13} /> KILN deck
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Dimension scores</div>
              <div className="panel-sub">Weighted analytic standards</div>
            </div>
          </div>
          <div className="panel-body">
            <div className="dimension-list">
              {DIMENSIONS.map((dimension) => {
                const value = latest.dimensions[dimension.id];
                return (
                  <div className="dim-row" key={dimension.id}>
                    <div className="dim-name">
                      {dimension.label}
                      <small>{dimension.weight}% WEIGHT</small>
                    </div>
                    <div className="dim-track">
                      <div
                        className={`dim-fill ${value >= 80 ? 'good' : value >= 60 ? 'mid' : 'bad'}`}
                        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                      />
                    </div>
                    <div className="dim-value">{value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Source audit</div>
              <div className="panel-sub">What could be checked against stored copies</div>
            </div>
          </div>
          <div className="panel-body">
            {latest.sourceAudit.length === 0 ? (
              <p className="hint">No sources were available to audit.</p>
            ) : (
              <div className="source-audit">
                {latest.sourceAudit.map((audit) => (
                  <div className="audit-row" key={`${audit.label}-${audit.title}`}>
                    <span className="source-label">{audit.label}</span>
                    <span className="audit-title" title={audit.note}>
                      {audit.title || 'Untitled'}
                    </span>
                    <span
                      className={`tag ${
                        audit.status === 'excerpt-found'
                          ? 'tag-green'
                          : audit.status === 'excerpt-missing'
                            ? 'tag-rose'
                            : audit.status === 'pattern-only'
                              ? 'tag-amber'
                              : 'tag-dim'
                      }`}
                    >
                      {audit.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="hint" style={{ marginTop: 10 }}>
              A source the review cannot open is marked unverified, not wrong. Saving the article to the Library gives
              the audit an offline copy to compare against.
            </p>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Findings and revision tasks</div>
            <div className="panel-sub">{latest.findings.length} item(s), most severe first</div>
          </div>
          <div className="panel-head-actions">
            <FileText size={14} className="dim" />
          </div>
        </div>
        <div className="panel-body">
          {latest.findings.length === 0 ? (
            <div className="callout cyan">
              <strong>No findings.</strong> That is unusual. Check that the sources are independently verifiable and
              that the judgments survive a hostile reading before you accept.
            </div>
          ) : (
            latest.findings.map((finding) => (
              <div className={`finding ${finding.severity}`} key={finding.id}>
                <div className="finding-head">
                  <span className={`tag tag-${finding.severity === 'critical' ? 'rose' : finding.severity === 'major' ? 'amber' : finding.severity === 'minor' ? 'cyan' : 'dim'}`}>
                    {finding.severity.toUpperCase()}
                  </span>
                  <span className="tag tag-dim">{dimensionMeta(finding.dimension).short}</span>
                  {finding.origin === 'supervisor' ? <span className="tag tag-cyan">AI READ</span> : null}
                </div>
                <div className="finding-msg">{finding.message}</div>
                {finding.evidence ? <div className="finding-evidence">{finding.evidence}</div> : null}
                {finding.task ? <div className="finding-task">{finding.task}</div> : null}
              </div>
            ))
          )}
        </div>
      </div>

      {latest.strengths.length > 0 ? (
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">What held up</div>
              <div className="panel-sub">Keep these habits</div>
            </div>
          </div>
          <div className="panel-body">
            <ul className="strength-list">
              {latest.strengths.map((strength, index) => (
                <li key={`${index}-${strength.slice(0, 20)}`}>{strength}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {latest.aiNarrative ? (
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Supervisor's written read</div>
              <div className="panel-sub">
                {latest.aiStatus === 'done' ? 'AI-assisted commentary; the audit remains authoritative' : 'Pending'}
              </div>
            </div>
            <span className="tag tag-cyan">
              <Sparkles size={10} /> AI READ
            </span>
          </div>
          <div className="panel-body">
            <div className="ai-read">{latest.aiNarrative}</div>
          </div>
        </div>
      ) : null}

      <div className="callout">
        <strong>How to argue with this.</strong> A review finding is a claim about your product, not about your
        ability. Open the cited source, check the cited sentence, and either fix the defect or show the reviewer why
        the evidence supports the original wording. Use the revision post for that; do not rewrite everything.
      </div>

      <p className="hint">
        Confidence terms on this report were evaluated against the same probability yardstick used in the tasking:{' '}
        {confidenceMeta('likely').short} = {confidenceMeta('likely').range}. The review board is an exercise; it is not
        a real intelligence assessment.
      </p>
    </div>
  );
}
