import { SupportedLanguage } from './i18n';

/**
 * Text-to-Speech (TTS) Guidance Service using browser SpeechSynthesis API.
 * Provides accessible spoken audio instructions in English and Tamil.
 */
export function speakGuidance(text: string, lang: SupportedLanguage = 'EN') {
  if (!('speechSynthesis' in window)) {
    console.log('Text-to-speech not supported by browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.lang = lang === 'TA' ? 'ta-IN' : 'en-US';

  // Find voice if available
  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find(
    (v) => v.lang.startsWith(lang === 'TA' ? 'ta' : 'en')
  );
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopGuidance() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
