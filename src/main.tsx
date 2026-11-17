import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles/global.css';
import { StoreProvider } from './store/StoreProvider';
import { AppShell } from './components/AppShell';
import { FeedView } from './views/FeedView';
import { MissionsView } from './views/MissionsView';
import { MissionView } from './views/MissionView';
import { LibraryView } from './views/LibraryView';
import { ProgressView } from './views/ProgressView';
import { ReferenceView } from './views/ReferenceView';
import { SettingsView } from './views/SettingsView';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element is missing.');

createRoot(rootElement).render(
  <StrictMode>
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<FeedView />} />
            <Route path="/missions" element={<MissionsView />} />
            <Route path="/mission/:id" element={<MissionView />} />
            <Route path="/library" element={<LibraryView />} />
            <Route path="/library/:id" element={<LibraryView />} />
            <Route path="/progress" element={<ProgressView />} />
            <Route path="/reference" element={<ReferenceView />} />
            <Route path="/reference/:term" element={<ReferenceView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Offline caching is best-effort; the app still works without it.
    });
  });
}
