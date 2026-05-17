export type NarrationAreaKey =
  | 'opening'
  | 'mooladhara'
  | 'swadhisthana'
  | 'manipura'
  | 'anahata'
  | 'vishuddhi'
  | 'ajna'
  | 'bindu'
  | 'integration'
  | 'closing';

export interface NarrationManifest {
  language: 'english';
  basePath: '/audio/voice/english';
  sections: Record<NarrationAreaKey, readonly string[]>;
}

const BASE_PATH = '/audio/voice/english' as const;

const sectionFiles = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, i) => `${BASE_PATH}/${prefix}${String(i + 1).padStart(2, '0')}.mp3`);

export const ENGLISH_NARRATION_MANIFEST: NarrationManifest = {
  language: 'english',
  basePath: BASE_PATH,
  sections: {
    opening: sectionFiles('opening', 6),
    mooladhara: sectionFiles('mooladhara', 7),
    swadhisthana: sectionFiles('swadhisthana', 5),
    manipura: sectionFiles('manipura', 5),
    anahata: sectionFiles('anahata', 5),
    vishuddhi: sectionFiles('vishuddhi', 5),
    ajna: sectionFiles('ajna', 5),
    bindu: sectionFiles('bindu', 4),
    integration: sectionFiles('integration', 5),
    closing: sectionFiles('closing', 4),
  },
};

