import type { Analysis } from "../../src/lib/types";
import {
  DEFAULT_LANGUAGE,
  getStorageKey,
  LANGUAGE_OPTIONS,
  type SupportedLanguage,
} from "./shared";

const API_BASE_URL = import.meta.env.VITE_API_URL;

type TriggerAnalysisMessage = { type: "TRIGGER_ANALYSIS"; targetLanguage?: SupportedLanguage };
type AnalyzeRequestMessage = {
  type: "ANALYZE_REQUEST";
  text: string;
  url: string;
  targetLanguage?: SupportedLanguage;
};
type AnalysisResultMessage = { type: "ANALYSIS_RESULT"; data: Analysis };
type AnalysisErrorMessage = { type: "ANALYSIS_ERROR"; message: string };

type RuntimeMessage =
  | TriggerAnalysisMessage
  | AnalyzeRequestMessage
  | AnalysisResultMessage
  | AnalysisErrorMessage;

type AnalysisCacheEntry =
  | { status: "loading"; url: string; updatedAt: string }
  | {
      status: "success";
      url: string;
      updatedAt: string;
      data: Analysis;
      languageCache?: Partial<Record<SupportedLanguage, Analysis>>;
    }
  | { status: "error"; url: string; updatedAt: string; message: string };

const prefetchInFlightByTab = new Map<number, Set<SupportedLanguage>>();

chrome.runtime.onMessage.addListener((message: RuntimeMessage, sender: { tab?: { id?: number; url?: string } }) => {
  if (message.type === "TRIGGER_ANALYSIS") {
    void handleTriggerFromPopup(message.targetLanguage);
    return false;
  }

  if (message.type === "ANALYZE_REQUEST") {
    void handleAnalyzeRequest(message, sender.tab?.id);
    return false;
  }

  if (message.type === "ANALYSIS_ERROR") {
    void handleContentError(message, sender.tab?.id, sender.tab?.url);
    return false;
  }

  return false;
});

async function handleTriggerFromPopup(targetLanguage?: SupportedLanguage) {
  const activeTab = await getActiveTab();
  if (!activeTab?.id) {
    return;
  }

  if (!isSupportedUrl(activeTab.url)) {
    await setAnalysisState(activeTab.id, {
      status: "error",
      url: activeTab.url ?? "",
      updatedAt: new Date().toISOString(),
      message: "This extension only works on regular http and https pages.",
    });
    return;
  }

  const selectedLanguage = sanitizeLanguage(targetLanguage ?? (await getPreferredLanguage()));
  const existingEntry = await getAnalysisState(activeTab.id);

  const cachedResult = getCachedAnalysisForLanguage(existingEntry, activeTab.url, selectedLanguage);
  if (cachedResult) {
    const state: AnalysisCacheEntry = {
      status: "success",
      url: activeTab.url,
      updatedAt: new Date().toISOString(),
      data: cachedResult,
      languageCache:
        existingEntry?.status === "success"
          ? { ...(existingEntry.languageCache ?? {}), [cachedResult.language as SupportedLanguage]: cachedResult }
          : { [cachedResult.language as SupportedLanguage]: cachedResult },
    };
    await setAnalysisState(activeTab.id, state);
    await sendMessageToTab(activeTab.id, {
      type: "ANALYSIS_RESULT",
      data: cachedResult,
    });
    return;
  }

  if (!existingEntry || existingEntry.url !== activeTab.url || existingEntry.status !== "success") {
    await setAnalysisState(activeTab.id, {
      status: "loading",
      url: activeTab.url,
      updatedAt: new Date().toISOString(),
    });
  }

  try {
    await chrome.tabs.sendMessage(activeTab.id, {
      type: "TRIGGER_ANALYSIS",
      targetLanguage: selectedLanguage,
    } satisfies TriggerAnalysisMessage);
  } catch {
    await setAnalysisState(activeTab.id, {
      status: "error",
      url: activeTab.url,
      updatedAt: new Date().toISOString(),
      message: "The page is not ready for analysis yet. Refresh the tab and try again.",
    });
  }
}

async function handleAnalyzeRequest(message: AnalyzeRequestMessage, tabId?: number) {
  if (!tabId) {
    return;
  }

  const targetLanguage = sanitizeLanguage(message.targetLanguage);
  const cachedEntry = await getAnalysisState(tabId);
  const cachedResult = getCachedAnalysisForLanguage(cachedEntry, message.url, targetLanguage);
  if (cachedResult) {
    await sendMessageToTab(tabId, {
      type: "ANALYSIS_RESULT",
      data: cachedResult,
    });
    return;
  }

  await setAnalysisState(tabId, {
    status: "loading",
    url: message.url,
    updatedAt: new Date().toISOString(),
  });

  try {
    if (!API_BASE_URL) {
      throw new Error("The extension API URL is not configured.");
    }

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message.text,
        language: targetLanguage,
        readingLevel: "simple",
        source: "extension",
      }),
    });

    const payload = (await response.json()) as unknown;
    if (!response.ok) {
      throw new Error(getApiErrorMessage(payload));
    }

    if (!isAnalysis(payload)) {
      throw new Error("The analysis response was not in the expected format.");
    }

    const normalizedPayload: Analysis =
      payload.language === targetLanguage
        ? payload
        : {
            ...payload,
            // Keep extension UI language consistent with the user's selected target language.
            language: targetLanguage,
          };

    const state: AnalysisCacheEntry = {
      status: "success",
      url: message.url,
      updatedAt: new Date().toISOString(),
      data: normalizedPayload,
      languageCache:
        cachedEntry?.status === "success"
          ? { ...(cachedEntry.languageCache ?? {}), [targetLanguage]: normalizedPayload }
          : { [targetLanguage]: normalizedPayload },
    };

    await setAnalysisState(tabId, state);
    await sendMessageToTab(tabId, { type: "ANALYSIS_RESULT", data: normalizedPayload });
    void prefetchOtherLanguages(tabId, message, targetLanguage, state);
  } catch (error) {
    const messageText = getAnalyzeFailureMessage(error);

    await handleFailure(tabId, message.url, messageText);
  }
}

function getCachedAnalysisForLanguage(
  entry: AnalysisCacheEntry | null,
  url: string,
  language: SupportedLanguage
): Analysis | null {
  if (!entry || entry.status !== "success" || entry.url !== url) {
    return null;
  }

  if (entry.data.language === language) {
    return entry.data;
  }

  return entry.languageCache?.[language] ?? null;
}

async function prefetchOtherLanguages(
  tabId: number,
  message: AnalyzeRequestMessage,
  currentLanguage: SupportedLanguage,
  entry: Extract<AnalysisCacheEntry, { status: "success" }>
) {
  if (!API_BASE_URL) return;

  const remainingLanguages = LANGUAGE_OPTIONS.map((option) => option.value).filter(
    (lang) => lang !== currentLanguage && !entry.languageCache?.[lang]
  );

  if (remainingLanguages.length === 0) return;

  let inFlight = prefetchInFlightByTab.get(tabId);
  if (!inFlight) {
    inFlight = new Set<SupportedLanguage>();
    prefetchInFlightByTab.set(tabId, inFlight);
  }

  for (const lang of remainingLanguages) {
    if (inFlight.has(lang)) continue;
    inFlight.add(lang);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: message.text,
          language: lang,
          readingLevel: "simple",
          source: "extension",
        }),
      });

      const payload = (await response.json()) as unknown;
      if (!response.ok || !isAnalysis(payload)) {
        continue;
      }

      const normalizedPayload: Analysis =
        payload.language === lang
          ? payload
          : {
              ...payload,
              language: lang,
            };

      const latestState = await getAnalysisState(tabId);
      if (!latestState || latestState.status !== "success" || latestState.url !== message.url) {
        continue;
      }

      await setAnalysisState(tabId, {
        ...latestState,
        updatedAt: new Date().toISOString(),
        languageCache: {
          ...(latestState.languageCache ?? {}),
          [lang]: normalizedPayload,
        },
      });
    } catch {
      // Background prefetch is best-effort only.
    } finally {
      inFlight.delete(lang);
    }
  }

  if (inFlight.size === 0) {
    prefetchInFlightByTab.delete(tabId);
  }
}

async function handleContentError(
  message: AnalysisErrorMessage,
  tabId?: number,
  url?: string,
) {
  if (!tabId) {
    return;
  }

  await handleFailure(tabId, url ?? "", message.message);
}

async function handleFailure(tabId: number, url: string, message: string) {
  await setAnalysisState(tabId, {
    status: "error",
    url,
    updatedAt: new Date().toISOString(),
    message,
  });

  await sendMessageToTab(tabId, { type: "ANALYSIS_ERROR", message });
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function sendMessageToTab(tabId: number, message: RuntimeMessage) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch {
    return;
  }
}

async function getAnalysisState(tabId: number): Promise<AnalysisCacheEntry | null> {
  const key = getStorageKey(tabId);
  const data = await chrome.storage.session.get(key);
  return (data[key] as AnalysisCacheEntry | undefined) ?? null;
}

async function setAnalysisState(tabId: number, state: AnalysisCacheEntry) {
  const key = getStorageKey(tabId);
  await chrome.storage.session.set({ [key]: state });
}

function isSupportedUrl(url?: string): url is string {
  return Boolean(url && /^https?:\/\//.test(url));
}

async function getPreferredLanguage(): Promise<SupportedLanguage> {
  const stored = await chrome.storage.sync.get("preferredLanguage");
  return sanitizeLanguage(stored.preferredLanguage);
}

function sanitizeLanguage(value: unknown): SupportedLanguage {
  const match = LANGUAGE_OPTIONS.find((option) => option.value === value);
  return match?.value ?? DEFAULT_LANGUAGE;
}

function getApiErrorMessage(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  return "The API returned an error while analyzing this page.";
}

function isAnalysis(value: unknown): value is Analysis {
  if (!value || typeof value !== "object") {
    return false;
  }

  const analysis = value as Record<string, unknown>;
  return (
    typeof analysis.summary === "string" &&
    typeof analysis.riskScore === "number" &&
    isRiskLevel(analysis.riskLevel) &&
    Array.isArray(analysis.keyObligations) &&
    Array.isArray(analysis.hiddenClauses) &&
    Array.isArray(analysis.quiz) &&
    typeof analysis.language === "string" &&
    typeof analysis.auditId === "string" &&
    typeof analysis.createdAt === "string"
  );
}

function isRiskLevel(value: unknown): value is Analysis["riskLevel"] {
  return value === "low" || value === "medium" || value === "high" || value === "critical";
}

function getAnalyzeFailureMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Something went wrong while analyzing this page.";
  }

  if (error.message === "Failed to fetch") {
    return `The extension could not reach ${API_BASE_URL}/api/analyze. Start the web app and reload the extension.`;
  }

  return error.message;
}
