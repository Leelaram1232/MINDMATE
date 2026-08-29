import { Capacitor } from '@capacitor/core';
import { LANGUAGES } from './i18n';
import { speak } from './voice';
import {
  listNativeSpeechLanguages,
  nativeHasLocale,
  openAndroidVoiceInstaller,
} from './ttsLanguage';

const INSTALLED_KEY = 'mindmate-lang-packs';
const PACK_PREFIX = 'mindmate-lang-pack:';
const listeners = new Set();

function readInstalled() {
  if (typeof window === 'undefined') return ['en'];
  try {
    const raw = window.localStorage.getItem(INSTALLED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.from(new Set(['en', ...list.filter((code) => LANGUAGES.some((l) => l.code === code))]));
  } catch {
    return ['en'];
  }
}

function writeInstalled(list) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INSTALLED_KEY, JSON.stringify(Array.from(new Set(['en', ...list]))));
  listeners.forEach((fn) => fn(readInstalled()));
}

export function getInstalledPacks() {
  return readInstalled();
}

export function isPackInstalled(code) {
  return readInstalled().includes(code);
}

export function subscribeInstalledPacks(fn) {
  listeners.add(fn);
  fn(readInstalled());
  return () => listeners.delete(fn);
}

export function packUrl(code) {
  return `${import.meta.env.BASE_URL}lang-packs/${code}.json`;
}

function savePack(code, pack) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PACK_PREFIX + code, JSON.stringify({ ...pack, savedAt: Date.now() }));
}

export function readSavedPack(code) {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem(PACK_PREFIX + code) || 'null');
  } catch {
    return null;
  }
}

async function fetchWithProgress(url, onProgress) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not download language pack (${res.status}).`);

  const total = Number(res.headers.get('content-length') || 0);
  if (!res.body || !total || !res.body.getReader) {
    const pack = await res.json();
    onProgress?.(100);
    return pack;
  }

  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress?.(Math.min(90, Math.round((received / total) * 90)));
  }

  const blob = new Blob(chunks);
  const text = await blob.text();
  onProgress?.(96);
  return JSON.parse(text);
}

export async function downloadLanguagePack(code, { onProgress } = {}) {
  const meta = LANGUAGES.find((l) => l.code === code);
  if (!meta) throw new Error('Unknown language.');

  onProgress?.({ stage: 'download', percent: 8, detail: meta.name });

  const tick = setInterval(() => {
    /* keep UI moving while headers arrive */
  }, 200);

  try {
    const pack = await fetchWithProgress(packUrl(code), (percent) => {
      onProgress?.({ stage: 'download', percent: Math.max(8, percent), detail: meta.name });
    });
    if (!pack?.code) throw new Error('Language pack was empty.');
    savePack(code, pack);
    onProgress?.({ stage: 'save', percent: 92, detail: meta.name });

    const installed = readInstalled();
    if (!installed.includes(code)) writeInstalled([...installed, code]);

    if (Capacitor.isNativePlatform()) {
      onProgress?.({ stage: 'android', percent: 96, detail: meta.name });
      const languages = await listNativeSpeechLanguages();
      const ready = nativeHasLocale(languages, meta.locale);
      if (!ready) {
        await openAndroidVoiceInstaller();
      }
    }

    onProgress?.({ stage: 'ready', percent: 100, detail: meta.name });
    return pack;
  } finally {
    clearInterval(tick);
  }
}

export async function previewPackVoice(code) {
  const pack = readSavedPack(code);
  const text = pack?.voiceSample || 'Hello, I am Mira.';
  await speak(text, { lang: code, force: true });
}

export function languageNeedsDownload(code) {
  return code !== 'en' && !isPackInstalled(code);
}
