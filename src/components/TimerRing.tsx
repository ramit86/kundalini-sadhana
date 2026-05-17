import { useEffect, useRef } from 'react';
import { ChakraKey, CHAKRA_MAP } from '../data/sessions';

interface Props {
  timeRemaining: number;
  totalDuration: number;
  chakra: ChakraKey;
  isRunning: boolean;
  size?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function TimerRing({ timeRemaining, totalDuration, chakra, isRunning, size = 240 }: Props) {
  const cc = CHAKRA_MAP[chakra] ?? CHAKRA_MAP['Preparation'];
  const prevChakra = useRef(chakra);
  const glowRef = useRef<HTMLDivElement>(null);

  const outerR = size * 0.4;
  const innerR = size * 0.3417;
  const cx = size / 2;
  const outerCirc = 2 * Math.PI * outerR;
  const innerCirc = 2 * Math.PI * innerR;

  const pct = totalDuration > 0 ? timeRemaining / totalDuration : 1;
  const outerOffset = outerCirc * (1 - pct);

  // Tick markers
  const tickCount = 60;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / tickCount) * 2 * Math.PI - Math.PI / 2;
    const isMajor = i % 5 === 0;
    const rOuter = outerR + 10;
    const rInner = rOuter - (isMajor ? 7 : 4);
    return {
      x1: cx + rInner * Math.cos(angle),
      y1: cx + rInner * Math.sin(angle),
      x2: cx + rOuter * Math.cos(angle),
      y2: cx + rOuter * Math.sin(angle),
      major: isMajor,
      active: i / tickCount <= pct,
    };
  });

  // Flash glow on chakra change
  useEffect(() => {
    if (prevChakra.current !== chakra && glowRef.current) {
      glowRef.current.style.transition = 'none';
      glowRef.current.style.opacity = '1';
      setTimeout(() => {
        if (glowRef.current) {
          glowRef.current.style.transition = 'opacity 1.2s ease';
          glowRef.current.style.opacity = isRunning ? '0.7' : '0.45';
        }
      }, 80);
    }
    prevChakra.current = chakra;
  }, [chakra, isRunning]);

  return (
    <div
      style={{
        position: 'relative',
        width: size, height: size,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {/* Morphing background glow */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: size * 0.86, height: size * 0.86,
          background: `radial-gradient(ellipse at 44% 42%, ${cc.dot}3A 0%, ${cc.dot}1A 48%, transparent 72%)`,
          opacity: isRunning ? 0.72 : 0.42,
          filter: 'blur(26px)',
          transition: 'background 1s ease, opacity 1.5s ease, transform 1s ease',
          animation: isRunning ? 'breathe-active 6s ease-in-out infinite, morph-glow 9s ease-in-out infinite' : 'none',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: '50%',
          background: `radial-gradient(circle, transparent 56%, ${cc.dot}1E 72%, transparent 88%)`,
          opacity: isRunning ? 0.5 : 0.25,
          transform: isRunning ? 'scale(1.03)' : 'scale(1)',
          transition: 'all 0.8s ease',
          animation: isRunning ? 'breathe-slow 8s ease-in-out infinite' : 'none',
          pointerEvents: 'none',
        }}
      />

      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'relative', zIndex: 1, transform: 'rotate(-90deg)' }}
      >
        <defs>
          <linearGradient id={`timerGrad-${chakra}`} x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor={cc.dot} stopOpacity="0.38" />
            <stop offset="48%" stopColor={cc.dot} stopOpacity="0.95" />
            <stop offset="100%" stopColor={cc.dot} stopOpacity="0.58" />
          </linearGradient>
          <radialGradient id={`timerSoft-${chakra}`} cx="50%" cy="50%" r="54%">
            <stop offset="62%" stopColor={cc.dot} stopOpacity="0" />
            <stop offset="85%" stopColor={cc.dot} stopOpacity="0.17" />
            <stop offset="100%" stopColor={cc.dot} stopOpacity="0.02" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={cx} cy={cx} r={outerR + 5}
          fill={`url(#timerSoft-${chakra})`}
          opacity={isRunning ? 0.6 : 0.35}
        />

        {/* Tick marks */}
        <g
          style={{
            transformOrigin: `${cx}px ${cx}px`,
            animation: isRunning ? 'spin-slow 90s linear infinite' : 'none',
          }}
        >
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1} y1={t.y1}
              x2={t.x2} y2={t.y2}
              stroke={t.active ? cc.dot : 'rgba(200,169,110,0.08)'}
              strokeWidth={t.major ? 1.45 : 0.75}
              strokeLinecap="round"
              style={{ transition: 'stroke 0.4s ease' }}
              opacity={t.active ? (t.major ? 0.66 : 0.4) : 0.2}
            />
          ))}
        </g>

        {/* Outer track */}
        <circle
          cx={cx} cy={cx} r={outerR}
          fill="none"
          stroke="var(--border-soft)"
          strokeWidth={6.5}
        />

        {/* Outer progress ring */}
        <circle
          cx={cx} cy={cx} r={outerR}
          fill="none"
          stroke={`url(#timerGrad-${chakra})`}
          strokeWidth={6.5}
          strokeLinecap="round"
          strokeDasharray={outerCirc}
          strokeDashoffset={outerOffset}
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 0.6s linear, stroke 0.9s ease' }}
        />

        {/* Inner decorative ring */}
        <circle
          cx={cx} cy={cx} r={innerR}
          fill="none"
          stroke="var(--border-soft)"
          strokeWidth={1}
          strokeDasharray={`${innerCirc * 0.015} ${innerCirc * 0.985 / (tickCount / 4 - 1)}`}
        />

        <circle
          cx={cx} cy={cx} r={innerR - 6}
          fill="none"
          stroke={`${cc.dot}33`}
          strokeWidth={0.9}
          opacity={isRunning ? 0.75 : 0.42}
          strokeDasharray={`${innerCirc * 0.01} ${innerCirc * 0.99 / (tickCount / 5 - 1)}`}
          style={{
            transformOrigin: `${cx}px ${cx}px`,
            animation: isRunning ? 'spin-slow 70s linear infinite reverse' : 'none',
          }}
        />

        {/* Progressing dot at tip of arc */}
        {pct > 0.01 && pct < 0.999 && (
          <circle
            cx={cx + outerR * Math.cos(2 * Math.PI * pct - Math.PI / 2)}
            cy={cx + outerR * Math.sin(2 * Math.PI * pct - Math.PI / 2)}
            r={4.5}
            fill={cc.dot}
            filter="url(#glow)"
            style={{ transition: 'cx 0.6s linear, cy 0.6s linear' }}
          />
        )}
      </svg>

      {/* Center display */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 2,
      }}>
        {isRunning && (
          <div style={{
            fontSize: '8px', letterSpacing: '0.35em',
            textTransform: 'uppercase', color: cc.dot,
            fontFamily: "'Raleway', sans-serif", fontWeight: 400,
            opacity: 0.82,
            marginBottom: 4,
            animation: 'glow-pulse 2.5s ease-in-out infinite',
          }}>
            Active
          </div>
        )}
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '3.1rem',
          fontWeight: 300,
          color: 'var(--text-primary)',
          letterSpacing: '0.02em',
          lineHeight: 1,
          textShadow: isRunning ? `0 0 30px ${cc.dot}44` : 'none',
          transition: 'text-shadow 0.8s ease',
        }}>
          {formatTime(timeRemaining)}
        </span>
        <span style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '8.5px',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'var(--text-subtle)',
          marginTop: 7,
          fontWeight: 500,
        }}>
          remaining
        </span>

        {/* Percentage ring indicator */}
        <div style={{
          marginTop: 10,
          width: 38, height: 3, borderRadius: 2,
          background: 'var(--border-soft)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${pct * 100}%`,
            background: cc.dot,
            borderRadius: 2,
            transition: 'width 0.6s linear, background 0.9s ease',
            opacity: 0.7,
          }} />
        </div>
      </div>
    </div>
  );
}
