import { useCallback, useEffect, useRef, useState } from 'react';
import { Session } from '../../data/sessions';
import {
  startAmbient,
  stopAmbient,
  setAmbientVolume,
  ringBell,
  resumeAudioContextFromGesture,
  getAudioContextState,
  isAmbientActive,
  isAmbientFileMissing,
  getBellBusyMsRemaining,
  playOneShotAudio,
  stopOneShotAudio,
} from '../../audio/audioManager';
import {
  saveProgress,
  clearProgress,
  setStoredAmbientVolume,
  getAmbientVolume,
  getPreferences,
  savePreferences,
  loadProgress,
  SavedProgress,
} from '../../store/sessionStore';
import { requestWakeLock, releaseWakeLock, WakeLockMode } from '../../utils/wakeLock';
import { haptic } from './haptic';
import {
  isSessionPhase,
  SessionPhase,
  useSessionPhaseController,
} from './useSessionPhaseController';

const OPENING_MANTRA_PATH = '/audio/mantras/asato-ma-opening.mp3';
const OPENING_SILENCE_MS = 2400;
const TRANSITION_SILENCE_MS = 5000;
const CLOSING_SILENCE_MS = 5000;
const AMBIENT_FADE_MS = 1250;
const CLOSING_SITTING_SECONDS = 30;

interface PracticeRuntimeState {
  timeRemaining: number;
  completed: boolean;
}

interface TransitionDebug {
  id: number;
  state: SessionPhase;
  sourcePractice: string;
  destinationPractice: string;
  event: string;
}

interface Args {
  session: Session;
  initialPracticeIndex: number;
  initialTimeRemaining?: number;
  isMobile: boolean;
  onEnd: (practicesCompleted?: number) => void;
  onGoHome: () => void;
  onCancelToday: () => void;
}

function buildDefaultPracticeStates(session: Session): Record<number, PracticeRuntimeState> {
  return Object.fromEntries(
    session.practices.map((practice, idx) => [idx, { timeRemaining: practice.duration, completed: false }])
  );
}

function normalizePracticeStates(
  session: Session,
  saved: SavedProgress | null,
  initialPracticeIndex: number,
  initialTimeRemaining: number | undefined,
): Record<number, PracticeRuntimeState> {
  const states = buildDefaultPracticeStates(session);

  if (saved?.practiceStates) {
    for (const [rawIndex, value] of Object.entries(saved.practiceStates)) {
      const idx = Number(rawIndex);
      if (!Number.isInteger(idx) || !session.practices[idx]) continue;
      states[idx] = {
        timeRemaining: Math.max(0, value.timeRemaining),
        completed: value.completed === true,
      };
    }
  } else {
    for (let i = 0; i < initialPracticeIndex; i += 1) {
      const practice = session.practices[i];
      if (!practice) continue;
      states[i] = { timeRemaining: 0, completed: true };
    }
  }

  const current = session.practices[initialPracticeIndex];
  if (current) {
    states[initialPracticeIndex] = {
      timeRemaining: typeof initialTimeRemaining === 'number' ? initialTimeRemaining : current.duration,
      completed: states[initialPracticeIndex]?.completed ?? false,
    };
  }

  return states;
}

function serializePracticeStates(states: Record<number, PracticeRuntimeState>) {
  return Object.fromEntries(
    Object.entries(states).map(([index, value]) => [
      index,
      {
        timeRemaining: value.timeRemaining,
        completed: value.completed,
      },
    ])
  );
}

function debugQuietly(...args: unknown[]) {
  if (import.meta.env.DEV) {
    console.debug('[session-playback]', JSON.stringify(args.length === 1 ? args[0] : args));
  }
}

function resolveInitialPhase(saved: SavedProgress | null, shouldAutoStartOpening: boolean): SessionPhase {
  if (shouldAutoStartOpening) return 'opening_invocation';
  if (!isSessionPhase(saved?.sessionPhase)) return 'paused';
  if (saved.sessionPhase === 'closing_complete') return 'closing_complete';
  if (saved.sessionPhase.startsWith('closing_')) return 'closing_sitting';
  return 'paused';
}

export function useSessionPlayback({
  session, initialPracticeIndex, initialTimeRemaining, isMobile, onEnd, onGoHome, onCancelToday,
}: Args) {
  const prefs = getPreferences();
  const savedProgress = loadProgress();
  const shouldAutoStartOpening =
    !savedProgress?.openingInvocationSeen &&
    initialPracticeIndex === 0 &&
    typeof initialTimeRemaining === 'undefined';

  const [practiceIndex, setPracticeIndex] = useState(initialPracticeIndex);
  const [timeRemaining, setTimeRemaining] = useState(
    initialTimeRemaining ?? session.practices[initialPracticeIndex]?.duration ?? 0
  );
  const [practiceStates, setPracticeStates] = useState<Record<number, PracticeRuntimeState>>(
    () => normalizePracticeStates(session, savedProgress, initialPracticeIndex, initialTimeRemaining)
  );
  const [ambientOn, setAmbientOn] = useState(prefs.ambientOn ?? true);
  const [ambientVol, setAmbientVol] = useState(getAmbientVolume());
  const [bellFlash, setBellFlash] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [practiceTransition, setPracticeTransition] = useState(false);
  const [auraTransitionPulse, setAuraTransitionPulse] = useState(false);
  const [wakeLockMode, setWakeLockMode] = useState<WakeLockMode>('inactive');
  const [showWakeLockLimitedToast, setShowWakeLockLimitedToast] = useState(false);
  const {
    phase: sessionPhase,
    phaseRef: sessionPhaseRef,
    enterPhase,
    isActive: isRunning,
    isOpening,
    isTransitioning,
    isClosing,
  } = useSessionPhaseController(resolveInitialPhase(savedProgress, shouldAutoStartOpening));
  const [closingSilentRemaining, setClosingSilentRemaining] = useState(
    savedProgress?.closingSilentRemaining ?? CLOSING_SITTING_SECONDS
  );
  const [transitionId, setTransitionId] = useState(0);
  const [transitionDebug, setTransitionDebug] = useState<TransitionDebug>({
    id: 0,
    state: resolveInitialPhase(savedProgress, shouldAutoStartOpening),
    sourcePractice: '',
    destinationPractice: '',
    event: 'idle',
  });
  const [audioDebug, setAudioDebug] = useState({
    state: 'none' as ReturnType<typeof getAudioContextState>,
    ambientActive: false,
    ambientMissing: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const practiceRef = useRef(practiceIndex);
  const timeRemainingRef = useRef(timeRemaining);
  const practiceStatesRef = useRef(practiceStates);
  const canonicalPracticeIndexRef = useRef(
    savedProgress?.resumePracticeIndex ?? savedProgress?.practiceIndex ?? initialPracticeIndex
  );
  const transitionTokenRef = useRef(0);
  const openingStartedRef = useRef(false);
  const completionRequestedRef = useRef(false);
  const openingInvocationSeenRef = useRef(savedProgress?.openingInvocationSeen === true || !shouldAutoStartOpening);

  practiceRef.current = practiceIndex;
  timeRemainingRef.current = timeRemaining;
  practiceStatesRef.current = practiceStates;

  const practice = session.practices[practiceIndex];

  const persistProgressSnapshot = useCallback((
    nextPracticeIndex: number,
    nextTimeRemaining: number,
    nextPracticeStates: Record<number, PracticeRuntimeState> = practiceStatesRef.current,
    openingSeen = openingInvocationSeenRef.current,
    nextClosingSilentRemaining = closingSilentRemaining,
  ) => {
    canonicalPracticeIndexRef.current = nextPracticeIndex;
    saveProgress(session.key, nextPracticeIndex, nextTimeRemaining, {
      resumePracticeIndex: nextPracticeIndex,
      resumeTimeRemaining: nextTimeRemaining,
      openingInvocationSeen: openingSeen,
      sessionPhase: sessionPhaseRef.current,
      closingSilentRemaining: nextClosingSilentRemaining,
      practiceStates: serializePracticeStates(nextPracticeStates),
    });
  }, [closingSilentRemaining, session.key, sessionPhaseRef]);

  const setAudioSnapshot = useCallback(() => {
    if (!import.meta.env.DEV) return;
    setAudioDebug({
      state: getAudioContextState(),
      ambientActive: isAmbientActive(),
      ambientMissing: isAmbientFileMissing(),
    });
  }, []);

  const setTransitionDebugEvent = useCallback((
    state: SessionPhase,
    event: string,
    sourcePractice = '',
    destinationPractice = '',
  ) => {
    const next = {
      id: transitionTokenRef.current,
      state,
      sourcePractice,
      destinationPractice,
      event,
    };
    setTransitionDebug(next);
    debugQuietly({
      transitionId: next.id,
      state: next.state,
      sourcePractice: next.sourcePractice,
      destinationPractice: next.destinationPractice,
      event: next.event,
    });
  }, []);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (sessionPhaseRef.current === 'active') {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 5500);
    }
  }, [sessionPhaseRef]);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopPlaybackAudio = useCallback((fadeAmbient = true) => {
    stopOneShotAudio();
    if (fadeAmbient) void stopAmbient(true);
    else void stopAmbient(false);
    setAudioSnapshot();
  }, [setAudioSnapshot]);

  const cancelPendingFlow = useCallback((nextToken?: number, stopAudio = true) => {
    debugQuietly({ event: 'cancel-flow', phase: sessionPhaseRef.current });
    transitionTokenRef.current = nextToken ?? transitionTokenRef.current + 1;
    clearTimerInterval();
    if (stopAudio) stopPlaybackAudio();
    enterPhase('paused');
    setBellFlash(false);
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
  }, [clearTimerInterval, enterPhase, sessionPhaseRef, stopPlaybackAudio]);

  const disposePendingFlow = useCallback(() => {
    debugQuietly({ event: 'dispose-flow', phase: sessionPhaseRef.current });
    transitionTokenRef.current += 1;
    clearTimerInterval();
    stopPlaybackAudio();
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
  }, [clearTimerInterval, sessionPhaseRef, stopPlaybackAudio]);

  const setCurrentPractice = useCallback((
    nextPracticeIndex: number,
    nextTimeRemaining: number,
    patch?: Partial<PracticeRuntimeState>,
    persist = true,
  ) => {
    const nextPractice = session.practices[nextPracticeIndex];
    if (!nextPractice) return;
    setPracticeIndex(nextPracticeIndex);
    setTimeRemaining(nextTimeRemaining);
    practiceRef.current = nextPracticeIndex;
    timeRemainingRef.current = nextTimeRemaining;

    setPracticeStates(prev => {
      const current = prev[nextPracticeIndex] ?? {
        timeRemaining: nextPractice.duration,
        completed: false,
      };
      const next = {
        ...prev,
        [nextPracticeIndex]: {
          ...current,
          timeRemaining: nextTimeRemaining,
          completed: patch?.completed ?? current.completed,
        },
      };
      practiceStatesRef.current = next;
      if (persist) {
        persistProgressSnapshot(nextPracticeIndex, nextTimeRemaining, next);
      }
      return next;
    });
  }, [persistProgressSnapshot, session.practices]);

  const setRunningState = useCallback((nextRunning: boolean) => {
    enterPhase(nextRunning ? 'active' : 'paused');
    if (nextRunning) {
      resetControlsTimer();
    }
  }, [enterPhase, resetControlsTimer]);

  const waitForToken = useCallback((ms: number, token: number) => {
    return new Promise<boolean>(resolve => {
      window.setTimeout(() => resolve(token === transitionTokenRef.current), ms);
    });
  }, []);

  const preparePractice = useCallback(async (
    nextPracticeIndex: number,
    token: number,
  ) => {
    const nextPractice = session.practices[nextPracticeIndex];
    if (!nextPractice) return false;
    if (token !== transitionTokenRef.current) return false;

    enterPhase('prepare_next');
    setTransitionDebugEvent('prepare_next', 'prepare', session.practices[practiceRef.current]?.name ?? '', nextPractice.name);

    setPracticeTransition(true);
    setAuraTransitionPulse(true);
    setTimeout(() => setPracticeTransition(false), 820);
    setTimeout(() => setAuraTransitionPulse(false), 980);

    const savedNextState = practiceStatesRef.current[nextPracticeIndex];
    const nextTimeRemaining = savedNextState?.completed
      ? nextPractice.duration
      : savedNextState?.timeRemaining ?? nextPractice.duration;
    setCurrentPractice(nextPracticeIndex, nextTimeRemaining, { completed: false });
    openingInvocationSeenRef.current = true;

    if (token !== transitionTokenRef.current) return false;

    enterPhase('fade_ambient');
    setTransitionDebugEvent('fade_ambient', 'ambient-fade', '', nextPractice.name);
    stopOneShotAudio();
    if (ambientOn) {
      await resumeAudioContextFromGesture();
      await startAmbient(nextPractice.chakra, ambientVol);
    } else {
      void stopAmbient(false);
    }

    if (token !== transitionTokenRef.current) return false;

    await waitForToken(AMBIENT_FADE_MS, token);
    if (token !== transitionTokenRef.current) return false;

    setTransitionDebugEvent('active', 'timer-start', '', nextPractice.name);
    setRunningState(true);
    debugQuietly({
      transitionId: transitionTokenRef.current,
      state: 'timer-start',
      sourcePractice: session.practices[practiceRef.current]?.name,
      destinationPractice: nextPractice.name,
    });

    return true;
  }, [ambientOn, ambientVol, enterPhase, session.practices, setCurrentPractice, setRunningState, setTransitionDebugEvent, waitForToken]);

  const startTransitionToPractice = useCallback(async (
    nextPracticeIndex: number,
    opts?: { manualSkip?: boolean; sourcePracticeIndex?: number; keepCurrentProgress?: boolean },
  ) => {
    const nextPractice = session.practices[nextPracticeIndex];
    if (!nextPractice) return;

    const sourcePracticeIndex = opts?.sourcePracticeIndex ?? practiceRef.current;
    const sourcePractice = session.practices[sourcePracticeIndex];
    const manualSkip = opts?.manualSkip === true;
    const token = ++transitionTokenRef.current;
    setTransitionId(token);
    cancelPendingFlow(token, false);
    enterPhase('practice_complete');
    setTransitionDebugEvent('practice_complete', manualSkip ? 'manual-skip' : 'auto-transition', sourcePractice?.name ?? '', nextPractice.name);
    haptic(manualSkip ? 'light' : 'medium');

    clearTimerInterval();
    stopOneShotAudio();

    setBellFlash(false);

    if (sourcePractice && !opts?.keepCurrentProgress) {
      setPracticeStates(prev => {
        const next = {
          ...prev,
          [sourcePracticeIndex]: {
            timeRemaining: manualSkip ? Math.max(0, timeRemainingRef.current) : 0,
            completed: !manualSkip,
          },
        };
        practiceStatesRef.current = next;
        persistProgressSnapshot(practiceRef.current, timeRemainingRef.current, next, openingInvocationSeenRef.current);
        return next;
      });
    }

    enterPhase('transition_silence');
    setTransitionDebugEvent('transition_silence', 'ambient-fade-out', sourcePractice?.name ?? '', nextPractice.name);
    await stopAmbient(true);
    if (token !== transitionTokenRef.current) return;

    setTransitionDebugEvent('transition_silence', 'silence', sourcePractice?.name ?? '', nextPractice.name);
    await waitForToken(TRANSITION_SILENCE_MS, token);
    if (token !== transitionTokenRef.current) return;

    enterPhase('end_bell');
    setTransitionDebugEvent('end_bell', 'bell-start', sourcePractice?.name ?? '', nextPractice.name);
    ringBell(1);
    haptic('medium');
    setBellFlash(true);
    setTimeout(() => setBellFlash(false), 520);

    await waitForToken(Math.max(0, getBellBusyMsRemaining() + 80), token);
    if (token !== transitionTokenRef.current) return;

    await preparePractice(nextPracticeIndex, token);
  }, [cancelPendingFlow, clearTimerInterval, enterPhase, persistProgressSnapshot, preparePractice, session.practices, setTransitionDebugEvent, waitForToken]);

  const startOpeningInvocation = useCallback(async () => {
    if (openingStartedRef.current) return;
    openingStartedRef.current = true;

    const token = ++transitionTokenRef.current;
    setTransitionId(token);
    enterPhase('opening_invocation');
    setTransitionDebugEvent('opening_invocation', 'opening-start', '', session.practices[0]?.name ?? '');
    openingInvocationSeenRef.current = true;
    persistProgressSnapshot(0, session.practices[0]?.duration ?? 0, practiceStatesRef.current, true);

    await resumeAudioContextFromGesture();
    if (token !== transitionTokenRef.current) return;

    setTransitionDebugEvent('opening_invocation', 'opening-audio-start', '', session.practices[0]?.name ?? '');
    const invocationPlayed = await playOneShotAudio(OPENING_MANTRA_PATH, 0.9);
    if (token !== transitionTokenRef.current) return;
    setTransitionDebugEvent('opening_invocation', invocationPlayed ? 'opening-audio-end' : 'opening-audio-fallback', '', session.practices[0]?.name ?? '');

    const graceMs = invocationPlayed ? OPENING_SILENCE_MS : 6500;
    enterPhase('opening_silence');
    setTransitionDebugEvent('opening_silence', 'opening-silence', '', session.practices[0]?.name ?? '');
    await waitForToken(graceMs, token);
    if (token !== transitionTokenRef.current) return;

    enterPhase('opening_bell');
    setTransitionDebugEvent('opening_bell', 'bell-start', '', session.practices[0]?.name ?? '');
    ringBell(1);
    haptic('medium');
    setBellFlash(true);
    setTimeout(() => setBellFlash(false), 520);
    await waitForToken(getBellBusyMsRemaining() + 80, token);
    if (token !== transitionTokenRef.current) return;

    await preparePractice(0, token);
  }, [enterPhase, persistProgressSnapshot, preparePractice, session.practices, setTransitionDebugEvent, waitForToken]);

  const skipInvocation = useCallback(async () => {
    if (!sessionPhaseRef.current.startsWith('opening_')) return;
    haptic('light');
    const token = ++transitionTokenRef.current;
    setTransitionId(token);
    cancelPendingFlow(token, false);
    enterPhase('opening_prepare');
    setTransitionDebugEvent('opening_prepare', 'skip-invocation', '', session.practices[0]?.name ?? '');
    await waitForToken(420, token);
    if (token !== transitionTokenRef.current) return;
    await preparePractice(0, token);
  }, [cancelPendingFlow, enterPhase, preparePractice, session.practices, sessionPhaseRef, setTransitionDebugEvent, waitForToken]);

  const stopTimer = useCallback(() => {
    transitionTokenRef.current += 1;
    clearTimerInterval();
    stopPlaybackAudio();
    setRunningState(false);
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    void releaseWakeLock();
    setWakeLockMode('inactive');
  }, [clearTimerInterval, setRunningState, stopPlaybackAudio]);

  const startClosingRitual = useCallback(async () => {
    const token = ++transitionTokenRef.current;
    setTransitionId(token);
    cancelPendingFlow(token, false);
    clearTimerInterval();
    await stopAmbient(true);
    stopOneShotAudio();

    const finalPracticeIndex = session.practices.length - 1;
    const finalPractice = session.practices[finalPracticeIndex];
    const completedStates = {
      ...practiceStatesRef.current,
      [finalPracticeIndex]: {
        timeRemaining: 0,
        completed: true,
      },
    };
    practiceStatesRef.current = completedStates;
    setPracticeStates(completedStates);
    timeRemainingRef.current = 0;
    setTimeRemaining(0);

    enterPhase('closing_silence');
    setTransitionDebugEvent('closing_silence', 'silence', finalPractice?.name ?? '', '');
    persistProgressSnapshot(finalPracticeIndex, 0, completedStates);
    await waitForToken(CLOSING_SILENCE_MS, token);
    if (token !== transitionTokenRef.current) return;

    enterPhase('closing_bell');
    setTransitionDebugEvent('closing_bell', 'closing-bell', finalPractice?.name ?? '', '');
    ringBell(1);
    haptic('heavy');
    setBellFlash(true);
    window.setTimeout(() => setBellFlash(false), 520);

    await waitForToken(Math.max(0, getBellBusyMsRemaining() + 80), token);
    if (token !== transitionTokenRef.current) return;

    setClosingSilentRemaining(CLOSING_SITTING_SECONDS);
    enterPhase('closing_sitting');
    setTransitionDebugEvent('closing_sitting', 'silent-sitting', finalPractice?.name ?? '', '');
    persistProgressSnapshot(
      finalPracticeIndex,
      0,
      completedStates,
      openingInvocationSeenRef.current,
      CLOSING_SITTING_SECONDS,
    );
  }, [
    cancelPendingFlow,
    clearTimerInterval,
    enterPhase,
    persistProgressSnapshot,
    session.practices,
    setTransitionDebugEvent,
    waitForToken,
  ]);

  const finishSilentSitting = useCallback(() => {
    const finalPracticeIndex = session.practices.length - 1;
    stopOneShotAudio();
    setClosingSilentRemaining(0);
    enterPhase('closing_complete');
    setTransitionDebugEvent('closing_complete', 'ready-to-complete', session.practices[finalPracticeIndex]?.name ?? '', '');
    persistProgressSnapshot(
      finalPracticeIndex,
      0,
      practiceStatesRef.current,
      openingInvocationSeenRef.current,
      0,
    );
  }, [enterPhase, persistProgressSnapshot, session.practices, setTransitionDebugEvent]);

  const completeSession = useCallback(() => {
    if (completionRequestedRef.current) return;
    completionRequestedRef.current = true;
    stopTimer();
    clearProgress();
    haptic('heavy');
    onEnd(session.practices.length);
  }, [onEnd, session.practices.length, stopTimer]);

  useEffect(() => {
    if (!isRunning) return;
    resetControlsTimer();

    intervalRef.current = setInterval(() => {
      const next = Math.max(0, timeRemainingRef.current - 1);
      timeRemainingRef.current = next;
      setTimeRemaining(next);
      const nextPracticeStates = {
        ...practiceStatesRef.current,
        [practiceRef.current]: {
          ...practiceStatesRef.current[practiceRef.current],
          timeRemaining: next,
        },
      };
      practiceStatesRef.current = nextPracticeStates;
      setPracticeStates(nextPracticeStates);
      persistProgressSnapshot(
        practiceRef.current,
        next,
        nextPracticeStates,
        openingInvocationSeenRef.current,
      );

      if (next <= 0) {
        clearTimerInterval();
        stopOneShotAudio();
        const nextIdx = practiceRef.current + 1;
        if (nextIdx >= session.practices.length) {
          void startClosingRitual();
        } else {
          void startTransitionToPractice(nextIdx, { sourcePracticeIndex: practiceRef.current });
        }
      }
    }, 1000);

    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval, isRunning, persistProgressSnapshot, resetControlsTimer, session.practices, startClosingRitual, startTransitionToPractice]);

  useEffect(() => {
    if (sessionPhase !== 'closing_sitting') return;
    if (closingSilentRemaining <= 0) {
      finishSilentSitting();
      return;
    }

    const timer = window.setTimeout(() => {
      const next = Math.max(0, closingSilentRemaining - 1);
      setClosingSilentRemaining(next);
      persistProgressSnapshot(
        session.practices.length - 1,
        0,
        practiceStatesRef.current,
        openingInvocationSeenRef.current,
        next,
      );
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [
    closingSilentRemaining,
    finishSilentSitting,
    persistProgressSnapshot,
    session.practices.length,
    sessionPhase,
  ]);

  useEffect(() => {
    if (!shouldAutoStartOpening) return;
    const startTimer = window.setTimeout(() => {
      void startOpeningInvocation();
    }, 0);
    return () => {
      window.clearTimeout(startTimer);
    };
  }, [shouldAutoStartOpening, startOpeningInvocation]);

  useEffect(() => {
    if (isRunning) {
      void requestWakeLock().then(setWakeLockMode);
    } else if (sessionPhase === 'paused' || sessionPhase === 'closing_complete') {
      void releaseWakeLock();
      setWakeLockMode('inactive');
    }
  }, [isRunning, sessionPhase]);

  useEffect(() => {
    if (!isMobile || sessionPhase === 'paused' || sessionPhase === 'closing_complete') return;
    if (wakeLockMode !== 'limited') return;
    setShowWakeLockLimitedToast(true);
    const t = window.setTimeout(() => setShowWakeLockLimitedToast(false), 2400);
    return () => window.clearTimeout(t);
  }, [isMobile, sessionPhase, wakeLockMode]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      disposePendingFlow();
      document.body.style.overflow = '';
      void releaseWakeLock();
    };
  }, [disposePendingFlow]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const update = () => {
      setAudioDebug({
        state: getAudioContextState(),
        ambientActive: isAmbientActive(),
        ambientMissing: isAmbientFileMissing(),
      });
    };
    update();
    const t = window.setInterval(update, 700);
    return () => window.clearInterval(t);
  }, []);

  const togglePlayPause = async () => {
    haptic('light');
    if (sessionPhase !== 'paused' && sessionPhase !== 'active') return;
    if (practiceRef.current !== canonicalPracticeIndexRef.current) return;
    if (isRunning) {
      stopTimer();
      return;
    }

    await resumeAudioContextFromGesture();
    const nextPractice = session.practices[practiceRef.current];
    if (!nextPractice) return;
    stopOneShotAudio();
    if (ambientOn) {
      await startAmbient(nextPractice.chakra, ambientVol);
    }
    setRunningState(true);
  };

  const handleRestart = () => {
    if (isTransitioning || isClosing || isOpening) return;
    if (practiceRef.current !== canonicalPracticeIndexRef.current) return;
    haptic('light');
    const currentPractice = session.practices[practiceRef.current];
    if (!currentPractice) return;
    stopTimer();
    setCurrentPractice(practiceRef.current, currentPractice.duration, { completed: false });
  };

  const handleSkip = () => {
    if (isTransitioning || isClosing) return;
    haptic('medium');
    if (isOpening) {
      void skipInvocation();
      return;
    }

    const next = practiceRef.current + 1;
    if (practiceRef.current !== canonicalPracticeIndexRef.current) {
      const target = session.practices[next];
      if (!target) return;
      const saved = practiceStatesRef.current[next];
      setCurrentPractice(next, saved?.timeRemaining ?? target.duration, { completed: saved?.completed ?? false }, false);
      return;
    }
    if (next >= session.practices.length) {
      void startClosingRitual();
      return;
    }
    void startTransitionToPractice(next, {
      manualSkip: true,
      sourcePracticeIndex: practiceRef.current,
      keepCurrentProgress: true,
    });
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
      void stopAmbient();
      setAudioSnapshot();
    } else if (isRunning) {
      void resumeAudioContextFromGesture().then(async () => {
        await startAmbient(practice.chakra, ambientVol);
      }).finally(() => {
        setAudioSnapshot();
      });
    }
  };

  const handleVolumeChange = (v: number) => {
    const vol = v / 100;
    setAmbientVol(vol);
    setStoredAmbientVolume(vol);
    setAmbientVolume(vol);
  };

  const handleOpenPractice = (idx: number) => {
    if (isTransitioning || isClosing || isOpening) return;
    const target = session.practices[idx];
    if (!target) return;
    if (idx === practiceRef.current) return;
    haptic('light');
    stopTimer();
    const saved = practiceStatesRef.current[idx];
    setCurrentPractice(idx, saved?.timeRemaining ?? target.duration, undefined, false);
  };

  const sessionBusy = isOpening || isTransitioning || isClosing;

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
    sessionPhase,
    transitionId,
    transitionDebug,
    isOpening,
    isClosing,
    sessionBusy,
    closingSilentRemaining,
    practiceStates,
    resetControlsTimer,
    togglePlayPause,
    handleRestart,
    handleSkip,
    handleGoHome,
    handleCancelToday,
    handleToggleAmbient,
    handleVolumeChange,
    handleOpenPractice,
    skipInvocation,
    finishSilentSitting,
    completeSession,
  };
}
