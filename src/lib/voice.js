import { Capacitor } from '@capacitor/core';

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

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => /^en/i.test(v.lang) && /female|woman|zira|samantha|google us/i.test(v.name)) ||
    voices.find((v) => /^en-US/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    voices[0] ||
    null
  );
}

function startResumeWatch() {
  if (resumeWatch || typeof window === 'undefined' || !window.speechSynthesis) return;
  resumeWatch = window.setInterval(() => {
    if (!window.speechSynthesis.speaking) return;
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
  }, 8000);
}

/** Call from a tap so the phone/browser allows sound. */
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

function speakWeb(text, rate) {
  const synth = window.speechSynthesis;
  synth.cancel();
  synth.resume();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1.05;
  utterance.volume = 1;
  const voice = pickVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = 'en-US';
  }
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

async function speakNative(text, rate) {
  const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
  await TextToSpeech.stop();
  await TextToSpeech.speak({
    text,
    lang: 'en-US',
    rate: Math.min(1, Math.max(0.5, rate)),
    pitch: 1.05,
    volume: 1,
    category: 'playback',
  });
}

export async function speak(text, { rate = 0.9 } = {}) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean || !canSpeak()) return;

  if (Capacitor.isNativePlatform()) {
    try {
      await speakNative(clean, rate);
      return;
    } catch (error) {
      console.warn('[voice] native TTS failed, trying browser:', error);
    }
  }

  if (!('speechSynthesis' in window)) return;
  if (window.speechSynthesis.getVoices().length) {
    speakWeb(clean, rate);
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
  speakWeb(clean, rate);
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
  recognition.lang = 'en-IN';
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
