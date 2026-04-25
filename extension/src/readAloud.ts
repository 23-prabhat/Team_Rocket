import { SPEECH_LANGUAGE_MAP, type SupportedLanguage } from "./shared";

export type SpeechStatus = "idle" | "playing" | "paused";

let speechToken = 0;
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesReadyPromise: Promise<SpeechSynthesisVoice[]> | null = null;
let voicesListenerAttached = false;
const voiceByLanguage = new Map<SupportedLanguage, SpeechSynthesisVoice>();

const LANGUAGE_FALLBACKS: Record<SupportedLanguage, string[]> = {
  en: ["en-US", "en-GB", "en"],
  hi: ["hi-IN", "hi", "en-IN", "en-US"],
  mr: ["mr-IN", "mr", "hi-IN", "hi", "en-IN", "en-US"],
};

function refreshCachedVoices(): SpeechSynthesisVoice[] {
  const synthesis = window.speechSynthesis;
  if (!synthesis?.getVoices) return [];
  const voices = synthesis.getVoices();
  if (voices.length > 0) {
    cachedVoices = voices;
    voiceByLanguage.clear();
  }
  return voices;
}

function ensureVoicesListener() {
  const synthesis = window.speechSynthesis;
  if (!synthesis?.addEventListener || voicesListenerAttached) return;
  voicesListenerAttached = true;
  synthesis.addEventListener("voiceschanged", () => {
    refreshCachedVoices();
  });
}

async function waitForVoices(timeoutMs = 300): Promise<SpeechSynthesisVoice[]> {
  const synthesis = window.speechSynthesis;
  if (!synthesis?.getVoices) {
    return [];
  }

  if (cachedVoices.length > 0) {
    return cachedVoices;
  }

  const immediate = refreshCachedVoices();
  if (immediate.length > 0) {
    return immediate;
  }

  if (!voicesReadyPromise) {
    voicesReadyPromise = new Promise((resolve) => {
      let settled = false;

      const finalize = () => {
        if (settled) return;
        settled = true;
        synthesis.removeEventListener("voiceschanged", handleVoicesChanged);
        const voices = refreshCachedVoices();
        voicesReadyPromise = null;
        resolve(voices);
      };

      const handleVoicesChanged = () => finalize();

      synthesis.addEventListener("voiceschanged", handleVoicesChanged);
      window.setTimeout(finalize, timeoutMs);
    });
  }

  return voicesReadyPromise;
}

function pickBestVoice(
  availableVoices: SpeechSynthesisVoice[],
  language: SupportedLanguage,
): SpeechSynthesisVoice | undefined {
  const preferred = LANGUAGE_FALLBACKS[language];
  const lowerPreferred = preferred.map((item) => item.toLowerCase());

  const exact = availableVoices.find((voice) =>
    lowerPreferred.includes(voice.lang.toLowerCase()),
  );
  if (exact) return exact;

  const prefix = availableVoices.find((voice) =>
    lowerPreferred.some((target) => voice.lang.toLowerCase().startsWith(target.split("-")[0])),
  );
  if (prefix) return prefix;

  const byName = availableVoices.find((voice) => {
    const name = `${voice.name} ${voice.lang}`.toLowerCase();
    if (language === "hi") return name.includes("hindi");
    if (language === "mr") return name.includes("marathi") || name.includes("hindi");
    return name.includes("english");
  });

  return byName;
}

function chunkText(input: string, maxChunkLength = 220): string[] {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const pieces = normalized
    .split(/(?<=[.!?\u0964])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const chunks: string[] = [];
  let current = "";

  for (const piece of pieces) {
    if (!current) {
      current = piece;
      continue;
    }

    if (`${current} ${piece}`.length <= maxChunkLength) {
      current = `${current} ${piece}`;
      continue;
    }

    chunks.push(current);
    current = piece;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.flatMap((chunk) => {
    if (chunk.length <= maxChunkLength) return [chunk];

    const split: string[] = [];
    for (let i = 0; i < chunk.length; i += maxChunkLength) {
      split.push(chunk.slice(i, i + maxChunkLength).trim());
    }
    return split.filter((item) => item.length > 0);
  });
}

export function stopSpeech() {
  speechToken += 1;
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
  const synthesis = window.speechSynthesis;
  if (!synthesis) {
    onEnd();
    return;
  }

  const chunks = chunkText(text);
  if (chunks.length === 0) {
    onEnd();
    return;
  }

  const token = speechToken;
  const targetLang = SPEECH_LANGUAGE_MAP[language] ?? "en-US";

  void (async () => {
    ensureVoicesListener();
    const voices = await waitForVoices();
    if (token !== speechToken) return;

    const cachedVoice = voiceByLanguage.get(language);
    const matchingVoice =
      cachedVoice && voices.includes(cachedVoice)
        ? cachedVoice
        : pickBestVoice(voices, language);
    if (matchingVoice) {
      voiceByLanguage.set(language, matchingVoice);
    }
    let index = 0;

    const speakNext = () => {
      if (token !== speechToken) return;
      if (index >= chunks.length) {
        onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = matchingVoice?.lang ?? targetLang;
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      utterance.rate = 0.95;
      utterance.onend = () => {
        index += 1;
        speakNext();
      };
      utterance.onerror = () => {
        index += 1;
        speakNext();
      };

      synthesis.speak(utterance);
    };

    speakNext();
  })();
}
