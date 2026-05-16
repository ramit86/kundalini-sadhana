export interface PracticeMetaEntry {
  personalNote?: string;
  isFavorite?: boolean;
  customLabel?: string;
}

export type PracticeMetaMap = Record<string, PracticeMetaEntry>;

const STORAGE_KEY = 'ks_practice_meta_v1';
const MAX_PERSONAL_NOTE_LENGTH = 160;
const MAX_CUSTOM_LABEL_LENGTH = 48;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanShortText(value: unknown, maxLen: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLen);
}

function sanitizeEntry(input: unknown): PracticeMetaEntry {
  if (!isObject(input)) return {};
  const personalNote = cleanShortText(input.personalNote, MAX_PERSONAL_NOTE_LENGTH);
  const customLabel = cleanShortText(input.customLabel, MAX_CUSTOM_LABEL_LENGTH);
  const isFavorite = typeof input.isFavorite === 'boolean' ? input.isFavorite : undefined;
  return {
    ...(personalNote ? { personalNote } : {}),
    ...(typeof isFavorite === 'boolean' ? { isFavorite } : {}),
    ...(customLabel ? { customLabel } : {}),
  };
}

function sanitizeMetaMap(input: unknown): PracticeMetaMap {
  if (!isObject(input)) return {};
  const out: PracticeMetaMap = {};
  for (const [practiceId, rawEntry] of Object.entries(input)) {
    const entry = sanitizeEntry(rawEntry);
    if (
      typeof entry.personalNote !== 'undefined' ||
      typeof entry.isFavorite !== 'undefined' ||
      typeof entry.customLabel !== 'undefined'
    ) {
      out[practiceId] = entry;
    }
  }
  return out;
}

export function getPracticeMeta(): PracticeMetaMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return sanitizeMetaMap(parsed);
  } catch {
    return {};
  }
}

export function updatePracticeMeta(practiceId: string, patch: PracticeMetaEntry): PracticeMetaMap {
  const safeId = practiceId.trim();
  if (!safeId) return getPracticeMeta();

  const current = getPracticeMeta();
  const currentEntry = current[safeId] ?? {};
  const nextEntry = sanitizeEntry({ ...currentEntry, ...patch });

  if (
    typeof nextEntry.personalNote === 'undefined' &&
    typeof nextEntry.isFavorite === 'undefined' &&
    typeof nextEntry.customLabel === 'undefined'
  ) {
    delete current[safeId];
  } else {
    current[safeId] = nextEntry;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current;
}

export function resetPracticeMeta(): PracticeMetaMap {
  localStorage.removeItem(STORAGE_KEY);
  return {};
}

