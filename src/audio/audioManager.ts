import { ChakraKey } from '../data/sessions';
import { AUDIO_MANIFEST } from '../data/audioManifest';
import { getSettings } from '../store/settingsStore';

let audioCtx: AudioContext | null = null;

interface AmbientTrackState {
  element: HTMLAudioElement;
  path: string;
  chakra: ChakraKey;
  targetVolume: number;
}

let ambientTrack: AmbientTrackState | null = null;
let ambientFileMissing = false;
let bellBusyUntil = 0;
let oneShotAudio: HTMLAudioElement | null = null;
let oneShotCancel: (() => void) | null = null;

const AMBIENT_FADE_MS = 1250;
const BELL_PATH = '/audio/rituals/meditation-bell.mp3';
const BELL_DURATION_MS = 3600;

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
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  } catch {
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

export function getBellBusyMsRemaining(): number {
  return Math.max(0, bellBusyUntil - Date.now());
}

export function stopOneShotAudio() {
  const cancel = oneShotCancel;
  oneShotCancel = null;
  cancel?.();
  if (oneShotAudio) {
    try {
      oneShotAudio.pause();
      oneShotAudio.currentTime = 0;
      oneShotAudio.src = '';
    } catch {
      // ignore stop errors
    }
    oneShotAudio = null;
  }
}

export async function playOneShotAudio(path: string, volume = 1): Promise<boolean> {
  stopOneShotAudio();

  return new Promise(resolve => {
    const el = new Audio(path);
    oneShotAudio = el;
    let finished = false;

    const done = (ok: boolean) => {
      if (finished) return;
      finished = true;
      el.onended = null;
      el.onerror = null;
      try {
        el.pause();
      } catch {
        // ignore stop errors
      }
      if (oneShotAudio === el) oneShotAudio = null;
      if (oneShotCancel === cancel) oneShotCancel = null;
      resolve(ok);
    };
    const cancel = () => done(false);
    oneShotCancel = cancel;

    el.preload = 'auto';
    el.loop = false;
    el.muted = false;
    el.volume = clamp01(volume);
    el.setAttribute('playsinline', 'true');
    el.onended = () => done(true);
    el.onerror = () => done(false);
    el.play().catch(() => done(false));
  });
}

// ── Bell ────────────────────────────────────────────────
export function ringBell(times = 1) {
  try {
    void times;
    bellBusyUntil = Date.now() + BELL_DURATION_MS;
    stopOneShotAudio();
    void playOneShotAudio(BELL_PATH, clamp01(getSettings().bellVolume));
  } catch (_) {}
}

// ── Ambient Mantra Loop ─────────────────────────────────
export async function startAmbient(chakra: ChakraKey, volume: number): Promise<void> {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const path = mapChakraToAmbientPath(chakra);
    const target = clamp01(volume);

    if (ambientTrack && ambientTrack.path === path) {
      ambientTrack.targetVolume = target;
      ambientTrack.element.muted = false;
      ambientTrack.element.volume = target;
      if (ambientTrack.element.paused || ambientTrack.element.ended) {
        try {
          if (ambientTrack.element.ended) {
            ambientTrack.element.currentTime = 0;
          }
          await ambientTrack.element.play();
        } catch (error) {
          ambientFileMissing = true;
          return;
        }
      }
      ambientFileMissing = false;
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
      return;
    }

    if (loadError) {
      try {
        next.pause();
      } catch (_) {}
      ambientFileMissing = true;
      return;
    }

    const previous = ambientTrack?.element ?? null;
    ambientTrack = { element: next, path, chakra, targetVolume: target };
    ambientFileMissing = false;
    fadeVolume(next, 0, target, AMBIENT_FADE_MS);

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

  } catch (error) {
  }
}

export function stopAmbient(fade = true): Promise<void> {
  if (!ambientTrack) return Promise.resolve();
  try {
    const current = ambientTrack.element;
    ambientTrack = null;
    if (fade) {
      return new Promise(resolve => {
        fadeVolume(current, current.volume, 0, AMBIENT_FADE_MS, () => {
          try {
            current.pause();
            current.currentTime = 0;
            current.src = '';
          } catch (_) {}
          resolve();
        });
      });
    } else {
      current.pause();
      current.currentTime = 0;
      current.src = '';
    }
  } catch (error) {
  }
  return Promise.resolve();
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

function mapChakraToAmbientPath(chakra: ChakraKey): string {
  const track = AUDIO_MANIFEST.ambient[
    chakra === 'Mooladhara' ? 'mooladhara'
      : chakra === 'Swadhisthana' ? 'swadhisthana'
      : chakra === 'Manipura' ? 'manipura'
      : chakra === 'Anahata' ? 'anahata'
      : chakra === 'Vishuddhi' ? 'vishuddhi'
      : chakra === 'Ajna' ? 'ajna'
      : chakra === 'Bindu' ? 'bindu'
      : 'integration'
  ]?.[0];
  return track?.path ?? '/audio/ambient/integration/base.mp3';
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
