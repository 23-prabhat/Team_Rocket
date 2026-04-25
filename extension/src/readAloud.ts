import { SPEECH_LANGUAGE_MAP, type SupportedLanguage } from "./shared";

export type SpeechStatus = "idle" | "playing" | "paused";

export function stopSpeech() {
  window.speechSynthesis?.cancel();
}

export function pauseSpeech() {
  window.speechSynthesis?.pause();
}

export function resumeSpeech() {
  window.speechSynthesis?.resume();
}

export function speakText(text: string, language: SupportedLanguage, onEnd: () => void) {
  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = SPEECH_LANGUAGE_MAP[language] ?? "en-US";
  utterance.rate = 0.95;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;

  window.speechSynthesis?.speak(utterance);
}
