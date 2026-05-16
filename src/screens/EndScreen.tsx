import { useEffect, useRef, useState } from 'react';
import { Session, CHAKRA_MAP } from '../data/sessions';

interface Props {
  session: Session;
  practicesCompleted: number;
  minutesCompleted: number;
  onHome: () => void;
}

export default function EndScreen({ session, practicesCompleted, minutesCompleted, onHome }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(0);
  const isMorning = session.key === 'morning';
  const accentColor = isMorning ? '#D4892A' : '#6B7FBF';

  // Stage in elements gradually
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 800),
      setTimeout(() => setStage(3), 1400),
      setTimeout(() => setStage(4), 1900),
      setTimeout(() => setStage(5), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Rising sparks canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    type Spark = { x: number; y: number; vy: number; vx: number; size: number; life: number; maxLife: number; color: string; };
    const sparks: Spark[] = [];
    const colors = [accentColor, '#C8A96E', '#E8D5B0', 'rgba(200,169,110,0.6)'];

    const addSpark = () => {
      sparks.push({
        x: canvas.width * 0.3 + Math.random() * canvas.width * 0.4,
        y: canvas.height,
        vy: -(Math.random() * 1.8 + 0.6),
        vx: (Math.random() - 0.5) * 0.7,
        size: Math.random() * 2 + 0.5,
        life: 0,
        maxLife: 80 + Math.random() * 80,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (frame % 8 === 0) addSpark();
      frame++;

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        const alpha = Math.sin((s.life / s.maxLife) * Math.PI) * 0.7;
        if (s.life >= s.maxLife) { sparks.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color.startsWith('rgba') ? s.color : s.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [accentColor]);

  // Chakra summary
  const chakraCounts = session.practices.reduce((acc, p) => {
    if (p.chakra !== 'Preparation') {
      const cc = CHAKRA_MAP[p.chakra];
      acc[p.chakra] = { color: cc.dot, count: (acc[p.chakra]?.count ?? 0) + 1 };
    }
    return acc;
  }, {} as Record<string, { color: string; count: number }>);

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #0A0806 0%, #0E0B07 60%, #0A0806 100%)',
      padding: '2rem 1.8rem',
      textAlign: 'center', overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Sparks canvas */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', width: 380, height: 380, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${accentColor}12 0%, transparent 65%)`,
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(30px)',
        animation: 'breathe-slow 12s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 320, width: '100%' }}>

        {/* Om symbol */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '3.8rem', color: accentColor,
          lineHeight: 1, marginBottom: '1.2rem',
          opacity: stage >= 1 ? 1 : 0,
          transform: stage >= 1 ? 'scale(1)' : 'scale(0.75)',
          transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)',
          textShadow: `0 0 50px ${accentColor}66`,
          animation: stage >= 1 ? 'glow-pulse 4s ease-in-out infinite' : 'none',
        }}>
          ॐ
        </div>

        {/* Title */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '2.1rem', fontWeight: 300, color: '#EDE5DA',
          marginBottom: '0.4rem',
          opacity: stage >= 2 ? 1 : 0,
          transform: stage >= 2 ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          Session Complete
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          marginBottom: '1.4rem',
          opacity: stage >= 2 ? 1 : 0,
          transition: 'opacity 0.7s 0.15s ease',
        }}>
          <div style={{ width: 40, height: 1, background: `linear-gradient(to right, transparent, ${accentColor}55)` }} />
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: accentColor, opacity: 0.5 }} />
          <div style={{ width: 40, height: 1, background: `linear-gradient(to left, transparent, ${accentColor}55)` }} />
        </div>

        {/* End text */}
        <div style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '12px', color: '#8A7A6A',
          lineHeight: 1.85, marginBottom: '1.8rem',
          fontWeight: 300, fontStyle: 'italic',
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
          whiteSpace: 'pre-line',
        }}>
          {session.end}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 12, justifyContent: 'center',
          marginBottom: '1.8rem',
          opacity: stage >= 4 ? 1 : 0,
          transform: stage >= 4 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <StatCard value={minutesCompleted} label="Minutes" accent={accentColor} />
          <StatCard value={practicesCompleted} label="Practices" accent={accentColor} />
        </div>

        {/* Chakra trail */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 8,
          marginBottom: '2rem', flexWrap: 'wrap',
          opacity: stage >= 4 ? 1 : 0,
          transition: 'opacity 0.7s 0.15s ease',
        }}>
          {Object.entries(chakraCounts).map(([chakra, { color }]) => (
            <div key={chakra} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 10,
              border: `1px solid ${color}33`,
              background: `${color}0D`,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }} />
              <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: color + 'CC', letterSpacing: '0.06em' }}>
                {chakra}
              </span>
            </div>
          ))}
        </div>

        {/* Return button */}
        <button
          onClick={onHome}
          style={{
            padding: '12px 36px', borderRadius: 28,
            border: `1px solid ${accentColor}55`,
            background: `${accentColor}11`,
            color: '#EDE5DA',
            fontFamily: "'Raleway', sans-serif",
            fontSize: '11px', fontWeight: 500,
            letterSpacing: '0.22em', cursor: 'pointer',
            transition: 'all 0.25s ease',
            textTransform: 'uppercase',
            opacity: stage >= 5 ? 1 : 0,
            transform: stage >= 5 ? 'translateY(0)' : 'translateY(10px)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = `${accentColor}22`;
            (e.currentTarget as HTMLButtonElement).style.borderColor = `${accentColor}88`;
            (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${accentColor}22`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = `${accentColor}11`;
            (e.currentTarget as HTMLButtonElement).style.borderColor = `${accentColor}55`;
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          Return Home
        </button>
      </div>
    </div>
  );
}

function StatCard({ value, label, accent }: { value: number; label: string; accent: string }) {
  return (
    <div style={{
      padding: '14px 24px',
      border: `1px solid ${accent}20`,
      borderRadius: 16,
      background: `${accent}08`,
      minWidth: 90,
    }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '2rem', color: accent,
        lineHeight: 1, fontWeight: 300,
        textShadow: `0 0 20px ${accent}44`,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'Raleway', sans-serif",
        fontSize: '9px', color: '#4A4038',
        letterSpacing: '0.18em', marginTop: 5,
        textTransform: 'uppercase', fontWeight: 400,
      }}>
        {label}
      </div>
    </div>
  );
}
