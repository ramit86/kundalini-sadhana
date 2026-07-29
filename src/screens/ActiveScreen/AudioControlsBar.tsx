import { MicOff, Music, Settings2, Volume2 } from 'lucide-react';
import AudioPill from './AudioPill';

const NARRATION_TEMP_DISABLED = true;

interface Props {
  ambientOn: boolean;
  ambientVol: number;
  showControls: boolean;
  onToggleAmbient: () => void;
  onVolumeChange: (v: number) => void;
}

export default function AudioControlsBar({
  ambientOn, ambientVol, showControls, onToggleAmbient, onVolumeChange,
}: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 6, padding: '0.3rem 1.2rem 0',
      flexShrink: 0, position: 'relative', zIndex: 2, flexWrap: 'wrap',
      opacity: showControls ? 1 : 0.12,
      transition: 'opacity 0.5s ease',
    }}>
      <AudioPill
        active={false}
        disabled={NARRATION_TEMP_DISABLED}
        icon={<MicOff size={11} />}
        label={NARRATION_TEMP_DISABLED ? 'Voice Soon' : 'Voice'}
      />

      <button
        disabled={NARRATION_TEMP_DISABLED}
        style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '1px solid var(--border-soft)',
          background: 'transparent', cursor: NARRATION_TEMP_DISABLED ? 'not-allowed' : 'pointer', color: 'var(--text-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', opacity: NARRATION_TEMP_DISABLED ? 0.45 : 1,
        }}>
        <Settings2 size={11} />
      </button>

      <div style={{ width: 1, height: 14, background: 'var(--divider-soft)' }} />

      <AudioPill active={ambientOn} onClick={onToggleAmbient}
        icon={<Music size={11} style={{ opacity: ambientOn ? 1 : 0.35 }} />}
        label="Ambient" />

      <div style={{ width: 1, height: 14, background: 'var(--divider-soft)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Volume2 size={10} color="var(--text-subtle)" />
        <input type="range" min="0" max="100"
          value={Math.round(ambientVol * 100)}
          onChange={e => onVolumeChange(Number(e.target.value))}
          className="vol-slider" style={{ width: 54 }} />
      </div>
    </div>
  );
}
