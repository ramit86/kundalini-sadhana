import { Session } from '../data/sessions';
import { GuidanceMode } from '../audio/voiceManager';

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

export interface SavedProgress {
  sessionKey: string;
  practiceIndex: number;
  timeRemaining: number;
}

export interface Preferences {
  ambientOn?: boolean;
  voiceOn?: boolean;
  guidanceMode?: GuidanceMode;
  lastSessionKey?: 'morning' | 'night';
}

export function saveProgress(sessionKey: string, practiceIndex: number, timeRemaining: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionKey, practiceIndex, timeRemaining }));
}

export function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedProgress;
  } catch (_) { return null; }
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
  } catch (_) { return {}; }
}

export function savePreferences(patch: Partial<Preferences>) {
  const current = getPreferences();
  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...patch }));
}
