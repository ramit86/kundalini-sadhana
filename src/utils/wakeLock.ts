type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>;
  };
};

let wakeLockSentinel: WakeLockSentinelLike | null = null;
let keepActive = false;
let listenerAttached = false;
let fallbackVideoEl: HTMLVideoElement | null = null;
let fallbackCanvas: HTMLCanvasElement | null = null;
let fallbackStream: MediaStream | null = null;
let fallbackRaf: number | null = null;

export type WakeLockMode = 'full' | 'limited' | 'inactive';

function devLog(...args: unknown[]) {
  if (import.meta.env.DEV) {
    console.log('[wakeLock]', ...args);
  }
}

function isSupported(): boolean {
  return typeof window !== 'undefined' && !!(navigator as WakeLockNavigator).wakeLock;
}

async function acquireWakeLockIfNeeded(): Promise<void> {
  if (!keepActive) return;
  if (!isSupported()) return;
  if (document.visibilityState !== 'visible') return;
  if (wakeLockSentinel && !wakeLockSentinel.released) return;

  try {
    const nav = navigator as WakeLockNavigator;
    wakeLockSentinel = await nav.wakeLock!.request('screen');
    devLog('acquired');
  } catch (error) {
    devLog('acquire failed', error);
  }
}

function getOrCreateFallbackVideo(): HTMLVideoElement | null {
  if (typeof document === 'undefined') return null;
  if (fallbackVideoEl) return fallbackVideoEl;

  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 2;
  fallbackCanvas = canvas;

  const stream = canvas.captureStream?.(1);
  if (!stream) {
    devLog('fallback video unsupported');
    return null;
  }
  fallbackStream = stream;

  const el = document.createElement('video');
  el.srcObject = stream;
  el.loop = true;
  el.muted = true;
  el.volume = 0;
  el.autoplay = false;
  el.setAttribute('playsinline', 'true');
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('tabindex', '-1');
  el.style.position = 'fixed';
  el.style.width = '0';
  el.style.height = '0';
  el.style.opacity = '0';
  el.style.pointerEvents = 'none';
  document.body.appendChild(el);
  fallbackVideoEl = el;
  return fallbackVideoEl;
}

function startFallbackCanvasLoop() {
  if (!fallbackCanvas) return;
  const ctx = fallbackCanvas.getContext('2d');
  if (!ctx) return;
  const draw = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, fallbackCanvas!.width, fallbackCanvas!.height);
    fallbackRaf = window.requestAnimationFrame(draw);
  };
  if (fallbackRaf == null) {
    fallbackRaf = window.requestAnimationFrame(draw);
  }
}

async function startFallbackMedia(): Promise<boolean> {
  const el = getOrCreateFallbackVideo();
  if (!el) return false;
  try {
    startFallbackCanvasLoop();
    await el.play();
    devLog('fallback silent video started');
    return true;
  } catch (error) {
    devLog('fallback video failed', error);
    return false;
  }
}

function stopFallbackMedia() {
  if (fallbackRaf != null) {
    window.cancelAnimationFrame(fallbackRaf);
    fallbackRaf = null;
  }
  if (!fallbackVideoEl) return;
  try {
    fallbackVideoEl.pause();
    fallbackVideoEl.srcObject = null;
    devLog('fallback silent video stopped');
  } catch (error) {
    devLog('fallback stop failed', error);
  } finally {
    fallbackStream?.getTracks().forEach((t) => t.stop());
    fallbackStream = null;
  }
}

function ensureVisibilityListener() {
  if (listenerAttached || typeof document === 'undefined') return;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (isSupported()) {
        void acquireWakeLockIfNeeded();
      } else if (keepActive) {
        void startFallbackMedia();
      }
    }
  });
  listenerAttached = true;
}

export async function requestWakeLock(): Promise<WakeLockMode> {
  keepActive = true;
  ensureVisibilityListener();
  if (!isSupported()) {
    devLog('unsupported browser');
    await startFallbackMedia();
    return 'limited';
  }
  await acquireWakeLockIfNeeded();
  if (wakeLockSentinel && !wakeLockSentinel.released) {
    stopFallbackMedia();
    return 'full';
  }
  await startFallbackMedia();
  return 'limited';
}

export async function releaseWakeLock(): Promise<void> {
  keepActive = false;
  stopFallbackMedia();
  if (!wakeLockSentinel) return;
  try {
    if (!wakeLockSentinel.released) {
      await wakeLockSentinel.release();
      devLog('released');
    }
  } catch (error) {
    devLog('release failed', error);
  } finally {
    wakeLockSentinel = null;
  }
}
