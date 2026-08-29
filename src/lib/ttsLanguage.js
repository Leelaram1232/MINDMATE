import { Capacitor, registerPlugin } from '@capacitor/core';

const TtsLanguage = registerPlugin('TtsLanguage');

export async function openAndroidVoiceInstaller() {
  if (!Capacitor.isNativePlatform()) return { opened: false };
  try {
    return await TtsLanguage.installVoiceData();
  } catch (error) {
    console.warn('[tts] installVoiceData failed:', error);
    return { opened: false, error: error?.message };
  }
}

export async function openAndroidTtsSettings() {
  if (!Capacitor.isNativePlatform()) return { opened: false };
  try {
    return await TtsLanguage.openTtsSettings();
  } catch (error) {
    console.warn('[tts] openTtsSettings failed:', error);
    return { opened: false, error: error?.message };
  }
}

export async function listNativeSpeechLanguages() {
  if (!Capacitor.isNativePlatform()) return [];
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    const result = await TextToSpeech.getSupportedLanguages();
    return result?.languages || [];
  } catch (error) {
    console.warn('[tts] getSupportedLanguages failed:', error);
    return [];
  }
}

export function nativeHasLocale(languages, locale) {
  const want = String(locale || '').toLowerCase();
  const prefix = want.slice(0, 2);
  return (languages || []).some((item) => {
    const lang = String(item || '').toLowerCase();
    return lang === want || lang.startsWith(`${prefix}-`) || lang.startsWith(prefix);
  });
}
