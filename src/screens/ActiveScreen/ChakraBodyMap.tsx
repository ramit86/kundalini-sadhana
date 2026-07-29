import { CHAKRA_MAP, ChakraKey } from '../../data/sessions';
import { CHAKRA_INFO } from '../../data/chakraInfo';
import { CHAKRA_SEQUENCE } from './chakraCopy';

interface Props {
  activeChakra: ChakraKey;
  compact?: boolean;
  pulse?: boolean;
}

export default function ChakraBodyMap({ activeChakra, compact = false, pulse = false }: Props) {
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
