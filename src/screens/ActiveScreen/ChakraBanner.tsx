import { Info } from 'lucide-react';
import { Practice } from '../../data/sessions';
import { ChakraInfo } from '../../data/chakraInfo';

interface Props {
  practice: Practice | undefined;
  practiceIndex: number;
  chakraColor: string;
  chakraTextColor: string;
  chakraInfo: ChakraInfo | undefined;
  isRunning: boolean;
  onOpenChakraOverlay: () => void;
}

export default function ChakraBanner({
  practice, practiceIndex, chakraColor, chakraTextColor, chakraInfo, isRunning, onOpenChakraOverlay,
}: Props) {
  return (
    <div
      key={`chakra-${practiceIndex}`}
      style={{
        flexShrink: 0,
        margin: '0 0 0.65rem',
        padding: '0.62rem 0.9rem',
        borderRadius: 14,
        background: `linear-gradient(135deg, ${chakraColor}12 0%, ${chakraColor}06 100%)`,
        border: `1px solid ${chakraColor}1f`,
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
        background: `radial-gradient(ellipse, ${chakraColor}24 0%, transparent 72%)`,
        filter: 'blur(18px)', pointerEvents: 'none',
        animation: isRunning ? 'breathe-active 5s ease-in-out infinite' : 'none',
      }} />

      {/* Phase label + practice name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '7.5px', letterSpacing: '0.32em', textTransform: 'uppercase', color: chakraColor, opacity: 0.7, marginBottom: 2 }}>
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
          onClick={onOpenChakraOverlay}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 10,
            background: `${chakraColor}18`, border: `1px solid ${chakraColor}40`,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          {/* Pulsing chakra dot */}
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: chakraColor, flexShrink: 0,
            boxShadow: `0 0 8px ${chakraColor}, 0 0 16px ${chakraColor}66`,
            animation: isRunning ? 'pulse-dot 2.5s ease-in-out infinite' : 'none',
            display: 'inline-block',
          }} />
          <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.08em', color: chakraTextColor, fontWeight: 400 }}>
            {practice?.chakra}
          </span>
          <Info size={9} color={`${chakraColor}99`} />
        </button>
        {/* Body position chip */}
        {chakraInfo?.bodyLocation && (
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '7.5px', color: `${chakraColor}77`, letterSpacing: '0.04em', textAlign: 'right' }}>
            {chakraInfo.bodyLocation}
          </div>
        )}
      </div>
    </div>
  );
}
