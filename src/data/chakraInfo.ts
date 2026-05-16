import { ChakraKey } from './sessions';

export type ChakraInfoId =
  | 'Mooladhara'
  | 'Swadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddhi'
  | 'Ajna'
  | 'Bindu'
  | 'All Chakras';

export interface ChakraInfo {
  id: ChakraInfoId;
  displayName: string;
  bodyLocation: string;
  element: string;
  bijaMantra: string;
  color: string;
  spiritualMeaning: string;
  spiritualBenefits: string[];
  glowGradient: string;
  bodyPositionPercent: number;
}

export const CHAKRA_INFO_LIST: ChakraInfo[] = [
  {
    id: 'Mooladhara',
    displayName: 'Mooladhara · Root Chakra',
    bodyLocation: 'Base of spine, pelvic floor',
    element: 'Earth',
    bijaMantra: 'LAM',
    color: '#E04040',
    spiritualMeaning: 'Foundation, steadiness, and sacred rootedness in the present.',
    spiritualBenefits: [
      'A grounded inner posture during practice',
      'Steadier attention and patience',
      'A quiet sense of belonging within oneself',
    ],
    glowGradient: 'radial-gradient(circle at 50% 42%, rgba(224,64,64,0.44) 0%, rgba(224,64,64,0.16) 52%, transparent 84%)',
    bodyPositionPercent: 92,
  },
  {
    id: 'Swadhisthana',
    displayName: 'Swadhisthana · Sacral Chakra',
    bodyLocation: 'Lower abdomen, just above the root center',
    element: 'Water',
    bijaMantra: 'VAM',
    color: '#E87820',
    spiritualMeaning: 'Flow, receptivity, and devotional softness.',
    spiritualBenefits: [
      'Smoother emotional flow in stillness',
      'Gentle creative openness',
      'Ease in releasing inner tension',
    ],
    glowGradient: 'radial-gradient(circle at 50% 42%, rgba(232,120,32,0.42) 0%, rgba(232,120,32,0.14) 52%, transparent 84%)',
    bodyPositionPercent: 82,
  },
  {
    id: 'Manipura',
    displayName: 'Manipura · Solar Center',
    bodyLocation: 'Navel region, solar plexus',
    element: 'Fire',
    bijaMantra: 'RAM',
    color: '#DDB800',
    spiritualMeaning: 'Inner fire, disciplined will, and luminous clarity.',
    spiritualBenefits: [
      'A clearer inner direction',
      'Steadiness in committed practice',
      'Warmth of purposeful awareness',
    ],
    glowGradient: 'radial-gradient(circle at 50% 42%, rgba(221,184,0,0.4) 0%, rgba(221,184,0,0.14) 52%, transparent 84%)',
    bodyPositionPercent: 62,
  },
  {
    id: 'Anahata',
    displayName: 'Anahata · Heart Chakra',
    bodyLocation: 'Center of chest, heart space',
    element: 'Air',
    bijaMantra: 'YAM',
    color: '#48B048',
    spiritualMeaning: 'Compassion, balance, and the unstruck inner resonance.',
    spiritualBenefits: [
      'A softer and kinder inner tone',
      'Calm devotional warmth',
      'A spacious feeling of connection',
    ],
    glowGradient: 'radial-gradient(circle at 50% 42%, rgba(72,176,72,0.4) 0%, rgba(72,176,72,0.14) 52%, transparent 84%)',
    bodyPositionPercent: 46,
  },
  {
    id: 'Vishuddhi',
    displayName: 'Vishuddhi · Throat Chakra',
    bodyLocation: 'Throat center',
    element: 'Ether / Space',
    bijaMantra: 'HAM',
    color: '#3090D8',
    spiritualMeaning: 'Purification, truthful expression, and subtle listening.',
    spiritualBenefits: [
      'Clearer inward listening',
      'Gentle sincerity in expression',
      'A refined sense of inner purity',
    ],
    glowGradient: 'radial-gradient(circle at 50% 42%, rgba(48,144,216,0.4) 0%, rgba(48,144,216,0.14) 52%, transparent 84%)',
    bodyPositionPercent: 28,
  },
  {
    id: 'Ajna',
    displayName: 'Ajna · Third Eye',
    bodyLocation: 'Brow center, inner midline awareness',
    element: 'Light / Mind',
    bijaMantra: 'OM',
    color: '#6650CC',
    spiritualMeaning: 'Insight, witness-consciousness, and one-pointed attention.',
    spiritualBenefits: [
      'Calmer and clearer perception',
      'Stronger meditative focus',
      'Natural inward guidance',
    ],
    glowGradient: 'radial-gradient(circle at 50% 42%, rgba(102,80,204,0.42) 0%, rgba(102,80,204,0.14) 52%, transparent 84%)',
    bodyPositionPercent: 12,
  },
  {
    id: 'Bindu',
    displayName: 'Bindu · Lunar Point',
    bodyLocation: 'Back of head, upper occipital point',
    element: 'Moon / Subtle Essence',
    bijaMantra: 'OM',
    color: '#AA44CC',
    spiritualMeaning: 'Still-point awareness and subtle inward dissolution.',
    spiritualBenefits: [
      'A deepening taste of silence',
      'Refinement of contemplative presence',
      'A restful, inwardly luminous mood',
    ],
    glowGradient: 'radial-gradient(circle at 50% 42%, rgba(170,68,204,0.4) 0%, rgba(170,68,204,0.14) 52%, transparent 84%)',
    bodyPositionPercent: 6,
  },
  {
    id: 'All Chakras',
    displayName: 'Integration · All Chakras',
    bodyLocation: 'Entire central channel',
    element: 'All Elements in Harmony',
    bijaMantra: 'OM',
    color: '#C8A96E',
    spiritualMeaning: 'Wholeness, alignment, and unified inner ascent.',
    spiritualBenefits: [
      'Balanced energetic tone in meditation',
      'A coherent sense of inner alignment',
      'A timeless feeling of inward unity',
    ],
    glowGradient: 'radial-gradient(circle at 50% 42%, rgba(200,169,110,0.38) 0%, rgba(200,169,110,0.12) 52%, transparent 84%)',
    bodyPositionPercent: 50,
  },
];

export const CHAKRA_INFO: Partial<Record<ChakraKey, ChakraInfo>> = CHAKRA_INFO_LIST.reduce(
  (acc, chakra) => {
    acc[chakra.id] = chakra;
    return acc;
  },
  {} as Partial<Record<ChakraKey, ChakraInfo>>
);
