import ParticleField from '../../components/ParticleField';

interface Props {
  chakraColor: string;
  isRunning: boolean;
  bellFlash: boolean;
  practiceTransition: boolean;
  auraTransitionPulse: boolean;
}

export default function SessionBackdrop({
  chakraColor, isRunning, bellFlash, practiceTransition, auraTransitionPulse,
}: Props) {
  return (
    <>
      {/* Bell flash */}
      {bellFlash && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50,
          background: `radial-gradient(ellipse at center, ${chakraColor}22 0%, transparent 65%)`,
          animation: 'fadeIn 0.12s ease',
        }} />
      )}

      {/* Practice transition */}
      {practiceTransition && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 48,
          background: 'var(--screen-transition-overlay)',
          animation: 'fadeIn 0.08s ease',
        }} />
      )}

      <ParticleField color={chakraColor} active={isRunning} />

      {/* Breathing chakra background glow */}
      <div style={{
        position: 'absolute', pointerEvents: 'none',
        width: 420, height: 420, borderRadius: '50%',
        background: `radial-gradient(ellipse at 40% 35%, ${chakraColor}${isRunning ? '20' : '10'} 0%, ${chakraColor}08 40%, transparent 68%)`,
        top: '38%', left: '50%',
        transform: `translate(-50%, -50%) scale(${auraTransitionPulse ? 1.07 : 1})`,
        filter: 'blur(38px)',
        transition: 'background 1.4s ease, opacity 1s ease',
        opacity: auraTransitionPulse ? 0.95 : undefined,
        animation: isRunning || auraTransitionPulse ? 'breathe-active 7s ease-in-out infinite' : 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', pointerEvents: 'none',
        width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${chakraColor}10 0%, transparent 70%)`,
        bottom: '15%', left: '20%',
        filter: 'blur(28px)',
        transition: 'background 1.4s ease',
        animation: isRunning ? 'breathe-active 9s ease-in-out infinite reverse' : 'none',
        zIndex: 0,
      }} />
    </>
  );
}
