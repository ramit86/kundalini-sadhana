export interface ReminderSettings {
  morningReminderEnabled: boolean;
  morningReminderTime: string; // HH:MM (24h)
  nightReminderEnabled: boolean;
  nightReminderTime: string; // HH:MM (24h)
}

const STORAGE_KEY = 'ks_reminder_settings_v1';
const TIME_24H_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  morningReminderEnabled: false,
  morningReminderTime: '06:00',
  nightReminderEnabled: false,
  nightReminderTime: '21:30',
};

function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_24H_REGEX.test(value);
}

function sanitizeSettings(input: Partial<ReminderSettings> | null | undefined): ReminderSettings {
  const safe = input ?? {};
  return {
    morningReminderEnabled:
      typeof safe.morningReminderEnabled === 'boolean'
        ? safe.morningReminderEnabled
        : DEFAULT_REMINDER_SETTINGS.morningReminderEnabled,
    morningReminderTime: isValidTime(safe.morningReminderTime)
      ? safe.morningReminderTime
      : DEFAULT_REMINDER_SETTINGS.morningReminderTime,
    nightReminderEnabled:
      typeof safe.nightReminderEnabled === 'boolean'
        ? safe.nightReminderEnabled
        : DEFAULT_REMINDER_SETTINGS.nightReminderEnabled,
    nightReminderTime: isValidTime(safe.nightReminderTime)
      ? safe.nightReminderTime
      : DEFAULT_REMINDER_SETTINGS.nightReminderTime,
  };
}

export function getReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_REMINDER_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
    return sanitizeSettings(parsed);
  } catch {
    return { ...DEFAULT_REMINDER_SETTINGS };
  }
}

export function updateReminderSettings(patch: Partial<ReminderSettings>): ReminderSettings {
  const current = getReminderSettings();
  const next = sanitizeSettings({ ...current, ...patch });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function resetReminderSettings(): ReminderSettings {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_REMINDER_SETTINGS };
}

