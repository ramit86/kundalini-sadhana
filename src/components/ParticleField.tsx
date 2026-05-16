import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; opacity: number;
}

interface Props {
  color: string;
  active: boolean;
}

export default function ParticleField({ color, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.6 + 0.2),
      life: 0,
      maxLife: Math.random() * 300 + 200,
      size: Math.random() * 2 + 0.5,
      opacity: 0,
    });

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (active && particlesRef.current.length < 28 && Math.random() < 0.12) {
        particlesRef.current.push(spawn());
      }

      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      particlesRef.current.forEach(p => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        const progress = p.life / p.maxLife;
        p.opacity = progress < 0.15
          ? progress / 0.15
          : progress > 0.7
            ? (1 - progress) / 0.3
            : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.round(p.opacity * 0.35 * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });
    };

    animate();
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [color, active]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      style={{ opacity: active ? 1 : 0, transition: 'opacity 1s ease' }}
    />
  );
}
