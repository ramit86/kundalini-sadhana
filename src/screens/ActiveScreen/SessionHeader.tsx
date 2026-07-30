import { CSSProperties } from 'react';
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
  transitionDebug: {
    id: number;
    state: string;
    sourcePractice: string;
    destinationPractice: string;
    event: string;
  };
  onGoHome: () => void;
  onCancelToday: () => void;
}

export default function SessionHeader({
  session, practiceIndex, isMobile, isMorning, isRunning, showControls,
  wakeLockMode, audioDebug, transitionDebug, onGoHome, onCancelToday,
}: Props) {
  return (
    <div style={{
      padding: isMobile ? '0.45rem 0.65rem 0.25rem' : '0.55rem 1.15rem 0.35rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      flexShrink: 0, position: 'relative', zIndex: 2,
      opacity: showControls ? 1 : 0,
      transition: 'opacity 0.5s ease',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
        <span style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '8px',
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: isMorning ? 'rgba(242,200,120,0.72)' : 'rgba(168,181,232,0.72)',
          whiteSpace: 'nowrap',
        }}>
          {session.label}
        </span>
        <span style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '8px',
          color: 'var(--text-subtle)',
          letterSpacing: '0.1em',
          whiteSpace: 'nowrap',
        }}>
          {practiceIndex + 1} / {session.practices.length}
        </span>
        {!isMobile && isRunning && (
          <span style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: '6.5px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: wakeLockMode === 'full' ? 'rgba(111,203,111,0.58)' : 'rgba(200,169,110,0.58)',
            whiteSpace: 'nowrap',
          }}>
            {wakeLockMode === 'full' ? 'Screen awake' : 'Wake limited'}
          </span>
        )}
        {!isMobile && import.meta.env.DEV && (
          <span style={{
            color: 'var(--text-subtle)',
            fontFamily: "'Raleway', sans-serif",
            fontSize: '6px',
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
          }}>
            {audioDebug.state} · ambient {audioDebug.ambientActive ? 'on' : 'off'} · {transitionDebug.state}
            {audioDebug.ambientMissing ? ' · file missing' : ''}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
        <button
          onClick={onGoHome}
          aria-label="Return home"
          title="Return home"
          style={quietHeaderButtonStyle}
        >
          <Home size={12} />
        </button>
        <button
          onClick={onCancelToday}
          aria-label="Cancel today's session"
          title="Cancel today's session"
          style={{ ...quietHeaderButtonStyle, color: 'rgba(224,112,112,0.56)' }}
        >
          <XCircle size={12} />
        </button>
      </div>
    </div>
  );
}

const quietHeaderButtonStyle: CSSProperties = {
  width: 30,
  height: 30,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 0,
  borderRadius: '50%',
  background: 'transparent',
  color: 'var(--text-muted)',
  cursor: 'pointer',
};
