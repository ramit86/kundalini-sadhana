import { useState, useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import OverviewScreen from './screens/OverviewScreen';
import ActiveScreen from './screens/ActiveScreen';
import EndScreen from './screens/EndScreen';
import AdminScreen from './screens/AdminScreen';
import KnowledgeScreen from './knowledge/screens/KnowledgeScreen';
import { SESSIONS, Session } from './data/sessions';
import {
  clearProgress,
  createSessionLifecycle,
  invalidateActiveSessionLifecycle,
  loadProgress,
  setActiveSessionLifecycle,
  SessionLifecycle,
} from './store/sessionStore';
import { unlockAudio } from './audio/audioManager';
import { getSettings, SETTINGS_CHANGED_EVENT, ThemeMode } from './store/settingsStore';
import {
  recordCompletion,
  cancelSession,
  restartSession,
  getTodayStatus,
  getStreaks,
  TodayStatusMap,
} from './lib/tracker';
import { recordSessionHistory } from './store/sessionHistoryStore';

function unlockAudioSafe() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) new AudioCtx();
  } catch (_) {}
}

type Screen = 'home' | 'overview' | 'knowledge' | 'active' | 'end' | 'admin';
type ResolvedTheme = 'dark' | 'light';

function resolveTheme(themeMode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  if (themeMode === 'auto') return prefersDark ? 'dark' : 'light';
  return themeMode;
}

function applyTheme(mode: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;
  root.classList.remove('theme-dark', 'theme-light');
  body.classList.remove('theme-dark', 'theme-light');
  root.classList.add(mode === 'dark' ? 'theme-dark' : 'theme-light');
  body.classList.add(mode === 'dark' ? 'theme-dark' : 'theme-light');
  document.documentElement.setAttribute('data-theme', mode);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLifecycle, setSessionLifecycle] = useState<SessionLifecycle | null>(null);
  const [initPracticeIndex, setInitPracticeIndex] = useState(0);
  const [initTimeRemaining, setInitTimeRemaining] = useState<number | undefined>(undefined);
  const [endStats, setEndStats] = useState({ practices: 0, minutes: 0 });
  const [todayStatus, setTodayStatus] = useState<TodayStatusMap>({ morning: 'not_started', night: 'not_started' });
  const [streaks, setStreaks] = useState({ morning: 0, night: 0, both: 0 });

  useEffect(() => {
    try { unlockAudioSafe(); } catch (_) {}
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
    const unlock = () => { try { unlockAudioSafe(); } catch (_) {} };
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('click', unlock, { once: true });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const mediaAny = media as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };
    const applyFromSettings = () => {
      try {
        const settings = getSettings();
        const resolved = resolveTheme(settings.themeMode, media.matches);
        applyTheme(resolved);
      } catch {
        applyTheme('dark');
      }
    };

    const onSettingsChanged = () => applyFromSettings();
    const onPrefChange = () => applyFromSettings();
    applyFromSettings();

    window.addEventListener(SETTINGS_CHANGED_EVENT, onSettingsChanged as EventListener);
    if (typeof mediaAny.addEventListener === 'function') mediaAny.addEventListener('change', onPrefChange);
    else mediaAny.addListener?.(onPrefChange);
    return () => {
      window.removeEventListener(SETTINGS_CHANGED_EVENT, onSettingsChanged as EventListener);
      if (typeof mediaAny.removeEventListener === 'function') mediaAny.removeEventListener('change', onPrefChange);
      else mediaAny.removeListener?.(onPrefChange);
    };
  }, []);

  const refreshTodayStatus = () => {
    try {
      setTodayStatus(getTodayStatus());
      setStreaks(getStreaks());
    } catch {
      setTodayStatus({ morning: 'not_started', night: 'not_started' });
      setStreaks({ morning: 0, night: 0, both: 0 });
    }
  };

  useEffect(() => {
    refreshTodayStatus();
  }, []);

  const handleSelectSession = (key: 'morning' | 'night') => {
    setSession(SESSIONS[key]);
    setInitPracticeIndex(0);
    setInitTimeRemaining(undefined);
    setScreen('overview');
  };

  const handleOpenKnowledge = () => {
    setScreen('knowledge');
  };

  const handleResume = () => {
    const saved = loadProgress();
    if (!saved) return;
    const s = SESSIONS[saved.sessionKey as 'morning' | 'night'];
    if (!s) return;
    void unlockAudio({ ambientChakra: s.practices[saved.resumePracticeIndex ?? saved.practiceIndex]?.chakra });
    const lifecycle = saved.sessionId && saved.sessionStartedAt
      ? { sessionId: saved.sessionId, sessionStartedAt: saved.sessionStartedAt }
      : createSessionLifecycle();
    setSessionLifecycle(lifecycle);
    setActiveSessionLifecycle(lifecycle);
    setSession(s);
    setInitPracticeIndex(saved.resumePracticeIndex ?? saved.practiceIndex);
    setInitTimeRemaining(saved.resumeTimeRemaining ?? saved.timeRemaining);
    setScreen('active');
  };

  const handleBegin = () => {
    void unlockAudio({ ambientChakra: session?.practices[0]?.chakra });
    const lifecycle = createSessionLifecycle();
    setSessionLifecycle(lifecycle);
    setActiveSessionLifecycle(lifecycle);
    clearProgress();
    setInitPracticeIndex(0);
    setInitTimeRemaining(undefined);
    setScreen('active');
  };

  const handleEnd = async (practicesCompleted?: number) => {
    if (session) {
      const totalMins = Math.round(session.practices.reduce((s, p) => s + p.duration, 0) / 60);
      const practiced = practicesCompleted ?? session.practices.length;
      setEndStats({ practices: practiced, minutes: totalMins });
      recordCompletion(session.key);
      recordSessionHistory({
        sessionKey: session.key,
        outcome: 'completed',
        completedAt: new Date().toISOString(),
        durationMinutes: totalMins,
        practiceCount: practiced,
        sessionLabel: session.label,
      });
      refreshTodayStatus();
    }
    invalidateActiveSessionLifecycle();
    setSessionLifecycle(null);
    clearProgress();
    setScreen('end');
  };

  const handleCancelSession = async (key: 'morning' | 'night') => {
    cancelSession(key);
    refreshTodayStatus();
    invalidateActiveSessionLifecycle();
    setSessionLifecycle(null);
    clearProgress();
    setScreen('home');
  };

  const handleRestartSession = async (key: 'morning' | 'night') => {
    restartSession(key);
    refreshTodayStatus();
    invalidateActiveSessionLifecycle();
    setSessionLifecycle(null);
    clearProgress();
    handleSelectSession(key);
  };

  const handleHome = () => {
    setSession(null);
    setScreen('home');
    refreshTodayStatus();
  };

  return (
    <div style={{ width: '100%', height: '100vh', minHeight: '100vh', background: 'var(--app-bg)', color: 'var(--app-text)', position: 'relative', overflow: 'hidden' }}>
      {screen === 'home' && (
        <HomeScreen
          onSelectSession={handleSelectSession}
          onResume={handleResume}
          todayStatus={todayStatus}
          streaks={streaks}
          onCancelSession={handleCancelSession}
          onRestartSession={handleRestartSession}
          onAdmin={() => setScreen('admin')}
          onKnowledge={handleOpenKnowledge}
        />
      )}
      {screen === 'overview' && session && (
        <OverviewScreen
          session={session}
          onBack={() => setScreen('home')}
          onBegin={handleBegin}
        />
      )}
      {screen === 'active' && session && (
        <ActiveScreen
          session={session}
          initialPracticeIndex={initPracticeIndex}
          initialTimeRemaining={initTimeRemaining}
          sessionLifecycle={sessionLifecycle ?? createSessionLifecycle()}
          onEnd={handleEnd}
          onGoHome={() => setScreen('home')}
          onCancelToday={() => handleCancelSession(session.key)}
        />
      )}
      {screen === 'end' && session && (
        <EndScreen
          session={session}
          practicesCompleted={endStats.practices}
          minutesCompleted={endStats.minutes}
          onHome={handleHome}
        />
      )}
      {screen === 'knowledge' && (
        <KnowledgeScreen onBack={() => setScreen('home')} />
      )}
      {screen === 'admin' && (
        <AdminScreen onBack={() => setScreen('home')} />
      )}
    </div>
  );
}
