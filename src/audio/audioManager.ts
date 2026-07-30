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

type AudioRole = 'bell' | 'opening-mantra' | 'ambient' | 'one-shot';

interface AudioSnapshot {
  paused: boolean;
  ended: boolean;
  muted: boolean;
  volume: number;
  readyState: number;
  networkState: number;
  currentTime: number;
  src: string;
  visibilityState: string;
  audioCtxState: AudioContextState | 'none';
}

let ambientTrack: AmbientTrackState | null = null;
let ambientFileMissing = false;
let bellBusyUntil = 0;
let ambientElement: HTMLAudioElement | null = null;
let openingMantraAudio: HTMLAudioElement | null = null;
const oneShotAudioByPath = new Map<string, HTMLAudioElement>();
let oneShotAudio: HTMLAudioElement | null = null;
let oneShotCancel: (() => void) | null = null;
let ambientFadeCancel: (() => void) | null = null;
let ambientFadeToken = 0;

const AMBIENT_FADE_MS = 1250;
const BELL_PATH = '/audio/rituals/meditation-bell.mp3';
const BELL_DURATION_MS = 3600;
const OPENING_MANTRA_PATH = '/audio/mantras/asato-ma-opening.mp3';

export function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) throw new Error('AudioContext not supported');
    audioCtx = new AudioCtx();
  }
  return audioCtx;
}

export async function unlockAudio(opts?: { ambientChakra?: ChakraKey }): Promise<void> {
  const promises: Array<Promise<unknown>> = [];
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
      promises.push(ctx.resume());
    }
  } catch (_) {}

  try {
    const bell = getBellAudio();
    promises.push(primeAudioElement(bell, 'bell', BELL_PATH, 1));
  } catch (_) {}

  try {
    const mantra = getOpeningMantraAudio();
    promises.push(primeAudioElement(mantra, 'opening-mantra', OPENING_MANTRA_PATH, 0.9));
  } catch (_) {}

  if (opts?.ambientChakra) {
    try {
      const ambientPath = mapChakraToAmbientPath(opts.ambientChakra);
      const ambient = getAmbientAudio();
      promises.push(primeAudioElement(ambient, 'ambient', ambientPath, 0));
    } catch (_) {}
  }

  await Promise.allSettled(promises);
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
    const el = getOneShotAudio(path);
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

    void safePlayAudio(el, 'one-shot', clamp01(volume), { restart: true, path }).then(ok => {
      if (!ok) done(false);
    });

    el.onended = () => done(true);
    el.onerror = () => done(false);
  });
}

// ── Bell ────────────────────────────────────────────────
export function ringBell(times = 1) {
  try {
    void times;
    bellBusyUntil = Date.now() + BELL_DURATION_MS;
    stopOneShotAudio();
    const bell = getBellAudio();
    void safePlayAudio(bell, 'bell', clamp01(getSettings().bellVolume), { restart: true, path: BELL_PATH });
  } catch (_) {}
}

// ── Ambient Mantra Loop ─────────────────────────────────
export async function startAmbient(chakra: ChakraKey, volume: number): Promise<void> {
  try {
    cancelAmbientFade();
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const path = mapChakraToAmbientPath(chakra);
    const target = clamp01(volume);
    const ambient = getAmbientAudio();
    const changedPath = !ambientTrack || ambientTrack.path !== path;

    if (changedPath) {
      try {
        ambient.pause();
      } catch (_) {}
      try {
        ambient.currentTime = 0;
      } catch (_) {}
      ambient.src = path;
      ambient.load();
    }

    const startingVolume = changedPath ? 0 : target;
    const played = await safePlayAudio(ambient, 'ambient', startingVolume, {
      restart: changedPath || ambient.ended,
      path,
    });
    if (!played) {
      ambientFileMissing = true;
      return;
    }

    ambientFileMissing = false;
    ambientTrack = { element: ambient, path, chakra, targetVolume: target };
    if (changedPath || ambient.volume !== target) {
      ambientFadeCancel = fadeVolume(ambient, ambient.volume, target, AMBIENT_FADE_MS, ++ambientFadeToken);
    }
  } catch (error) {
  }
}

export function stopAmbient(fade = true): Promise<void> {
  if (!ambientTrack) return Promise.resolve();
  try {
    const current = ambientTrack.element;
    ambientTrack = null;
    cancelAmbientFade();
    if (fade) {
      return new Promise(resolve => {
        ambientFadeCancel = fadeVolume(current, current.volume, 0, AMBIENT_FADE_MS, ++ambientFadeToken, () => {
          try {
            current.pause();
            current.currentTime = 0;
            current.src = '';
          } catch (_) {}
          if (ambientFadeCancel) ambientFadeCancel = null;
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

function getBellAudio() {
  return getOrCreateAudio('bell', BELL_PATH, false, 1);
}

function getOpeningMantraAudio() {
  if (!openingMantraAudio) {
    openingMantraAudio = createManagedAudio('opening-mantra', OPENING_MANTRA_PATH, false, 0.9);
  }
  return openingMantraAudio;
}

function getAmbientAudio() {
  if (!ambientElement) {
    ambientElement = createManagedAudio('ambient', '', true, 0);
  }
  return ambientElement;
}

function getOneShotAudio(path: string) {
  const existing = oneShotAudioByPath.get(path);
  if (existing) return existing;
  const el = createManagedAudio('one-shot', path, false, 1);
  oneShotAudioByPath.set(path, el);
  return el;
}

function getOrCreateAudio(
  role: Exclude<AudioRole, 'ambient' | 'one-shot'>,
  path: string,
  loop: boolean,
  defaultVolume: number,
) {
  const key = `${role}:${path}`;
  const existing = oneShotAudioByPath.get(key);
  if (existing) return existing;
  const el = createManagedAudio(role, path, loop, defaultVolume);
  oneShotAudioByPath.set(key, el);
  return el;
}

function createManagedAudio(
  role: AudioRole,
  path: string,
  loop: boolean,
  defaultVolume: number,
) {
  const el = new Audio(path);
  el.loop = loop;
  el.preload = 'auto';
  el.muted = false;
  el.volume = clamp01(defaultVolume);
  el.setAttribute('playsinline', 'true');
  if (import.meta.env.DEV) {
    el.setAttribute('webkit-playsinline', 'true');
  }
  el.addEventListener('error', () => {
    if (role === 'ambient') ambientFileMissing = true;
    debugAudio(role, 'element-error', el);
  });
  return el;
}

async function primeAudioElement(
  element: HTMLAudioElement,
  role: AudioRole,
  path: string,
  defaultVolume: number,
) {
  if (path && element.src !== new URL(path, window.location.href).href) {
    element.src = path;
    element.load();
  }
  const prevMuted = element.muted;
  const prevVolume = element.volume;
  element.muted = true;
  element.volume = 0;
  debugAudio(role, 'unlock-request', element);
  try {
    const play = element.play();
    if (play) await play;
    debugAudio(role, 'unlock-play-resolved', element);
  } catch (error) {
    debugAudio(role, 'unlock-play-rejected', element, error);
  } finally {
    try {
      element.pause();
    } catch (_) {}
    try {
      element.currentTime = 0;
    } catch (_) {}
    element.muted = prevMuted;
    element.volume = clamp01(prevVolume || defaultVolume);
  }
}

async function safePlayAudio(
  element: HTMLAudioElement,
  role: AudioRole,
  volume: number,
  opts?: { restart?: boolean; path?: string },
): Promise<boolean> {
  if (opts?.path && element.src !== new URL(opts.path, window.location.href).href) {
    element.src = opts.path;
    element.load();
  }
  element.muted = false;
  element.volume = clamp01(volume);
  if (opts?.restart || element.ended) {
    try {
      element.currentTime = 0;
    } catch (_) {}
  }
  if (element.readyState === 0) {
    try {
      element.load();
    } catch (_) {}
  }
  debugAudio(role, 'play-request', element);
  try {
    const play = element.play();
    if (play) await play;
    debugAudio(role, 'play-resolved', element);
    return true;
  } catch (error) {
    debugAudio(role, 'play-rejected', element, error);
    return false;
  }
}

function debugAudio(
  role: AudioRole,
  event: string,
  element: HTMLAudioElement,
  error?: unknown,
) {
  if (!import.meta.env.DEV) return;
  const snapshot: AudioSnapshot = {
    paused: element.paused,
    ended: element.ended,
    muted: element.muted,
    volume: element.volume,
    readyState: element.readyState,
    networkState: element.networkState,
    currentTime: Number.isFinite(element.currentTime) ? Number(element.currentTime.toFixed(3)) : element.currentTime,
    src: element.currentSrc || element.src,
    visibilityState: typeof document !== 'undefined' ? document.visibilityState : 'unknown',
    audioCtxState: getAudioContextState(),
  };
  const payload = error instanceof Error
    ? { name: error.name, message: error.message }
    : error ? { error: String(error) } : undefined;
  console.info('[audio]', role, event, payload ? { ...snapshot, ...payload } : snapshot);
}

function fadeVolume(
  element: HTMLAudioElement,
  from: number,
  to: number,
  durationMs: number,
  token: number,
  onDone?: () => void,
) {
  const start = performance.now();
  const run = (now: number) => {
    if (!isAmbientFadeTokenCurrent(token)) return;
    const t = Math.min(1, (now - start) / durationMs);
    element.volume = clamp01(from + (to - from) * t);
    if (t < 1) {
      requestAnimationFrame(run);
    } else {
      ambientFadeCancel = null;
      onDone?.();
    }
  };
  const cancel = () => {
    if (!isAmbientFadeTokenCurrent(token)) return;
    ambientFadeCancel = null;
    onDone?.();
  };
  ambientFadeCancel = cancel;
  requestAnimationFrame(run);
  return cancel;
}

function cancelAmbientFade() {
  const cancel = ambientFadeCancel;
  cancel?.();
  ambientFadeCancel = null;
  ambientFadeToken += 1;
}

function isAmbientFadeTokenCurrent(token: number) {
  return token === ambientFadeToken;
}
