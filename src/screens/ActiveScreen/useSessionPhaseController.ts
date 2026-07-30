import { useCallback, useRef, useState } from 'react';

export type SessionPhase =
  | 'opening_invocation'
  | 'opening_silence'
  | 'opening_bell'
  | 'opening_prepare'
  | 'paused'
  | 'active'
  | 'practice_complete'
  | 'end_bell'
  | 'transition_silence'
  | 'transition_voice'
  | 'prepare_next'
  | 'fade_ambient'
  | 'closing_bell'
  | 'closing_silence'
  | 'closing_message'
  | 'closing_sitting'
  | 'closing_complete';

const OPENING_PHASES = new Set<SessionPhase>([
  'opening_invocation',
  'opening_silence',
  'opening_bell',
  'opening_prepare',
]);

const TRANSITION_PHASES = new Set<SessionPhase>([
  'practice_complete',
  'end_bell',
  'transition_silence',
  'transition_voice',
  'prepare_next',
  'fade_ambient',
]);

const CLOSING_PHASES = new Set<SessionPhase>([
  'closing_bell',
  'closing_silence',
  'closing_message',
  'closing_sitting',
  'closing_complete',
]);

export function isSessionPhase(value: unknown): value is SessionPhase {
  return typeof value === 'string' && (
    OPENING_PHASES.has(value as SessionPhase) ||
    TRANSITION_PHASES.has(value as SessionPhase) ||
    CLOSING_PHASES.has(value as SessionPhase) ||
    value === 'paused' ||
    value === 'active'
  );
}

export function useSessionPhaseController(initialPhase: SessionPhase) {
  const [phase, setPhase] = useState<SessionPhase>(initialPhase);
  const phaseRef = useRef<SessionPhase>(initialPhase);

  const enterPhase = useCallback((nextPhase: SessionPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  return {
    phase,
    phaseRef,
    enterPhase,
    isActive: phase === 'active',
    isOpening: OPENING_PHASES.has(phase),
    isTransitioning: TRANSITION_PHASES.has(phase),
    isClosing: CLOSING_PHASES.has(phase),
  };
}
