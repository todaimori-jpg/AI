import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookMarked, Crosshair, Flame, Radar, Sparkles, TrendingUp } from 'lucide-react';
import type { Area, DimensionId } from '../types';
import { AREAS, DIMENSIONS, rankForXp } from '../lib/constants';
import { fmtDate, fmtRelative } from '../lib/time';
import { readCachedScan } from '../lib/live';
import { useAppState, useNow } from '../store/StoreProvider';
import { Meter } from '../components/ui';
import { SituationMap } from '../components/SituationMap';

const WEAK_REFERENCE: Record<DimensionId, string> = {
  sourcing: 'Admiralty grading',
  evidence: 'Corroboration',
  uncertainty: 'Probability yardstick',
  alternatives: 'Analysis of competing hypotheses',
  gaps: 'Intelligence gap',
  objectivity: 'Mirror-imaging',
  structure: 'BLUF',
};

export function ProgressView() {
  const state = useAppState();
  const now = useNow(60000);
  const rank = rankForXp(state.profile.xp);
  const leads = useMemo(() => readCachedScan()?.anchors ?? [], [state.scan?.at]);

  const history = state.profile.history;
  const avg = history.length
    ? Math.round(history.reduce((sum, entry) => sum + entry.score, 0) / history.length)
    : null;
  const best = history.length ? Math.max(...history.map((entry) => entry.score)) : null;

  const byArea = useMemo(() => {
    const map = new Map<Area, { count: number; total: number; best: number }>();
    for (const entry of history) {
      const current = map.get(entry.area) ?? { count: 0, total: 0, best: 0 };
      current.count += 1;
      current.total += entry.score;
      current.best = Math.max(current.best, entry.score);
      map.set(entry.area, current);
    }
    return (Object.keys(AREAS) as Area[])
      .filter((area) => map.has(area))
      .map((area) => {
        const data = map.get(area)!;
        return { area, count: data.count, avg: Math.round(data.total / data.count), best: data.best };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [history]);

  const weakest = [...DIMENSIONS].sort(
    (a, b) => state.profile.skill[a.id] - state.profile.skill[b.id],
  )[0];

  const mappedMissions = state.missions.filter(
    (mission) => mission.status !== 'offered' && mission.status !== 'archived',
  );

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <div className="eyebrow">Analyst record · training history</div>
          <h1 className="page-title">Progress</h1>
          <p className="page-sub">
            Your filed record, skill profile and the collection picture across every tasking. Scores measure analytic
            tradecraft against public standards, not how impressive the prose sounds.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/missions" className="btn">
            <Crosshair size={14} /> Mission board
          </Link>
          <Link to="/reference" className="btn btn-cyan">
            <BookMarked size={14} /> Reference desk
          </Link>
        </div>
      </div>

      <div className="rank-banner" style={{ marginBottom: 16 }}>
        <div className="rank-insignia">
          <Award />
        </div>
        <div style={{ flex: '1 1 280px' }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>
            {state.settings.callsign || 'ANALYST'} · CURRENT RANK
          </div>
          <div className="rank-title">{rank.title}</div>
          <div className="rank-sub">
            {rank.next
              ? `${Math.round(rank.progress * 100)}% toward ${rank.next} · ${state.profile.xp} XP`
              : `${state.profile.xp} XP · top of the ladder`}
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${Math.round(rank.progress * 100)}%` }} />
          </div>
        </div>
        <div className="row" style={{ gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div className="metric-label">Streak</div>
            <div className="rank-title" style={{ fontSize: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={16} className="amber" /> {state.profile.streak}d
            </div>
          </div>
          <div>
            <div className="metric-label">Filed</div>
            <div className="rank-title" style={{ fontSize: 20 }}>
              {state.profile.completed}
            </div>
          </div>
          <div>
            <div className="metric-label">Average</div>
            <div className="rank-title" style={{ fontSize: 20 }}>
              {avg ?? '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="metrics" style={{ marginBottom: 16 }}>
        <div className="metric">
          <div className="metric-label">Submitted</div>
          <div className="metric-value">{state.profile.submitted}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Accepted reviews</div>
          <div className="metric-value">{state.profile.completed}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Best score</div>
          <div className="metric-value">{best ?? '—'}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Target difficulty</div>
          <div className="metric-value">{state.profile.targetDifficulty}/5</div>
        </div>
        <div className="metric">
          <div className="metric-label">Library sources</div>
          <div className="metric-value">{state.articles.length}</div>
        </div>
      </div>

      <div className="grid grid-sidebar" style={{ marginBottom: 16 }}>
        <div className="stack" style={{ gap: 16 }}>
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Situation map</div>
                <div className="panel-sub">Every accepted tasking and cached live lead, plotted</div>
              </div>
              <div className="panel-head-actions">
                <Radar size={14} className="dim" />
              </div>
            </div>
            <div className="panel-body flush">
              <SituationMap missions={mappedMissions} leads={leads} height={430} />
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Filed history</div>
                <div className="panel-sub">
                  {history.length ? `${history.length} accepted review(s)` : 'No filed reviews yet'}
                </div>
              </div>
            </div>
            <div className="panel-body">
              {history.length === 0 ? (
                <p className="hint">
                  Accept a review on the review board to file it. Filed reviews build your skill profile, streak and
                  rank.
                </p>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Tasking</th>
                      <th>Area</th>
                      <th>Diff.</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 20).map((entry) => (
                      <tr key={entry.id}>
                        <td>{fmtDate(entry.date)}</td>
                        <td>
                          <Link to={`/mission/${entry.missionId}`} className="mission-link">
                            {entry.missionTitle}
                          </Link>
                        </td>
                        <td>{AREAS[entry.area].short}</td>
                        <td>{entry.difficulty}/5</td>
                        <td className="score-cell">{entry.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <aside className="feed-side">
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Skill profile</div>
                <div className="panel-sub">Rolling average from accepted reviews</div>
              </div>
              <TrendingUp size={14} className="dim" />
            </div>
            <div className="panel-body">
              <div className="skill-grid">
                {DIMENSIONS.map((dimension) => (
                  <Meter
                    key={dimension.id}
                    label={dimension.label}
                    value={state.profile.skill[dimension.id]}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Next training focus</div>
                <div className="panel-sub">Lowest current dimension</div>
              </div>
            </div>
            <div className="panel-body tight">
              <div className="stat-line">
                <span>Dimension</span>
                <strong>{weakest.label}</strong>
              </div>
              <div className="stat-line">
                <span>Score</span>
                <strong>{state.profile.skill[weakest.id]}</strong>
              </div>
              <p className="hint" style={{ marginTop: 8 }}>
                {weakest.blurb}
              </p>
              <Link to={`/reference/${encodeURIComponent(WEAK_REFERENCE[weakest.id])}`} className="btn btn-sm" style={{ marginTop: 10 }}>
                <BookMarked size={12} /> Open desk entry
              </Link>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Area performance</div>
                <div className="panel-sub">Average accepted score by mission area</div>
              </div>
            </div>
            <div className="panel-body tight">
              {byArea.length === 0 ? (
                <p className="hint">No filed work yet. Scores appear here once you accept a review.</p>
              ) : (
                byArea.map((entry) => (
                  <div className="stat-line" key={entry.area}>
                    <span>{AREAS[entry.area].label}</span>
                    <strong>
                      {entry.avg} · {entry.count} filed
                    </strong>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Collection status</div>
                <div className="panel-sub">Cached live leads on this device</div>
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
                <span>Feeds used</span>
                <strong>{state.scan?.used.length ? state.scan.used.join(', ') : 'standing points'}</strong>
              </div>
              <div className="callout cyan" style={{ marginTop: 10 }}>
                <Sparkles size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                Keep unfinished work. An accepted mission stays on the board until you file it, even offline.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
