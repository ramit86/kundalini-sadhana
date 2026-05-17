import { useEffect, useRef, useCallback, useState } from 'react';
import {
  RotateCcw, Play, Pause, SkipForward,
  Mic, MicOff, Music, Volume2, Settings2, Info, Home, XCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Session, CHAKRA_MAP, ChakraKey } from '../data/sessions';
import {
  startAmbient, stopAmbient, setAmbientVolume, ringBell, resumeAudioContextFromGesture, getAudioContextState, isAmbientActive, isAmbientFileMissing,
} from '../audio/audioManager';
import {
  playNarrationForPractice, stopSpeaking, GuidanceMode,
} from '../audio/voiceManager';
import {
  saveProgress, clearProgress,
  setStoredAmbientVolume, getAmbientVolume,
  getPreferences, savePreferences,
} from '../store/sessionStore';
import TimerRing from '../components/TimerRing';
import ChakraDots from '../components/ChakraDots';
import InstructionBox from '../components/InstructionBox';
import ParticleField from '../components/ParticleField';
import VoicePicker from '../components/VoicePicker';
import ChakraOverlay from '../components/ChakraOverlay';
import { CHAKRA_INFO } from '../data/chakraInfo';
import { requestWakeLock, releaseWakeLock, WakeLockMode } from '../utils/wakeLock';

const CHAKRA_SEQUENCE = ['Bindu', 'Ajna', 'Vishuddhi', 'Anahata', 'Manipura', 'Swadhisthana', 'Mooladhara'] as const;

const CHAKRA_SHORT_MEANING: Partial<Record<string, string>> = {
  Mooladhara: 'Rooted presence and steadiness.',
  Swadhisthana: 'Flow, receptivity, and inner softness.',
  Manipura: 'Inner fire, resolve, and clarity.',
  Anahata: 'Unstruck compassion and devotional openness.',
  Vishuddhi: 'Purity of expression and subtle listening.',
  Ajna: 'Inner seeing and one-pointed awareness.',
  Bindu: 'The subtle point of dissolution into stillness.',
  Preparation: 'Arriving inward and becoming available.',
  'All Chakras': 'Harmonising the whole inner channel.',
};

const CHAKRA_SPIRITUAL_BENEFITS: Partial<Record<string, string[]>> = {
  Mooladhara: ['Settled attention in the present moment', 'Quiet confidence in stillness', 'A gentle sense of inner support'],
  Swadhisthana: ['Smoother emotional flow', 'Creative devotional mood', 'Softening of inner resistance'],
  Manipura: ['Steady inner discipline', 'Clear intention in practice', 'Warmth of purposeful awareness'],
  Anahata: ['Tender compassion toward self and others', 'Calm devotional feeling', 'A sense of spacious forgiveness'],
  Vishuddhi: ['Refined inner listening', 'Honest and simple expression', 'Subtle feeling of purification'],
  Ajna: ['Sharpened witnessing awareness', 'Natural mental quietness', 'A centered intuitive gaze within'],
  Bindu: ['Taste of inward silence', 'Refinement of subtle perception', 'Restful contemplative depth'],
  Preparation: ['Grounding before deeper practice', 'Soft transition from outer to inner', 'Easeful settling of attention'],
  'All Chakras': ['Balanced energetic tone', 'Unified meditative flow', 'Wholeness in inward awareness'],
};

function haptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    if ('vibrate' in navigator) {
      const pattern = type === 'light' ? [18] : type === 'medium' ? [35] : [60];
      navigator.vibrate(pattern);
    }
  } catch (_) {}
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

interface Props {
  session: Session;
  initialPracticeIndex?: number;
  initialTimeRemaining?: number;
  onEnd: (practicesCompleted?: number) => void;
  onGoHome: () => void;
  onCancelToday: () => void;
}

export default function ActiveScreen({
  session,
  initialPracticeIndex = 0,
  initialTimeRemaining,
  onEnd,
  onGoHome,
  onCancelToday,
}: Props) {
  const prefs = getPreferences();
  const [practiceIndex, setPracticeIndex] = useState(initialPracticeIndex);
  const [timeRemaining, setTimeRemaining] = useState(
    initialTimeRemaining ?? session.practices[initialPracticeIndex]?.duration ?? 0
  );
  const [isRunning, setIsRunning] = useState(false);
  const [ambientOn, setAmbientOn] = useState(prefs.ambientOn ?? true);
  const [voiceOn, setVoiceOn] = useState(prefs.voiceOn ?? true);
  const [ambientVol, setAmbientVol] = useState(getAmbientVolume());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [narrationText, setNarrationText] = useState('');
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [showChakraOverlay, setShowChakraOverlay] = useState(false);
  const [guidanceMode, setGuidanceMode] = useState<GuidanceMode>(prefs.guidanceMode ?? 'full');
  const [bellFlash, setBellFlash] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [practiceTransition, setPracticeTransition] = useState(false);
  const [auraTransitionPulse, setAuraTransitionPulse] = useState(false);
  const [chakraPanelOpen, setChakraPanelOpen] = useState(false);
  const [wakeLockMode, setWakeLockMode] = useState<WakeLockMode>('inactive');
  const [showWakeLockLimitedToast, setShowWakeLockLimitedToast] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const [audioDebug, setAudioDebug] = useState({
    state: 'none' as ReturnType<typeof getAudioContextState>,
    ambientActive: false,
    ambientMissing: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const practiceRef = useRef(practiceIndex);
  const isRunningRef = useRef(isRunning);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  practiceRef.current = practiceIndex;
  isRunningRef.current = isRunning;

  const practice = session.practices[practiceIndex];
  const cc = CHAKRA_MAP[practice?.chakra] ?? CHAKRA_MAP['Preparation'];
  const chakraInfo = practice ? CHAKRA_INFO[practice.chakra] : undefined;
  const isMobile = viewportWidth < 700;
  const showDesktopPlaceholder = viewportWidth >= 1180;

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isRunningRef.current) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 5500);
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    stopAmbient();
    stopSpeaking();
    setIsSpeaking(false);
    setNarrationText('');
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    void releaseWakeLock();
  }, []);

  const doSpeak = useCallback((pIdx: number, gMode?: GuidanceMode) => {
    const p = session.practices[pIdx];
    const mode = gMode ?? guidanceMode;
    if (!p || !voiceOn || mode === 'silent') return;

    setNarrationText(`${p.name} · ${p.chakra}`);
    void playNarrationForPractice({
      name: p.name,
      chakra: p.chakra,
      mode,
      onStart: () => setIsSpeaking(true),
      onEnd: () => { setIsSpeaking(false); setNarrationText(''); },
    });
  }, [session, voiceOn, guidanceMode]);

  const loadPractice = useCallback((
    idx: number,
    autoStart = false,
    opts?: { transitionBell?: boolean }
  ) => {
    stopTimer();
    const p = session.practices[idx];
    if (!p) return;

    const shouldTransitionBell = opts?.transitionBell ?? false;
    if (shouldTransitionBell) ringBell(1);

    const TRANSITION_MS = 820;
    const SETTLE_MS = 520;

    setPracticeIndex(idx);
    setTimeRemaining(p.duration);
    saveProgress(session.key, idx, p.duration);
    haptic('medium');

    setPracticeTransition(true);
    setAuraTransitionPulse(true);
    setTimeout(() => setPracticeTransition(false), TRANSITION_MS);
    setTimeout(() => setAuraTransitionPulse(false), 960);

    setTimeout(() => {
      if (voiceOn && guidanceMode !== 'silent') doSpeak(idx);
      if (autoStart) {
        if (ambientOn) {
          void startAmbient(p.chakra, ambientVol);
        }
        setTimeout(() => {
          setIsRunning(true);
          if (import.meta.env.DEV) {
            setAudioDebug({
              state: getAudioContextState(),
              ambientActive: isAmbientActive(),
              ambientMissing: isAmbientFileMissing(),
            });
          }
        }, 120);
      }
    }, SETTLE_MS);
  }, [session, stopTimer, voiceOn, guidanceMode, doSpeak, ambientOn, ambientVol]);

  const doEnd = useCallback(() => {
    stopTimer();
    clearProgress();
    ringBell(3);
    haptic('heavy');
    setTimeout(() => onEnd(practiceRef.current + 1), 800);
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
          setIsSpeaking(false);
          ringBell();
          haptic('medium');
          setBellFlash(true);
          setTimeout(() => setBellFlash(false), 500);
          const nextIdx = practiceRef.current + 1;
          setTimeout(() => {
            if (nextIdx >= session.practices.length) doEnd();
            else loadPractice(nextIdx, true, { transitionBell: false });
          }, 1000);
          return 0;
        }
        saveProgress(session.key, practiceRef.current, next);
        return next;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, ambientOn, ambientVol, session, doEnd, loadPractice, resetControlsTimer]);

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
      document.body.style.overflow = '';
      void releaseWakeLock();
      setWakeLockMode('inactive');
    };
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (viewportWidth >= 960) setChakraPanelOpen(true);
    else setChakraPanelOpen(false);
  }, [practiceIndex, viewportWidth]);

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
      await resumeAudioContextFromGesture();
      if (ambientOn) {
        await startAmbient(practice.chakra, ambientVol);
      }
      setIsRunning(true);
      if (import.meta.env.DEV) {
        setAudioDebug({
          state: getAudioContextState(),
          ambientActive: isAmbientActive(),
          ambientMissing: isAmbientFileMissing(),
        });
      }
    }
  };

  const handleRestart = () => {
    haptic('light');
    stopTimer();
    setTimeRemaining(session.practices[practiceIndex].duration);
  };

  const handleSkip = () => {
    haptic('medium');
    stopTimer();
    const next = practiceIndex + 1;
    if (next >= session.practices.length) { doEnd(); return; }
    loadPractice(next, false, { transitionBell: true });
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

  const handleToggleVoice = () => {
    haptic('light');
    const next = !voiceOn;
    setVoiceOn(next);
    savePreferences({ voiceOn: next });
    if (!next) { stopSpeaking(); setIsSpeaking(false); setNarrationText(''); }
  };

  const handleVolumeChange = (v: number) => {
    const vol = v / 100;
    setAmbientVol(vol);
    setStoredAmbientVolume(vol);
    setAmbientVolume(vol);
  };

  const handleGuidanceModeChange = (m: GuidanceMode) => {
    setGuidanceMode(m);
    savePreferences({ guidanceMode: m });
  };

  const totalDone = session.practices.slice(0, practiceIndex).reduce((s, p) => s + p.duration, 0);
  const totalAll = session.practices.reduce((s, p) => s + p.duration, 0);
  const progressPct = Math.round((totalDone / totalAll) * 100);
  const isMorning = session.key === 'morning';
  const chakraMeta = CHAKRA_INFO[practice?.chakra ?? 'Preparation'];
  const spiritualBenefits = CHAKRA_SPIRITUAL_BENEFITS[practice?.chakra ?? 'Preparation'] ?? [];

  return (
    <div
      onClick={resetControlsTimer}
      style={{
        width: '100%', maxWidth: '100vw', height: '100%',
        display: 'flex', flexDirection: 'column',
        background: 'var(--app-bg)',
        overflow: 'hidden', overflowX: 'hidden', touchAction: 'none',
        position: 'relative',
      }}
    >
      {/* Bell flash */}
      {bellFlash && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50,
          background: `radial-gradient(ellipse at center, ${cc.dot}22 0%, transparent 65%)`,
          animation: 'fadeIn 0.12s ease',
        }} />
      )}

      {/* Practice transition */}
      {practiceTransition && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 48,
          background: 'var(--screen-transition-overlay)',
          animation: 'fadeIn 0.08s ease',
        }} />
      )}

      <ParticleField color={cc.dot} active={isRunning} />

      {/* Breathing chakra background glow */}
      <div style={{
        position: 'absolute', pointerEvents: 'none',
        width: 420, height: 420, borderRadius: '50%',
        background: `radial-gradient(ellipse at 40% 35%, ${cc.dot}${isRunning ? '20' : '10'} 0%, ${cc.dot}08 40%, transparent 68%)`,
        top: '38%', left: '50%',
        transform: `translate(-50%, -50%) scale(${auraTransitionPulse ? 1.07 : 1})`,
        filter: 'blur(38px)',
        transition: 'background 1.4s ease, opacity 1s ease',
        opacity: auraTransitionPulse ? 0.95 : undefined,
        animation: isRunning || auraTransitionPulse ? 'breathe-active 7s ease-in-out infinite' : 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', pointerEvents: 'none',
        width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${cc.dot}10 0%, transparent 70%)`,
        bottom: '15%', left: '20%',
        filter: 'blur(28px)',
        transition: 'background 1.4s ease',
        animation: isRunning ? 'breathe-active 9s ease-in-out infinite reverse' : 'none',
        zIndex: 0,
      }} />

      {/* Progress bar */}
      <div style={{ height: 2, background: 'var(--border-soft)', flexShrink: 0, position: 'relative', zIndex: 2 }}>
        <div style={{
          height: '100%',
          background: `linear-gradient(to right, ${cc.dot}77, ${cc.dot})`,
          width: `${progressPct}%`,
          transition: 'width 0.8s ease, background 1s ease',
          borderRadius: '0 2px 2px 0',
          boxShadow: `0 0 7px ${cc.dot}55`,
        }} />
      </div>

      {/* Header */}
      <div style={{
        padding: isMobile ? '0.42rem 0.6rem' : '0.6rem 1.2rem',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: isMobile ? 'flex-start' : 'space-between',
        gap: isMobile ? 5 : 10,
        flexShrink: 0, position: 'relative', zIndex: 2,
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.5s ease',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}>
        {isMobile ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0, gap: 10 }}>
              <span style={{
                fontSize: '9px', letterSpacing: '0.28em',
                textTransform: 'uppercase', padding: '3px 10px', borderRadius: 10,
                fontFamily: "'Raleway', sans-serif", fontWeight: 400,
                background: isMorning ? 'rgba(212,137,42,0.1)' : 'rgba(107,127,191,0.1)',
                color: isMorning ? '#F2C878' : '#A8B5E8',
                border: isMorning ? '1px solid rgba(212,137,42,0.18)' : '1px solid rgba(107,127,191,0.18)',
                whiteSpace: 'nowrap',
              }}>
                {session.label}
              </span>
              <span style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: '9px',
                color: 'var(--text-muted)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                {practiceIndex + 1} / {session.practices.length}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'center' }}>
              <button
                onClick={handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  justifyContent: 'center',
                  minWidth: 104,
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--card-border)',
                  background: 'var(--card-bg-soft)',
                  color: 'var(--text-muted)',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '8px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                title="Go to Home"
              >
                <Home size={10} />
                Home
              </button>
              <button
                onClick={handleCancelToday}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  justifyContent: 'center',
                  minWidth: 104,
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(220,80,80,0.22)',
                  background: 'rgba(220,80,80,0.08)',
                  color: '#E07070',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '8px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                title="Cancel today's session"
              >
                <XCircle size={10} />
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{
                fontSize: '9px', letterSpacing: '0.28em',
                textTransform: 'uppercase', padding: '3px 10px', borderRadius: 10,
                fontFamily: "'Raleway', sans-serif", fontWeight: 400,
                background: isMorning ? 'rgba(212,137,42,0.1)' : 'rgba(107,127,191,0.1)',
                color: isMorning ? '#F2C878' : '#A8B5E8',
                border: isMorning ? '1px solid rgba(212,137,42,0.18)' : '1px solid rgba(107,127,191,0.18)',
                whiteSpace: 'nowrap',
              }}>
                {session.label}
              </span>
              <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: 'var(--text-subtle)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {practiceIndex + 1} / {session.practices.length}
              </span>
              {isRunning && (
                <div style={{
                  padding: '3px 8px',
                  borderRadius: 8,
                  border: `1px solid ${wakeLockMode === 'full' ? 'rgba(72,176,72,0.25)' : 'rgba(200,169,110,0.2)'}`,
                  background: wakeLockMode === 'full' ? 'rgba(72,176,72,0.08)' : 'rgba(200,169,110,0.08)',
                  color: wakeLockMode === 'full' ? '#6FCB6F' : '#C8A96E',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '7px',
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  {wakeLockMode === 'full' ? 'Screen Awake' : 'Screen Awake Limited'}
                </div>
              )}
              {import.meta.env.DEV && (
                <div style={{
                  padding: '3px 7px',
                  borderRadius: 8,
                  border: '1px solid rgba(200,169,110,0.12)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-muted)',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '6.5px',
                  letterSpacing: '0.11em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  ctx:{audioDebug.state} · ambient:{audioDebug.ambientActive ? 'true' : 'false'}
                </div>
              )}
              {import.meta.env.DEV && audioDebug.ambientMissing && (
                <div style={{
                  padding: '3px 7px',
                  borderRadius: 8,
                  border: '1px solid rgba(220,80,80,0.18)',
                  background: 'rgba(220,80,80,0.08)',
                  color: '#B27C7C',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '6.5px',
                  letterSpacing: '0.11em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  Ambient file missing
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button
                onClick={handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  borderRadius: 8,
                  border: '1px solid var(--card-border)',
                  background: 'var(--card-bg-soft)',
                  color: 'var(--text-muted)',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '8px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                title="Go to Home"
              >
                <Home size={10} />
                Home
              </button>
              <button
                onClick={handleCancelToday}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  borderRadius: 8,
                  border: '1px solid rgba(220,80,80,0.22)',
                  background: 'rgba(220,80,80,0.08)',
                  color: '#E07070',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '8px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                title="Cancel today's session"
              >
                <XCircle size={10} />
                Cancel Today
              </button>
            </div>
          </>
        )}
      </div>

      {isMobile && showWakeLockLimitedToast && (
        <div style={{
          position: 'absolute',
          top: 56,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 12,
          borderRadius: 10,
          border: '1px solid var(--card-border)',
          background: 'var(--card-bg)',
          color: 'var(--text-muted)',
          fontFamily: "'Raleway', sans-serif",
          fontSize: '9px',
          letterSpacing: '0.08em',
          padding: '7px 10px',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.2s ease',
        }}>
          Sleep protection limited on this device
        </div>
      )}

      {/* Chakra dots */}
      <div style={{ position: 'relative', zIndex: 2, flexShrink: 0 }}>
        <ChakraDots practices={session.practices} currentIndex={practiceIndex} />
      </div>

      {/* Main body */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: isMobile ? '0 0.55rem 0.25rem' : '0 1.2rem 0.25rem',
        overflow: 'hidden', position: 'relative', zIndex: 2,
        minHeight: 0,
        width: '100%',
        maxWidth: '100vw',
      }}>
        <div style={{
          width: '100%',
          maxWidth: showDesktopPlaceholder ? 1120 : 760,
          margin: '0 auto',
          minHeight: 0,
          flex: 1,
          display: 'grid',
          gridTemplateColumns: showDesktopPlaceholder ? 'minmax(0,760px) minmax(220px,1fr)' : 'minmax(0,760px)',
          gap: showDesktopPlaceholder ? 16 : 0,
          alignItems: 'stretch',
        }}>
          <div style={{
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 18,
            background: 'var(--card-bg-alt)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-soft), inset 0 1px 0 var(--button-ghost-bg)',
            padding: isMobile ? '0.6rem' : '0.9rem 1rem',
            overflow: 'hidden',
            backdropFilter: 'blur(5px)',
            width: '100%',
          }}>
            {/* Chakra banner — outshine the active chakra */}
            <div
              key={`chakra-${practiceIndex}`}
              style={{
                flexShrink: 0,
                margin: '0 0 0.35rem',
                padding: '0.6rem 0.9rem',
                borderRadius: 14,
                background: `linear-gradient(135deg, ${cc.dot}12 0%, ${cc.dot}06 100%)`,
                border: `1px solid ${cc.dot}28`,
                display: 'flex', alignItems: 'center', gap: 10,
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.9s ease',
                animation: 'fadeIn 0.5s ease both',
              }}
            >
              {/* Glow blob behind */}
              <div style={{
                position: 'absolute', right: -20, top: -20, width: 90, height: 90,
                borderRadius: '50%',
                background: `radial-gradient(ellipse, ${cc.dot}30 0%, transparent 70%)`,
                filter: 'blur(18px)', pointerEvents: 'none',
                animation: isRunning ? 'breathe-active 5s ease-in-out infinite' : 'none',
              }} />

              {/* Phase label + practice name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '7.5px', letterSpacing: '0.32em', textTransform: 'uppercase', color: cc.dot, opacity: 0.7, marginBottom: 2 }}>
                  {practice?.phase}
                </div>
                <div
                  key={`name-${practiceIndex}`}
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.05rem, 4vw, 1.4rem)', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.2, animation: 'fadeDown 0.4s ease both' }}
                >
                  {practice?.name}
                </div>
              </div>

              {/* Chakra pill + info button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                <button
                  onClick={() => setShowChakraOverlay(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 10,
                    background: `${cc.dot}18`, border: `1px solid ${cc.dot}40`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {/* Pulsing chakra dot */}
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: cc.dot, flexShrink: 0,
                    boxShadow: `0 0 8px ${cc.dot}, 0 0 16px ${cc.dot}66`,
                    animation: isRunning ? 'pulse-dot 2.5s ease-in-out infinite' : 'none',
                    display: 'inline-block',
                  }} />
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.08em', color: cc.text, fontWeight: 400 }}>
                    {practice?.chakra}
                  </span>
                  <Info size={9} color={`${cc.dot}99`} />
                </button>
                {/* Body position chip */}
                {chakraInfo?.bodyLocation && (
                  <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '7.5px', color: `${cc.dot}77`, letterSpacing: '0.04em', textAlign: 'right' }}>
                    {chakraInfo.bodyLocation}
                  </div>
                )}
              </div>
            </div>

            {!showDesktopPlaceholder && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0.15rem 0 0.35rem' }}>
                <div style={{
                  width: '100%',
                  maxWidth: 180,
                  borderRadius: 16,
                  border: '1px solid var(--border-soft)',
                  background: 'var(--card-bg-soft)',
                  padding: '0.35rem',
                }}>
                  <ChakraBodyMap activeChakra={practice?.chakra ?? 'Preparation'} compact pulse={practiceTransition} />
                </div>
              </div>
            )}

            {/* Timer ring with sacred aura */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexShrink: 0,
              margin: '0.1rem 0 0.25rem',
              position: 'relative',
              minHeight: isMobile ? 214 : 242,
            }}>
              <div style={{
                position: 'absolute',
                width: 290,
                height: 230,
                borderRadius: '50%',
                background: `radial-gradient(ellipse at 50% 45%, ${cc.dot}24 0%, ${cc.dot}12 34%, transparent 72%)`,
                filter: 'blur(28px)',
                animation: 'breathe-slow 10s ease-in-out infinite',
                opacity: 0.38,
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute',
                width: 248,
                height: 248,
                borderRadius: '50%',
                border: `1px solid ${cc.dot}26`,
                boxShadow: bellFlash ? `0 0 36px ${cc.dot}88` : `0 0 20px ${cc.dot}33`,
                opacity: practiceTransition ? 0.85 : 0.45,
                transform: practiceTransition ? 'scale(1.06)' : 'scale(1)',
                transition: 'all 0.7s ease',
                pointerEvents: 'none',
              }} />
              <TimerRing
                timeRemaining={timeRemaining}
                totalDuration={practice?.duration ?? 1}
                chakra={practice?.chakra ?? 'Preparation'}
                isRunning={isRunning}
                size={isMobile ? 212 : 240}
              />
            </div>

            {/* Guidance panel */}
            {practice && (
              <div
                key={`instruction-${practiceIndex}`}
                style={{
                  flex: 1,
                  minHeight: 0,
                  width: '100%',
                  borderRadius: 14,
                  border: '1px solid var(--border-soft)',
                  background: 'var(--card-bg-soft)',
                  padding: isMobile ? '0.58rem' : '0.8rem',
                  animation: 'fadeUp 0.5s 0.1s ease both',
                  overflow: 'hidden',
                }}
              >
                <div style={{ height: chakraPanelOpen ? '62%' : '100%', minHeight: 120, overflowY: 'auto', transition: 'height 0.3s ease' }}>
                  <InstructionBox instruction={practice.instruction} note={practice.note} chakraColor={cc.dot} />
                </div>

                {chakraMeta && (
                  <div style={{
                    marginTop: 8,
                    borderRadius: 12,
                    border: '1px solid var(--border-soft)',
                    background: 'var(--card-bg-soft)',
                    overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => setChakraPanelOpen(v => !v)}
                      style={{
                        width: '100%',
                        border: 'none',
                        borderBottom: chakraPanelOpen ? '1px solid var(--border-soft)' : 'none',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '9px 10px',
                        cursor: 'pointer',
                        fontFamily: "'Raleway', sans-serif",
                        fontSize: '9px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cc.dot, boxShadow: `0 0 8px ${cc.dot}88` }} />
                      Chakra Reflection
                      <span style={{ flex: 1 }} />
                      {chakraPanelOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {chakraPanelOpen && (
                      <div style={{ padding: '0.72rem 0.75rem 0.78rem', animation: 'fadeIn 0.25s ease both' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                          <InfoChip label="Chakra" value={chakraMeta.displayName} color={cc.dot} />
                          <InfoChip label="Location" value={chakraMeta.bodyLocation} color={cc.dot} />
                          <InfoChip label="Element" value={chakraMeta.element} color={cc.dot} />
                          <InfoChip label="Bija" value={chakraMeta.bijaMantra || '—'} color={cc.dot} />
                        </div>
                        <p style={{ margin: '0 0 7px', fontFamily: "'Raleway', sans-serif", fontSize: '10.5px', lineHeight: 1.65, color: 'var(--text-muted)' }}>
                          {CHAKRA_SHORT_MEANING[practice?.chakra ?? 'Preparation'] ?? chakraMeta.spiritualMeaning.split('.')[0]}
                        </p>
                        {spiritualBenefits.length > 0 && (
                          <div style={{ display: 'grid', gap: 4 }}>
                            {spiritualBenefits.slice(0, 3).map((b, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                                <span style={{ width: 5, height: 5, marginTop: 6, borderRadius: '50%', background: cc.dot, opacity: 0.8, flexShrink: 0 }} />
                                <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', lineHeight: 1.6, color: 'var(--text-muted)' }}>{b}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {showDesktopPlaceholder && (
            <div style={{
              borderRadius: 18,
              border: '1px solid var(--border-soft)',
              background: 'var(--card-bg-soft)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}>
              <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateRows: '1fr auto', gap: 10 }}>
                <ChakraBodyMap activeChakra={practice?.chakra ?? 'Preparation'} pulse={practiceTransition} />
                <div style={{ textAlign: 'center', fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Subtle Body Axis
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audio controls */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '0.3rem 1.2rem 0',
        flexShrink: 0, position: 'relative', zIndex: 2, flexWrap: 'wrap',
        opacity: showControls ? 1 : 0.12,
        transition: 'opacity 0.5s ease',
      }}>
        <AudioPill active={voiceOn} onClick={handleToggleVoice}
          icon={voiceOn ? <Mic size={11} /> : <MicOff size={11} />}
          label="Voice" indicator={isSpeaking && voiceOn} />

        <button onClick={() => setShowVoicePicker(true)}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '1px solid var(--border-soft)',
            background: 'transparent', cursor: 'pointer', color: 'var(--text-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>
          <Settings2 size={11} />
        </button>

        <div style={{ width: 1, height: 14, background: 'var(--divider-soft)' }} />

        <AudioPill active={ambientOn} onClick={handleToggleAmbient}
          icon={<Music size={11} style={{ opacity: ambientOn ? 1 : 0.35 }} />}
          label="Ambient" />

        <div style={{ width: 1, height: 14, background: 'var(--divider-soft)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Volume2 size={10} color="var(--text-subtle)" />
          <input type="range" min="0" max="100"
            value={Math.round(ambientVol * 100)}
            onChange={e => handleVolumeChange(Number(e.target.value))}
            className="vol-slider" style={{ width: 54 }} />
        </div>
      </div>

      {/* Playback controls */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 14, padding: '0.6rem 1.2rem',
        paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom, 0px))',
        flexShrink: 0, position: 'relative', zIndex: 2,
        opacity: showControls ? 1 : 0.12,
        transition: 'opacity 0.5s ease',
      }}>
        <ControlBtn onClick={handleRestart} title="Restart">
          <RotateCcw size={18} strokeWidth={1.6} />
        </ControlBtn>

        <button
          onClick={togglePlayPause}
          style={{
            width: 70, height: 70, borderRadius: '50%',
            background: isRunning
              ? `rgba(${hexToRgb(cc.dot)},0.13)`
              : 'rgba(200,169,110,0.09)',
            border: `2px solid ${isRunning ? cc.dot : 'rgba(200,169,110,0.4)'}`,
            cursor: 'pointer', color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.28s ease',
            boxShadow: isRunning
              ? `0 0 30px ${cc.dot}44, inset 0 0 14px ${cc.dot}10`
              : '0 2px 18px rgba(0,0,0,0.35)',
            animation: isRunning ? 'pulse-ring 3s ease-out infinite' : 'none',
          }}
        >
          {isRunning
            ? <Pause size={28} fill="currentColor" />
            : <Play size={28} fill="currentColor" style={{ marginLeft: 3 }} />}
        </button>

        <ControlBtn onClick={handleSkip} title="Next practice">
          <SkipForward size={18} strokeWidth={1.6} />
        </ControlBtn>
      </div>

      {/* Narration bar */}
      {narrationText && voiceOn && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '8px 1.4rem',
          background: 'var(--narration-bg)',
          fontFamily: "'Raleway', sans-serif",
          fontSize: '10.5px', color: 'var(--text-muted)',
          fontStyle: 'italic', letterSpacing: '0.03em',
          textAlign: 'center', lineHeight: 1.55,
          borderTop: '1px solid var(--narration-border)',
          zIndex: 10, animation: 'fadeIn 0.4s ease',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{ color: cc.dot, opacity: 0.55, marginRight: 5, fontSize: 9 }}>✦</span>
          {narrationText}
        </div>
      )}

      {showVoicePicker && (
        <VoicePicker
          onClose={() => setShowVoicePicker(false)}
          guidanceMode={guidanceMode}
          onGuidanceModeChange={handleGuidanceModeChange}
        />
      )}

      {showChakraOverlay && practice && (
        <ChakraOverlay
          chakra={practice.chakra}
          onClose={() => setShowChakraOverlay(false)}
        />
      )}
    </div>
  );
}

function AudioPill({
  active, onClick, icon, label, indicator,
}: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; indicator?: boolean;
}) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 16,
      border: active ? '1px solid rgba(200,169,110,0.32)' : '1px solid rgba(200,169,110,0.09)',
      background: active ? 'var(--button-ghost-bg)' : 'transparent',
      cursor: 'pointer', color: active ? 'var(--gold-accent)' : 'var(--button-ghost-fg)',
      fontFamily: "'Raleway', sans-serif",
      fontSize: '9.5px', letterSpacing: '0.1em',
      transition: 'all 0.2s',
    }}>
      {icon}
      {label}
      {indicator && (
        <span style={{
          width: 4, height: 4, borderRadius: '50%',
          background: 'var(--gold-accent)', display: 'inline-block',
          animation: 'pulse-dot 1s ease-in-out infinite', marginLeft: 1,
        }} />
      )}
    </button>
  );
}

function ControlBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title}
      style={{
        width: 52, height: 52, borderRadius: '50%',
        border: '1px solid rgba(200,169,110,0.11)',
        background: 'var(--button-ghost-bg)',
        cursor: 'pointer', color: 'var(--button-ghost-fg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,169,110,0.28)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold-accent)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,169,110,0.11)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--button-ghost-fg)';
      }}
    >
      {children}
    </button>
  );
}

function InfoChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: '4px 8px',
      borderRadius: 8,
      border: `1px solid ${color}22`,
      background: `${color}0F`,
      minWidth: 90,
    }}>
      <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '7px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: 'var(--text-muted)', lineHeight: 1.35 }}>
        {value}
      </div>
    </div>
  );
}

function ChakraBodyMap({
  activeChakra,
  compact = false,
  pulse = false,
}: {
  activeChakra: ChakraKey;
  compact?: boolean;
  pulse?: boolean;
}) {
  const nodeSize = compact ? 8 : 12;
  const activeAll = activeChakra === 'All Chakras';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', opacity: 0.88 }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at 50% 35%, ${CHAKRA_MAP[activeChakra].dot}20 0%, transparent 62%)`,
        transition: 'background 0.8s ease, opacity 0.8s ease, transform 0.8s ease',
        transform: `scale(${pulse ? 1.04 : 1})`,
        opacity: pulse ? 1 : 0.88,
        pointerEvents: 'none',
      }} />

      {!compact && (
        <svg width="100%" height="100%" viewBox="0 0 120 260" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0 }}>
          <path
            d="M60 20c-8 0-14 7-14 15 0 7 4 12 10 14v18l-20 22c-8 9-10 22-7 35l8 32c1 6 7 10 13 9l10-2v55h8v-55l10 2c6 1 12-3 13-9l8-32c3-13 1-26-7-35L64 67V49c6-2 10-7 10-14 0-8-6-15-14-15Z"
            fill="none"
            stroke="rgba(200,169,110,0.14)"
            strokeWidth="1.1"
          />
          <path
            d="M60 44v170"
            stroke="rgba(200,169,110,0.24)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      )}

      <div style={{
        position: 'absolute',
        left: '50%',
        top: compact ? '9%' : '11%',
        bottom: compact ? '8%' : '9%',
        width: compact ? 1.6 : 2.2,
        transform: 'translateX(-50%)',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(200,169,110,0.16) 14%, rgba(200,169,110,0.3) 50%, rgba(200,169,110,0.14) 84%, transparent 100%)',
      }} />

      {CHAKRA_SEQUENCE.map((key) => {
        const info = CHAKRA_INFO[key];
        if (!info) return null;
        const active = activeAll || key === activeChakra;
        const yPct = info.bodyPositionPercent;
        const dotColor = CHAKRA_MAP[key].dot;
        return (
          <div
            key={key}
            style={{
              position: 'absolute',
              left: '50%',
              top: `${yPct}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              gap: compact ? 0 : 8,
            }}
          >
            <div style={{
              width: nodeSize + (active ? 6 : 0),
              height: nodeSize + (active ? 6 : 0),
              borderRadius: '50%',
              border: `1px solid ${active ? `${dotColor}A0` : 'rgba(200,169,110,0.2)'}`,
              background: active
                ? `radial-gradient(circle, ${dotColor}D0 0%, ${dotColor}35 52%, transparent 100%)`
                : 'rgba(200,169,110,0.12)',
              boxShadow: active ? `0 0 16px ${dotColor}88` : 'none',
              animation: active ? 'pulse-dot 3s ease-in-out infinite' : 'none',
              transition: 'all 0.45s ease',
            }} />
            {!compact && (
              <span style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: '8px',
                letterSpacing: '0.08em',
                color: active ? dotColor : '#635747',
                textTransform: 'uppercase',
                opacity: active ? 0.95 : 0.58,
                transition: 'all 0.4s ease',
              }}>
                {key}
              </span>
            )}
          </div>
        );
      })}

      {!compact && (
        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: '4%',
          transform: 'translateX(-50%)',
          fontFamily: "'Raleway', sans-serif",
          fontSize: '8px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(200,169,110,0.55)',
        }}>
          Body Awareness
        </div>
      )}
    </div>
  );
}
