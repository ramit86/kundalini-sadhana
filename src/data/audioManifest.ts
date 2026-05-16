export type ChakraAudioKey =
  | 'mooladhara'
  | 'swadhisthana'
  | 'manipura'
  | 'anahata'
  | 'vishuddhi'
  | 'ajna'
  | 'bindu'
  | 'integration';

export interface AudioTrack {
  id: string;
  label: string;
  path: string;
}

export interface AmbientTrack extends AudioTrack {
  kind: 'ambient';
}

export interface MantraTrack extends AudioTrack {
  kind: 'mantra';
  mantra: string;
}

export interface BellTrack extends AudioTrack {
  kind: 'bell';
}

export interface VoiceTrack extends AudioTrack {
  kind: 'voice';
  session: 'morning' | 'night' | 'universal';
}

export type ChakraMappedTracks<T extends AudioTrack> = Record<ChakraAudioKey, T[]>;

export interface AudioManifest {
  ambient: ChakraMappedTracks<AmbientTrack>;
  mantras: ChakraMappedTracks<MantraTrack>;
  bells: {
    start: BellTrack[];
    transition: BellTrack[];
    end: BellTrack[];
    deepClose: BellTrack[];
  };
  voice: {
    morning: VoiceTrack[];
    night: VoiceTrack[];
    universal: VoiceTrack[];
  };
}

export const AUDIO_MANIFEST: AudioManifest = {
  ambient: {
    mooladhara: [
      { id: 'ambient-mooladhara-base', kind: 'ambient', label: 'Mooladhara Base Drone', path: '/audio/ambient/mooladhara/base.mp3' },
    ],
    swadhisthana: [
      { id: 'ambient-swadhisthana-base', kind: 'ambient', label: 'Swadhisthana Flow Bed', path: '/audio/ambient/swadhisthana/base.mp3' },
    ],
    manipura: [
      { id: 'ambient-manipura-base', kind: 'ambient', label: 'Manipura Fire Bed', path: '/audio/ambient/manipura/base.mp3' },
    ],
    anahata: [
      { id: 'ambient-anahata-base', kind: 'ambient', label: 'Anahata Heart Field', path: '/audio/ambient/anahata/base.mp3' },
    ],
    vishuddhi: [
      { id: 'ambient-vishuddhi-base', kind: 'ambient', label: 'Vishuddhi Ether Bed', path: '/audio/ambient/vishuddhi/base.mp3' },
    ],
    ajna: [
      { id: 'ambient-ajna-base', kind: 'ambient', label: 'Ajna Focus Field', path: '/audio/ambient/ajna/base.mp3' },
    ],
    bindu: [
      { id: 'ambient-bindu-base', kind: 'ambient', label: 'Bindu Lunar Bed', path: '/audio/ambient/bindu/base.mp3' },
    ],
    integration: [
      { id: 'ambient-integration-base', kind: 'ambient', label: 'Integration Sushumna Field', path: '/audio/ambient/integration/base.mp3' },
    ],
  },
  mantras: {
    mooladhara: [
      { id: 'mantra-mooladhara-lam', kind: 'mantra', label: 'LAM Loop', mantra: 'LAM', path: '/audio/mantras/mooladhara/lam-loop.mp3' },
    ],
    swadhisthana: [
      { id: 'mantra-swadhisthana-vam', kind: 'mantra', label: 'VAM Loop', mantra: 'VAM', path: '/audio/mantras/swadhisthana/vam-loop.mp3' },
    ],
    manipura: [
      { id: 'mantra-manipura-ram', kind: 'mantra', label: 'RAM Loop', mantra: 'RAM', path: '/audio/mantras/manipura/ram-loop.mp3' },
    ],
    anahata: [
      { id: 'mantra-anahata-yam', kind: 'mantra', label: 'YAM Loop', mantra: 'YAM', path: '/audio/mantras/anahata/yam-loop.mp3' },
    ],
    vishuddhi: [
      { id: 'mantra-vishuddhi-ham', kind: 'mantra', label: 'HAM Loop', mantra: 'HAM', path: '/audio/mantras/vishuddhi/ham-loop.mp3' },
    ],
    ajna: [
      { id: 'mantra-ajna-om', kind: 'mantra', label: 'OM Loop', mantra: 'OM', path: '/audio/mantras/ajna/om-loop.mp3' },
    ],
    bindu: [
      { id: 'mantra-bindu-om', kind: 'mantra', label: 'Bindu OM Loop', mantra: 'OM', path: '/audio/mantras/bindu/om-loop.mp3' },
    ],
    integration: [
      { id: 'mantra-integration-om', kind: 'mantra', label: 'Integration OM Field', mantra: 'OM', path: '/audio/mantras/integration/om-loop.mp3' },
    ],
  },
  bells: {
    start: [
      { id: 'bell-start-soft', kind: 'bell', label: 'Soft Start Bell', path: '/audio/bells/start/soft-bell.mp3' },
    ],
    transition: [
      { id: 'bell-transition-single', kind: 'bell', label: 'Transition Bell', path: '/audio/bells/transition/single.mp3' },
    ],
    end: [
      { id: 'bell-end-triple', kind: 'bell', label: 'End Triple Bell', path: '/audio/bells/end/triple.mp3' },
    ],
    deepClose: [
      { id: 'bell-deep-close', kind: 'bell', label: 'Deep Close Bell', path: '/audio/bells/deep-close/temple.mp3' },
    ],
  },
  voice: {
    morning: [
      { id: 'voice-morning-guided-en', kind: 'voice', session: 'morning', label: 'Morning Guided (EN)', path: '/audio/voice/morning/guided-en.mp3' },
    ],
    night: [
      { id: 'voice-night-guided-en', kind: 'voice', session: 'night', label: 'Night Guided (EN)', path: '/audio/voice/night/guided-en.mp3' },
    ],
    universal: [
      { id: 'voice-universal-practice-cues', kind: 'voice', session: 'universal', label: 'Universal Practice Cues', path: '/audio/voice/universal/practice-cues.mp3' },
    ],
  },
};

