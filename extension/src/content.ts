import type { Analysis } from "../../src/lib/types";
import { pauseSpeech, resumeSpeech, speakText, stopSpeech } from "./readAloud";
import {
  DEFAULT_LANGUAGE,
  getCredibilityLabel,
  getTruthLikelihood,
  getUiCopy,
  getVerdictText,
  getWrongnessPercentage,
  LANGUAGE_OPTIONS,
  type SupportedLanguage,
} from "./shared";

const MAX_TEXT_LENGTH = 12000;
const MIN_TEXT_LENGTH = 300;
const SIDEBAR_HOST_ID = "veritron-extension-root";
const ARTICLE_KEYWORDS = [
  "breaking",
  "viral",
  "exclusive",
  "government",
  "minister",
  "police",
  "election",
  "health",
  "cure",
  "alert",
  "claim",
  "report",
  "official",
  "youtube",
  "whatsapp",
  "facebook",
  "instagram",
  "shocking",
  "truth",
  "fact",
  "fake",
  "misleading",
] as const;
const SELECTOR_PRIORITY = [
  "article",
  "[role='main']",
  "main",
  ".article",
  ".post-content",
  ".entry-content",
  ".story",
  ".content",
  "body",
] as const;

type RuntimeMessage =
  | { type: "TRIGGER_ANALYSIS"; targetLanguage?: SupportedLanguage }
  | { type: "ANALYZE_REQUEST"; text: string; url: string; targetLanguage?: SupportedLanguage }
  | { type: "ANALYSIS_RESULT"; data: Analysis }
  | { type: "ANALYSIS_ERROR"; message: string };

type SidebarState =
  | { status: "idle" }
  | { status: "loading"; targetLanguage: SupportedLanguage }
  | { status: "success"; data: Analysis; targetLanguage: SupportedLanguage }
  | { status: "error"; message: string; targetLanguage: SupportedLanguage };

type SidebarController = {
  host: HTMLDivElement;
  container: HTMLDivElement;
  render: (state: SidebarState) => void;
  open: () => void;
  close: () => void;
};

let sidebarController: SidebarController | null = null;
let currentPageState: SidebarState = { status: "idle" };
let analyzedUrl: string | null = null;
let selectedLanguage: SupportedLanguage = DEFAULT_LANGUAGE;
let speechStatus: "idle" | "playing" | "paused" = "idle";

chrome.runtime.onMessage.addListener((message: RuntimeMessage) => {
  if (message.type === "TRIGGER_ANALYSIS") {
    handleTriggerAnalysis(message.targetLanguage);
    return;
  }

  if (message.type === "ANALYSIS_RESULT") {
    analyzedUrl = window.location.href;
    selectedLanguage = sanitizeLanguage(message.data.language);
    currentPageState = {
      status: "success",
      data: message.data,
      targetLanguage: selectedLanguage,
    };
    ensureSidebar().render(currentPageState);
    return;
  }

  if (message.type === "ANALYSIS_ERROR") {
    analyzedUrl = window.location.href;
    currentPageState = {
      status: "error",
      message: message.message,
      targetLanguage: selectedLanguage,
    };
    ensureSidebar().render(currentPageState);
  }
});

function handleTriggerAnalysis(targetLanguage?: SupportedLanguage) {
  selectedLanguage = sanitizeLanguage(targetLanguage);

  const sidebar = ensureSidebar();
  sidebar.open();

  if (
    analyzedUrl === window.location.href &&
    currentPageState.status === "success" &&
    currentPageState.targetLanguage === selectedLanguage
  ) {
    sidebar.render(currentPageState);
    return;
  }

  if (
    analyzedUrl === window.location.href &&
    currentPageState.status === "loading" &&
    currentPageState.targetLanguage === selectedLanguage
  ) {
    sidebar.render(currentPageState);
    return;
  }

  currentPageState = { status: "loading", targetLanguage: selectedLanguage };
  analyzedUrl = window.location.href;
  stopPlayback();
  sidebar.render(currentPageState);

  const text = extractRelevantText();
  if (!text) {
    const message = getUiCopy(selectedLanguage).pageNotFound;
    currentPageState = { status: "error", message, targetLanguage: selectedLanguage };
    sidebar.render(currentPageState);
    void chrome.runtime.sendMessage({ type: "ANALYSIS_ERROR", message } satisfies RuntimeMessage);
    return;
  }

  void chrome.runtime.sendMessage({
    type: "ANALYZE_REQUEST",
    text,
    url: window.location.href,
    targetLanguage: selectedLanguage,
  } satisfies RuntimeMessage);
}

function extractRelevantText(): string | null {
  let bestMatch: { text: string; score: number } | null = null;

  for (const selector of SELECTOR_PRIORITY) {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));

    for (const element of elements) {
      if (!isReadableElement(element)) {
        continue;
      }

      const cleaned = cleanText(extractElementText(element));
      if (cleaned.length < MIN_TEXT_LENGTH) {
        continue;
      }

      const score = scoreCandidate(cleaned, selector);
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          text: cleaned.slice(0, MAX_TEXT_LENGTH),
          score,
        };
      }
    }
  }

  return bestMatch?.text ?? null;
}

function cleanText(rawText: string): string {
  return rawText
    .replace(/\b(accept all|reject all|sign in|log in|skip to content|share this|advertisement)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractElementText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("script, style, noscript, svg, nav, footer, header, aside, form").forEach((node) => {
    node.remove();
  });

  const paragraphs = Array.from(clone.querySelectorAll("p, h1, h2, h3, li"))
    .map((node) => node.textContent?.trim() ?? "")
    .filter((text) => text.length > 0);

  return paragraphs.length > 4 ? paragraphs.join(" ") : clone.innerText || clone.textContent || "";
}

function isReadableElement(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && element.innerText.trim().length > 0;
}

function scoreCandidate(text: string, selector: string): number {
  const lowerText = text.toLowerCase();
  const keywordHits = ARTICLE_KEYWORDS.reduce((count, keyword) => {
    return count + (lowerText.includes(keyword) ? 1 : 0);
  }, 0);
  const selectorBoost =
    selector === "article" || selector === "main" || selector === "[role='main']"
      ? 7
      : selector === "body"
        ? 0
        : 4;
  const paragraphBoost = Math.min((text.match(/[.?!]/g) ?? []).length, 12);
  const lengthBoost = text.length > 2500 ? 6 : text.length > 1200 ? 3 : 0;

  return keywordHits * 3 + selectorBoost + paragraphBoost + lengthBoost;
}

function ensureSidebar(): SidebarController {
  if (sidebarController) {
    return sidebarController;
  }

  const existingHost = document.getElementById(SIDEBAR_HOST_ID) as HTMLDivElement | null;
  if (existingHost?.shadowRoot) {
    const existingContainer = existingHost.shadowRoot.getElementById("veritron-sidebar") as HTMLDivElement | null;

    if (existingContainer) {
      sidebarController = createSidebarController(existingHost, existingContainer);
      return sidebarController;
    }
  }

  const host = document.createElement("div");
  host.id = SIDEBAR_HOST_ID;
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = getSidebarStyles();

  const container = document.createElement("div");
  container.id = "veritron-sidebar";
  shadowRoot.append(style, container);

  sidebarController = createSidebarController(host, container);
  return sidebarController;
}

function createSidebarController(host: HTMLDivElement, container: HTMLDivElement): SidebarController {
  const controller: SidebarController = {
    host,
    container,
    render: (state) => renderSidebar(container, state, controller),
    open: () => {
      host.style.display = "block";
    },
    close: () => {
      host.style.display = "none";
      stopPlayback();
    },
  };

  controller.render(currentPageState);
  return controller;
}

function renderSidebar(
  container: HTMLDivElement,
  state: SidebarState,
  controller: SidebarController,
) {
  container.replaceChildren();
  const activeLanguage = state.status === "idle" ? selectedLanguage : state.targetLanguage;
  const copy = getUiCopy(activeLanguage);

  const panel = document.createElement("aside");
  panel.className = "panel";

  const header = document.createElement("div");
  header.className = "header";

  const titleWrap = document.createElement("div");
  titleWrap.innerHTML = `
    <p class="eyebrow">Veritron</p>
    <h2 class="title">${escapeHtml(copy.appTitle)}</h2>
    <p class="subtitle">${escapeHtml(copy.appSubtitle)}</p>
  `;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "closeButton";
  closeButton.setAttribute("aria-label", "Close sidebar");
  closeButton.textContent = "X";
  closeButton.addEventListener("click", () => controller.close());

  header.append(titleWrap, closeButton);
  panel.appendChild(header);

  const content = document.createElement("div");
  content.className = "content";

  const controlsCard = document.createElement("section");
  controlsCard.className = "sectionCard";

  const controlsTitle = document.createElement("p");
  controlsTitle.className = "sectionLabel";
  controlsTitle.textContent = copy.outputLanguage;

  const controlsHint = document.createElement("p");
  controlsHint.className = "helperText";
  controlsHint.textContent = copy.outputLanguageHint;

  const languageSelect = document.createElement("select");
  languageSelect.className = "languageSelect";
  languageSelect.value = state.status === "idle" ? selectedLanguage : state.targetLanguage;

  for (const option of LANGUAGE_OPTIONS) {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.label;
    languageSelect.appendChild(item);
  }

  languageSelect.addEventListener("change", (event) => {
    const nextLanguage = sanitizeLanguage((event.target as HTMLSelectElement).value);
    selectedLanguage = nextLanguage;
    void chrome.storage.sync.set({ preferredLanguage: nextLanguage });
    handleTriggerAnalysis(nextLanguage);
  });

  controlsCard.append(controlsTitle, controlsHint, languageSelect);
  content.appendChild(controlsCard);

  if (state.status === "loading") {
    const loadingCard = document.createElement("div");
    loadingCard.className = "loadingCard";
    loadingCard.innerHTML = `
      <div class="spinner" aria-hidden="true"></div>
      <p class="loadingText">${escapeHtml(copy.loadingSignals)}</p>
    `;
    content.appendChild(loadingCard);
  }

  if (state.status === "error") {
    const errorCard = document.createElement("div");
    errorCard.className = "errorCard";
    errorCard.innerHTML = `
      <p class="errorTitle">${escapeHtml(copy.analysisError)}</p>
      <p class="errorMessage">${escapeHtml(state.message)}</p>
    `;
    content.appendChild(errorCard);
  }

  if (state.status === "success") {
    const riskCard = document.createElement("div");
    riskCard.className = "riskCard";
    riskCard.innerHTML = `
      <div>
        <p class="sectionLabel">${escapeHtml(copy.fakeNewsPercentage)}</p>
        <p class="score">${state.data.riskScore}<span>%</span></p>
        <p class="helperText">${escapeHtml(getCredibilityLabel(state.data.riskScore))}</p>
      </div>
      <span class="riskBadge risk-${state.data.riskLevel}">${escapeHtml(state.data.riskLevel)}</span>
    `;
    content.appendChild(riskCard);

    const percentageCard = document.createElement("section");
    percentageCard.className = "sectionCard";
    percentageCard.innerHTML = `
      <p class="sectionLabel">${escapeHtml(copy.verdict)}</p>
      <div class="statRow">
        <span class="statName">${escapeHtml(copy.falseRiskPercentage)}</span>
        <span class="statNumber">${state.data.riskScore}%</span>
      </div>
      <div class="statRow">
        <span class="statName">${escapeHtml(copy.truthLikelihoodPercentage)}</span>
        <span class="statNumber">${getTruthLikelihood(state.data.riskScore)}%</span>
      </div>
      <div class="statRow">
        <span class="statName">${escapeHtml(copy.wrongnessPercentage)}</span>
        <span class="statNumber">${getWrongnessPercentage(state.data.riskScore)}%</span>
      </div>
    `;
    content.appendChild(percentageCard);

    const verdictCard = document.createElement("section");
    verdictCard.className = "sectionCard";
    verdictCard.innerHTML = `
      <p class="sectionLabel">${escapeHtml(copy.explanation)}</p>
      <p class="summaryText">${escapeHtml(getVerdictText(state.data.riskScore, state.targetLanguage))}</p>
    `;
    content.appendChild(verdictCard);

    const summaryCard = document.createElement("section");
    summaryCard.className = "sectionCard";
    summaryCard.innerHTML = `
      <p class="sectionLabel">${escapeHtml(copy.topReasons)}</p>
      <p class="summaryText">${escapeHtml(shortenText(state.data.summary, 360))}</p>
      <p class="helperText">${escapeHtml(copy.output)}: ${escapeHtml(getLanguageLabel(state.targetLanguage))}</p>
    `;
    content.appendChild(summaryCard);

    const reasonsCard = document.createElement("section");
    reasonsCard.className = "sectionCard";

    const reasonsTitle = document.createElement("p");
    reasonsTitle.className = "sectionLabel";
    reasonsTitle.textContent = copy.topReasons;
    reasonsCard.appendChild(reasonsTitle);

    const reasonsList = document.createElement("div");
    reasonsList.className = "reasons";
    const topReasons = state.data.hiddenClauses.slice(0, 3);

    if (topReasons.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "emptyText";
      emptyState.textContent = copy.noReasons;
      reasonsList.appendChild(emptyState);
    } else {
      for (const clause of topReasons) {
        const item = document.createElement("article");
        item.className = "reasonItem";
        item.innerHTML = `
          <div class="reasonHeader">
            <span class="reasonCategory">${escapeHtml(clause.category)}</span>
            <span class="severity severity-${clause.severity}">${escapeHtml(clause.severity)}</span>
          </div>
          <p class="reasonExplanation">${escapeHtml(shortenText(clause.explanation, 180))}</p>
          <p class="reasonOriginal">${escapeHtml(shortenText(clause.text, 180))}</p>
        `;
        reasonsList.appendChild(item);
      }
    }

    reasonsCard.appendChild(reasonsList);
    content.appendChild(reasonsCard);

    const audioCard = document.createElement("section");
    audioCard.className = "sectionCard";

    const audioTitle = document.createElement("p");
    audioTitle.className = "sectionLabel";
    audioTitle.textContent = copy.readAloud;

    const audioActions = document.createElement("div");
    audioActions.className = "actionRow";

    const audioButton = document.createElement("button");
    audioButton.type = "button";
    audioButton.className = "secondaryButton";
    audioButton.textContent =
      speechStatus === "playing" ? copy.pauseAudio : speechStatus === "paused" ? copy.resumeAudio : copy.playAudio;
    audioButton.addEventListener("click", () => {
      const playbackText = [state.data.summary, ...topReasons.map((item) => item.explanation)].join(". ");

      if (speechStatus === "playing") {
        pauseSpeech();
        speechStatus = "paused";
      } else if (speechStatus === "paused") {
        resumeSpeech();
        speechStatus = "playing";
      } else {
        speakText(playbackText, state.targetLanguage, () => {
          speechStatus = "idle";
          renderSidebar(container, state, controller);
        });
        speechStatus = "playing";
      }

      renderSidebar(container, state, controller);
    });

    const stopButton = document.createElement("button");
    stopButton.type = "button";
    stopButton.className = "ghostButton";
    stopButton.textContent = copy.stop;
    stopButton.disabled = speechStatus === "idle";
    stopButton.addEventListener("click", () => {
      stopPlayback();
      renderSidebar(container, state, controller);
    });

    audioActions.append(audioButton, stopButton);
    audioCard.append(audioTitle, audioActions);
    content.appendChild(audioCard);
  }

  const analyzeButton = document.createElement("button");
  analyzeButton.type = "button";
  analyzeButton.className = "primaryButton";
  analyzeButton.textContent = copy.scanPageAgain;
  analyzeButton.addEventListener("click", () => handleTriggerAnalysis(selectedLanguage));
  content.appendChild(analyzeButton);

  panel.appendChild(content);
  container.appendChild(panel);
}

function shortenText(text: string, maxLength: number): string {
  const normalized = cleanText(text);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeLanguage(value: unknown): SupportedLanguage {
  const match = LANGUAGE_OPTIONS.find((option) => option.value === value);
  return match?.value ?? DEFAULT_LANGUAGE;
}

function getLanguageLabel(language: SupportedLanguage) {
  return LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ?? "English";
}

function stopPlayback() {
  stopSpeech();
  speechStatus = "idle";
}

function getSidebarStyles(): string {
  return `
    :host {
      all: initial;
    }

    * {
      box-sizing: border-box;
    }

    .panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      max-width: min(400px, 100vw);
      height: 100vh;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      background:
        radial-gradient(circle at top, rgba(96, 165, 250, 0.22), transparent 28%),
        linear-gradient(180deg, #f8fbff 0%, #e9f2ff 100%);
      border-left: 1px solid #cfe1ff;
      box-shadow: -24px 0 48px rgba(37, 99, 235, 0.14);
      font-family: "Segoe UI", Arial, sans-serif;
      color: #0f2c55;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid #d9e7ff;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
    }

    .eyebrow {
      margin: 0 0 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #2563eb;
    }

    .title {
      margin: 0;
      font-size: 22px;
      line-height: 1.15;
      font-weight: 700;
    }

    .subtitle {
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.5;
      color: #52719d;
    }

    .closeButton {
      border: 1px solid #bfdbfe;
      background: #ffffff;
      color: #1d4ed8;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      flex: 0 0 auto;
    }

    .closeButton:hover {
      background: #eff6ff;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .riskCard,
    .sectionCard,
    .loadingCard,
    .errorCard {
      border-radius: 18px;
      border: 1px solid #d5e5ff;
      background: rgba(255, 255, 255, 0.92);
      padding: 16px;
      box-shadow: 0 10px 28px rgba(37, 99, 235, 0.08);
    }

    .riskCard {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .sectionLabel {
      margin: 0 0 8px;
      color: #315ea8;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .helperText,
    .summaryText,
    .reasonExplanation,
    .reasonOriginal,
    .emptyText,
    .errorMessage,
    .loadingText {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #163765;
    }

    .helperText,
    .reasonOriginal {
      color: #5377aa;
      font-size: 12px;
    }

    .score {
      margin: 0;
      font-size: 40px;
      line-height: 1;
      font-weight: 800;
    }

    .score span {
      font-size: 18px;
      color: #4e73a7;
      margin-left: 4px;
    }

    .riskBadge,
    .severity {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: capitalize;
    }

    .risk-low,
    .severity-low {
      background: #dcfce7;
      color: #166534;
    }

    .risk-medium,
    .severity-medium {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .risk-high,
    .severity-high {
      background: #fde68a;
      color: #b45309;
    }

    .risk-critical,
    .severity-critical {
      background: #fee2e2;
      color: #b91c1c;
    }

    .reasons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .statRow {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 16px;
      padding-top: 8px;
      margin-top: 8px;
      border-top: 1px solid #e2ecff;
    }

    .statName {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
      font-weight: 700;
      color: #315ea8;
    }

    .statNumber {
      margin: 0;
      font-size: 22px;
      line-height: 1.1;
      font-weight: 800;
      color: #0f2c55;
    }

    .reasonItem {
      border-radius: 14px;
      padding: 14px;
      background: #f8fbff;
      border: 1px solid #dbeafe;
    }

    .reasonHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }

    .reasonCategory {
      font-size: 13px;
      font-weight: 700;
      color: #17417a;
    }

    .loadingCard,
    .errorCard {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }

    .spinner {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid #dbeafe;
      border-top-color: #2563eb;
      animation: spin 0.8s linear infinite;
    }

    .errorTitle {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #991b1b;
    }

    .languageSelect,
    .primaryButton,
    .secondaryButton,
    .ghostButton {
      width: 100%;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 700;
    }

    .languageSelect {
      border: 1px solid #bfdbfe;
      background: #f8fbff;
      color: #14325c;
      padding: 12px 14px;
      outline: none;
      margin-top: 10px;
    }

    .actionRow {
      display: flex;
      gap: 10px;
    }

    .primaryButton,
    .secondaryButton,
    .ghostButton {
      cursor: pointer;
      padding: 13px 14px;
    }

    .primaryButton {
      border: 0;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
    }

    .secondaryButton {
      border: 1px solid #93c5fd;
      background: #eff6ff;
      color: #1d4ed8;
    }

    .ghostButton {
      border: 1px solid #d7e5ff;
      background: #ffffff;
      color: #4c6b9c;
    }

    .ghostButton:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;
}
