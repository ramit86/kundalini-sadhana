import { saveSettings, PersonalSettings } from './settingsStore';

type TrackerStatus = 'not_started' | 'completed' | 'cancelled';

interface TrackerDayStatus {
  morning: TrackerStatus;
  night: TrackerStatus;
}

interface TrackerStoreShape {
  byDate: Record<string, TrackerDayStatus>;
}

export interface AppBackupPayload {
  appVersion: string;
  exportedAt: string;
  trackerData: TrackerStoreShape | null;
  settingsData: PersonalSettings | null;
}

export interface BackupSummary {
  appVersion: string;
  hasTrackerData: boolean;
  trackerDayCount: number;
  hasSettingsData: boolean;
  lastExportedAt: string | null;
  lastImportedAt: string | null;
}

export interface ImportResult {
  ok: boolean;
  imported: { trackerData: boolean; settingsData: boolean };
  error?: string;
}

const TRACKER_STORAGE_KEY = 'ks_daily_tracker_v1';
const SETTINGS_STORAGE_KEY = 'ks_personal_settings_v1';
const BACKUP_META_KEY = 'ks_backup_meta_v1';
const FALLBACK_APP_VERSION = '0.0.0';
const VALID_TRACKER_STATUS: TrackerStatus[] = ['not_started', 'completed', 'cancelled'];

function getAppVersion(): string {
  const envVersion = (import.meta.env.VITE_APP_VERSION as string | undefined)?.trim();
  return envVersion && envVersion.length > 0 ? envVersion : FALLBACK_APP_VERSION;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTrackerStatus(value: unknown): value is TrackerStatus {
  return typeof value === 'string' && VALID_TRACKER_STATUS.includes(value as TrackerStatus);
}

function validateTrackerData(input: unknown): TrackerStoreShape | null {
  if (!isObject(input) || !isObject(input.byDate)) return null;
  const byDate: Record<string, TrackerDayStatus> = {};

  for (const [dateKey, value] of Object.entries(input.byDate)) {
    if (!isObject(value)) return null;
    if (!isTrackerStatus(value.morning) || !isTrackerStatus(value.night)) return null;
    byDate[dateKey] = { morning: value.morning, night: value.night };
  }

  return { byDate };
}

function readSettingsData(): PersonalSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersonalSettings>;
    return saveSettings(parsed as PersonalSettings);
  } catch {
    return null;
  }
}

function readTrackerData(): TrackerStoreShape | null {
  try {
    const raw = localStorage.getItem(TRACKER_STORAGE_KEY);
    if (!raw) return null;
    return validateTrackerData(JSON.parse(raw));
  } catch {
    return null;
  }
}

function readMeta(): { lastExportedAt: string | null; lastImportedAt: string | null } {
  try {
    const raw = localStorage.getItem(BACKUP_META_KEY);
    if (!raw) return { lastExportedAt: null, lastImportedAt: null };
    const parsed = JSON.parse(raw);
    if (!isObject(parsed)) return { lastExportedAt: null, lastImportedAt: null };
    return {
      lastExportedAt: typeof parsed.lastExportedAt === 'string' ? parsed.lastExportedAt : null,
      lastImportedAt: typeof parsed.lastImportedAt === 'string' ? parsed.lastImportedAt : null,
    };
  } catch {
    return { lastExportedAt: null, lastImportedAt: null };
  }
}

function writeMeta(meta: { lastExportedAt?: string; lastImportedAt?: string }) {
  const current = readMeta();
  const next = {
    lastExportedAt: meta.lastExportedAt ?? current.lastExportedAt,
    lastImportedAt: meta.lastImportedAt ?? current.lastImportedAt,
  };
  localStorage.setItem(BACKUP_META_KEY, JSON.stringify(next));
}

export function exportAppData(): string {
  const payload: AppBackupPayload = {
    appVersion: getAppVersion(),
    exportedAt: new Date().toISOString(),
    trackerData: readTrackerData(),
    settingsData: readSettingsData(),
  };
  writeMeta({ lastExportedAt: payload.exportedAt });
  return JSON.stringify(payload, null, 2);
}

export function importAppData(json: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return {
      ok: false,
      imported: { trackerData: false, settingsData: false },
      error: 'Invalid JSON.',
    };
  }

  if (!isObject(parsed)) {
    return {
      ok: false,
      imported: { trackerData: false, settingsData: false },
      error: 'Backup payload must be an object.',
    };
  }

  const trackerData = validateTrackerData(parsed.trackerData);
  const settingsData = parsed.settingsData;

  const imported = { trackerData: false, settingsData: false };

  if (trackerData) {
    localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(trackerData));
    imported.trackerData = true;
  }

  if (isObject(settingsData)) {
    saveSettings(settingsData as unknown as PersonalSettings);
    imported.settingsData = true;
  }

  if (!imported.trackerData && !imported.settingsData) {
    return {
      ok: false,
      imported,
      error: 'No valid trackerData or settingsData found in backup.',
    };
  }

  writeMeta({ lastImportedAt: new Date().toISOString() });
  return { ok: true, imported };
}

export function clearAllAppData(): void {
  localStorage.removeItem(TRACKER_STORAGE_KEY);
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
}

export function getBackupSummary(): BackupSummary {
  const trackerData = readTrackerData();
  const settingsData = readSettingsData();
  const meta = readMeta();
  return {
    appVersion: getAppVersion(),
    hasTrackerData: !!trackerData,
    trackerDayCount: trackerData ? Object.keys(trackerData.byDate).length : 0,
    hasSettingsData: !!settingsData,
    lastExportedAt: meta.lastExportedAt,
    lastImportedAt: meta.lastImportedAt,
  };
}
