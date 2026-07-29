import { Session } from '../data/sessions';
import type { GuidanceMode } from '../audio/voiceManager';

export type Screen = 'home' | 'overview' | 'active' | 'end';

export interface SessionState {
  screen: Screen;
  session: Session | null;
  practiceIndex: number;
  timeRemaining: number;
  isRunning: boolean;
  ambientOn: boolean;
  voiceOn: boolean;
  ambientVolume: number;
  isSpeaking: boolean;
  narrationText: string;
}

const STORAGE_KEY = 'ks_last_session';
const PREFS_KEY = 'ks_preferences';
const ACTIVE_SESSION_KEY = 'ks_active_session_v1';

export interface SessionLifecycle {
  sessionId: string;
  sessionStartedAt: string;
}

export interface SavedProgress {
  sessionKey: string;
  practiceIndex: number;
  timeRemaining: number;
  sessionId?: string;
  sessionStartedAt?: string;
  resumePracticeIndex?: number;
  resumeTimeRemaining?: number;
  openingInvocationSeen?: boolean;
  sessionPhase?: string;
  closingSilentRemaining?: number;
  practiceStates?: Record<string, {
    timeRemaining: number;
    completed: boolean;
  }>;
}

export interface Preferences {
  ambientOn?: boolean;
  voiceOn?: boolean;
  guidanceMode?: GuidanceMode;
  lastSessionKey?: 'morning' | 'night';
}

export interface SaveProgressPatch {
  sessionId?: string;
  sessionStartedAt?: string;
  resumePracticeIndex?: number;
  resumeTimeRemaining?: number;
  openingInvocationSeen?: boolean;
  sessionPhase?: string;
  closingSilentRemaining?: number;
  practiceStates?: Record<string, {
    timeRemaining: number;
    completed: boolean;
  }>;
}

function createFallbackSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createSessionLifecycle(): SessionLifecycle {
  return {
    sessionId: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : createFallbackSessionId(),
    sessionStartedAt: new Date().toISOString(),
  };
}

function normalizeSessionLifecycle(input: unknown): SessionLifecycle | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Partial<SessionLifecycle>;
  if (typeof raw.sessionId !== 'string' || !raw.sessionId.trim()) return null;
  if (typeof raw.sessionStartedAt !== 'string' || !raw.sessionStartedAt.trim()) return null;
  return {
    sessionId: raw.sessionId,
    sessionStartedAt: raw.sessionStartedAt,
  };
}

export function getActiveSessionLifecycle(): SessionLifecycle | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    return normalizeSessionLifecycle(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function setActiveSessionLifecycle(lifecycle: SessionLifecycle) {
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(lifecycle));
}

export function invalidateActiveSessionLifecycle() {
  setActiveSessionLifecycle(createSessionLifecycle());
}

function resolveCanonicalProgress(raw: Partial<SavedProgress>, practiceStates?: SavedProgress['practiceStates']) {
  if (typeof raw.resumePracticeIndex === 'number') {
    return {
      resumePracticeIndex: raw.resumePracticeIndex,
      resumeTimeRemaining: typeof raw.resumeTimeRemaining === 'number' ? raw.resumeTimeRemaining : raw.timeRemaining,
    };
  }

  if (practiceStates) {
    const entries = Object.entries(practiceStates)
      .map(([key, value]) => [Number(key), value] as const)
      .filter(([index]) => Number.isInteger(index))
      .sort((a, b) => a[0] - b[0]);

    for (const [index, value] of entries) {
      if (value.completed !== true) {
        return {
          resumePracticeIndex: index,
          resumeTimeRemaining: value.timeRemaining,
        };
      }
    }
  }

  return {
    resumePracticeIndex: typeof raw.practiceIndex === 'number' ? raw.practiceIndex : 0,
    resumeTimeRemaining: typeof raw.timeRemaining === 'number' ? raw.timeRemaining : 0,
  };
}

function normalizeProgress(input: unknown): SavedProgress | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Partial<SavedProgress>;
  if (typeof raw.sessionKey !== 'string') return null;
  if (typeof raw.practiceIndex !== 'number' || typeof raw.timeRemaining !== 'number') return null;
  const practiceStates = raw.practiceStates && typeof raw.practiceStates === 'object'
    ? Object.fromEntries(
      Object.entries(raw.practiceStates).map(([key, value]) => {
        const entry = value as { timeRemaining?: unknown; completed?: unknown };
        return [key, {
          timeRemaining: typeof entry.timeRemaining === 'number' ? entry.timeRemaining : 0,
          completed: entry.completed === true,
        }];
      })
    )
    : undefined;
  return {
    sessionKey: raw.sessionKey as 'morning' | 'night',
    practiceIndex: raw.practiceIndex,
    timeRemaining: raw.timeRemaining,
    ...(typeof raw.sessionId === 'string' ? { sessionId: raw.sessionId } : {}),
    ...(typeof raw.sessionStartedAt === 'string' ? { sessionStartedAt: raw.sessionStartedAt } : {}),
    ...resolveCanonicalProgress(raw, practiceStates),
    openingInvocationSeen: raw.openingInvocationSeen === true,
    ...(typeof raw.sessionPhase === 'string' ? { sessionPhase: raw.sessionPhase } : {}),
    ...(typeof raw.closingSilentRemaining === 'number'
      ? { closingSilentRemaining: Math.max(0, raw.closingSilentRemaining) }
      : {}),
    ...(practiceStates ? { practiceStates } : {}),
  };
}

export function saveProgress(
  sessionKey: string,
  practiceIndex: number,
  timeRemaining: number,
  patch?: SaveProgressPatch,
) {
  const activeLifecycle = getActiveSessionLifecycle();
  const sessionId = patch?.sessionId ?? activeLifecycle?.sessionId;
  const sessionStartedAt = patch?.sessionStartedAt ?? activeLifecycle?.sessionStartedAt;
  if (activeLifecycle) {
    if (!patch?.sessionId) return;
    if (patch.sessionId !== activeLifecycle.sessionId) return;
  }
  const next: SavedProgress = {
    sessionKey,
    practiceIndex,
    timeRemaining,
    ...(sessionId ? { sessionId } : {}),
    ...(sessionStartedAt ? { sessionStartedAt } : {}),
    resumePracticeIndex: patch?.resumePracticeIndex ?? practiceIndex,
    resumeTimeRemaining: patch?.resumeTimeRemaining ?? timeRemaining,
    ...(patch?.openingInvocationSeen ? { openingInvocationSeen: true } : {}),
    ...(patch?.sessionPhase ? { sessionPhase: patch.sessionPhase } : {}),
    ...(typeof patch?.closingSilentRemaining === 'number'
      ? { closingSilentRemaining: Math.max(0, patch.closingSilentRemaining) }
      : {}),
    ...(patch?.practiceStates ? { practiceStates: patch.practiceStates } : {}),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAmbientVolume(): number {
  const v = localStorage.getItem('ks_ambient_vol');
  return v ? parseFloat(v) : 0.35;
}

export function setStoredAmbientVolume(v: number) {
  localStorage.setItem('ks_ambient_vol', String(v));
}

export function getPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Preferences;
  } catch {
    return {};
  }
}

export function savePreferences(patch: Partial<Preferences>) {
  const current = getPreferences();
  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...patch }));
}
