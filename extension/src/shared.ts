export type SupportedLanguage = "en" | "hi" | "mr";

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

export const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string }> = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" },
];

export const SPEECH_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  en: "en-US",
  hi: "hi-IN",
  mr: "mr-IN",
};

export function getCredibilityLabel(score: number) {
  if (score <= 30) {
    return "Likely credible";
  }

  if (score <= 60) {
    return "Needs verification";
  }

  if (score <= 80) {
    return "Likely misleading";
  }

  return "High fake-news risk";
}

export function getStorageKey(tabId: number) {
  return `analysis_${tabId}`;
}
