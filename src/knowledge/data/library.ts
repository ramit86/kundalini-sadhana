import {
  GuideCard,
  GlossaryEntry,
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeReference,
} from '../models/knowledge';

const articleRef = (id: string, label: string, note?: string): KnowledgeReference => ({
  id,
  kind: 'article',
  label,
  ...(note ? { note } : {}),
});

const glossaryRef = (id: string, label: string, note?: string): KnowledgeReference => ({
  id,
  kind: 'glossary',
  label,
  ...(note ? { note } : {}),
});

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  {
    id: 'practice-preparation',
    title: 'Practice Preparation',
    summary: 'How to arrive rested, steady, and ready for practice.',
    status: 'available',
    order: 1,
    articleId: 'practice-preparation',
  },
  {
    id: 'safety-contraindications',
    title: 'Safety & Contraindications',
    summary: 'Education first, with clear cautions and when to seek advice.',
    status: 'available',
    order: 2,
    articleId: 'safety-contraindications',
  },
  {
    id: 'chakra-guide',
    title: 'Chakra Guide',
    summary: 'Traditional symbolism for the chakra centres used in the app.',
    status: 'available',
    order: 3,
    articleId: 'chakra-guide',
  },
  {
    id: 'mudra-library',
    title: 'Mudra Library',
    summary: 'Gentle seals and hand forms used in classical meditation.',
    status: 'available',
    order: 4,
    articleId: 'mudra-library',
  },
  {
    id: 'preparation-asanas',
    title: 'Preparation Asanas',
    summary: 'Soft postures that help the body settle before meditation.',
    status: 'available',
    order: 5,
    articleId: 'preparation-asanas',
  },
  {
    id: 'sanskrit-glossary',
    title: 'Sanskrit Glossary',
    summary: 'A clear glossary for the language used throughout practice.',
    status: 'available',
    order: 6,
    articleId: 'sanskrit-glossary',
  },
  {
    id: 'sattvic-diet',
    title: 'Sattvic Diet',
    summary: 'Educational notes on nourishment, timing, and moderation.',
    status: 'available',
    order: 7,
    articleId: 'sattvic-diet',
  },
  {
    id: 'pranayama-library',
    title: 'Pranayama Library',
    summary: 'Future guidance on breath practices, if expanded later.',
    status: 'coming-soon',
    order: 8,
  },
  {
    id: 'bandhas',
    title: 'Bandhas',
    summary: 'Future guidance on energetic seals and their traditional context.',
    status: 'coming-soon',
    order: 9,
  },
  {
    id: 'kriyas',
    title: 'Kriyas',
    summary: 'Future guidance on cleansing practices and how they fit the path.',
    status: 'coming-soon',
    order: 10,
  },
  {
    id: 'yogic-lifestyle',
    title: 'Yogic Lifestyle',
    summary: 'Future reflections on daily life, discipline, and balance.',
    status: 'coming-soon',
    order: 11,
  },
  {
    id: 'faq',
    title: 'FAQ',
    summary: 'Future practical answers for common questions.',
    status: 'coming-soon',
    order: 12,
  },
  {
    id: 'recommended-reading',
    title: 'Recommended Reading',
    summary: 'Future reading list and study notes.',
    status: 'coming-soon',
    order: 13,
  },
];

export const GUIDE_CARDS: GuideCard[] = KNOWLEDGE_CATEGORIES.map(category => ({
  id: category.id,
  title: category.title,
  summary: category.summary,
  categoryId: category.id,
  status: category.status,
  accent: category.status === 'available' ? 'var(--gold-accent)' : 'var(--text-subtle)',
}));

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'practice-preparation',
    categoryId: 'practice-preparation',
    title: 'Practice Preparation',
    summary: 'Practical ways to arrive calmly and keep the ritual simple.',
    status: 'available',
    sections: [
      {
        id: 'preparation-foundation',
        title: 'Arriving for practice',
        paragraphs: [
          'Choose the time window that best supports consistency. Morning and evening can both work; the more important factor is steadiness.',
          'Practice on a light stomach, with enough hydration to feel comfortable but not full. Wear clothing that does not distract from posture or breath.',
        ],
        bullets: [
          'Choose a quiet, uncluttered place when possible.',
          'Reduce phone notifications before sitting.',
          'Settle the body first, then begin with a simple inner attitude.',
          'If a day is missed, return gently at the next available session without self-criticism.',
        ],
        references: [
          articleRef('safety-contraindications', 'Safety & Contraindications'),
          articleRef('sattvic-diet', 'Sattvic Diet'),
          glossaryRef('sadhana', 'Sadhana'),
          glossaryRef('tapas', 'Tapas'),
        ],
      },
      {
        id: 'preparation-closing',
        title: 'Ending and restarting well',
        paragraphs: [
          'End practice by allowing a short period of quiet integration. In traditional yoga, the settling after practice is part of the practice itself.',
          'If you return after missed days, resume with a calm and manageable session rather than trying to make up for time lost.',
        ],
        bullets: [
          'Stay seated for a few breaths before standing.',
          'When returning after a break, re-enter with the same simple routine.',
          'Consistency matters more than intensity.',
        ],
        references: [
          articleRef('safety-contraindications', 'Safety & Contraindications'),
          glossaryRef('dhyana', 'Dhyana'),
          glossaryRef('mantra', 'Mantra'),
        ],
      },
    ],
    references: [
      articleRef('safety-contraindications', 'Safety & Contraindications'),
      articleRef('sattvic-diet', 'Sattvic Diet'),
      glossaryRef('sadhana', 'Sadhana'),
    ],
  },
  {
    id: 'safety-contraindications',
    categoryId: 'safety-contraindications',
    title: 'Safety & Contraindications',
    summary: 'Educational cautions for a responsible and steady practice.',
    status: 'available',
    sections: [
      {
        id: 'safety-before-practice',
        title: 'Before practice',
        paragraphs: [
          'This content is educational and does not replace personalised medical advice. Traditional yogic practices can be intense for some people and should be approached with care.',
          'If you have a medical condition, are recovering from illness or surgery, or are unsure whether a practice is suitable, consult a qualified professional before proceeding.',
        ],
        bullets: [
          'High blood pressure or heart disease',
          'Pregnancy',
          'Recent surgery',
          'Shoulder or spinal injuries',
          'Vertigo or balance disorders',
          'Severe anxiety or panic symptoms',
        ],
      },
      {
        id: 'safety-breath-retention',
        title: 'Breath-retention cautions',
        paragraphs: [
          'Breath retention and forceful breathing techniques are not appropriate for everyone. Traditional instructions often require gradual preparation and individual supervision.',
        ],
        bullets: [
          'Do not strain the breath.',
          'Reduce intensity if dizziness, pressure, or distress appears.',
          'Stop immediately if you feel unwell.',
          'Hydrate, rest, and seek appropriate support when needed.',
        ],
      },
      {
        id: 'safety-disclaimer',
        title: 'When to stop',
        paragraphs: [
          'Stop practice if pain, light-headedness, chest discomfort, confusion, or unusual symptoms arise. The safest response is to step away from the practice and get advice from an appropriate professional if symptoms persist.',
          'The aim of sadhana is steadiness and clarity, not force. In practice, less is often more.',
        ],
        references: [
          articleRef('practice-preparation', 'Practice Preparation'),
          articleRef('preparation-asanas', 'Preparation Asanas'),
          glossaryRef('prana', 'Prana'),
        ],
      },
    ],
    references: [
      articleRef('practice-preparation', 'Practice Preparation'),
      articleRef('preparation-asanas', 'Preparation Asanas'),
    ],
  },
  {
    id: 'chakra-guide',
    categoryId: 'chakra-guide',
    title: 'Chakra Guide',
    summary: 'Traditional notes on the centres referenced in the ritual sequence.',
    status: 'available',
    sections: [
      {
        id: 'chakra-tradition-note',
        title: 'Traditional teaching note',
        paragraphs: [
          'The descriptions below follow traditional yogic symbolism. They are not medical claims and should not be read as clinical descriptions.',
          'Where modern evidence exists, it may support general wellbeing or attention training, but the chakra model itself remains a spiritual and contemplative framework.',
        ],
      },
      {
        id: 'chakra-entries',
        title: 'Chakra centres',
        entries: [
          {
            id: 'mooladhara',
            title: 'Mooladhara',
            subtitle: 'Root chakra',
            summary: 'Traditional foundation centre associated with steadiness and grounded presence.',
            facts: [
              { label: 'Meaning', value: 'Foundation, support, rootedness' },
              { label: 'Location', value: 'Base of the spine and pelvic floor' },
              { label: 'Element', value: 'Earth' },
              { label: 'Colour', value: 'Red' },
              { label: 'Bija mantra', value: 'LAM' },
            ],
            bullets: [
              'Associated qualities: stability, patience, grounded attention.',
              'Traditional symbolism: the seat of primal support and embodied safety.',
              'Associated practices: posture, steady breath awareness, moola-related concentration.',
              'Traditional caution: avoid forcing the pelvic floor or straining the body.',
            ],
            references: [
              articleRef('preparation-asanas', 'Preparation Asanas'),
              articleRef('mudra-library', 'Mudra Library'),
            ],
          },
          {
            id: 'swadhisthana',
            title: 'Swadhisthana',
            subtitle: 'Sacral chakra',
            summary: 'Traditional centre of flow, receptivity, and gentle creativity.',
            facts: [
              { label: 'Meaning', value: 'One’s own abode, the seat of fluid movement' },
              { label: 'Location', value: 'Lower abdomen and pelvic region' },
              { label: 'Element', value: 'Water' },
              { label: 'Colour', value: 'Orange' },
              { label: 'Bija mantra', value: 'VAM' },
            ],
            bullets: [
              'Associated qualities: emotional flow, creativity, adaptability.',
              'Traditional symbolism: fluid movement without losing inner centre.',
              'Associated practices: gentle pelvic awareness and steady seated meditation.',
              'Traditional caution: keep the practice soft and non-forcing.',
            ],
          },
          {
            id: 'manipura',
            title: 'Manipura',
            subtitle: 'Solar centre',
            summary: 'Traditional centre of fire, discipline, and purposeful clarity.',
            facts: [
              { label: 'Meaning', value: 'Lustrous gem or city of jewels' },
              { label: 'Location', value: 'Navel and solar plexus region' },
              { label: 'Element', value: 'Fire' },
              { label: 'Colour', value: 'Yellow' },
              { label: 'Bija mantra', value: 'RAM' },
            ],
            bullets: [
              'Associated qualities: will, warmth, direction, and transformation.',
              'Traditional symbolism: inner fire that clarifies and refines.',
              'Associated practices: abdominal awareness and carefully paced discipline.',
              'Traditional caution: do not over-press the breath or the abdomen.',
            ],
          },
          {
            id: 'anahata',
            title: 'Anahata',
            subtitle: 'Heart chakra',
            summary: 'Traditional centre of compassion, balance, and the unstruck sound.',
            facts: [
              { label: 'Meaning', value: 'Unstruck, the sound heard without outer impact' },
              { label: 'Location', value: 'Centre of the chest' },
              { label: 'Element', value: 'Air' },
              { label: 'Colour', value: 'Green' },
              { label: 'Bija mantra', value: 'YAM' },
            ],
            bullets: [
              'Associated qualities: compassion, steadiness, spaciousness.',
              'Traditional symbolism: resonance without friction.',
              'Associated practices: humming, devotion, and calm witness awareness.',
              'Traditional caution: let the chest remain soft rather than forced open.',
            ],
          },
          {
            id: 'vishuddhi',
            title: 'Vishuddhi',
            subtitle: 'Throat chakra',
            summary: 'Traditional centre of purification, listening, and truthful expression.',
            facts: [
              { label: 'Meaning', value: 'Purified or especially clear' },
              { label: 'Location', value: 'Throat centre' },
              { label: 'Element', value: 'Ether / space' },
              { label: 'Colour', value: 'Blue' },
              { label: 'Bija mantra', value: 'HAM' },
            ],
            bullets: [
              'Associated qualities: listening, refinement, and honest expression.',
              'Traditional symbolism: a clear channel for sound and awareness.',
              'Associated practices: humming, breath listening, and throat awareness.',
              'Traditional caution: avoid strain in the neck or throat.',
            ],
          },
          {
            id: 'ajna',
            title: 'Ajna',
            subtitle: 'Third eye',
            summary: 'Traditional centre of insight, inner witness, and focused attention.',
            facts: [
              { label: 'Meaning', value: 'Command or perception' },
              { label: 'Location', value: 'Brow centre' },
              { label: 'Element', value: 'Light / mind' },
              { label: 'Colour', value: 'Indigo' },
              { label: 'Bija mantra', value: 'OM' },
            ],
            bullets: [
              'Associated qualities: concentration, insight, and inner guidance.',
              'Traditional symbolism: the meeting point of attention and awareness.',
              'Associated practices: eyebrow-centre awareness and mantra repetition.',
              'Traditional caution: keep the gaze relaxed and the forehead soft.',
            ],
          },
          {
            id: 'bindu',
            title: 'Bindu',
            subtitle: 'Lunar point',
            summary: 'Traditional subtle centre associated with stillness and inward dissolution.',
            facts: [
              { label: 'Meaning', value: 'Point, drop, seed' },
              { label: 'Location', value: 'Back of the head / subtle occipital point' },
              { label: 'Element', value: 'Moon / subtle essence' },
              { label: 'Colour', value: 'Violet / deep purple' },
              { label: 'Bija mantra', value: 'OM' },
            ],
            bullets: [
              'Associated qualities: stillness, subtle perception, and inward absorption.',
              'Traditional symbolism: the quiet point from which deeper silence is perceived.',
              'Associated practices: inward listening and refined stillness practices.',
              'Traditional caution: do not over-analyse subtle experiences.',
            ],
          },
          {
            id: 'integration',
            title: 'Integration',
            subtitle: 'All chakras',
            summary: 'Traditional note on the unified central channel and whole-system balance.',
            facts: [
              { label: 'Meaning', value: 'Wholeness and integration' },
              { label: 'Location', value: 'Entire central channel' },
              { label: 'Element', value: 'All elements in harmony' },
              { label: 'Colour', value: 'Gold / luminous amber' },
              { label: 'Bija mantra', value: 'OM' },
            ],
            bullets: [
              'Associated qualities: balance, continuity, and unified awareness.',
              'Traditional symbolism: the journey from centre to centre becoming one continuum.',
              'Associated practices: cycling awareness through the chakras with calm attention.',
              'Traditional caution: integration is gradual; avoid rushing the process.',
            ],
            references: [
              articleRef('practice-preparation', 'Practice Preparation'),
              glossaryRef('sushumna', 'Sushumna'),
            ],
          },
        ],
      },
    ],
    references: [
      glossaryRef('prana', 'Prana'),
      glossaryRef('nadi', 'Nadi'),
      glossaryRef('sushumna', 'Sushumna'),
    ],
  },
  {
    id: 'mudra-library',
    categoryId: 'mudra-library',
    title: 'Mudra Library',
    summary: 'Gentle seals and meditative hand forms used in classical practice.',
    status: 'available',
    sections: [
      {
        id: 'mudra-intro',
        title: 'Mudra notes',
        paragraphs: [
          'Mudras are symbolic seals or gestures used to support meditation, concentration, and subtle awareness. They should feel quiet and sustainable, not rigid.',
          'The forms below are presented as gentle educational reference points. If a gesture creates strain, reduce it or leave it out.',
        ],
      },
      {
        id: 'mudra-entries',
        title: 'Mudras and related seals',
        entries: [
          {
            id: 'chin-mudra',
            title: 'Chin Mudra',
            subtitle: 'Index finger and thumb touching',
            summary: 'A simple resting hand seal often used during meditation.',
            facts: [
              { label: 'Purpose', value: 'Support calm concentration and receptivity' },
              { label: 'Hand position', value: 'Thumb and index finger lightly touch; other fingers relaxed' },
              { label: 'Duration', value: 'As long as sitting remains comfortable' },
            ],
            bullets: [
              'Use when sitting quietly and needing a simple supportive hand position.',
              'Common mistake: pressing too hard or holding the hand stiffly.',
              'Contraindications: none specific, but release if wrist or finger strain appears.',
            ],
            illustrationPlaceholder: 'Illustration placeholder: seated hands resting on the knees with thumb and index lightly touching.',
            references: [articleRef('practice-preparation', 'Practice Preparation')],
          },
          {
            id: 'jnana-mudra',
            title: 'Jnana Mudra',
            subtitle: 'Gesture of knowledge',
            summary: 'A close cousin of Chin Mudra, used to support inward attention.',
            facts: [
              { label: 'Purpose', value: 'Encourage quiet receptivity and inner focus' },
              { label: 'Hand position', value: 'Thumb and index finger touch with the palms often facing down' },
              { label: 'Duration', value: 'During seated meditation' },
            ],
            bullets: [
              'Use when the body is already settled and the hands can rest naturally.',
              'Common mistake: collapsing the posture while focusing on the hand shape.',
              'Contraindications: release if the hands feel tense or numb.',
            ],
            illustrationPlaceholder: 'Illustration placeholder: palms resting downward on the knees with relaxed fingers.',
          },
          {
            id: 'shambhavi-mudra',
            title: 'Shambhavi Mudra',
            subtitle: 'Eyebrow-centre awareness',
            summary: 'A subtle inner gaze at the eyebrow centre without strain.',
            facts: [
              { label: 'Purpose', value: 'Support focused inward attention' },
              { label: 'Position', value: 'Eyes gently focused toward the eyebrow centre' },
              { label: 'Duration', value: 'Short intervals, then rest' },
            ],
            bullets: [
              'Use in brief, soft intervals rather than holding the gaze forcefully.',
              'Common mistake: squeezing the eyes or lifting the forehead.',
              'Contraindications: stop if eye strain, headache, or dizziness appears.',
            ],
            illustrationPlaceholder: 'Illustration placeholder: relaxed seated posture with a soft inner gaze.',
            references: [articleRef('chakra-guide', 'Chakra Guide')],
          },
          {
            id: 'nasikagra-drishti',
            title: 'Nasikagra Drishti',
            subtitle: 'Nosetip gaze',
            summary: 'A focused, gentle gaze toward the tip of the nose.',
            facts: [
              { label: 'Purpose', value: 'Stabilise attention and reduce distraction' },
              { label: 'Position', value: 'Eyes gently converging at the nosetip' },
              { label: 'Duration', value: 'Short periods, not continuously strained' },
            ],
            bullets: [
              'Use as a calming concentration aid when the eyes remain comfortable.',
              'Common mistake: forcing the eyes inward or tightening the brow.',
              'Contraindications: avoid if it increases strain or headache.',
            ],
            illustrationPlaceholder: 'Illustration placeholder: face relaxed with the gaze subtly angled toward the nose.',
          },
          {
            id: 'yoni-mudra',
            title: 'Yoni Mudra',
            subtitle: 'Sensory withdrawal gesture',
            summary: 'A classical seal that symbolically closes the senses for inward focus.',
            facts: [
              { label: 'Purpose', value: 'Encourage pratyahara and inward listening' },
              { label: 'Position', value: 'Hands form a gentle seal over the sensory openings as traditionally taught' },
              { label: 'Duration', value: 'Short, comfortable intervals' },
            ],
            bullets: [
              'Use only when well instructed and the body is calm.',
              'Common mistake: holding the breath too strongly or creating tension in the face.',
              'Contraindications: release immediately if retention, pressure, or anxiety appears.',
            ],
            illustrationPlaceholder: 'Illustration placeholder: contemplative seated posture with hands arranged in a traditional sensory seal.',
            references: [articleRef('safety-contraindications', 'Safety & Contraindications')],
          },
          {
            id: 'unmani-mudra',
            title: 'Unmani Mudra',
            subtitle: 'No-mind gesture',
            summary: 'A traditional closing seal associated with inward absorption and quiet witnessing.',
            facts: [
              { label: 'Purpose', value: 'Support non-grasping awareness and inner stillness' },
              { label: 'Position', value: 'Awareness softens while the body remains steady' },
              { label: 'Duration', value: 'Briefly, with ample resting afterwards' },
            ],
            bullets: [
              'Use as a subtle contemplative gesture rather than a forceful technique.',
              'Common mistake: chasing a special state.',
              'Contraindications: stop if it feels disorienting.',
            ],
            illustrationPlaceholder: 'Illustration placeholder: serene seated figure with a soft forward gaze dissolving inward.',
          },
        ],
      },
    ],
  },
  {
    id: 'preparation-asanas',
    categoryId: 'preparation-asanas',
    title: 'Preparation Asanas',
    summary: 'Gentle postures that prepare the body for seated meditation.',
    status: 'available',
    sections: [
      {
        id: 'asana-intro',
        title: 'Gentle preparation only',
        paragraphs: [
          'These are not fitness drills. They are soft preparation shapes that help the body become steady and comfortable for meditation.',
          'Move slowly, breathe naturally, and keep the emphasis on comfort and stability rather than endurance.',
        ],
      },
      {
        id: 'asana-entries',
        title: 'Suggested preparation poses',
        entries: [
          {
            id: 'siddhasana',
            title: 'Siddhasana',
            subtitle: 'Accomplished pose',
            summary: 'A traditional seated pose used for stillness and spinal ease.',
            facts: [
              { label: 'Purpose', value: 'Support steady sitting and subtle energy awareness' },
              { label: 'Steps', value: 'Sit upright, place one heel as traditionally instructed, keep the spine tall, relax the shoulders' },
              { label: 'Duration', value: 'As long as the posture remains comfortable' },
              { label: 'Benefits', value: 'Stable seat, quieter body, simpler breath awareness' },
            ],
            bullets: [
              'Avoid forcing the knees or hips.',
              'If discomfort appears, use a support cushion or choose a simpler seat.',
              'Transition into meditation by settling the breath after the posture is set.',
            ],
            illustrationPlaceholder: 'Illustration placeholder: upright seated posture with a simple, stable base.',
            references: [articleRef('practice-preparation', 'Practice Preparation')],
          },
          {
            id: 'siddha-yoni-asana',
            title: 'Siddha Yoni Asana',
            subtitle: 'Seated meditative pose',
            summary: 'A traditional seated posture often used in women’s practice texts and adapted with care.',
            facts: [
              { label: 'Purpose', value: 'Create a stable and comfortable base for meditation' },
              { label: 'Steps', value: 'Sit with the pelvis supported, spine tall, shoulders relaxed' },
              { label: 'Duration', value: 'Comfortable seated intervals' },
              { label: 'Benefits', value: 'Ease, uprightness, and settled attention' },
            ],
            bullets: [
              'Use cushions or blankets to support the pelvis as needed.',
              'Avoid any shape that creates pain in the knees, hips, or lower back.',
              'Transition into meditation by letting the body become still before beginning.',
            ],
            illustrationPlaceholder: 'Illustration placeholder: supported seated posture with gentle alignment.',
          },
          {
            id: 'bhadrasana',
            title: 'Bhadrasana',
            subtitle: 'A secure seated pose',
            summary: 'A supportive seated posture used when a more open seat is preferable.',
            facts: [
              { label: 'Purpose', value: 'Make the body comfortable for longer sitting' },
              { label: 'Steps', value: 'Sit upright and settle the legs in a comfortable configuration' },
              { label: 'Duration', value: 'Until the body feels steady' },
              { label: 'Benefits', value: 'Grounding, comfort, and reduced strain' },
            ],
            bullets: [
              'Avoid forcing the knees downward.',
              'Use if the classic seated forms are not yet available to the body.',
              'Transition into meditation with a few natural breaths.',
            ],
            illustrationPlaceholder: 'Illustration placeholder: grounded seated pose with a calm spine.',
          },
          {
            id: 'shavasana',
            title: 'Shavasana',
            subtitle: 'Corpse pose',
            summary: 'A restful lying posture used for integration and recovery.',
            facts: [
              { label: 'Purpose', value: 'Let the nervous system settle and release effort' },
              { label: 'Steps', value: 'Lie flat, soften the limbs, and allow the breath to be natural' },
              { label: 'Duration', value: 'A few minutes or as needed' },
              { label: 'Benefits', value: 'Rest, release, and reduced bodily tension' },
            ],
            bullets: [
              'Avoid if lying flat is uncomfortable without support.',
              'Use pillows or props to make the body truly at ease.',
              'Transition into sitting meditation slowly and without rush.',
            ],
            illustrationPlaceholder: 'Illustration placeholder: restful supine posture with the body softly lengthened.',
          },
          {
            id: 'vajrasana',
            title: 'Vajrasana',
            subtitle: 'Thunderbolt pose',
            summary: 'A kneeling posture sometimes used as a short preparation shape.',
            facts: [
              { label: 'Purpose', value: 'Create alert stillness and compact support' },
              { label: 'Steps', value: 'Kneel, sit back gently, and keep the spine upright' },
              { label: 'Duration', value: 'Short, comfortable intervals' },
              { label: 'Benefits', value: 'Grounded attention and an upright seat' },
            ],
            bullets: [
              'Avoid if the knees or ankles dislike kneeling.',
              'Do not force the body to remain in the pose beyond comfort.',
              'Transition into meditation by returning to the chosen seat with ease.',
            ],
            illustrationPlaceholder: 'Illustration placeholder: upright kneeling posture with the torso relaxed.',
          },
        ],
      },
    ],
  },
  {
    id: 'sanskrit-glossary',
    categoryId: 'sanskrit-glossary',
    title: 'Sanskrit Glossary',
    summary: 'An alphabetical glossary for terms used in the library and practice flow.',
    status: 'available',
    sections: [
      {
        id: 'glossary-intro',
        title: 'Reading the glossary',
        paragraphs: [
          'Pronunciations below are simple approximations intended for readers, not a full phonetic system.',
          'Cross-links connect terms to related guides so the knowledge layer can grow without duplicating definitions.',
        ],
      },
      {
        id: 'glossary-entries',
        title: 'Entries',
        entries: [
          {
            id: 'ajna',
            title: 'Ajna',
            subtitle: 'Pronunciation: AHJ-nah',
            summary: 'The brow centre or third eye in yogic symbolism.',
            facts: [{ label: 'Meaning', value: 'Perception, command, inward seeing' }],
            paragraphs: ['Used for focused attention and inner witness awareness.'],
            references: [articleRef('chakra-guide', 'Chakra Guide')],
          },
          {
            id: 'bandha',
            title: 'Bandha',
            subtitle: 'Pronunciation: BUN-dha',
            summary: 'A traditional seal or lock used to direct subtle energy.',
            facts: [{ label: 'Meaning', value: 'Seal, lock, binding' }],
            paragraphs: ['Often refers to energetic locks such as moola, uddiyana, and jalandhara.'],
            references: [articleRef('chakra-guide', 'Chakra Guide')],
          },
          {
            id: 'dhyana',
            title: 'Dhyana',
            subtitle: 'Pronunciation: dyaa-NAH',
            summary: 'Meditation or sustained inward contemplation.',
            facts: [{ label: 'Meaning', value: 'Meditation, uninterrupted attention' }],
            paragraphs: ['A steady, quiet state of awareness that deepens over time.'],
            references: [articleRef('practice-preparation', 'Practice Preparation')],
          },
          {
            id: 'kundalini',
            title: 'Kundalini',
            subtitle: 'Pronunciation: koon-dah-LEE-nee',
            summary: 'The latent spiritual power described in yogic tradition.',
            facts: [{ label: 'Meaning', value: 'Coiled energy or spiritual power' }],
            paragraphs: ['A classical term for the transformative current of spiritual practice.'],
            references: [articleRef('chakra-guide', 'Chakra Guide')],
          },
          {
            id: 'mantra',
            title: 'Mantra',
            subtitle: 'Pronunciation: MUN-trah',
            summary: 'A sacred sound, phrase, or formula repeated in practice.',
            facts: [{ label: 'Meaning', value: 'Instrument of thought or sound' }],
            paragraphs: ['Used to steady attention, devotion, and inner rhythm.'],
            references: [articleRef('practice-preparation', 'Practice Preparation')],
          },
          {
            id: 'mudra',
            title: 'Mudra',
            subtitle: 'Pronunciation: MOOD-rah',
            summary: 'A gesture or seal used to support awareness.',
            facts: [{ label: 'Meaning', value: 'Seal, gesture, symbolic form' }],
            paragraphs: ['Mudras may involve the hands, the eyes, or even a subtle inner attitude.'],
            references: [articleRef('mudra-library', 'Mudra Library')],
          },
          {
            id: 'nadi',
            title: 'Nadi',
            subtitle: 'Pronunciation: NAH-dee',
            summary: 'A subtle channel through which prana is described as flowing.',
            facts: [{ label: 'Meaning', value: 'Channel, river, flow-path' }],
            paragraphs: ['Classical yogic maps describe many nadis, with sushumna as the central channel.'],
            references: [articleRef('chakra-guide', 'Chakra Guide')],
          },
          {
            id: 'prana',
            title: 'Prana',
            subtitle: 'Pronunciation: PRAH-nah',
            summary: 'The life-force or vital current in yogic thought.',
            facts: [{ label: 'Meaning', value: 'Vital energy, life current' }],
            paragraphs: ['The term often points to the felt vitality that animates body and mind in traditional teachings.'],
            references: [articleRef('sattvic-diet', 'Sattvic Diet')],
          },
          {
            id: 'sadhana',
            title: 'Sadhana',
            subtitle: 'Pronunciation: SAH-dha-nah',
            summary: 'A disciplined spiritual practice or daily path.',
            facts: [{ label: 'Meaning', value: 'Practice, method, sustained spiritual work' }],
            paragraphs: ['Sadhana implies regular, committed practice rather than occasional effort.'],
            references: [articleRef('practice-preparation', 'Practice Preparation')],
          },
          {
            id: 'samadhi',
            title: 'Samadhi',
            subtitle: 'Pronunciation: sah-MAH-dhee',
            summary: 'Absorption or deep contemplative union in yogic language.',
            facts: [{ label: 'Meaning', value: 'Collectedness, absorption, integration' }],
            paragraphs: ['Traditionally refers to a mature state of meditative absorption.'],
            references: [articleRef('chakra-guide', 'Chakra Guide')],
          },
          {
            id: 'shakti',
            title: 'Shakti',
            subtitle: 'Pronunciation: SHUK-tee',
            summary: 'Dynamic power or creative force.',
            facts: [{ label: 'Meaning', value: 'Power, energy, dynamic force' }],
            paragraphs: ['Often paired with Shiva in classical symbolism as energy and awareness.'],
            references: [articleRef('chakra-guide', 'Chakra Guide')],
          },
          {
            id: 'shiva',
            title: 'Shiva',
            subtitle: 'Pronunciation: SHEE-vah',
            summary: 'Awareness, stillness, and the witnessing principle in yogic symbolism.',
            facts: [{ label: 'Meaning', value: 'Auspiciousness, stillness, witness awareness' }],
            paragraphs: ['The term often represents the unchanging consciousness that witnesses change.'],
            references: [articleRef('chakra-guide', 'Chakra Guide')],
          },
          {
            id: 'sushumna',
            title: 'Sushumna',
            subtitle: 'Pronunciation: soo-SHOOM-nah',
            summary: 'The central channel described in subtle-body maps.',
            facts: [{ label: 'Meaning', value: 'Most gracious or central channel' }],
            paragraphs: ['Classically the central pathway running through the spine and associated with deep integration.'],
            references: [articleRef('chakra-guide', 'Chakra Guide')],
          },
          {
            id: 'tapas',
            title: 'Tapas',
            subtitle: 'Pronunciation: TAH-pus',
            summary: 'Self-discipline or disciplined inner heat.',
            facts: [{ label: 'Meaning', value: 'Austerity, discipline, inner heat' }],
            paragraphs: ['Tapas points to sustained, sincere effort without harshness or self-punishment.'],
            references: [articleRef('practice-preparation', 'Practice Preparation')],
          },
        ],
      },
    ],
  },
  {
    id: 'sattvic-diet',
    categoryId: 'sattvic-diet',
    title: 'Sattvic Diet',
    summary: 'Educational notes on simple, calm nourishment and meal timing.',
    status: 'available',
    sections: [
      {
        id: 'diet-intro',
        title: 'What the term means',
        paragraphs: [
          'A sattvic diet is traditionally described as light, fresh, and steadying. The aim in this library is education, not prescription.',
          'Food choices can be personal and culturally varied. This section offers a gentle framework rather than a rulebook.',
        ],
      },
      {
        id: 'diet-guidance',
        title: 'Helpful themes',
        bullets: [
          'Traditional contrasts: sattvic, rajasic, and tamasic foods are used as an educational vocabulary.',
          'Meal timing: lighter meals often sit more comfortably near practice time.',
          'Hydration: enough water to be comfortable, without arriving overfull.',
          'Seasonal eating: many traditions emphasise adjusting food to climate and circumstance.',
          'Moderation: avoid extremes and pay attention to how the body feels.',
        ],
        references: [
          articleRef('practice-preparation', 'Practice Preparation'),
          articleRef('safety-contraindications', 'Safety & Contraindications'),
          glossaryRef('prana', 'Prana'),
        ],
      },
      {
        id: 'diet-examples',
        title: 'Example meal patterns',
        paragraphs: [
          'Examples might include warm grains, cooked vegetables, fruit, yogurt or plant alternatives if they suit the individual, and simple soups or light meals. The purpose is calm support, not a medical plan.',
          'Rajasic and tamasic foods are often described in traditional texts as more stimulating or heavy. The app presents this as a learning lens only, not a health diagnosis.',
        ],
        bullets: [
          'Eat in a way that supports steadiness for your own body and circumstances.',
          'If you have dietary restrictions or medical needs, follow appropriate professional guidance.',
          'Tradition and physiology are related but not identical; use discernment.',
        ],
      },
    ],
    references: [
      articleRef('practice-preparation', 'Practice Preparation'),
      articleRef('safety-contraindications', 'Safety & Contraindications'),
    ],
  },
  {
    id: 'pranayama-library',
    categoryId: 'pranayama-library',
    title: 'Pranayama Library',
    summary: 'Future guidance on breath work, if the library expands later.',
    status: 'coming-soon',
    sections: [
      {
        id: 'pranayama-placeholder',
        title: 'Planned content',
        paragraphs: [
          'This space is reserved for a future breath-practice reference library. It may eventually include step-by-step summaries, cautions, and practice cross-links.',
        ],
      },
    ],
  },
  {
    id: 'bandhas',
    categoryId: 'bandhas',
    title: 'Bandhas',
    summary: 'Future guidance on energetic seals and locks.',
    status: 'coming-soon',
    sections: [
      {
        id: 'bandhas-placeholder',
        title: 'Planned content',
        paragraphs: [
          'This section is reserved for future explanations of energetic locks and how they relate to seated practice.',
        ],
      },
    ],
  },
  {
    id: 'kriyas',
    categoryId: 'kriyas',
    title: 'Kriyas',
    summary: 'Future guidance on cleansing practices.',
    status: 'coming-soon',
    sections: [
      {
        id: 'kriyas-placeholder',
        title: 'Planned content',
        paragraphs: [
          'This section is reserved for future cleansing practices and their traditional context.',
        ],
      },
    ],
  },
  {
    id: 'yogic-lifestyle',
    categoryId: 'yogic-lifestyle',
    title: 'Yogic Lifestyle',
    summary: 'Future reflections on daily life, rhythm, and balanced discipline.',
    status: 'coming-soon',
    sections: [
      {
        id: 'lifestyle-placeholder',
        title: 'Planned content',
        paragraphs: [
          'This section is reserved for future notes on daily rhythm, conduct, study, and the broader shape of a sadhaka’s life.',
        ],
      },
    ],
  },
  {
    id: 'faq',
    categoryId: 'faq',
    title: 'FAQ',
    summary: 'Future practical answers to common questions.',
    status: 'coming-soon',
    sections: [
      {
        id: 'faq-placeholder',
        title: 'Planned content',
        paragraphs: [
          'This section will eventually hold concise answers to common practical questions about the knowledge library and practice context.',
        ],
      },
    ],
  },
  {
    id: 'recommended-reading',
    categoryId: 'recommended-reading',
    title: 'Recommended Reading',
    summary: 'Future reading suggestions and study notes.',
    status: 'coming-soon',
    sections: [
      {
        id: 'reading-placeholder',
        title: 'Planned content',
        paragraphs: [
          'This section is reserved for a curated reading list and brief study notes.',
        ],
      },
    ],
  },
];

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    id: 'ajna',
    word: 'Ajna',
    pronunciation: 'AHJ-nah',
    meaning: 'Brow centre; third eye',
    explanation: 'The centre of perception, insight, and focused inward attention.',
    relatedTerms: ['Dhyana', 'Mantra', 'Sushumna'],
    crossLinks: [articleRef('chakra-guide', 'Chakra Guide')],
  },
  {
    id: 'bandha',
    word: 'Bandha',
    pronunciation: 'BUN-dha',
    meaning: 'Lock or seal',
    explanation: 'An energetic lock used in classical yoga to direct attention and subtle force.',
    relatedTerms: ['Mudra', 'Prana', 'Sushumna'],
    crossLinks: [articleRef('mudra-library', 'Mudra Library')],
  },
  {
    id: 'dhyana',
    word: 'Dhyana',
    pronunciation: 'dyaa-NAH',
    meaning: 'Meditation',
    explanation: 'Sustained contemplative attention, often translated as meditation.',
    relatedTerms: ['Sadhana', 'Samadhi', 'Mantra'],
    crossLinks: [articleRef('practice-preparation', 'Practice Preparation')],
  },
  {
    id: 'kundalini',
    word: 'Kundalini',
    pronunciation: 'koon-dah-LEE-nee',
    meaning: 'Coiled spiritual power',
    explanation: 'A traditional name for the transformative spiritual current described in yogic texts.',
    relatedTerms: ['Shakti', 'Sushumna', 'Chakra'],
    crossLinks: [articleRef('chakra-guide', 'Chakra Guide')],
  },
  {
    id: 'mantra',
    word: 'Mantra',
    pronunciation: 'MUN-trah',
    meaning: 'Sacred sound or formula',
    explanation: 'A sound, syllable, or phrase repeated to steady attention and devotion.',
    relatedTerms: ['Dhyana', 'Prana', 'Sadhana'],
    crossLinks: [articleRef('practice-preparation', 'Practice Preparation')],
  },
  {
    id: 'mudra',
    word: 'Mudra',
    pronunciation: 'MOOD-rah',
    meaning: 'Seal, gesture',
    explanation: 'A physical or subtle gesture used to support concentration and inner alignment.',
    relatedTerms: ['Bandha', 'Prana', 'Shambhavi Mudra'],
    crossLinks: [articleRef('mudra-library', 'Mudra Library')],
  },
  {
    id: 'nadi',
    word: 'Nadi',
    pronunciation: 'NAH-dee',
    meaning: 'Channel, conduit',
    explanation: 'A subtle channel through which yogic tradition describes pranic flow.',
    relatedTerms: ['Prana', 'Sushumna', 'Chakra'],
    crossLinks: [articleRef('chakra-guide', 'Chakra Guide')],
  },
  {
    id: 'prana',
    word: 'Prana',
    pronunciation: 'PRAH-nah',
    meaning: 'Vital force',
    explanation: 'The life-current or vitality described in yogic thought.',
    relatedTerms: ['Nadi', 'Shakti', 'Sadhana'],
    crossLinks: [articleRef('sattvic-diet', 'Sattvic Diet')],
  },
  {
    id: 'sadhana',
    word: 'Sadhana',
    pronunciation: 'SAH-dha-nah',
    meaning: 'Spiritual practice',
    explanation: 'A sustained, disciplined path of practice over time.',
    relatedTerms: ['Tapas', 'Dhyana', 'Mantra'],
    crossLinks: [articleRef('practice-preparation', 'Practice Preparation')],
  },
  {
    id: 'samadhi',
    word: 'Samadhi',
    pronunciation: 'sah-MAH-dhee',
    meaning: 'Absorption, integration',
    explanation: 'A mature contemplative state of absorbed awareness in classical yoga.',
    relatedTerms: ['Dhyana', 'Sadhana', 'Shiva'],
    crossLinks: [articleRef('chakra-guide', 'Chakra Guide')],
  },
  {
    id: 'shakti',
    word: 'Shakti',
    pronunciation: 'SHUK-tee',
    meaning: 'Power, energy',
    explanation: 'Dynamic creative power in yogic and devotional language.',
    relatedTerms: ['Shiva', 'Kundalini', 'Prana'],
    crossLinks: [articleRef('chakra-guide', 'Chakra Guide')],
  },
  {
    id: 'shiva',
    word: 'Shiva',
    pronunciation: 'SHEE-vah',
    meaning: 'Witness consciousness, auspicious stillness',
    explanation: 'In symbolic language, the unchanging awareness that witnesses change.',
    relatedTerms: ['Shakti', 'Samadhi', 'Dhyana'],
    crossLinks: [articleRef('chakra-guide', 'Chakra Guide')],
  },
  {
    id: 'sushumna',
    word: 'Sushumna',
    pronunciation: 'soo-SHOOM-nah',
    meaning: 'Central channel',
    explanation: 'The central subtle channel through the spine in classic chakra maps.',
    relatedTerms: ['Nadi', 'Chakra', 'Ajna'],
    crossLinks: [articleRef('chakra-guide', 'Chakra Guide')],
  },
  {
    id: 'tapas',
    word: 'Tapas',
    pronunciation: 'TAH-pus',
    meaning: 'Disciplined inner heat',
    explanation: 'Sustained, sincere effort that refines practice without harshness.',
    relatedTerms: ['Sadhana', 'Dhyana', 'Practice Preparation'],
    crossLinks: [articleRef('practice-preparation', 'Practice Preparation')],
  },
];

export function getArticleById(id: string) {
  return KNOWLEDGE_ARTICLES.find(article => article.id === id) ?? null;
}

export function getCategoryById(id: string) {
  return KNOWLEDGE_CATEGORIES.find(category => category.id === id) ?? null;
}

export function getGlossaryEntryById(id: string) {
  return GLOSSARY_ENTRIES.find(entry => entry.id === id) ?? null;
}

export function getKnowledgeCards() {
  return [...GUIDE_CARDS].sort((a, b) => {
    const left = getCategoryById(a.categoryId)?.order ?? 999;
    const right = getCategoryById(b.categoryId)?.order ?? 999;
    return left - right;
  });
}
