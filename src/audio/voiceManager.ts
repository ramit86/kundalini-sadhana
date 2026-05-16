export type GuidanceMode = 'full' | 'minimal' | 'silent';

let selectedVoice: SpeechSynthesisVoice | null = null;
let narrationRate = 0.78;

const VOICE_STORAGE_KEY = 'ks_voice_name';
const RATE_STORAGE_KEY = 'ks_narration_rate';

function scoreVoice(v: SpeechSynthesisVoice): number {
  let score = 0;
  const n = v.name.toLowerCase();
  const l = (v.lang || '').toLowerCase();
  if (l === 'en-in') score += 40;
  else if (l.startsWith('hi')) score += 30;
  else if (l === 'en-gb') score += 5;
  else if (l.startsWith('en')) score += 2;
  if (n.includes('ravi'))   score += 30;
  if (n.includes('kiran'))  score += 25;
  if (n.includes('hemant')) score += 25;
  if (n.includes('arjun'))  score += 25;
  if (n.includes('mohan'))  score += 25;
  if (n.includes('google hindi'))  score += 28;
  if (n.includes('google en-in')) score += 35;
  if (n.includes('veena'))  score += 18;
  if (n.includes('male') && !n.includes('fe')) score += 20;
  if (n.includes('daniel')) score += 8;
  if (n.includes('oliver')) score += 6;
  if (n.includes('arthur')) score += 6;
  ['female','woman','samantha','victoria','karen','moira','fiona',
   'tessa','zira','linda','susan','alice','ava','allison'].forEach(w => {
    if (n.includes(w)) score -= 30;
  });
  return score;
}

export function getSortedVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  return [...window.speechSynthesis.getVoices()].sort(
    (a, b) => scoreVoice(b) - scoreVoice(a)
  );
}

export function pickBestVoice(): SpeechSynthesisVoice | null {
  const voices = getSortedVoices();
  if (!voices.length) return null;
  const saved = localStorage.getItem(VOICE_STORAGE_KEY);
  if (saved) {
    const match = voices.find(v => v.name === saved);
    if (match) return match;
  }
  return voices[0];
}

export function setSelectedVoice(voice: SpeechSynthesisVoice) {
  selectedVoice = voice;
  localStorage.setItem(VOICE_STORAGE_KEY, voice.name);
}

export function getSelectedVoice(): SpeechSynthesisVoice | null {
  if (!selectedVoice) selectedVoice = pickBestVoice();
  return selectedVoice;
}

export function getNarrationRate(): number {
  const saved = localStorage.getItem(RATE_STORAGE_KEY);
  if (saved) narrationRate = parseFloat(saved);
  return narrationRate;
}

export function setNarrationRate(rate: number) {
  narrationRate = rate;
  localStorage.setItem(RATE_STORAGE_KEY, String(rate));
}

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '. ')
    .replace(/<strong>(.*?)<\/strong>/gi, '$1')
    .replace(/<em>(.*?)<\/em>/gi, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

export function buildNarrationText(
  name: string,
  chakra: string,
  instruction: string,
  note: string | undefined,
  mode: GuidanceMode
): string {
  if (mode === 'silent') return '';
  const intro = `${name}. ${chakra} practice. `;
  const body = stripHtml(instruction);
  if (mode === 'minimal') return intro + body.split('.').slice(0, 3).join('.') + '.';
  const noteText = note ? ' Note. ' + stripHtml(note) : '';
  return intro + body + noteText;
}

export interface SpeakOptions {
  text: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export function speak({ text, onStart, onEnd }: SpeakOptions) {
  stopSpeaking();
  if (!text || !('speechSynthesis' in window)) { onEnd?.(); return; }
  const voice = getSelectedVoice();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = getNarrationRate();
  utter.pitch = 0.72;
  utter.volume = 0.95;
  if (voice) { utter.voice = voice; utter.lang = voice.lang; }
  else utter.lang = 'en-IN';
  utter.onstart = () => onStart?.();
  utter.onend = () => onEnd?.();
  utter.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function previewVoice(voice: SpeechSynthesisVoice) {
  stopSpeaking();
  const utter = new SpeechSynthesisUtterance('Om. This is your guide for today\'s sadhana.');
  utter.rate = getNarrationRate(); utter.pitch = 0.72; utter.volume = 0.9;
  utter.voice = voice;
  window.speechSynthesis.speak(utter);
}
