import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createAppStore, type AppState, type AppStore } from './appStore';
import type { Mission } from '../types';

const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = createAppStore();
  const store = storeRef.current;

  useEffect(() => {
    void store.actions.init();
    const flush = () => store.flush();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [store]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): AppStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}

export function useAppState(): AppState {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

export function useActions() {
  return useStore().actions;
}

export function useMission(id: string | undefined): Mission | undefined {
  const state = useAppState();
  if (!id) return undefined;
  return state.missions.find((mission) => mission.id === id);
}

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

export function useBusy(key: string): boolean {
  const state = useAppState();
  return Boolean(state.busy[key]);
}
