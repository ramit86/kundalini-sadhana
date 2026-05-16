import { ChakraKey } from '../data/sessions';

let audioCtx: AudioContext | null = null;

interface AmbientTrackState {
  element: HTMLAudioElement;
  path: string;
  chakra: ChakraKey;
  targetVolume: number;
}

let ambientTrack: AmbientTrackState | null = null;
let ambientFileMissing = false;

function devLog(...args: unknown[]) {
  void args;
}

export function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) throw new Error('AudioContext not supported');
    audioCtx = new AudioCtx();
  }
  return audioCtx;
}

export function unlockAudio() {
  try { getAudioCtx(); } catch (_) {}
}

export async function resumeAudioContextFromGesture(): Promise<void> {
  try {
    const ctx = getAudioCtx();
    devLog('audio context state', ctx.state);
    if (ctx.state === 'suspended') {
      await ctx.resume();
      devLog('audio context state', ctx.state);
    }
  } catch (error) {
    devLog('ambient failed with reason', error);
  }
}

export function getAudioContextState(): AudioContextState | 'none' {
  if (!audioCtx) return 'none';
  return audioCtx.state;
}

export function isAmbientActive(): boolean {
  return !!ambientTrack && !ambientTrack.element.paused;
}

export function isAmbientFileMissing(): boolean {
  return ambientFileMissing;
}

// ── Bell ────────────────────────────────────────────────
export function ringBell(times = 1) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const playTone = (delay: number) => {
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime + delay);
      master.gain.linearRampToValueAtTime(0.28, ctx.currentTime + delay + 0.03);
      master.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 3.5);
      master.connect(ctx.destination);

      // Fundamental
      const o1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      o1.type = 'sine'; o1.frequency.value = 432;
      o1.frequency.exponentialRampToValueAtTime(360, ctx.currentTime + delay + 2.2);
      g1.gain.value = 0.7;
      o1.connect(g1); g1.connect(master);

      // 2nd partial — richness
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.type = 'sine'; o2.frequency.value = 648;
      o2.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + delay + 1.8);
      g2.gain.value = 0.25;
      o2.connect(g2); g2.connect(master);

      // 3rd partial — shimmer
      const o3 = ctx.createOscillator();
      const g3 = ctx.createGain();
      o3.type = 'sine'; o3.frequency.value = 864;
      g3.gain.value = 0.08;
      o3.connect(g3); g3.connect(master);

      [o1, o2, o3].forEach(o => {
        o.start(ctx.currentTime + delay);
        o.stop(ctx.currentTime + delay + 3.6);
      });
    };

    for (let i = 0; i < times; i++) playTone(i * 1.6);
  } catch (_) {}
}

// ── Ambient Mantra Loop ─────────────────────────────────
export async function startAmbient(chakra: ChakraKey, volume: number): Promise<void> {
  devLog('ambient requested', chakra);
  try {
    const ctx = getAudioCtx();
    devLog('audio context state', ctx.state);
    if (ctx.state === 'suspended') {
      await ctx.resume();
      devLog('audio context state', ctx.state);
    }

    const path = mapChakraToMantraPath(chakra);
    const target = clamp01(volume);

    if (ambientTrack && ambientTrack.path === path) {
      ambientTrack.targetVolume = target;
      ambientTrack.element.volume = target;
      ambientFileMissing = false;
      devLog('ambient started', `file:${path}`);
      return;
    }

    const next = new Audio(path);
    next.loop = true;
    next.preload = 'auto';
    next.muted = false;
    next.volume = 0;
    next.setAttribute('playsinline', 'true');

    let loadError = false;
    next.onerror = () => {
      loadError = true;
      ambientFileMissing = true;
    };

    try {
      await next.play();
    } catch (error) {
      ambientFileMissing = true;
      devLog('ambient failed with reason', error);
      return;
    }

    if (loadError) {
      try {
        next.pause();
      } catch (_) {}
      ambientFileMissing = true;
      devLog('ambient failed with reason', `missing file: ${path}`);
      return;
    }

    const previous = ambientTrack?.element ?? null;
    ambientTrack = { element: next, path, chakra, targetVolume: target };
    ambientFileMissing = false;
    fadeVolume(next, 0, target, 700);

    if (previous) {
      const from = previous.volume;
      fadeVolume(previous, from, 0, 500, () => {
        try {
          previous.pause();
          previous.currentTime = 0;
          previous.src = '';
        } catch (_) {}
      });
    }

    devLog('ambient started', `file:${path}`);
  } catch (error) {
    devLog('ambient failed with reason', error);
  }
}

export function stopAmbient(fade = true) {
  if (!ambientTrack) return;
  try {
    const current = ambientTrack.element;
    ambientTrack = null;
    if (fade) {
      fadeVolume(current, current.volume, 0, 450, () => {
        try {
          current.pause();
          current.currentTime = 0;
          current.src = '';
        } catch (_) {}
      });
    } else {
      current.pause();
      current.currentTime = 0;
      current.src = '';
    }
    devLog('ambient stopped', 'file');
  } catch (error) {
    devLog('ambient failed with reason', error);
  }
}

export function setAmbientVolume(vol: number) {
  if (!ambientTrack) return;
  const next = clamp01(vol);
  ambientTrack.targetVolume = next;
  ambientTrack.element.volume = next;
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function mapChakraToMantraPath(chakra: ChakraKey): string {
  if (chakra === 'Mooladhara') return '/audio/mantras/mooladhara-lam.mp3';
  if (chakra === 'Swadhisthana') return '/audio/mantras/swadhisthana-vam.mp3';
  if (chakra === 'Manipura') return '/audio/mantras/manipura-ram.mp3';
  if (chakra === 'Anahata') return '/audio/mantras/anahata-yam.mp3';
  if (chakra === 'Vishuddhi') return '/audio/mantras/vishuddhi-ham.mp3';
  if (chakra === 'Ajna') return '/audio/mantras/ajna-om.mp3';
  if (chakra === 'Bindu') return '/audio/mantras/bindu-om.mp3';
  return '/audio/mantras/integration-om.mp3';
}

function fadeVolume(
  element: HTMLAudioElement,
  from: number,
  to: number,
  durationMs: number,
  onDone?: () => void,
) {
  const start = performance.now();
  const run = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    element.volume = clamp01(from + (to - from) * t);
    if (t < 1) {
      requestAnimationFrame(run);
    } else {
      onDone?.();
    }
  };
  requestAnimationFrame(run);
}
