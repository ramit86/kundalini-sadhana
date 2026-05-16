import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  getSortedVoices,
  setSelectedVoice,
  getSelectedVoice,
  previewVoice,
  getNarrationRate,
  setNarrationRate,
} from '../audio/voiceManager';
import { GuidanceMode } from '../audio/voiceManager';

interface Props {
  onClose: () => void;
  guidanceMode: GuidanceMode;
  onGuidanceModeChange: (m: GuidanceMode) => void;
}

export default function VoicePicker({ onClose, guidanceMode, onGuidanceModeChange }: Props) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [rate, setRate] = useState(getNarrationRate());

  useEffect(() => {
    const load = () => {
      const sorted = getSortedVoices();
      setVoices(sorted);
      const cur = getSelectedVoice();
      if (cur) {
        const idx = sorted.findIndex(v => v.name === cur.name);
        if (idx >= 0) setSelectedIdx(idx);
      }
    };
    load();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = load;
    }
  }, []);

  const handleConfirm = () => {
    if (voices[selectedIdx]) setSelectedVoice(voices[selectedIdx]);
    setNarrationRate(rate);
    onClose();
  };

  const handlePreview = () => {
    if (voices[selectedIdx]) {
      setSelectedVoice(voices[selectedIdx]);
      previewVoice(voices[selectedIdx]);
    }
  };

  const MODES: { key: GuidanceMode; label: string; sub: string }[] = [
    { key: 'full',    label: 'Full Guidance',    sub: 'Complete instructions + notes' },
    { key: 'minimal', label: 'Minimal Guidance', sub: 'Opening lines only' },
    { key: 'silent',  label: 'Silent Mode',      sub: 'No narration' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(8,6,4,0.88)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg flex flex-col gap-4"
        style={{
          background: '#1A1612',
          borderRadius: '20px 20px 0 0',
          borderTop: '1px solid rgba(200,169,110,0.2)',
          padding: '1.4rem 1.4rem calc(1.6rem + env(safe-area-inset-bottom, 0px))',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span style={{
            fontSize: '11px', letterSpacing: '0.28em',
            textTransform: 'uppercase', color: '#C8A96E',
          }}>
            Voice & Guidance Settings
          </span>
          <button onClick={onClose} style={{ color: '#6B5E50', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Guidance mode */}
        <div>
          <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6B5E50', marginBottom: 8 }}>
            Guidance Mode
          </div>
          <div className="flex flex-col gap-2">
            {MODES.map(m => (
              <button
                key={m.key}
                onClick={() => onGuidanceModeChange(m.key)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: guidanceMode === m.key
                    ? '1px solid rgba(200,169,110,0.5)'
                    : '1px solid rgba(200,169,110,0.12)',
                  background: guidanceMode === m.key
                    ? 'rgba(200,169,110,0.08)'
                    : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '13px',
                  color: guidanceMode === m.key ? '#E8DDD0' : '#A89880',
                }}>
                  {m.label}
                </span>
                <span style={{ fontSize: '11px', color: '#6B5E50', marginTop: 2 }}>{m.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Voice selector */}
        {guidanceMode !== 'silent' && (
          <>
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6B5E50', marginBottom: 8 }}>
                Guide Voice
              </div>
              <p style={{ fontSize: '11.5px', color: '#6B5E50', lineHeight: 1.6, marginBottom: 10 }}>
                Indian English voices appear at the top. On Android look for <strong style={{ color: '#A89880' }}>Google en-IN</strong>.
              </p>
              <select
                value={selectedIdx}
                onChange={e => setSelectedIdx(Number(e.target.value))}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: '#231E18',
                  border: '1px solid rgba(200,169,110,0.2)',
                  borderRadius: 8,
                  color: '#E8DDD0',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '13px',
                  outline: 'none',
                  WebkitAppearance: 'none',
                }}
              >
                {voices.map((v, i) => (
                  <option key={i} value={i}>{v.name} ({v.lang})</option>
                ))}
              </select>
            </div>

            {/* Speed */}
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6B5E50', marginBottom: 8 }}>
                Narration Speed
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '11px', color: '#6B5E50' }}>Slow</span>
                <input
                  type="range" min="0.5" max="1.1" step="0.05"
                  value={rate}
                  onChange={e => setRate(parseFloat(e.target.value))}
                  className="vol-slider flex-1"
                />
                <span style={{ fontSize: '11px', color: '#6B5E50' }}>Fast</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePreview}
                style={{
                  flex: 1, padding: '10px',
                  borderRadius: 10,
                  border: '1px solid rgba(200,169,110,0.2)',
                  background: 'transparent',
                  color: '#A89880',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                ▶ Preview
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1, padding: '10px',
                  borderRadius: 10,
                  border: '1px solid rgba(200,169,110,0.4)',
                  background: 'rgba(200,169,110,0.1)',
                  color: '#E8DDD0',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          </>
        )}

        {guidanceMode === 'silent' && (
          <button
            onClick={handleConfirm}
            style={{
              padding: '10px',
              borderRadius: 10,
              border: '1px solid rgba(200,169,110,0.4)',
              background: 'rgba(200,169,110,0.1)',
              color: '#E8DDD0',
              fontFamily: "'Raleway', sans-serif",
              fontSize: '12px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            Save Settings
          </button>
        )}
      </div>
    </div>
  );
}
