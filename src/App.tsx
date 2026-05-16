import { useState, useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import OverviewScreen from './screens/OverviewScreen';
import ActiveScreen from './screens/ActiveScreen';
import EndScreen from './screens/EndScreen';
import AdminScreen from './screens/AdminScreen';
import { SESSIONS, Session } from './data/sessions';
import { loadProgress, clearProgress } from './store/sessionStore';
import {
  recordCompletion,
  cancelSession,
  restartSession,
  getTodayStatus,
  getStreaks,
  TodayStatusMap,
} from './lib/tracker';

function unlockAudioSafe() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) new AudioCtx();
  } catch (_) {}
}

type Screen = 'home' | 'overview' | 'active' | 'end' | 'admin';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [session, setSession] = useState<Session | null>(null);
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

  const handleResume = () => {
    const saved = loadProgress();
    if (!saved) return;
    const s = SESSIONS[saved.sessionKey as 'morning' | 'night'];
    if (!s) return;
    setSession(s);
    setInitPracticeIndex(saved.practiceIndex);
    setInitTimeRemaining(saved.timeRemaining);
    setScreen('active');
  };

  const handleBegin = () => {
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
      refreshTodayStatus();
    }
    clearProgress();
    setScreen('end');
  };

  const handleCancelSession = async (key: 'morning' | 'night') => {
    cancelSession(key);
    refreshTodayStatus();
    clearProgress();
    setScreen('home');
  };

  const handleRestartSession = async (key: 'morning' | 'night') => {
    restartSession(key);
    refreshTodayStatus();
    handleSelectSession(key);
  };

  const handleHome = () => {
    setSession(null);
    setScreen('home');
    refreshTodayStatus();
  };

  return (
    <div style={{ width: '100%', height: '100vh', minHeight: '100vh', background: '#0F0D0A', color: '#E8DDD0', position: 'relative', overflow: 'hidden' }}>
      {screen === 'home' && (
        <HomeScreen
          onSelectSession={handleSelectSession}
          onResume={handleResume}
          todayStatus={todayStatus}
          streaks={streaks}
          onCancelSession={handleCancelSession}
          onRestartSession={handleRestartSession}
          onAdmin={() => setScreen('admin')}
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
      {screen === 'admin' && (
        <AdminScreen onBack={() => setScreen('home')} />
      )}
    </div>
  );
}
