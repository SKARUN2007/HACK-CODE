/**
 * Speech Utilities for MakkalSaantru:
 * 1. Web Speech SpeechRecognition (Speech-to-Text) in Tamil & English.
 * 2. Web Speech SpeechSynthesis (Text-to-Speech) for accessible audio guidance.
 */

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakAudioPrompt(text: string, lang: 'EN' | 'TA' = 'TA'): void {
  if (!isSpeechSynthesisSupported()) return;

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92; // Slightly paced for field clarity
    utterance.pitch = 1.0;
    utterance.lang = lang === 'TA' ? 'ta-IN' : 'en-IN';

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find((v) =>
        lang === 'TA'
          ? v.lang.startsWith('ta') || v.name.toLowerCase().includes('tamil')
          : v.lang.startsWith('en')
      );
      if (match) {
        utterance.voice = match;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[SpeechSynthesis] Failed to play audio guidance:', err);
  }
}

export function stopAudioPrompt(): void {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
  }
}

export interface SpeechRecognitionController {
  start: () => void;
  stop: () => void;
  isListening: boolean;
}

export function initSpeechRecognition(params: {
  lang: 'EN' | 'TA';
  onTranscript: (text: string) => void;
  onError?: (err: any) => void;
  onStateChange?: (listening: boolean) => void;
}): SpeechRecognitionController | null {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognitionClass) return null;

  let recognition: any = null;
  let isListening = false;

  try {
    recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = params.lang === 'TA' ? 'ta-IN' : 'en-IN';

    recognition.onstart = () => {
      isListening = true;
      params.onStateChange?.(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript.trim()) {
        params.onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (err: any) => {
      console.warn('[SpeechRecognition] error:', err);
      isListening = false;
      params.onStateChange?.(false);
      params.onError?.(err);
    };

    recognition.onend = () => {
      isListening = false;
      params.onStateChange?.(false);
    };

    return {
      start: () => {
        try {
          recognition.start();
        } catch (e) {
          console.warn('[SpeechRecognition] start error:', e);
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
      },
      get isListening() {
        return isListening;
      },
    };
  } catch (err) {
    console.warn('[SpeechRecognition] Initialization failed:', err);
    return null;
  }
}
