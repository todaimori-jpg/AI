import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  BookMarked,
  BookOpen,
  Crosshair,
  Database,
  Radar,
  Settings2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { ClassificationBar, Mark, Toasts } from './ui';
import { useAppState, useNow } from '../store/StoreProvider';
import { rankForXp } from '../lib/constants';
import { fmtClock } from '../lib/time';
import { activeMissions } from '../lib/status';

function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}

export function AppShell() {
  const state = useAppState();
  const now = useNow();
  const online = useOnline();

  if (!state.ready) {
    return (
      <div className="boot">
        <div className="boot-inner">
          <Mark className="boot-mark" />
          {state.fatal ? (
            <>
              <div style={{ color: 'var(--rose)', marginBottom: 8 }}>Station failed to initialize</div>
              <div style={{ color: 'var(--dim)', letterSpacing: 0, textTransform: 'none', fontFamily: 'var(--body)' }}>
                {state.fatal}
              </div>
            </>
          ) : (
            'Establishing station'
          )}
        </div>
      </div>
    );
  }

  const rank = rankForXp(state.profile.xp);
  const offers = state.missions.filter((m) => m.status === 'offered').length;
  const active = activeMissions(state.missions).length;

  return (
    <div className="app">
      <ClassificationBar />
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="STATION home">
          <Mark />
          <div>
            <div className="brand-title">STATION</div>
            <div className="brand-sub">All-Source Intelligence Trainer</div>
          </div>
        </NavLink>
        <div className="top-status">
          <div className="status-item">
            <span className="status-label">Analyst</span>
            <span className="status-value amber">{state.settings.callsign || 'ANALYST'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Rank</span>
            <span className="status-value">{rank.title}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Zulu</span>
            <span className="status-value">{fmtClock(now, true)}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Link</span>
            <span className="status-value">
              {online ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span className={`dot ${online ? 'ok' : 'bad'}`} />
              {online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      <div className="layout">
        <nav className="navrail" aria-label="Primary">
          <div className="nav-label">Watch floor</div>
          <ul className="nav-items">
            <li>
              <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <Radar />
                Feed
                {offers > 0 ? <span className="nav-count">{offers}</span> : null}
              </NavLink>
            </li>
            <li>
              <NavLink to="/missions" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <Crosshair />
                Missions
                {active > 0 ? <span className="nav-count">{active}</span> : null}
              </NavLink>
            </li>
            <li>
              <NavLink to="/library" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <BookOpen />
                Library
                {state.articles.length > 0 ? <span className="nav-count">{state.articles.length}</span> : null}
              </NavLink>
            </li>
            <li>
              <NavLink to="/reference" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <BookMarked />
                Reference
              </NavLink>
            </li>
            <li>
              <NavLink to="/progress" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <BarChart3 />
                Progress
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <Settings2 />
                Settings
              </NavLink>
            </li>
          </ul>
          <div className="nav-foot">
            <Database size={11} style={{ verticalAlign: '-2px', marginRight: 5 }} />
            {state.storageMode === 'idb' ? 'LOCAL DATABASE' : 'LOCAL STORAGE'}
            <br />
            {state.missions.length} taskings · {state.articles.length} articles
          </div>
        </nav>

        <main className="main">
          {state.warning ? (
            <div className="callout rose" style={{ marginBottom: 16 }}>
              <strong>Storage notice.</strong> {state.warning}
            </div>
          ) : null}
          <Outlet />
        </main>
      </div>
      <footer className="footer">
        STATION <span>/</span> All-Source Intelligence Trainer <span>/</span> Training use only — not a real intelligence product
      </footer>
      <Toasts />
    </div>
  );
}
