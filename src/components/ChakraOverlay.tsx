import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ChakraKey } from '../data/sessions';
import { CHAKRA_INFO } from '../data/chakraInfo';

interface Props {
  chakra: ChakraKey;
  onClose: () => void;
}

const CHAKRA_DOTS: { key: ChakraKey; y: number; color: string }[] = [
  { key: 'Bindu',        y: 6,  color: '#AA44CC' },
  { key: 'Ajna',         y: 13, color: '#6650CC' },
  { key: 'Vishuddhi',    y: 26, color: '#3090D8' },
  { key: 'Anahata',      y: 44, color: '#48B048' },
  { key: 'Manipura',     y: 60, color: '#DDB800' },
  { key: 'Swadhisthana', y: 74, color: '#E87820' },
  { key: 'Mooladhara',   y: 88, color: '#E04040' },
];

export default function ChakraOverlay({ chakra, onClose }: Props) {
  const info = CHAKRA_INFO[chakra];
  const [visible, setVisible] = useState(false);
  const [benefitIdx, setBenefitIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!info) return;
    const interval = setInterval(() => {
      setBenefitIdx(i => (i + 1) % (info.spiritualBenefits.length));
    }, 2800);
    return () => clearInterval(interval);
  }, [info]);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  if (!info) return null;

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(5,4,3,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        padding: '1.2rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520,
          background: 'linear-gradient(160deg, #0E0B08 0%, #0C0906 100%)',
          border: `1px solid ${info.color}28`,
          borderRadius: 20,
          overflow: 'hidden',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(20px)',
          transition: 'transform 0.35s ease',
          maxHeight: '88vh',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header glow strip */}
        <div style={{
          height: 3,
          background: `linear-gradient(to right, transparent, ${info.color}88, transparent)`,
        }} />

        {/* Main content */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {/* Top section: body diagram + chakra info */}
          <div style={{
            display: 'flex', gap: 0,
            padding: '1.4rem 1.4rem 1rem',
          }}>
            {/* Body diagram */}
            <div style={{ position: 'relative', width: 72, flexShrink: 0, marginRight: 18 }}>
              <BodySilhouette activeChakra={chakra} activeColor={info.color} />
            </div>

            {/* Chakra title block */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <div style={{
                    fontFamily: "'Raleway', sans-serif",
                    fontSize: '8px', letterSpacing: '0.35em',
                    textTransform: 'uppercase',
                    color: info.color, marginBottom: 4, opacity: 0.8,
                  }}>
                    {info.element} · {info.bijaMantra && `Bija: ${info.bijaMantra}`}
                  </div>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '1.6rem', fontWeight: 300, color: '#EDE5DA',
                    lineHeight: 1.1, marginBottom: 3,
                  }}>
                    {info.displayName}
                  </div>
                  <div style={{
                    fontFamily: "'Raleway', sans-serif",
                    fontSize: '10px', color: '#6B5E50',
                    letterSpacing: '0.06em', fontWeight: 300,
                  }}>
                    {info.spiritualMeaning}
                  </div>
                </div>
                <button
                  onClick={close}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    border: '1px solid rgba(200,169,110,0.1)',
                    background: 'rgba(255,255,255,0.02)',
                    color: '#5A5040', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Position badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 12,
                background: `${info.color}12`,
                border: `1px solid ${info.color}28`,
                marginBottom: 10,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: info.color, boxShadow: `0 0 8px ${info.color}` }} />
                <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9.5px', color: info.color, letterSpacing: '0.06em' }}>
                  {info.bodyLocation}
                </span>
              </div>

              {/* Description */}
              <p style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: '11px', color: '#7A6B5A',
                lineHeight: 1.7, fontWeight: 300, margin: 0,
              }}>
                {info.spiritualMeaning}
              </p>
            </div>
          </div>

          {/* Animated benefit ticker */}
          <div style={{
            margin: '0 1.4rem',
            padding: '0.85rem 1rem',
            background: `${info.color}08`,
            border: `1px solid ${info.color}1A`,
            borderRadius: 12,
            minHeight: 58,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: '8.5px', letterSpacing: '0.28em',
              textTransform: 'uppercase', color: info.color,
              marginBottom: 6, opacity: 0.7,
            }}>
              Spiritual Benefits
            </div>
            {info.spiritualBenefits.map((b, i) => (
              <div
                key={i}
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.05rem', color: '#DDD5C8',
                  lineHeight: 1.4, fontWeight: 300,
                  position: i === 0 ? 'relative' : 'absolute',
                  top: i === 0 ? 'auto' : '1.7rem', left: i === 0 ? 'auto' : '1rem',
                  right: i === 0 ? 'auto' : '1rem',
                  opacity: benefitIdx === i ? 1 : 0,
                  transform: `translateY(${benefitIdx === i ? '0' : '8px'})`,
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                  pointerEvents: 'none',
                }}
              >
                {b}
              </div>
            ))}
          </div>

          {/* Benefit dots */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 5,
            padding: '0.65rem 0 0.1rem',
          }}>
            {info.spiritualBenefits.map((_, i) => (
              <div
                key={i}
                onClick={() => setBenefitIdx(i)}
                style={{
                  width: benefitIdx === i ? 16 : 5,
                  height: 5, borderRadius: 3,
                  background: benefitIdx === i ? info.color : `${info.color}30`,
                  cursor: 'pointer',
                  transition: 'all 0.35s ease',
                }}
              />
            ))}
          </div>

          {/* All chakra dots on a spine line */}
          <div style={{ padding: '1rem 1.4rem 1.4rem' }}>
            <div style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: '8.5px', letterSpacing: '0.28em',
              textTransform: 'uppercase', color: '#3A3028',
              marginBottom: 10,
            }}>
              Chakra System
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CHAKRA_DOTS.map(cd => (
                <div
                  key={cd.key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 10,
                    background: chakra === cd.key ? `${cd.color}20` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${chakra === cd.key ? cd.color + '44' : 'rgba(255,255,255,0.04)'}`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: cd.color,
                    boxShadow: chakra === cd.key ? `0 0 8px ${cd.color}` : 'none',
                    opacity: chakra === cd.key ? 1 : 0.4,
                  }} />
                  <span style={{
                    fontFamily: "'Raleway', sans-serif",
                    fontSize: '9px', letterSpacing: '0.06em',
                    color: chakra === cd.key ? cd.color : '#3A3028',
                  }}>
                    {cd.key}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom glow strip */}
        <div style={{
          height: 2,
          background: `linear-gradient(to right, transparent, ${info.color}44, transparent)`,
        }} />
      </div>
    </div>
  );
}

function BodySilhouette({ activeChakra, activeColor }: { activeChakra: ChakraKey; activeColor: string }) {
  const activeDot = CHAKRA_DOTS.find(d => d.key === activeChakra);

  return (
    <svg viewBox="0 0 72 200" width="72" height="200" fill="none">
      {/* Head */}
      <ellipse cx="36" cy="18" rx="13" ry="15" fill="rgba(200,169,110,0.06)" stroke="rgba(200,169,110,0.12)" strokeWidth="0.8"/>
      {/* Neck */}
      <rect x="31" y="32" width="10" height="10" rx="3" fill="rgba(200,169,110,0.05)"/>
      {/* Torso */}
      <path d="M20 42 Q15 60 16 100 L56 100 Q57 60 52 42 Z" fill="rgba(200,169,110,0.06)" stroke="rgba(200,169,110,0.1)" strokeWidth="0.8"/>
      {/* Arms */}
      <path d="M20 45 Q10 70 12 95" stroke="rgba(200,169,110,0.08)" strokeWidth="6" strokeLinecap="round"/>
      <path d="M52 45 Q62 70 60 95" stroke="rgba(200,169,110,0.08)" strokeWidth="6" strokeLinecap="round"/>
      {/* Hips */}
      <path d="M16 100 Q14 115 18 125 L54 125 Q58 115 56 100 Z" fill="rgba(200,169,110,0.05)" stroke="rgba(200,169,110,0.08)" strokeWidth="0.8"/>
      {/* Legs */}
      <path d="M24 125 Q22 158 24 185" stroke="rgba(200,169,110,0.07)" strokeWidth="8" strokeLinecap="round"/>
      <path d="M48 125 Q50 158 48 185" stroke="rgba(200,169,110,0.07)" strokeWidth="8" strokeLinecap="round"/>

      {/* Sushumna spine line */}
      <line x1="36" y1="12" x2="36" y2="178" stroke="rgba(200,169,110,0.1)" strokeWidth="0.8" strokeDasharray="3 3"/>

      {/* All chakra dots */}
      {CHAKRA_DOTS.map(cd => {
        const y = (cd.y / 100) * 180 + 10;
        const isActive = cd.key === activeChakra;
        return (
          <g key={cd.key}>
            {isActive && (
              <>
                <circle cx="36" cy={y} r="12" fill={`${cd.color}15`} />
                <circle cx="36" cy={y} r="7" fill={`${cd.color}25`} />
              </>
            )}
            <circle cx="36" cy={y} r={isActive ? 4.5 : 3}
              fill={cd.color}
              opacity={isActive ? 1 : 0.3}
              style={isActive ? { filter: `drop-shadow(0 0 5px ${cd.color})` } : {}}
            />
          </g>
        );
      })}

      {/* Active chakra label line */}
      {activeDot && (
        <line
          x1="40"
          y1={(activeDot.y / 100) * 180 + 10}
          x2="65"
          y2={(activeDot.y / 100) * 180 + 10}
          stroke={`${activeColor}55`}
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />
      )}
    </svg>
  );
}
