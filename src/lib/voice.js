import { Capacitor } from '@capacitor/core';
import { getSpeechLocale, getActiveLanguage } from './i18n';
import { pickBestVoice, readVoiceSettings, voiceRateValue } from './voiceSettings';

const SpeechRecognitionAPI = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

let audioUnlocked = false;
let resumeWatch = null;

export function canListen() {
  return Boolean(SpeechRecognitionAPI);
}

export function canSpeak() {
  if (typeof window === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return true;
  return 'speechSynthesis' in window;
}

export function isNativeVoice() {
  return Capacitor.isNativePlatform();
}

function pickWebVoice(locale, gender) {
  const voices = window.speechSynthesis.getVoices();
  return pickBestVoice(voices, locale, gender).voice;
}

function startResumeWatch() {
  if (resumeWatch || typeof window === 'undefined' || !window.speechSynthesis) return;
  resumeWatch = window.setInterval(() => {
    if (!window.speechSynthesis.speaking) return;
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
  }, 8000);
}

export function unlockVoice() {
  audioUnlocked = true;
  if (typeof window === 'undefined') return;

  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.resume();
      const prime = new SpeechSynthesisUtterance(' ');
      prime.volume = 0;
      prime.rate = 2;
      window.speechSynthesis.speak(prime);
    } catch {
      /* ignore */
    }
    startResumeWatch();
  }
}

function speakWeb(text, { rate, pitch, locale, gender }) {
  const synth = window.speechSynthesis;
  synth.cancel();
  synth.resume();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1;
  utterance.lang = locale;
  const voice = pickWebVoice(locale, gender);
  if (voice) utterance.voice = voice;
  utterance.onerror = (event) => {
    if (event.error !== 'canceled' && event.error !== 'interrupted') {
      console.warn('[voice] speechSynthesis error:', event.error);
    }
  };

  window.setTimeout(() => {
    synth.resume();
    synth.speak(utterance);
  }, 80);
}

async function speakNative(text, { rate, pitch, locale, gender }) {
  const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
  await TextToSpeech.stop();
  let voiceIndex;
  try {
    const result = await TextToSpeech.getSupportedVoices();
    const picked = pickBestVoice(result?.voices || [], locale, gender);
    if (picked.index >= 0) voiceIndex = picked.index;
  } catch {
    /* use language only */
  }
  await TextToSpeech.speak({
    text,
    lang: locale,
    rate: Math.min(1, Math.max(0.5, rate)),
    pitch,
    volume: 1,
    category: 'playback',
    ...(Number.isInteger(voiceIndex) ? { voice: voiceIndex } : {}),
  });
}

export async function speak(text, { rate, lang, force = false } = {}) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean || !canSpeak()) return;
  const settings = readVoiceSettings();
  if (!force && settings.responsesOn === false) return;
  const locale = getSpeechLocale(lang || getActiveLanguage());
  const options = {
    rate: rate ?? voiceRateValue(settings.rateId),
    pitch: settings.pitch,
    locale,
    gender: settings.gender || 'female',
  };

  if (Capacitor.isNativePlatform()) {
    try {
      await speakNative(clean, options);
      return;
    } catch (error) {
      console.warn('[voice] native TTS failed, trying browser:', error);
    }
  }

  if (!('speechSynthesis' in window)) return;
  if (window.speechSynthesis.getVoices().length) {
    speakWeb(clean, options);
    return;
  }
  await new Promise((resolve) => {
    const ready = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', ready);
      resolve();
    };
    window.speechSynthesis.addEventListener('voiceschanged', ready);
    window.setTimeout(resolve, 400);
  });
  speakWeb(clean, options);
}

export async function stopSpeaking() {
  if (Capacitor.isNativePlatform()) {
    try {
      const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
      await TextToSpeech.stop();
    } catch {
      /* plugin not synced yet */
    }
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function startListening({ onResult, onInterim, onError, onEnd }) {
  if (!canListen()) {
    onError?.('Spoken input is not available here. Type a message instead.');
    return { stop: () => {} };
  }

  unlockVoice();

  const recognition = new SpeechRecognitionAPI();
  recognition.lang = getSpeechLocale();
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let interim = '';
    let finalText = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const piece = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += piece;
      else interim += piece;
    }
    if (interim) onInterim?.(interim);
    if (finalText.trim()) onResult?.(finalText.trim());
  };

  recognition.onerror = (event) => {
    if (event.error === 'aborted' || event.error === 'no-speech') {
      onEnd?.();
      return;
    }
    if (event.error === 'not-allowed') {
      onError?.('Microphone permission was denied. Please allow the mic, or type instead.');
    } else {
      onError?.('Could not hear that. Please try again or type instead.');
    }
    onEnd?.();
  };

  recognition.onend = () => onEnd?.();
  try {
    recognition.start();
  } catch {
    onError?.('Could not start the microphone. Type a message instead.');
    onEnd?.();
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

export function wasVoiceUnlocked() {
  return audioUnlocked;
}
