import { useEffect, useState } from 'react';
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
    resetControlsTimer,
    togglePlayPause,
    handleRestart,
    handleSkip,
    handleGoHome,
    handleCancelToday,
    handleToggleAmbient,
    handleVolumeChange,
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
            background: 'var(--card-bg-alt)',
            border: '1px solid var(--border-soft)',
            boxShadow: 'var(--shadow-soft)',
            padding: isMobile ? '0.72rem' : '1rem 1.08rem',
            overflow: 'hidden',
            backdropFilter: 'blur(5px)',
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
                  border: '1px solid color-mix(in srgb, var(--border-soft) 70%, transparent)',
                  background: 'var(--card-bg-soft)',
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
                  border: '1px solid color-mix(in srgb, var(--border-soft) 70%, transparent)',
                  background: 'var(--card-bg-soft)',
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
              border: '1px solid color-mix(in srgb, var(--border-soft) 70%, transparent)',
              background: 'var(--card-bg-soft)',
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
