const STORAGE_KEY = 'mindmate-voice';

export const VOICE_GENDERS = ['female', 'male'];
export const VOICE_RATES = [
  { id: 'slow', rate: 0.75 },
  { id: 'normal', rate: 0.92 },
  { id: 'fast', rate: 1.08 },
];

const DEFAULTS = {
  gender: 'female',
  rateId: 'normal',
  pitch: 1.08,
  responsesOn: true,
};

export function readVoiceSettings() {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    const gender = VOICE_GENDERS.includes(stored.gender) ? stored.gender : DEFAULTS.gender;
    const rateId = VOICE_RATES.some((r) => r.id === stored.rateId) ? stored.rateId : DEFAULTS.rateId;
    return {
      gender,
      rateId,
      pitch: gender === 'female' ? 1.08 : 0.92,
      responsesOn: stored.responsesOn !== false,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function writeVoiceSettings(patch) {
  const next = { ...readVoiceSettings(), ...patch };
  if (!VOICE_GENDERS.includes(next.gender)) next.gender = 'female';
  if (!VOICE_RATES.some((r) => r.id === next.rateId)) next.rateId = 'normal';
  next.pitch = next.gender === 'female' ? 1.08 : 0.92;
  next.responsesOn = next.responsesOn !== false;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function voiceRateValue(rateId = readVoiceSettings().rateId) {
  return VOICE_RATES.find((r) => r.id === rateId)?.rate || 0.92;
}

const FEMALE_RE = /female|woman|girl|zira|samantha|susan|karen|moira|tessa|fiona|veena|heera|lekha|kanya|kalpana|ananya|priya|aditi|meera|mira|swara|lakshmi|sarika|google uk english female|en-us-x-sfg|en-gb-x-gba/i;
const MALE_RE = /male|man|boy|david|mark|daniel|ravi|alex|fred|google uk english male|en-us-x-tpd/i;

export function scoreVoice(voice, locale, gender) {
  if (!voice) return -100;
  const lang = String(voice.lang || '').toLowerCase();
  const name = String(voice.name || '');
  const prefix = String(locale || 'en').slice(0, 2).toLowerCase();
  let score = 0;
  if (lang.startsWith(prefix)) score += 8;
  else if (/^en/i.test(lang)) score += 2;
  const female = FEMALE_RE.test(name);
  const male = MALE_RE.test(name);
  if (gender === 'female') {
    if (female) score += 10;
    if (male) score -= 6;
    score += 1;
  } else {
    if (male) score += 10;
    if (female) score -= 6;
  }
  return score;
}

export function pickBestVoice(voices, locale, gender = 'female') {
  const list = Array.isArray(voices) ? voices : [];
  if (!list.length) return { voice: null, index: -1 };
  let best = list[0];
  let bestIndex = 0;
  let bestScore = scoreVoice(best, locale, gender);
  list.forEach((voice, index) => {
    const score = scoreVoice(voice, locale, gender);
    if (score > bestScore) {
      best = voice;
      bestIndex = index;
      bestScore = score;
    }
  });
  return { voice: best, index: bestIndex };
}
