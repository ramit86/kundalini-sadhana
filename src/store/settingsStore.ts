export type AppLanguage = 'english' | 'hindi';
export type NarrationMode = 'full' | 'minimal' | 'silent';
export type ChakraGlowIntensity = 'low' | 'medium' | 'high';
export type ThemeMode = 'dark' | 'light' | 'auto';
export const SETTINGS_CHANGED_EVENT = 'ks-settings-changed';

export interface PersonalSettings {
  language: AppLanguage;
  themeMode: ThemeMode;
  narrationMode: NarrationMode;
  voiceEnabled: boolean;
  ambientEnabled: boolean;
  voiceVolume: number;
  ambientVolume: number;
  chakraGlowIntensity: ChakraGlowIntensity;
  showChakraInfo: boolean;
  showBodyMap: boolean;
  remindersEnabled: boolean;
}

const STORAGE_KEY = 'ks_personal_settings_v1';

export const DEFAULT_SETTINGS: PersonalSettings = {
  language: 'english',
  themeMode: 'dark',
  narrationMode: 'full',
  voiceEnabled: true,
  ambientEnabled: true,
  voiceVolume: 0.8,
  ambientVolume: 0.6,
  chakraGlowIntensity: 'medium',
  showChakraInfo: true,
  showBodyMap: true,
  remindersEnabled: false,
};

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function sanitizeSettings(input: Partial<PersonalSettings> | null | undefined): PersonalSettings {
  const safe = input ?? {};
  return {
    language: safe.language === 'hindi' ? 'hindi' : 'english',
    themeMode:
      safe.themeMode === 'light' || safe.themeMode === 'auto'
        ? safe.themeMode
        : 'dark',
    narrationMode:
      safe.narrationMode === 'minimal' || safe.narrationMode === 'silent'
        ? safe.narrationMode
        : 'full',
    voiceEnabled: typeof safe.voiceEnabled === 'boolean' ? safe.voiceEnabled : DEFAULT_SETTINGS.voiceEnabled,
    ambientEnabled: typeof safe.ambientEnabled === 'boolean' ? safe.ambientEnabled : DEFAULT_SETTINGS.ambientEnabled,
    voiceVolume: typeof safe.voiceVolume === 'number' ? clamp01(safe.voiceVolume) : DEFAULT_SETTINGS.voiceVolume,
    ambientVolume: typeof safe.ambientVolume === 'number' ? clamp01(safe.ambientVolume) : DEFAULT_SETTINGS.ambientVolume,
    chakraGlowIntensity:
      safe.chakraGlowIntensity === 'low' || safe.chakraGlowIntensity === 'high'
        ? safe.chakraGlowIntensity
        : 'medium',
    showChakraInfo: typeof safe.showChakraInfo === 'boolean' ? safe.showChakraInfo : DEFAULT_SETTINGS.showChakraInfo,
    showBodyMap: typeof safe.showBodyMap === 'boolean' ? safe.showBodyMap : DEFAULT_SETTINGS.showBodyMap,
    remindersEnabled: typeof safe.remindersEnabled === 'boolean' ? safe.remindersEnabled : DEFAULT_SETTINGS.remindersEnabled,
  };
}

function emitSettingsChanged(settings: PersonalSettings) {
  try {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent<PersonalSettings>(SETTINGS_CHANGED_EVENT, { detail: settings })
    );
  } catch {
    // ignore dispatch failures
  }
}

export function getSettings(): PersonalSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<PersonalSettings>;
    return sanitizeSettings(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: PersonalSettings): PersonalSettings {
  const safe = sanitizeSettings(settings);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  emitSettingsChanged(safe);
  return safe;
}

export function updateSettings(patch: Partial<PersonalSettings>): PersonalSettings {
  const current = getSettings();
  const next = sanitizeSettings({ ...current, ...patch });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitSettingsChanged(next);
  return next;
}

export function resetSettings(): PersonalSettings {
  localStorage.removeItem(STORAGE_KEY);
  const next = { ...DEFAULT_SETTINGS };
  emitSettingsChanged(next);
  return next;
}
