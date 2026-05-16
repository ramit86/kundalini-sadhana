export type SessionKey = 'morning' | 'night';
export type SessionStatus = 'not_started' | 'completed' | 'cancelled';
export type TodayStatusMap = Record<SessionKey, SessionStatus>;

interface DayStatus {
  morning: SessionStatus;
  night: SessionStatus;
}

interface TrackerStore {
  byDate: Record<string, DayStatus>;
}

interface TrackerDay {
  date: string;
  morning: SessionStatus;
  night: SessionStatus;
}

interface TrackerStreaks {
  morning: number;
  night: number;
  both: number;
}

const STORAGE_KEY = 'ks_daily_tracker_v1';

function getLocalDateKey(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultDayStatus(): DayStatus {
  return { morning: 'not_started', night: 'not_started' };
}

function loadStore(): TrackerStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { byDate: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.byDate !== 'object') {
      return { byDate: {} };
    }
    return parsed as TrackerStore;
  } catch {
    return { byDate: {} };
  }
}

function saveStore(store: TrackerStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function readDayStatus(date: string): DayStatus {
  const store = loadStore();
  return store.byDate[date] ?? getDefaultDayStatus();
}

function writeDayStatus(date: string, patch: Partial<DayStatus>) {
  const store = loadStore();
  const current = store.byDate[date] ?? getDefaultDayStatus();
  store.byDate[date] = { ...current, ...patch };
  saveStore(store);
}

export function getTodayStatus(): TodayStatusMap {
  const day = readDayStatus(getLocalDateKey());
  return { morning: day.morning, night: day.night };
}

export function recordCompletion(sessionKey: SessionKey): void {
  writeDayStatus(getLocalDateKey(), { [sessionKey]: 'completed' });
}

export function cancelSession(sessionKey: SessionKey): void {
  writeDayStatus(getLocalDateKey(), { [sessionKey]: 'cancelled' });
}

export function restartSession(sessionKey: SessionKey): void {
  writeDayStatus(getLocalDateKey(), { [sessionKey]: 'not_started' });
}

function getRecentDays(days: number): TrackerDay[] {
  const store = loadStore();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const date = getLocalDateKey(d);
    const status = store.byDate[date] ?? getDefaultDayStatus();
    return {
      date,
      morning: status.morning,
      night: status.night,
    };
  });
}

export function getStreaks(maxDays = 365): TrackerStreaks {
  const days = getRecentDays(maxDays);
  let morning = 0;
  let night = 0;
  let both = 0;

  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].morning === 'completed') morning += 1;
    else break;
  }
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].night === 'completed') night += 1;
    else break;
  }
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].morning === 'completed' && days[i].night === 'completed') both += 1;
    else break;
  }

  return { morning, night, both };
}

export function getTrackerData(days = 28): { days: TrackerDay[]; streaks: TrackerStreaks } {
  return {
    days: getRecentDays(days),
    streaks: getStreaks(),
  };
}
