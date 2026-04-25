import { useEffect, useState, type ChangeEvent, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import type { Analysis } from "../../src/lib/types";
import { pauseSpeech, resumeSpeech, speakText, stopSpeech, type SpeechStatus } from "./readAloud";
import {
  DEFAULT_LANGUAGE,
  getCredibilityLabel,
  getStorageKey,
  LANGUAGE_OPTIONS,
  type SupportedLanguage,
} from "./shared";

type AnalysisCacheEntry =
  | { status: "loading"; url: string; updatedAt: string }
  | { status: "success"; url: string; updatedAt: string; data: Analysis }
  | { status: "error"; url: string; updatedAt: string; message: string };

type PopupState = {
  tabId: number | null;
  tabUrl: string;
  entry: AnalysisCacheEntry | null;
  isLoading: boolean;
  loadError: string | null;
};

function PopupApp() {
  const [state, setState] = useState<PopupState>({
    tabId: null,
    tabUrl: "",
    entry: null,
    isLoading: true,
    loadError: null,
  });
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>("idle");
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const [activeTab, storedLanguage] = await Promise.all([
          chrome.tabs.query({ active: true, currentWindow: true }).then((tabs: Array<{ id?: number; url?: string }>) => tabs[0]),
          chrome.storage.sync.get("preferredLanguage"),
        ]);

        const tabId = activeTab?.id ?? null;
        const tabUrl = activeTab?.url ?? "";
        const preferredLanguage = sanitizeLanguage(storedLanguage.preferredLanguage);

        if (!isMounted) {
          return;
        }

        setSelectedLanguage(preferredLanguage);

        if (!tabId) {
          setState({
            tabId: null,
            tabUrl,
            entry: null,
            isLoading: false,
            loadError: "No active tab was found.",
          });
          return;
        }

        const key = getStorageKey(tabId);
        const stored = await chrome.storage.session.get(key);
        const entry = (stored[key] as AnalysisCacheEntry | undefined) ?? null;

        if (!isMounted) {
          return;
        }

        setState({
          tabId,
          tabUrl,
          entry: isMatchingEntry(entry, tabUrl, preferredLanguage) ? entry : null,
          isLoading: false,
          loadError: null,
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setState({
          tabId: null,
          tabUrl: "",
          entry: null,
          isLoading: false,
          loadError: "The popup could not read the current tab state.",
        });
      }
    };

    const handleStorageChange = (
      changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
      areaName: string,
    ) => {
      if (areaName !== "session") {
        return;
      }

      setState((currentState) => {
        if (currentState.tabId === null) {
          return currentState;
        }

        const change = changes[getStorageKey(currentState.tabId)];
        if (!change) {
          return currentState;
        }

        const nextEntry = (change.newValue as AnalysisCacheEntry | undefined) ?? null;
        return {
          ...currentState,
          entry: isMatchingEntry(nextEntry, currentState.tabUrl, selectedLanguage) ? nextEntry : null,
          isLoading: false,
        };
      });
    };

    void initialize();
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      isMounted = false;
      chrome.storage.onChanged.removeListener(handleStorageChange);
      stopSpeech();
    };
  }, [selectedLanguage]);

  useEffect(() => {
    stopSpeech();
    setSpeechStatus("idle");
  }, [state.entry]);

  const triggerAnalysis = async (targetLanguage = selectedLanguage) => {
    setState((currentState) => ({
      ...currentState,
      entry: {
        status: "loading",
        url: currentState.tabUrl,
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
      loadError: null,
    }));

    try {
      await chrome.storage.sync.set({ preferredLanguage: targetLanguage });
      await chrome.runtime.sendMessage({
        type: "TRIGGER_ANALYSIS",
        targetLanguage,
      });
    } catch {
      setState((currentState) => ({
        ...currentState,
        entry: {
          status: "error",
          url: currentState.tabUrl,
          updatedAt: new Date().toISOString(),
          message: "The extension could not start the page analysis.",
        },
      }));
    }
  };

  const handleLanguageChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = sanitizeLanguage(event.target.value);
    setSelectedLanguage(nextLanguage);
    await chrome.storage.sync.set({ preferredLanguage: nextLanguage });

    if (state.tabId !== null && /^https?:\/\//.test(state.tabUrl)) {
      void triggerAnalysis(nextLanguage);
    }
  };

  const result = state.entry?.status === "success" ? state.entry.data : null;
  const errorMessage = state.entry?.status === "error" ? state.entry.message : state.loadError;
  const unsupported = state.tabUrl.length > 0 && !/^https?:\/\//.test(state.tabUrl);
  const playbackText = result
    ? [result.summary, ...result.hiddenClauses.slice(0, 2).map((clause) => clause.explanation)].join(". ")
    : "";

  const toggleSpeech = () => {
    if (!playbackText || !speechSupported) {
      return;
    }

    if (speechStatus === "playing") {
      pauseSpeech();
      setSpeechStatus("paused");
      return;
    }

    if (speechStatus === "paused") {
      resumeSpeech();
      setSpeechStatus("playing");
      return;
    }

    speakText(playbackText, selectedLanguage, () => setSpeechStatus("idle"));
    setSpeechStatus("playing");
  };

  return (
    <div style={styles.shell}>
      <style>{popupStyles}</style>
      <div style={styles.panel}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>Veritron</p>
          <h1 style={styles.title}>Regional Misinformation Detector</h1>
          <p style={styles.subtitle}>
            Scan the current page, estimate fake-news risk, and explain the result in your chosen
            language.
          </p>
        </div>

        <div className="card controlsCard">
          <div>
            <p className="sectionLabel">Output language</p>
            <p className="bodyText">Choose how Veritron explains the result.</p>
          </div>
          <select className="languageSelect" value={selectedLanguage} onChange={handleLanguageChange}>
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {state.isLoading ? (
          <LoadingState />
        ) : errorMessage ? (
          <ErrorState message={errorMessage} onRetry={triggerAnalysis} />
        ) : result ? (
          <ResultState
            result={result}
            selectedLanguage={selectedLanguage}
            speechSupported={speechSupported}
            speechStatus={speechStatus}
            onAnalyze={triggerAnalysis}
            onToggleSpeech={toggleSpeech}
            onStopSpeech={() => {
              stopSpeech();
              setSpeechStatus("idle");
            }}
          />
        ) : (
          <EmptyState onAnalyze={triggerAnalysis} unsupported={unsupported} />
        )}

        {state.entry?.status === "loading" ? (
          <div className="statusCard">
            <div className="spinner" aria-hidden="true" />
            <p className="statusText">Checking the page for suspicious claims...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="statusCard">
      <div className="spinner" aria-hidden="true" />
      <p className="statusText">Loading current tab...</p>
    </div>
  );
}

function EmptyState({
  onAnalyze,
  unsupported,
}: {
  onAnalyze: (targetLanguage?: SupportedLanguage) => Promise<void>;
  unsupported: boolean;
}) {
  return (
    <div className="card">
      <p className="sectionLabel">Current page</p>
      <p className="bodyText">
        {unsupported
          ? "Open a regular http or https page to analyze it."
          : "No misinformation analysis is stored for this tab yet."}
      </p>
      <button className="primaryButton" onClick={() => void onAnalyze()} disabled={unsupported}>
        Analyze this page
      </button>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: (targetLanguage?: SupportedLanguage) => Promise<void>;
}) {
  return (
    <div className="card errorCard">
      <p className="sectionLabel">Analysis error</p>
      <p className="bodyText">{message}</p>
      <button className="primaryButton" onClick={() => void onRetry()}>
        Try again
      </button>
    </div>
  );
}

function ResultState({
  result,
  selectedLanguage,
  speechSupported,
  speechStatus,
  onAnalyze,
  onToggleSpeech,
  onStopSpeech,
}: {
  result: Analysis;
  selectedLanguage: SupportedLanguage;
  speechSupported: boolean;
  speechStatus: SpeechStatus;
  onAnalyze: (targetLanguage?: SupportedLanguage) => Promise<void>;
  onToggleSpeech: () => void;
  onStopSpeech: () => void;
}) {
  return (
    <>
      <div className="scoreCard">
        <div>
          <p className="sectionLabel">Fake news percentage</p>
          <div className="scoreLine">
            <span className="scoreValue">{result.riskScore}%</span>
          </div>
          <p className="metaText">{getCredibilityLabel(result.riskScore)}</p>
        </div>
        <span className={`riskBadge risk-${result.riskLevel}`}>{result.riskLevel}</span>
      </div>

      <div className="card">
        <p className="sectionLabel">Explanation</p>
        <p className="bodyText">{getOneLineSummary(result.summary)}</p>
        <p className="metaText">Output: {LANGUAGE_OPTIONS.find((item) => item.value === selectedLanguage)?.label}</p>
      </div>

      <div className="card">
        <p className="sectionLabel">Top reasons flagged</p>
        {result.hiddenClauses.slice(0, 2).length > 0 ? (
          <div className="reasonList">
            {result.hiddenClauses.slice(0, 2).map((clause, index) => (
              <div key={`${clause.category}-${index}`} className="reasonItem">
                <span className="reasonDot" aria-hidden="true" />
                <p className="bodyText">{clause.explanation}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="bodyText">No detailed reasons were returned for this page.</p>
        )}
      </div>

      {speechSupported ? (
        <div className="card">
          <p className="sectionLabel">Read aloud</p>
          <div className="actionRow">
            <button className="secondaryButton" onClick={onToggleSpeech}>
              {speechStatus === "playing" ? "Pause audio" : speechStatus === "paused" ? "Resume audio" : "Play audio"}
            </button>
            <button className="ghostButton" onClick={onStopSpeech} disabled={speechStatus === "idle"}>
              Stop
            </button>
          </div>
        </div>
      ) : null}

      <button className="primaryButton" onClick={() => void onAnalyze()}>
        Refresh analysis
      </button>
    </>
  );
}

function isMatchingEntry(
  entry: AnalysisCacheEntry | null,
  url: string,
  language: SupportedLanguage,
) {
  return Boolean(entry && entry.url === url && (entry.status !== "success" || entry.data.language === language));
}

function getOneLineSummary(summary: string) {
  const normalized = summary.replace(/\s+/g, " ").trim();
  const firstSentence = normalized.split(/(?<=[.!?])\s/)[0];
  const oneLine = firstSentence || normalized;
  return oneLine.length <= 180 ? oneLine : `${oneLine.slice(0, 177).trimEnd()}...`;
}

function sanitizeLanguage(value: unknown): SupportedLanguage {
  const match = LANGUAGE_OPTIONS.find((option) => option.value === value);
  return match?.value ?? DEFAULT_LANGUAGE;
}

const popupStyles = `
  :root {
    color-scheme: light;
  }

  body {
    margin: 0;
    width: 360px;
    min-height: 540px;
    background:
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.18), transparent 30%),
      linear-gradient(180deg, #f8fbff 0%, #e8f1ff 100%);
    font-family: "Segoe UI", Arial, sans-serif;
  }

  .card,
  .scoreCard,
  .statusCard {
    border: 1px solid #c9ddff;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.92);
    padding: 16px;
    box-shadow: 0 12px 30px rgba(37, 99, 235, 0.08);
  }

  .controlsCard {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .scoreCard {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  .statusCard {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .errorCard {
    border-color: #f5c6d0;
    background: #fff9fa;
  }

  .sectionLabel {
    margin: 0 0 8px;
    color: #315ea8;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .bodyText,
  .statusText,
  .metaText {
    margin: 0;
    color: #14325c;
    font-size: 14px;
    line-height: 1.6;
  }

  .metaText {
    margin-top: 8px;
    font-size: 12px;
    color: #5678ab;
  }

  .primaryButton,
  .secondaryButton,
  .ghostButton,
  .languageSelect {
    border-radius: 14px;
    font-size: 14px;
    font-weight: 700;
  }

  .primaryButton,
  .secondaryButton,
  .ghostButton {
    cursor: pointer;
  }

  .primaryButton {
    border: 0;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: #ffffff;
    width: 100%;
    padding: 14px 16px;
  }

  .primaryButton:hover,
  .secondaryButton:hover {
    filter: brightness(0.96);
  }

  .secondaryButton {
    border: 1px solid #93c5fd;
    background: #eff6ff;
    color: #1d4ed8;
    padding: 12px 14px;
    flex: 1;
  }

  .ghostButton {
    border: 1px solid #d7e5ff;
    background: #ffffff;
    color: #4c6b9c;
    padding: 12px 14px;
    flex: 1;
  }

  .primaryButton:disabled,
  .ghostButton:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .languageSelect {
    border: 1px solid #bfdbfe;
    background: #f8fbff;
    color: #14325c;
    padding: 12px 14px;
    outline: none;
  }

  .scoreLine {
    display: flex;
    align-items: flex-end;
    gap: 4px;
  }

  .scoreValue {
    font-size: 38px;
    line-height: 1;
    font-weight: 800;
    color: #0f2c55;
  }

  .riskBadge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
  }

  .risk-low {
    background: #dcfce7;
    color: #166534;
  }

  .risk-medium {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .risk-high {
    background: #fde68a;
    color: #b45309;
  }

  .risk-critical {
    background: #fee2e2;
    color: #b91c1c;
  }

  .reasonList {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .reasonItem {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .reasonDot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #2563eb;
    margin-top: 7px;
    flex: 0 0 auto;
  }

  .actionRow {
    display: flex;
    gap: 10px;
  }

  .spinner {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    border: 3px solid #dbeafe;
    border-top-color: #2563eb;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const styles: Record<string, CSSProperties> = {
  shell: {
    width: 360,
    minHeight: 540,
  },
  panel: {
    display: "flex",
    minHeight: 540,
    flexDirection: "column",
    gap: 16,
    padding: 18,
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  eyebrow: {
    margin: 0,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#2563eb",
  },
  title: {
    margin: 0,
    fontSize: 26,
    lineHeight: 1.1,
    color: "#0f2c55",
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.5,
    color: "#46668f",
  },
};

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<PopupApp />);
}
