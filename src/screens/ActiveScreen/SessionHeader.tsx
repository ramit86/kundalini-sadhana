import { Home, XCircle } from 'lucide-react';
import { Session } from '../../data/sessions';
import { getAudioContextState } from '../../audio/audioManager';
import { WakeLockMode } from '../../utils/wakeLock';

interface Props {
  session: Session;
  practiceIndex: number;
  isMobile: boolean;
  isMorning: boolean;
  isRunning: boolean;
  showControls: boolean;
  wakeLockMode: WakeLockMode;
  audioDebug: {
    state: ReturnType<typeof getAudioContextState>;
    ambientActive: boolean;
    ambientMissing: boolean;
  };
  onGoHome: () => void;
  onCancelToday: () => void;
}

export default function SessionHeader({
  session, practiceIndex, isMobile, isMorning, isRunning, showControls,
  wakeLockMode, audioDebug, onGoHome, onCancelToday,
}: Props) {
  const sessionBadge = (
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
  );

  return (
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
            {sessionBadge}
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
              onClick={onGoHome}
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
              onClick={onCancelToday}
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
            {sessionBadge}
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
              onClick={onGoHome}
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
              onClick={onCancelToday}
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
  );
}
