import { useMemo, useState } from 'react';
import { Compass, Crosshair, Search, X } from 'lucide-react';
import type { Area, Mission, MissionStatus } from '../types';
import { AREAS } from '../lib/constants';
import { useActions, useAppState } from '../store/StoreProvider';
import { EmptyState } from '../components/ui';
import { MissionCard } from '../components/MissionCard';

type StatusFilter = 'all' | 'open' | 'active' | 'filed';

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All taskings' },
  { id: 'open', label: 'Open offers' },
  { id: 'active', label: 'In progress' },
  { id: 'filed', label: 'Filed' },
];

const matchesStatus = (status: MissionStatus, filter: StatusFilter): boolean => {
  if (filter === 'all') return true;
  if (filter === 'open') return status === 'offered';
  if (filter === 'active') return status === 'accepted' || status === 'submitted';
  return status === 'reviewed' || status === 'archived';
};

export function MissionsView() {
  const state = useAppState();
  const actions = useActions();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [area, setArea] = useState<'all' | Area>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const base: Record<StatusFilter, number> = { all: state.missions.length, open: 0, active: 0, filed: 0 };
    for (const mission of state.missions) {
      if (mission.status === 'offered') base.open += 1;
      else if (mission.status === 'accepted' || mission.status === 'submitted') base.active += 1;
      else if (mission.status === 'reviewed' || mission.status === 'archived') base.filed += 1;
    }
    return base;
  }, [state.missions]);

  const missions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.missions
      .filter((mission) => matchesStatus(mission.status, statusFilter))
      .filter((mission) => area === 'all' || mission.area === area)
      .filter((mission) => {
        if (!needle) return true;
        return `${mission.code} ${mission.codename} ${mission.title} ${mission.tagline}`
          .toLowerCase()
          .includes(needle);
      })
      .sort(sortMissions);
  }, [state.missions, statusFilter, area, query]);

  const areasPresent = useMemo(() => {
    const present = new Set<Area>(state.missions.map((mission) => mission.area));
    return (Object.keys(AREAS) as Area[]).filter((key) => present.has(key));
  }, [state.missions]);

  const canGenerate = counts.open < 6 && !state.scanning;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <div className="eyebrow">Mission board · tasking register</div>
          <h1 className="page-title">Missions</h1>
          <p className="page-sub">
            Every tasking issued to this station, including unfinished work and filed reports. Nothing is lost when you
            close the app; an accepted mission stays on the board until you file it.
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
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-body tight">
          <div className="missions-toolbar">
            <div className="ref-search" style={{ flex: '1 1 240px' }}>
              <Search size={14} />
              <input
                className="input"
                value={query}
                placeholder="Search code, codename or title…"
                aria-label="Search missions"
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
            <div className="filters" style={{ margin: 0 }}>
              {STATUS_FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`filter-chip${statusFilter === item.id ? ' active' : ''}`}
                  onClick={() => setStatusFilter(item.id)}
                >
                  {item.label}
                  <span className="mono dim" style={{ marginLeft: 5 }}>
                    {counts[item.id]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {areasPresent.length > 0 ? (
            <div className="filters" style={{ marginTop: 8 }}>
              <button
                type="button"
                className={`filter-chip${area === 'all' ? ' active' : ''}`}
                onClick={() => setArea('all')}
              >
                All areas
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

      <div className="feed-list">
        {missions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>

      {missions.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<Crosshair />}
            title={state.missions.length === 0 ? 'No taskings yet' : 'No taskings match'}
            sub={
              state.missions.length === 0
                ? 'Run a scan to build the first tasking from current public sources.'
                : 'Clear the search or switch the status and area filters.'
            }
            action={
              state.missions.length === 0 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void actions.generateMission({ announce: true })}
                >
                  <Compass size={14} /> Find a mission
                </button>
              ) : (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setQuery('');
                    setStatusFilter('all');
                    setArea('all');
                  }}
                >
                  Clear filters
                </button>
              )
            }
          />
        </div>
      ) : null}
    </div>
  );
}

const STATUS_ORDER: Record<MissionStatus, number> = {
  accepted: 0,
  submitted: 1,
  offered: 2,
  reviewed: 3,
  archived: 4,
};

function sortMissions(a: Mission, b: Mission): number {
  const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  if (byStatus !== 0) return byStatus;
  if (a.status === 'accepted' || a.status === 'submitted') return a.dueAt - b.dueAt;
  return b.createdAt - a.createdAt;
}
