import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import ControlBtn from './ControlBtn';

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

interface Props {
  isRunning: boolean;
  chakraColor: string;
  showControls: boolean;
  onRestart: () => void;
  onTogglePlayPause: () => void;
  onSkip: () => void;
}

export default function TransportControls({
  isRunning, chakraColor, showControls, onRestart, onTogglePlayPause, onSkip,
}: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 14, padding: '0.6rem 1.2rem',
      paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom, 0px))',
      flexShrink: 0, position: 'relative', zIndex: 2,
      opacity: showControls ? 1 : 0.12,
      transition: 'opacity 0.5s ease',
    }}>
      <ControlBtn onClick={onRestart} title="Restart">
        <RotateCcw size={18} strokeWidth={1.6} />
      </ControlBtn>

      <button
        onClick={onTogglePlayPause}
        style={{
          width: 70, height: 70, borderRadius: '50%',
          background: isRunning
            ? `rgba(${hexToRgb(chakraColor)},0.13)`
            : 'rgba(200,169,110,0.09)',
          border: `2px solid ${isRunning ? chakraColor : 'rgba(200,169,110,0.4)'}`,
          cursor: 'pointer', color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.28s ease',
          boxShadow: isRunning
            ? `0 0 30px ${chakraColor}44, inset 0 0 14px ${chakraColor}10`
            : '0 2px 18px rgba(0,0,0,0.35)',
          animation: isRunning ? 'pulse-ring 3s ease-out infinite' : 'none',
        }}
      >
        {isRunning
          ? <Pause size={28} fill="currentColor" />
          : <Play size={28} fill="currentColor" style={{ marginLeft: 3 }} />}
      </button>

      <ControlBtn onClick={onSkip} title="Next practice">
        <SkipForward size={18} strokeWidth={1.6} />
      </ControlBtn>
    </div>
  );
}
