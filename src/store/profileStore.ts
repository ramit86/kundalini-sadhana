import { AppLanguage, SacredPracticeWindow } from './settingsStore';

export interface SadhanaProfile {
  displayName: string;
  preferredLanguage: AppLanguage;
  practiceWindow: SacredPracticeWindow;
  customPracticeWindowLabel: string;
}

const STORAGE_KEY = 'ks_sadhana_profile_v1';

export const DEFAULT_PROFILE: SadhanaProfile = {
  displayName: 'Practitioner',
  preferredLanguage: 'english',
  practiceWindow: 'morning',
  customPracticeWindowLabel: '',
};

function sanitizeProfile(input: Partial<SadhanaProfile> | null | undefined): SadhanaProfile {
  const safe = input ?? {};
  return {
    displayName: typeof safe.displayName === 'string' && safe.displayName.trim()
      ? safe.displayName.trim().slice(0, 36)
      : DEFAULT_PROFILE.displayName,
    preferredLanguage: safe.preferredLanguage === 'hindi' ? 'hindi' : 'english',
    practiceWindow:
      safe.practiceWindow === 'brahma_muhurta' ||
      safe.practiceWindow === 'sunrise' ||
      safe.practiceWindow === 'morning' ||
      safe.practiceWindow === 'sunset' ||
      safe.practiceWindow === 'evening' ||
      safe.practiceWindow === 'custom'
        ? safe.practiceWindow
        : DEFAULT_PROFILE.practiceWindow,
    customPracticeWindowLabel: typeof safe.customPracticeWindowLabel === 'string'
      ? safe.customPracticeWindowLabel.trim().slice(0, 48)
      : DEFAULT_PROFILE.customPracticeWindowLabel,
  };
}

export function getSadhanaProfile(): SadhanaProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return sanitizeProfile(JSON.parse(raw) as Partial<SadhanaProfile>);
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveSadhanaProfile(profile: SadhanaProfile): SadhanaProfile {
  const safe = sanitizeProfile(profile);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  return safe;
}

export function updateSadhanaProfile(patch: Partial<SadhanaProfile>): SadhanaProfile {
  const current = getSadhanaProfile();
  const next = sanitizeProfile({ ...current, ...patch });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function resetSadhanaProfile(): SadhanaProfile {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_PROFILE };
}
