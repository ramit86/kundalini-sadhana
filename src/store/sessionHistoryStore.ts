import { SessionKey } from '../lib/tracker';

export type SessionOutcome = 'completed' | 'cancelled';

export interface SessionHistoryEntry {
  id: string;
  sessionKey: SessionKey;
  outcome: SessionOutcome;
  completedAt: string;
  durationMinutes: number;
  practiceCount: number;
  sessionLabel: string;
}

const STORAGE_KEY = 'ks_session_history_v1';

function safeParseHistory(input: unknown): SessionHistoryEntry[] {
  if (!Array.isArray(input)) return [];
  return input.flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const raw = item as Partial<SessionHistoryEntry>;
    if (raw.sessionKey !== 'morning' && raw.sessionKey !== 'night') return [];
    if (raw.outcome !== 'completed' && raw.outcome !== 'cancelled') return [];
    if (typeof raw.completedAt !== 'string') return [];
    if (typeof raw.durationMinutes !== 'number' || Number.isNaN(raw.durationMinutes)) return [];
    if (typeof raw.practiceCount !== 'number' || Number.isNaN(raw.practiceCount)) return [];
    if (typeof raw.sessionLabel !== 'string') return [];
    return [{
      id: typeof raw.id === 'string' && raw.id.trim() ? raw.id : `${raw.sessionKey}-${raw.completedAt}`,
      sessionKey: raw.sessionKey,
      outcome: raw.outcome,
      completedAt: raw.completedAt,
      durationMinutes: Math.max(0, Math.round(raw.durationMinutes)),
      practiceCount: Math.max(0, Math.round(raw.practiceCount)),
      sessionLabel: raw.sessionLabel,
    }];
  });
}

function loadHistory(): SessionHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return safeParseHistory(JSON.parse(raw)).sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  } catch {
    return [];
  }
}

function saveHistory(history: SessionHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function recordSessionHistory(entry: Omit<SessionHistoryEntry, 'id'> & { id?: string }) {
  const history = loadHistory();
  const next: SessionHistoryEntry = {
    id: entry.id?.trim() || `${entry.sessionKey}-${entry.completedAt}`,
    sessionKey: entry.sessionKey,
    outcome: entry.outcome,
    completedAt: entry.completedAt,
    durationMinutes: Math.max(0, Math.round(entry.durationMinutes)),
    practiceCount: Math.max(0, Math.round(entry.practiceCount)),
    sessionLabel: entry.sessionLabel,
  };
  history.unshift(next);
  saveHistory(history.slice(0, 240));
  return next;
}

export function getSessionHistory(limit = 120): SessionHistoryEntry[] {
  return loadHistory().slice(0, limit);
}

export function getSessionHistoryForMonth(year: number, monthIndex: number): SessionHistoryEntry[] {
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  return loadHistory().filter(entry => entry.completedAt.startsWith(monthPrefix));
}

export function getMonthlyComparison(reference = new Date()) {
  const currentYear = reference.getFullYear();
  const currentMonth = reference.getMonth();
  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const current = getSessionHistoryForMonth(currentYear, currentMonth);
  const previous = getSessionHistoryForMonth(previousMonthDate.getFullYear(), previousMonthDate.getMonth());
  const currentMinutes = current.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const previousMinutes = previous.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const currentSessions = current.length;
  const previousSessions = previous.length;
  return {
    currentMinutes,
    previousMinutes,
    currentSessions,
    previousSessions,
    minuteDelta: currentMinutes - previousMinutes,
    sessionDelta: currentSessions - previousSessions,
  };
}

export function clearSessionHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
