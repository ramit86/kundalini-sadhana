import { useCallback, useEffect, useRef, useState } from 'react';
import { Session } from '../../data/sessions';
import {
  startAmbient, stopAmbient, setAmbientVolume, ringBell, resumeAudioContextFromGesture, getAudioContextState, isAmbientActive, isAmbientFileMissing,
} from '../../audio/audioManager';
import { stopSpeaking } from '../../audio/voiceManager';
import {
  saveProgress, clearProgress,
  setStoredAmbientVolume, getAmbientVolume,
  getPreferences, savePreferences,
} from '../../store/sessionStore';
import { requestWakeLock, releaseWakeLock, WakeLockMode } from '../../utils/wakeLock';
import { haptic } from './haptic';

const MODULE_TRANSITION_GAP_MS = 3000;
const MODULE_START_BELL_LEAD_MS = 650;

interface Args {
  session: Session;
  initialPracticeIndex: number;
  initialTimeRemaining?: number;
  isMobile: boolean;
  onEnd: (practicesCompleted?: number) => void;
  onGoHome: () => void;
  onCancelToday: () => void;
}

export function useSessionPlayback({
  session, initialPracticeIndex, initialTimeRemaining, isMobile, onEnd, onGoHome, onCancelToday,
}: Args) {
  const prefs = getPreferences();
  const [practiceIndex, setPracticeIndex] = useState(initialPracticeIndex);
  const [timeRemaining, setTimeRemaining] = useState(
    initialTimeRemaining ?? session.practices[initialPracticeIndex]?.duration ?? 0
  );
  const [isRunning, setIsRunning] = useState(false);
  const [ambientOn, setAmbientOn] = useState(prefs.ambientOn ?? true);
  const [ambientVol, setAmbientVol] = useState(getAmbientVolume());
  const [bellFlash, setBellFlash] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [practiceTransition, setPracticeTransition] = useState(false);
  const [auraTransitionPulse, setAuraTransitionPulse] = useState(false);
  const [wakeLockMode, setWakeLockMode] = useState<WakeLockMode>('inactive');
  const [showWakeLockLimitedToast, setShowWakeLockLimitedToast] = useState(false);
  const [audioDebug, setAudioDebug] = useState({
    state: 'none' as ReturnType<typeof getAudioContextState>,
    ambientActive: false,
    ambientMissing: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const practiceRef = useRef(practiceIndex);
  const isRunningRef = useRef(isRunning);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTokenRef = useRef(0);
  const transitionTimeoutsRef = useRef<number[]>([]);

  practiceRef.current = practiceIndex;
  isRunningRef.current = isRunning;

  const practice = session.practices[practiceIndex];

  const clearTransitionTimeouts = useCallback(() => {
    transitionTimeoutsRef.current.forEach(t => window.clearTimeout(t));
    transitionTimeoutsRef.current = [];
  }, []);

  const scheduleTransition = useCallback((fn: () => void, delayMs: number) => {
    const id = window.setTimeout(() => {
      transitionTimeoutsRef.current = transitionTimeoutsRef.current.filter(t => t !== id);
      fn();
    }, delayMs);
    transitionTimeoutsRef.current.push(id);
    return id;
  }, []);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isRunningRef.current) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 5500);
    }
  }, []);

  const stopTimer = useCallback(() => {
    transitionTokenRef.current += 1;
    clearTransitionTimeouts();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    stopAmbient();
    stopSpeaking();
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    void releaseWakeLock();
  }, [clearTransitionTimeouts]);

  const setPracticeVisualState = useCallback((idx: number) => {
    const p = session.practices[idx];
    if (!p) return;
    const TRANSITION_MS = 820;

    setPracticeIndex(idx);
    setTimeRemaining(p.duration);
    saveProgress(session.key, idx, p.duration);
    haptic('medium');

    setPracticeTransition(true);
    setAuraTransitionPulse(true);
    window.setTimeout(() => setPracticeTransition(false), TRANSITION_MS);
    window.setTimeout(() => setAuraTransitionPulse(false), 960);
  }, [session]);

  const startModulePlayback = useCallback((idx: number, opts?: { bellAtStart?: boolean; token?: number }) => {
    const p = session.practices[idx];
    if (!p) return;
    const token = opts?.token ?? transitionTokenRef.current;
    const bellAtStart = opts?.bellAtStart ?? false;

    if (bellAtStart) ringBell(1);
    const delay = bellAtStart ? MODULE_START_BELL_LEAD_MS : 0;

    scheduleTransition(() => {
      if (token !== transitionTokenRef.current) return;
      if (ambientOn) {
        void startAmbient(p.chakra, ambientVol);
      }
      setIsRunning(true);
      if (import.meta.env.DEV) {
        setAudioDebug({
          state: getAudioContextState(),
          ambientActive: isAmbientActive(),
          ambientMissing: isAmbientFileMissing(),
        });
      }
    }, delay);
  }, [ambientOn, ambientVol, scheduleTransition, session]);

  const queueModuleTransition = useCallback((nextIdx: number) => {
    const p = session.practices[nextIdx];
    if (!p) return;

    transitionTokenRef.current += 1;
    const token = transitionTokenRef.current;
    clearTransitionTimeouts();

    stopAmbient(true);
    setPracticeVisualState(nextIdx);
    scheduleTransition(() => {
      if (token !== transitionTokenRef.current) return;
      startModulePlayback(nextIdx, { bellAtStart: true, token });
    }, MODULE_TRANSITION_GAP_MS);
  }, [clearTransitionTimeouts, scheduleTransition, session, setPracticeVisualState, startModulePlayback]);

  const doEnd = useCallback(() => {
    stopTimer();
    clearProgress();
    haptic('heavy');
    window.setTimeout(() => onEnd(practiceRef.current + 1), 700);
  }, [stopTimer, onEnd]);

  useEffect(() => {
    if (!isRunning) return;
    resetControlsTimer();

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          stopSpeaking();
          ringBell();
          haptic('medium');
          setBellFlash(true);
          window.setTimeout(() => setBellFlash(false), 500);
          stopAmbient(true);
          const nextIdx = practiceRef.current + 1;
          if (nextIdx >= session.practices.length) {
            transitionTokenRef.current += 1;
            const token = transitionTokenRef.current;
            clearTransitionTimeouts();
            scheduleTransition(() => {
              if (token !== transitionTokenRef.current) return;
              doEnd();
            }, MODULE_TRANSITION_GAP_MS);
          } else {
            queueModuleTransition(nextIdx);
          }
          return 0;
        }
        saveProgress(session.key, practiceRef.current, next);
        return next;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, session, clearTransitionTimeouts, doEnd, queueModuleTransition, resetControlsTimer, scheduleTransition]);

  useEffect(() => {
    if (isRunning) {
      void requestWakeLock().then(setWakeLockMode);
    } else {
      void releaseWakeLock();
      setWakeLockMode('inactive');
    }
  }, [isRunning]);

  useEffect(() => {
    if (!isMobile || !isRunning) return;
    if (wakeLockMode !== 'limited') return;
    setShowWakeLockLimitedToast(true);
    const t = window.setTimeout(() => setShowWakeLockLimitedToast(false), 2400);
    return () => window.clearTimeout(t);
  }, [isMobile, isRunning, wakeLockMode]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      clearTransitionTimeouts();
      document.body.style.overflow = '';
      void releaseWakeLock();
      setWakeLockMode('inactive');
    };
  }, [clearTransitionTimeouts]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const update = () => setAudioDebug({
      state: getAudioContextState(),
      ambientActive: isAmbientActive(),
      ambientMissing: isAmbientFileMissing(),
    });
    update();
    const t = window.setInterval(update, 700);
    return () => window.clearInterval(t);
  }, []);

  const togglePlayPause = async () => {
    haptic('light');
    if (isRunning) stopTimer();
    else {
      transitionTokenRef.current += 1;
      const token = transitionTokenRef.current;
      clearTransitionTimeouts();
      await resumeAudioContextFromGesture();
      const atModuleStart = timeRemaining === practice.duration;
      startModulePlayback(practiceIndex, { bellAtStart: atModuleStart, token });
    }
  };

  const handleRestart = () => {
    haptic('light');
    stopTimer();
    setTimeRemaining(session.practices[practiceIndex].duration);
    saveProgress(session.key, practiceIndex, session.practices[practiceIndex].duration);
  };

  const handleSkip = () => {
    haptic('medium');
    stopTimer();
    const next = practiceIndex + 1;
    if (next >= session.practices.length) { doEnd(); return; }
    queueModuleTransition(next);
  };

  const handleGoHome = () => {
    haptic('light');
    stopTimer();
    onGoHome();
  };

  const handleCancelToday = () => {
    const confirmed = window.confirm(`Cancel today's ${session.label.toLowerCase()} session and return home?`);
    if (!confirmed) return;
    haptic('medium');
    stopTimer();
    onCancelToday();
  };

  const handleToggleAmbient = () => {
    haptic('light');
    const next = !ambientOn;
    setAmbientOn(next);
    savePreferences({ ambientOn: next });
    if (!next) {
      stopAmbient();
      if (import.meta.env.DEV) {
        setAudioDebug({
          state: getAudioContextState(),
          ambientActive: isAmbientActive(),
          ambientMissing: isAmbientFileMissing(),
        });
      }
    }
    else if (isRunning) {
      void resumeAudioContextFromGesture().then(async () => {
        await startAmbient(practice.chakra, ambientVol);
      }).finally(() => {
        if (import.meta.env.DEV) {
          setAudioDebug({
            state: getAudioContextState(),
            ambientActive: isAmbientActive(),
            ambientMissing: isAmbientFileMissing(),
          });
        }
      });
    }
  };

  const handleVolumeChange = (v: number) => {
    const vol = v / 100;
    setAmbientVol(vol);
    setStoredAmbientVolume(vol);
    setAmbientVolume(vol);
  };

  return {
    practice,
    practiceIndex,
    timeRemaining,
    isRunning,
    ambientOn,
    ambientVol,
    bellFlash,
    showControls,
    practiceTransition,
    auraTransitionPulse,
    wakeLockMode,
    showWakeLockLimitedToast,
    audioDebug,
    resetControlsTimer,
    togglePlayPause,
    handleRestart,
    handleSkip,
    handleGoHome,
    handleCancelToday,
    handleToggleAmbient,
    handleVolumeChange,
  };
}
