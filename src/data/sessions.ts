export interface Practice {
  name: string;
  phase: string;
  chakra: ChakraKey;
  duration: number; // seconds
  instruction: string;
  note?: string;
}

export interface Session {
  key: 'morning' | 'night';
  label: string;
  color: string;
  subtitle: string;
  end: string;
  practices: Practice[];
}

export type ChakraKey =
  | 'Preparation'
  | 'Ajna'
  | 'Mooladhara'
  | 'Swadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddhi'
  | 'Bindu'
  | 'All Chakras';

export const CHAKRA_MAP: Record<ChakraKey, { dot: string; bg: string; text: string; freq: number }> = {
  Preparation:  { dot: '#6B5E50', bg: 'rgba(107,94,80,0.15)',   text: '#A89880', freq: 256 },
  Ajna:         { dot: '#6650CC', bg: 'rgba(102,80,204,0.18)',  text: '#AA99EE', freq: 448 },
  Mooladhara:   { dot: '#E04040', bg: 'rgba(224,64,64,0.15)',   text: '#FF8888', freq: 194.18 },
  Swadhisthana: { dot: '#E87820', bg: 'rgba(232,120,32,0.15)',  text: '#FFB070', freq: 210.42 },
  Manipura:     { dot: '#DDB800', bg: 'rgba(221,184,0,0.15)',   text: '#FFE060', freq: 126.22 },
  Anahata:      { dot: '#48B048', bg: 'rgba(72,176,72,0.15)',   text: '#80DD80', freq: 341.3 },
  Vishuddhi:    { dot: '#3090D8', bg: 'rgba(48,144,216,0.15)',  text: '#80C0EE', freq: 384 },
  Bindu:        { dot: '#AA44CC', bg: 'rgba(170,68,204,0.15)',  text: '#CC88EE', freq: 432 },
  'All Chakras':{ dot: '#C8A96E', bg: 'rgba(200,169,110,0.15)', text: '#E8D5B0', freq: 136.1 },
};

export const SESSIONS: Record<'morning' | 'night', Session> = {
  morning: {
    key: 'morning',
    label: 'Morning',
    color: '#D4892A',
    subtitle: '60 min · Ajna → Anahata · Ascending',
    end: 'Your morning sadhana is complete.\nRemain in stillness for a few moments\nbefore returning to outer activity.',
    practices: [
      {
        name: 'Settling & Posture',
        phase: 'Preparation',
        chakra: 'Preparation',
        duration: 5 * 60,
        instruction: 'Sit in <strong>Siddhasana</strong> (men) or <strong>Siddha Yoni Asana</strong> (women). Heel presses the mooladhara trigger point. Place hands on knees in Chin Mudra. Hold the spine absolutely erect, shoulders relaxed, head poised. Let the body become still as a statue. Close the eyes. Breathe naturally. Allow thoughts to arise without interference — be a witness.',
        note: 'If siddhasana is not yet possible, use bhadrasana. Use a folded blanket (1–2 inches) under the buttocks to allow the knees to rest on the ground.',
      },
      {
        name: 'Anuloma Viloma Pranayama',
        phase: 'Ajna Chakra · Third Eye',
        chakra: 'Ajna',
        duration: 10 * 60,
        instruction: 'Become aware of the breath in the nostrils. With inhalation, awareness flows from the nosetip <em>up to the eyebrow center</em>. With exhalation, it returns. Feel the triangular form of breath — base at the upper lip, apex at ajna. Alternate psychically: inhale left nostril to bhrumadhya, exhale right; inhale right to bhrumadhya, exhale left. After every four rounds, breathe through both nostrils. <strong>Count from 100 down to zero.</strong> If count is lost, begin again from 100.',
        note: 'Accuracy in counting is essential — it maintains awareness and prevents the mind from being absorbed into the unconscious.',
      },
      {
        name: 'Shambhavi Mudra with Om',
        phase: 'Ajna Chakra · Third Eye',
        chakra: 'Ajna',
        duration: 5 * 60,
        instruction: '<strong>Stage 1 (1–2 min):</strong> Gaze upward at the eyebrow center without moving the head. Chant Oṁ softly — each 1–2 seconds — feeling its vibration at the eyebrow center.<br><br><strong>Stage 2 (1–2 min):</strong> Close the eyes. Inner gaze remains at the eyebrow center. Lengthen each Oṁ to fill the breath, steady and even.<br><br><strong>Stage 3 (1 min):</strong> Continue chanting. Feel the sound reverberating throughout the entire body — awareness on sound alone.',
        note: 'Do not strain the eyes. Release shambhavi mudra whenever the eyes feel strained.',
      },
      {
        name: 'Mooladhara Location + Moola Bandha',
        phase: 'Mooladhara Chakra · Root',
        chakra: 'Mooladhara',
        duration: 5 * 60,
        instruction: 'Center awareness on the pressure point of the heel at mooladhara. Feel or imagine breathing in and out of this point — breath becoming finer until it pierces the chakra. Repeat mentally: <em>"mooladhara, mooladhara, mooladhara"</em> for 2 minutes.<br><br>Then <strong>Moola Bandha Stage 2:</strong> rhythmically contract and release the trigger point at approximately one contraction per second, or synchronised with the heartbeat. Direct all attention precisely to the contraction point.',
        note: 'Men: contraction at the perineal body, midway between anus and scrotum. Women: at the cervix. Only this point contracts — anal sphincters and urinary muscles remain relaxed.',
      },
      {
        name: 'Nasikagra Drishti',
        phase: 'Mooladhara Chakra · Root',
        chakra: 'Mooladhara',
        duration: 3 * 60,
        instruction: 'Open the eyes and focus both gently at the nosetip. When both eyes are correctly fixed, the double outlines of the nose merge into a single V-shaped outline at the tip. Gaze at the crossing point.<br><br>Simultaneously become aware of the breath moving in and out — its movement and its subtle sound. Total absorption in three awarenesses: nosetip, breath movement, breath sound.',
        note: "Never strain the eyes. If discomfort arises, close the eyes briefly. Nasikagra drishti is directly connected to mooladhara through the earth element's relationship with smell.",
      },
      {
        name: 'Ashwini Mudra + Vajroli / Sahajoli',
        phase: 'Swadhisthana Chakra · Water',
        chakra: 'Swadhisthana',
        duration: 5 * 60,
        instruction: '<strong>Ashwini Mudra (2 min):</strong> Rhythmically contract and release the anal sphincters — half a second on, half a second off. Feel the pressure waves ascending to swadhisthana at the coccyx. Fix awareness on the lower end of the spine.<br><br><strong>Vajroli (men) / Sahajoli (women) — 3 min:</strong> Draw the sexual organ upward / contract the upper vaginal muscles deeply. Hold 10 seconds, release 10 seconds, alternating. Awareness at swadhisthana kshetram, mentally repeating: <em>"swadhisthana, swadhisthana, swadhisthana."</em>',
      },
      {
        name: 'Agnisar Kriya + Uddiyana Bandha',
        phase: 'Manipura Chakra · Fire',
        chakra: 'Manipura',
        duration: 7 * 60,
        instruction: '<strong>Agnisar Kriya (3 min):</strong> Sit in vajrasana, knees wide, tongue extended. Rapidly contract and expand the abdomen rhythmically — like a dog panting — up to 25 times per round. This activates the digestive fire and prepares manipura.<br><br><strong>Uddiyana Bandha (4 min):</strong> Exhale completely. Apply jalandhara bandha. Suck the abdomen inward and upward powerfully. Hold while the breath is retained outside. Fix awareness at manipura (behind the navel in the spine). Mentally repeat: <em>"manipura, manipura, manipura."</em> Release the abdomen, then jalandhara, then inhale. Build gradually to 10 rounds.',
        note: 'Not for those with heart disease, peptic ulcer, high blood pressure, or recent abdominal surgery. Practice only on a completely empty stomach.',
      },
      {
        name: 'Bhramari Pranayama',
        phase: 'Anahata Chakra · Heart',
        chakra: 'Anahata',
        duration: 8 * 60,
        instruction: 'Sit with back straight. Plug both ears with the index fingers. Keep teeth slightly separated, mouth closed throughout. Breathe in slowly and deeply through the nose.<br><br>On exhalation, produce a continuous <strong>humming sound</strong> — smooth and even for the full duration of the out-breath. The sound need not be loud; what matters is that you hear it reverberating within the skull. The exhalation should be slow and controlled. Keep full awareness on the vibration in the head and heart region.',
        note: 'The scriptures call the heart center "the cave of bees." The humming is both the sound of the bees and the vehicle of awareness tracing to the source of unstruck sound within anahata.',
      },
      {
        name: 'Ajapa Japa — So-Ham',
        phase: 'Anahata Chakra · Heart',
        chakra: 'Anahata',
        duration: 7 * 60,
        instruction: 'Close the eyes and relax. Become aware of the natural breath — do not control it, simply witness. Discover that the sound of inhalation is <em>So</em> and the sound of exhalation is <em>Ham</em>. This mantra is already within the breath.<br><br>Now become aware of the psychic breath between navel and throat: with inhalation the psychic breath rises from the navel to the throat (<em>So</em>); with exhalation it descends from the throat to the navel (<em>Ham</em>). Maintain this awareness continuously — breath, mantra, psychic passageway — completely relaxed.',
      },
      {
        name: 'Bija Sanchalana — Closing',
        phase: 'All Chakras · Integration',
        chakra: 'All Chakras',
        duration: 5 * 60,
        instruction: 'Bring awareness to mooladhara. Move upward through the arohan passage, mentally sounding the bija mantra at each centre:<br><em>Lam → Vam → Ram → Yam → Ham → Om (bindu)</em><br><br>Then descend through awarohan:<br><em>Om (ajna) → Ham → Yam → Ram → Vam → Lam (mooladhara)</em><br><br>Do 3 slow, complete rounds. Let awareness jump lightly from centre to centre. End with three soft internal Oṁ.',
        note: 'Awareness should move like a glance from a passing train — light touch at each centre. With daily practice, sensitivity to each centre develops naturally.',
      },
    ],
  },
  night: {
    key: 'night',
    label: 'Night',
    color: '#6B7FBF',
    subtitle: '60 min · Vishuddhi → Bindu · Integrating',
    end: 'Your night sadhana is complete.\nAllow the practice to dissolve\ninto deep, conscious sleep.',
    practices: [
      {
        name: 'Settling — Shavasana into Siddhasana',
        phase: 'Preparation',
        chakra: 'Preparation',
        duration: 5 * 60,
        instruction: 'Begin by lying in <strong>Shavasana</strong> for 3 minutes. Feel the body releasing the weight of the day. Spine straight, feet apart, palms facing up. Let thoughts arise and pass — do not engage them.<br><br>Then slowly sit up into Siddhasana or Siddha Yoni Asana. Establish absolute stillness. Declare a <strong>sankalpa</strong> — a short positive resolution of spiritual aspiration — mentally, three times, with feeling from the heart.',
      },
      {
        name: 'Jalandhara Bandha + Ujjayi',
        phase: 'Vishuddhi Chakra · Throat',
        chakra: 'Vishuddhi',
        duration: 5 * 60,
        instruction: '<strong>Jalandhara Bandha (2 min):</strong> Inhale deeply. Retain the breath inside. Lower the chin firmly toward the chest — pressing on the jugular notch. Hold comfortably. Release the chin, then exhale. Repeat. Feel the prana locked in the throat region stimulating vishuddhi.<br><br><strong>Ujjayi Pranayama (3 min):</strong> Fold the tongue back into <em>Khechari Mudra</em>. Contract the glottis so that a soft snoring sound arises in the throat. Breathe as if through the throat rather than the nose. Long, relaxed, audible breaths. Feel the breath moving through vishuddhi kshetram, piercing back to vishuddhi chakra in the spine.',
        note: 'Jalandhara is not for those with high blood pressure, heart conditions, or cervical spondylosis. Begin gently.',
      },
      {
        name: 'Vipareeta Karani Asana',
        phase: 'Vishuddhi Chakra · Throat',
        chakra: 'Vishuddhi',
        duration: 5 * 60,
        instruction: 'Lie flat on the floor. Exhale, press the hands into the floor, raise the legs over the head. Bend the arms and support the hips with the hands. Raise the legs to vertical. The trunk is at roughly 45° — unlike sarvangasana, the chin does not press the chest. Close the eyes. Breathe deeply.<br><br>Remain here for 4–5 minutes, allowing the energy to redirect from the lower to the higher chakras. Follow with Shavasana for 1 minute before the next practice.',
        note: 'Not for thyroid, liver, or spleen enlargement, high blood pressure, or heart conditions. Beginners may start with 30 seconds and increase gradually. Shavasana is essential as the counterpose.',
      },
      {
        name: 'Bhramari → Inner Sound Perception',
        phase: 'Bindu Visarga · Source of Sound',
        chakra: 'Bindu',
        duration: 7 * 60,
        instruction: 'Begin with <strong>Bhramari</strong> for 3 minutes (ears plugged, humming on exhalation). Then gradually reduce the humming to silence. Keep fingers in ears, eyes closed.<br><br>Now only <strong>listen</strong> — with complete attention — for any sound arising within the head. When a sound is perceived, however faint, fix full awareness on it. As it becomes established, listen for an even subtler sound beneath it. Transfer awareness to that subtler sound. Continue this inward movement — each time discarding the louder sound for the more subtle one. Fix awareness at the back of the head in the bindu region.',
        note: 'This practice requires weeks of steady effort before the first subtle sound is clearly perceived. Do not be discouraged by apparent silence. The effort itself purifies awareness.',
      },
      {
        name: 'Yoni Mudra',
        phase: 'Bindu Visarga · Source of Sound',
        chakra: 'Bindu',
        duration: 5 * 60,
        instruction: 'Bring hands before the face. Close: <strong>ears with thumbs, eyes with index fingers, nostrils with middle fingers</strong> (releasing during breath), upper lip with ring fingers, lower lip with little fingers.<br><br>Inhale deeply. Close the nostrils and retain the breath. With full attention fixed at bindu — top back of the head — listen for an inner sound. When one sound is perceived, allow awareness to be drawn to a subtler sound behind it. After comfortable retention, release nostrils and exhale slowly. Practise 5 rounds. Between rounds, rest the hands on the knees.',
        note: 'The awareness during breath retention must be fixed at bindu, not scattered. Those who practise nadi shodhana regularly will find yoni mudra naturally accessible.',
      },
      {
        name: 'Chaturtha Pranayama',
        phase: 'All Chakras · Integration',
        chakra: 'All Chakras',
        duration: 11 * 60,
        instruction: 'Hold the spine erect, eyes closed, breathing deeply. Synchronise the mental mantra with the breath — <em>"O"</em> arises with inhalation, <em>"mmmm"</em> arises with exhalation. Mouth closed, mental sound only.<br><br>Fix attention at the eyebrow centre. Then focus at mooladhara. With each inhalation and "O", feel the breath rising through the spine:<br><em>mooladhara → swadhisthana → manipura → anahata → vishuddhi → ajna → sahasrara</em><br><br>With each exhalation and "mmmm", feel it descending:<br><em>sahasrara → ajna → vishuddhi → anahata → manipura → swadhisthana → mooladhara</em><br><br>In the final minute: fix awareness only at the eyebrow center with the mantra — no breath awareness. Only Om.',
      },
      {
        name: 'Chakra Yoga Nidra',
        phase: 'All Chakras · Deep Integration',
        chakra: 'All Chakras',
        duration: 17 * 60,
        instruction: 'Lie in <strong>Shavasana</strong>. Spine straight, mouth and eyes closed, body motionless throughout.<br><br><strong>Sinking (1 min):</strong> Imagine the space surrounding your body. Your body feels light as a falling leaf, slowly sinking into infinite space. Breathe with awareness at the navel.<br><br><strong>Sankalpa (1 min):</strong> Repeat your sankalpa three times from the heart.<br><br><strong>Chakra rotation (10 min):</strong> Move awareness slowly upward from the base. At each centre, repeat its name three times:<br><em>mooladhara → swadhisthana → manipura → anahata → vishuddhi → ajna → bindu → sahasrara</em><br>then descend in reverse. Do 3–5 complete rounds. Try to feel a subtle pulsation or vibration at each centre. You may mentally sound the bija mantras (Lam, Vam, Ram, Yam, Ham, Om).<br><br><strong>Visualisation (4 min):</strong> At each centre, briefly visualise its symbol — mooladhara: deep red 4-petalled lotus; swadhisthana: vermilion 6-petalled lotus with crescent moon; manipura: yellow 10-petalled lotus with blazing fire; anahata: blue 12-petalled lotus with flame; vishuddhi: purple 16-petalled lotus with nectar drop; ajna: silver-grey 2-petalled lotus with Om sign; sahasrara: thousand-petalled lotus.<br><br><strong>Close (1 min):</strong> Repeat sankalpa three times. Become aware of breath, then body, then outer sounds. Move gently and sit up.',
        note: 'If sleep comes naturally toward the end, allow it — the practice has done its work of integrating the chakra experiences into the deeper consciousness.',
      },
      {
        name: 'Unmani Mudra — Closing',
        phase: 'All Chakras · No-Mind',
        chakra: 'All Chakras',
        duration: 5 * 60,
        instruction: 'Sit in Siddhasana. Back straight. Open the eyes wide without focusing on anything external. Fix awareness at <strong>bindu</strong>. Inhale deeply.<br><br>With the exhalation, allow awareness to descend the spinal passage:<br><em>ajna → vishuddhi → anahata → manipura → swadhisthana → mooladhara</em><br><br>Simultaneously, the eyes close very slowly, fully synchronised with the descending breath, reaching mooladhara as the eyes close completely. The eyes are open, but you look <em>inward</em> — there is no perception of the outer world. At mooladhara: inhale and begin again. <strong>Do 11 rounds.</strong> Close with three long, silent, internal Oṁ.',
        note: 'Unmani means "no-mind" — the natural state of thoughtlessness that arises in deep meditation. Let the practice happen spontaneously; it is more mental than physical.',
      },
    ],
  },
};
