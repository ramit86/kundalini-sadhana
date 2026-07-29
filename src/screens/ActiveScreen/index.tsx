import { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { Session, CHAKRA_MAP } from '../../data/sessions';
import TimerRing from '../../components/TimerRing';
import ChakraDots from '../../components/ChakraDots';
import InstructionBox from '../../components/InstructionBox';
import ChakraOverlay from '../../components/ChakraOverlay';
import { CHAKRA_INFO } from '../../data/chakraInfo';
import { useSessionPlayback } from './useSessionPlayback';
import SessionBackdrop from './SessionBackdrop';
import SessionHeader from './SessionHeader';
import ChakraBanner from './ChakraBanner';
import ChakraReflectionPanel from './ChakraReflectionPanel';
import ChakraBodyMap from './ChakraBodyMap';
import AudioControlsBar from './AudioControlsBar';
import TransportControls from './TransportControls';

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
  const [showChakraOverlay, setShowChakraOverlay] = useState(false);
  const [chakraPanelOpen, setChakraPanelOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  const isMobile = viewportWidth < 700;
  const showDesktopPlaceholder = viewportWidth >= 1180;

  const {
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
    transitionDebug,
    sessionPhase,
    isOpening,
    isClosing,
    practiceStates,
    closingSilentRemaining,
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
  } = useSessionPlayback({
    session,
    initialPracticeIndex,
    initialTimeRemaining,
    isMobile,
    onEnd,
    onGoHome,
    onCancelToday,
  });

  const cc = CHAKRA_MAP[practice?.chakra] ?? CHAKRA_MAP['Preparation'];
  const chakraInfo = practice ? CHAKRA_INFO[practice.chakra] : undefined;

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

  if (isOpening) {
    return (
      <OpeningRitualScreen
        isMobile={isMobile}
        phase={sessionPhase}
        onSkip={skipInvocation}
      />
    );
  }

  if (isClosing) {
    return (
      <ClosingRitualScreen
        isMobile={isMobile}
        phase={sessionPhase}
        message={session.end}
        secondsRemaining={closingSilentRemaining}
        onEndSitting={finishSilentSitting}
        onComplete={completeSession}
      />
    );
  }

  const totalDone = session.practices.slice(0, practiceIndex).reduce((s, p) => s + p.duration, 0);
  const totalAll = session.practices.reduce((s, p) => s + p.duration, 0);
  const progressPct = Math.round((totalDone / totalAll) * 100);
  const isMorning = session.key === 'morning';

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
      <SessionBackdrop
        chakraColor={cc.dot}
        isRunning={isRunning}
        bellFlash={bellFlash}
        practiceTransition={practiceTransition}
        auraTransitionPulse={auraTransitionPulse}
      />

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

      <SessionHeader
        session={session}
        practiceIndex={practiceIndex}
        isMobile={isMobile}
        isMorning={isMorning}
        isRunning={isRunning}
        showControls={showControls}
        wakeLockMode={wakeLockMode}
        audioDebug={audioDebug}
        transitionDebug={transitionDebug}
        onGoHome={handleGoHome}
        onCancelToday={handleCancelToday}
      />

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

      <div style={{
        position: 'relative',
        zIndex: 2,
        flexShrink: 0,
        padding: isMobile ? '0.15rem 0.48rem 0.05rem' : '0.15rem 1rem 0.05rem',
      }}>
        <div
          style={{
            display: 'flex',
            gap: isMobile ? 4 : 8,
            overflowX: 'auto',
            paddingBottom: 2,
            scrollbarWidth: 'none',
          }}
        >
          {session.practices.map((item, idx) => {
            const state = practiceStates[idx];
            const isCurrent = idx === practiceIndex;
            const isCompleted = state?.completed === true || (idx < practiceIndex && !isCurrent);
            const status = isCurrent ? 'Current' : isCompleted ? 'Completed' : 'Upcoming';
            const clickable = isCompleted && !isCurrent;
            const accent = isCurrent ? cc.dot : isCompleted ? 'var(--gold-accent)' : 'var(--text-subtle)';
            return (
              <button
                key={item.name}
                onClick={() => clickable && handleOpenPractice(idx)}
                disabled={!clickable}
                style={{
                  minWidth: isMobile ? 112 : 132,
                  borderRadius: 0,
                  border: 0,
                  borderBottom: `1px solid ${isCurrent ? cc.dot + '88' : 'transparent'}`,
                  background: 'transparent',
                  padding: '0.38rem 0.48rem 0.46rem',
                  textAlign: 'left',
                  cursor: clickable ? 'pointer' : 'default',
                  opacity: isCurrent ? 1 : isCompleted ? 0.68 : 0.38,
                  flexShrink: 0,
                }}
              >
                <div style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '7.5px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: accent,
                  marginBottom: 3,
                }}>
                  {status}
                </div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                  marginBottom: 4,
                }}>
                  {item.name}
                </div>
                <div style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '8px',
                  letterSpacing: '0.08em',
                  color: 'var(--text-subtle)',
                  textTransform: 'uppercase',
                }}>
                  {idx + 1} of {session.practices.length}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main body */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: isMobile ? '0.1rem 0.62rem 0.38rem' : '0.35rem 1.25rem 0.55rem',
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
          gap: showDesktopPlaceholder ? 18 : 0,
          alignItems: 'stretch',
        }}>
          <div style={{
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 20,
            background: 'color-mix(in srgb, var(--card-bg-alt) 52%, transparent)',
            border: '1px solid transparent',
            boxShadow: 'none',
            padding: isMobile ? '0.72rem' : '1rem 1.08rem',
            overflow: 'hidden',
            backdropFilter: 'blur(3px)',
            width: '100%',
          }}>
            <ChakraBanner
              practice={practice}
              practiceIndex={practiceIndex}
              chakraColor={cc.dot}
              chakraTextColor={cc.text}
              chakraInfo={chakraInfo}
              isRunning={isRunning}
              onOpenChakraOverlay={() => setShowChakraOverlay(true)}
            />

            {!showDesktopPlaceholder && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0.2rem 0 0.55rem' }}>
                <div style={{
                  width: '100%',
                  maxWidth: 180,
                  borderRadius: 16,
                  border: '1px solid transparent',
                  background: 'transparent',
                  padding: '0.4rem',
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
              margin: '0.15rem 0 0.5rem',
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
                opacity: 0.26,
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute',
                width: 248,
                height: 248,
                borderRadius: '50%',
                border: `1px solid ${cc.dot}18`,
                boxShadow: bellFlash ? `0 0 26px ${cc.dot}66` : `0 0 12px ${cc.dot}22`,
                opacity: practiceTransition ? 0.78 : 0.3,
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
                  border: '1px solid transparent',
                  background: 'color-mix(in srgb, var(--card-bg-soft) 58%, transparent)',
                  padding: isMobile ? '0.66rem' : '0.9rem',
                  animation: 'fadeUp 0.5s 0.1s ease both',
                  overflow: 'hidden',
                }}
              >
                <div style={{ height: chakraPanelOpen ? '62%' : '100%', minHeight: 120, overflowY: 'auto', transition: 'height 0.3s ease' }}>
                  <InstructionBox instruction={practice.instruction} note={practice.note} chakraColor={cc.dot} />
                </div>

                <ChakraReflectionPanel
                  chakra={practice?.chakra}
                  chakraColor={cc.dot}
                  open={chakraPanelOpen}
                  onToggle={() => setChakraPanelOpen(v => !v)}
                />
              </div>
            )}
          </div>

          {showDesktopPlaceholder && (
            <div style={{
              borderRadius: 20,
              border: '1px solid transparent',
              background: 'color-mix(in srgb, var(--card-bg-soft) 46%, transparent)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.1rem',
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

      <AudioControlsBar
        ambientOn={ambientOn}
        ambientVol={ambientVol}
        showControls={showControls}
        onToggleAmbient={handleToggleAmbient}
        onVolumeChange={handleVolumeChange}
      />

      <TransportControls
        isRunning={isRunning}
        chakraColor={cc.dot}
        showControls={showControls}
        onRestart={handleRestart}
        onTogglePlayPause={togglePlayPause}
        onSkip={handleSkip}
      />

      {showChakraOverlay && practice && (
        <ChakraOverlay
          chakra={practice.chakra}
          onClose={() => setShowChakraOverlay(false)}
        />
      )}
    </div>
  );
}

function RitualShell({
  children,
  isMobile,
}: {
  children: ReactNode;
  isMobile: boolean;
}) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      padding: isMobile ? '1.4rem' : '2.4rem',
      background: 'radial-gradient(circle at 50% 38%, rgba(200,169,110,0.09), transparent 32%), linear-gradient(180deg, #0c0906 0%, #080706 100%)',
      color: '#EDE5DA',
    }}>
      <div style={{
        position: 'absolute',
        width: isMobile ? 280 : 430,
        height: isMobile ? 280 : 430,
        borderRadius: '50%',
        border: '1px solid rgba(200,169,110,0.08)',
        boxShadow: '0 0 90px rgba(200,169,110,0.05)',
        animation: 'breathe-slow 12s ease-in-out infinite',
      }} />
      <div style={{
        width: '100%',
        maxWidth: 580,
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        animation: 'fadeUp 1.2s ease both',
      }}>
        {children}
      </div>
    </div>
  );
}

function OpeningRitualScreen({
  isMobile,
  phase,
  onSkip,
}: {
  isMobile: boolean;
  phase: string;
  onSkip: () => void;
}) {
  const isInvocation = phase === 'opening_invocation';
  return (
    <RitualShell isMobile={isMobile}>
      <div style={{
        fontFamily: "'Raleway', sans-serif",
        fontSize: '8px',
        color: 'rgba(200,169,110,0.72)',
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        marginBottom: isMobile ? 22 : 30,
      }}>
        {isInvocation ? 'Opening Mantra' : 'Enter the practice'}
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: isMobile ? '1.72rem' : '2.25rem',
        color: '#F0E8DC',
        lineHeight: 1.52,
        whiteSpace: 'pre-line',
        textShadow: '0 0 42px rgba(200,169,110,0.12)',
        opacity: isInvocation ? 1 : 0.58,
        transition: 'opacity 1.2s ease',
      }}>
        {'ॐ असतो मा सद्गमय ।\nतमसो मा ज्योतिर्गमय ।\nमृत्योर्मा अमृतं गमय ।\nॐ शान्तिः शान्तिः शान्तिः ॥'}
      </div>
      <div style={{
        width: 32,
        height: 1,
        margin: '22px auto',
        background: 'rgba(200,169,110,0.32)',
      }} />
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: isMobile ? '0.98rem' : '1.08rem',
        color: 'rgba(237,229,218,0.54)',
        lineHeight: 1.8,
        whiteSpace: 'pre-line',
        fontStyle: 'italic',
      }}>
        {'Lead me from the unreal to the real.\nLead me from darkness to light.\nLead me from mortality to immortality.\nOm, peace, peace, peace.'}
      </div>
      <button
        onClick={onSkip}
        style={{
          marginTop: isMobile ? 28 : 38,
          padding: '7px 10px',
          border: 0,
          background: 'transparent',
          color: 'rgba(237,229,218,0.32)',
          fontFamily: "'Raleway', sans-serif",
          fontSize: '7px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Skip invocation
      </button>
    </RitualShell>
  );
}

function ClosingRitualScreen({
  isMobile,
  phase,
  message,
  secondsRemaining,
  onEndSitting,
  onComplete,
}: {
  isMobile: boolean;
  phase: string;
  message: string;
  secondsRemaining: number;
  onEndSitting: () => void;
  onComplete: () => void;
}) {
  const isSitting = phase === 'closing_sitting';
  const isComplete = phase === 'closing_complete';
  const showClosingMessage = phase === 'closing_message';
  const title = isComplete
    ? 'The practice is complete'
    : isSitting
      ? 'Remain in stillness'
      : phase === 'closing_message'
        ? 'Carry the practice gently'
        : 'Let the practice settle';

  return (
    <RitualShell isMobile={isMobile}>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: isMobile ? '2.8rem' : '3.5rem',
        color: 'rgba(200,169,110,0.78)',
        lineHeight: 1,
        marginBottom: 24,
        textShadow: '0 0 48px rgba(200,169,110,0.2)',
      }}>
        ॐ
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: isMobile ? '1.75rem' : '2.2rem',
        fontWeight: 300,
        marginBottom: 16,
      }}>
        {title}
      </div>
      <div style={{
        maxWidth: 430,
        margin: '0 auto',
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: isMobile ? '1rem' : '1.12rem',
        lineHeight: 1.8,
        color: 'rgba(237,229,218,0.55)',
        whiteSpace: 'pre-line',
        fontStyle: 'italic',
        opacity: showClosingMessage ? 1 : 0,
        transition: 'opacity 1s ease',
      }}>
        {showClosingMessage ? message : '\u00a0'}
      </div>

      {isSitting && (
        <>
          <div style={{
            marginTop: 28,
            fontFamily: "'Raleway', sans-serif",
            fontSize: '8px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(200,169,110,0.55)',
          }}>
            {secondsRemaining} seconds of silence
          </div>
          <button onClick={onEndSitting} style={quietRitualButtonStyle}>
            End silent sitting
          </button>
        </>
      )}

      {isComplete && (
        <button onClick={onComplete} style={{
          ...quietRitualButtonStyle,
          color: 'rgba(237,229,218,0.78)',
          borderColor: 'rgba(200,169,110,0.22)',
        }}>
          Complete session
        </button>
      )}
    </RitualShell>
  );
}

const quietRitualButtonStyle: CSSProperties = {
  marginTop: 28,
  padding: '9px 14px',
  borderRadius: 18,
  border: '1px solid rgba(200,169,110,0.12)',
  background: 'transparent',
  color: 'rgba(237,229,218,0.4)',
  fontFamily: "'Raleway', sans-serif",
  fontSize: '7px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};
