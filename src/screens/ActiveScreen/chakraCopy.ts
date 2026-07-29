export const CHAKRA_SEQUENCE = ['Bindu', 'Ajna', 'Vishuddhi', 'Anahata', 'Manipura', 'Swadhisthana', 'Mooladhara'] as const;

export const CHAKRA_SHORT_MEANING: Partial<Record<string, string>> = {
  Mooladhara: 'Rooted presence and steadiness.',
  Swadhisthana: 'Flow, receptivity, and inner softness.',
  Manipura: 'Inner fire, resolve, and clarity.',
  Anahata: 'Unstruck compassion and devotional openness.',
  Vishuddhi: 'Purity of expression and subtle listening.',
  Ajna: 'Inner seeing and one-pointed awareness.',
  Bindu: 'The subtle point of dissolution into stillness.',
  Preparation: 'Arriving inward and becoming available.',
  'All Chakras': 'Harmonising the whole inner channel.',
};

export const CHAKRA_SPIRITUAL_BENEFITS: Partial<Record<string, string[]>> = {
  Mooladhara: ['Settled attention in the present moment', 'Quiet confidence in stillness', 'A gentle sense of inner support'],
  Swadhisthana: ['Smoother emotional flow', 'Creative devotional mood', 'Softening of inner resistance'],
  Manipura: ['Steady inner discipline', 'Clear intention in practice', 'Warmth of purposeful awareness'],
  Anahata: ['Tender compassion toward self and others', 'Calm devotional feeling', 'A sense of spacious forgiveness'],
  Vishuddhi: ['Refined inner listening', 'Honest and simple expression', 'Subtle feeling of purification'],
  Ajna: ['Sharpened witnessing awareness', 'Natural mental quietness', 'A centered intuitive gaze within'],
  Bindu: ['Taste of inward silence', 'Refinement of subtle perception', 'Restful contemplative depth'],
  Preparation: ['Grounding before deeper practice', 'Soft transition from outer to inner', 'Easeful settling of attention'],
  'All Chakras': ['Balanced energetic tone', 'Unified meditative flow', 'Wholeness in inward awareness'],
};
