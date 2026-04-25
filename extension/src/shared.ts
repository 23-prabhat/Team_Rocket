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

type UiCopy = {
  appTitle: string;
  appSubtitle: string;
  outputLanguage: string;
  outputLanguageHint: string;
  fakeNewsPercentage: string;
  falseRiskPercentage: string;
  truthLikelihoodPercentage: string;
  wrongnessPercentage: string;
  verdict: string;
  explanation: string;
  output: string;
  topReasons: string;
  noReasons: string;
  readAloud: string;
  playAudio: string;
  pauseAudio: string;
  resumeAudio: string;
  stop: string;
  refreshAnalysis: string;
  scanPageAgain: string;
  analyzeThisPage: string;
  noAnalysisStored: string;
  openRegularPage: string;
  currentPage: string;
  analysisError: string;
  tryAgain: string;
  loadingTab: string;
  checkingPage: string;
  loadingSignals: string;
  pageNotFound: string;
  likelyTrue: string;
  mixedClaims: string;
  likelyFalse: string;
  highFakeRisk: string;
};

export const UI_COPY: Record<SupportedLanguage, UiCopy> = {
  en: {
    appTitle: "Misinformation Detector",
    appSubtitle: "Scan this page, estimate fake-news risk, and explain the result in your chosen language.",
    outputLanguage: "Output language",
    outputLanguageHint: "Choose how Veritron explains the result.",
    fakeNewsPercentage: "Fake-news percentage",
    falseRiskPercentage: "False risk",
    truthLikelihoodPercentage: "Truth chance",
    wrongnessPercentage: "Wrongness",
    verdict: "Verdict",
    explanation: "Explanation",
    output: "Output",
    topReasons: "Top reasons",
    noReasons: "No detailed reasons were returned for this page.",
    readAloud: "Read aloud",
    playAudio: "Play audio",
    pauseAudio: "Pause audio",
    resumeAudio: "Resume audio",
    stop: "Stop",
    refreshAnalysis: "Refresh analysis",
    scanPageAgain: "Scan page again",
    analyzeThisPage: "Analyze this page",
    noAnalysisStored: "No misinformation analysis is stored for this tab yet.",
    openRegularPage: "Open a regular http or https page to analyze it.",
    currentPage: "Current page",
    analysisError: "Analysis error",
    tryAgain: "Try again",
    loadingTab: "Loading current tab...",
    checkingPage: "Checking the page for suspicious claims...",
    loadingSignals: "Checking this page for misinformation signals...",
    pageNotFound: "No article-like content with enough text was found on this page.",
    likelyTrue: "Likely true",
    mixedClaims: "Mixed or unclear claims",
    likelyFalse: "Likely false",
    highFakeRisk: "High fake-news risk",
  },
  hi: {
    appTitle: "\u092d\u094d\u0930\u093e\u092e\u0915 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u091c\u093e\u0902\u091a",
    appSubtitle:
      "\u0907\u0938 \u092a\u0947\u091c \u0915\u0940 \u091c\u093e\u0902\u091a \u0915\u0930\u0947\u0902, \u092b\u0947\u0915-\u0928\u094d\u092f\u0942\u091c\u093c \u091c\u094b\u0916\u093f\u092e \u0926\u0947\u0916\u0947\u0902, \u0914\u0930 \u091a\u0941\u0928\u0940 \u0939\u0941\u0908 \u092d\u093e\u0937\u093e \u092e\u0947\u0902 \u0915\u093e\u0930\u0923 \u0938\u092e\u091d\u0947\u0902\u0964",
    outputLanguage: "\u0906\u0909\u091f\u092a\u0941\u091f \u092d\u093e\u0937\u093e",
    outputLanguageHint:
      "\u0935\u0947\u0930\u093f\u091f\u094d\u0930\u0949\u0928 \u092a\u0930\u093f\u0923\u093e\u092e \u0915\u093f\u0938 \u092d\u093e\u0937\u093e \u092e\u0947\u0902 \u0938\u092e\u091d\u093e\u090f, \u092f\u0939 \u091a\u0941\u0928\u0947\u0902\u0964",
    fakeNewsPercentage: "\u092b\u0947\u0915 \u0928\u094d\u092f\u0942\u091c\u093c %",
    falseRiskPercentage: "\u0917\u0932\u0924 \u091c\u094b\u0916\u093f\u092e",
    truthLikelihoodPercentage: "\u0938\u0939\u0940 \u0938\u0902\u092d\u093e\u0935\u0928\u093e",
    wrongnessPercentage: "\u0917\u0932\u0924\u0940 %",
    verdict: "\u092b\u0948\u0938\u0932\u093e",
    explanation: "\u0935\u094d\u092f\u093e\u0916\u094d\u092f\u093e",
    output: "\u0906\u0909\u091f\u092a\u0941\u091f",
    topReasons: "\u092e\u0941\u0916\u094d\u092f \u0915\u093e\u0930\u0923",
    noReasons: "\u0907\u0938 \u092a\u0947\u091c \u0915\u0947 \u0932\u093f\u090f \u0935\u093f\u0938\u094d\u0924\u0943\u0924 \u0915\u093e\u0930\u0923 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0947\u0964",
    readAloud: "\u0938\u0941\u0928\u0947\u0902",
    playAudio: "\u0911\u0921\u093f\u092f\u094b \u091a\u0932\u093e\u090f\u0902",
    pauseAudio: "\u0911\u0921\u093f\u092f\u094b \u0930\u094b\u0915\u0947\u0902",
    resumeAudio: "\u0911\u0921\u093f\u092f\u094b \u092b\u093f\u0930 \u091a\u0932\u093e\u090f\u0902",
    stop: "\u092c\u0902\u0926 \u0915\u0930\u0947\u0902",
    refreshAnalysis: "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u092b\u093f\u0930 \u091a\u0932\u093e\u090f\u0902",
    scanPageAgain: "\u092a\u0947\u091c \u092b\u093f\u0930 \u0938\u094d\u0915\u0948\u0928 \u0915\u0930\u0947\u0902",
    analyzeThisPage: "\u0907\u0938 \u092a\u0947\u091c \u0915\u093e \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u0915\u0930\u0947\u0902",
    noAnalysisStored: "\u0907\u0938 \u091f\u0948\u092c \u0915\u0947 \u0932\u093f\u090f \u0905\u092d\u0940 \u0915\u094b\u0908 \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
    openRegularPage: "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u0915\u0947 \u0932\u093f\u090f \u0938\u093e\u092e\u093e\u0928\u094d\u092f http \u092f\u093e https \u092a\u0947\u091c \u0916\u094b\u0932\u0947\u0902\u0964",
    currentPage: "\u092e\u094c\u091c\u0942\u0926\u093e \u092a\u0947\u091c",
    analysisError: "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u0924\u094d\u0930\u0941\u091f\u093f",
    tryAgain: "\u092b\u093f\u0930 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902",
    loadingTab: "\u092e\u094c\u091c\u0942\u0926\u093e \u091f\u0948\u092c \u0932\u094b\u0921 \u0939\u094b \u0930\u0939\u093e \u0939\u0948...",
    checkingPage: "\u0938\u0902\u0926\u093f\u0917\u094d\u0927 \u0926\u093e\u0935\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f \u092a\u0947\u091c \u0915\u0940 \u091c\u093e\u0902\u091a \u0939\u094b \u0930\u0939\u0940 \u0939\u0948...",
    loadingSignals: "\u0907\u0938 \u092a\u0947\u091c \u092a\u0930 \u092d\u094d\u0930\u093e\u092e\u0915 \u0938\u0902\u0915\u0947\u0924 \u091c\u093e\u0902\u091a\u0947 \u091c\u093e \u0930\u0939\u0947 \u0939\u0948\u0902...",
    pageNotFound: "\u0907\u0938 \u092a\u0947\u091c \u092a\u0930 \u092a\u0930\u094d\u092f\u093e\u092a\u094d\u0924 \u0932\u0947\u0916-\u091c\u0948\u0938\u093e \u091f\u0947\u0915\u094d\u0938\u094d\u091f \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964",
    likelyTrue: "\u0938\u0902\u092d\u0935\u0924\u0903 \u0938\u0939\u0940",
    mixedClaims: "\u092e\u093f\u0936\u094d\u0930\u093f\u0924 \u092f\u093e \u0905\u0938\u094d\u092a\u0937\u094d\u091f \u0926\u093e\u0935\u0947",
    likelyFalse: "\u0938\u0902\u092d\u0935\u0924\u0903 \u0917\u0932\u0924",
    highFakeRisk: "\u092b\u0947\u0915 \u0928\u094d\u092f\u0942\u091c\u093c \u0915\u093e \u0909\u091a\u094d\u091a \u091c\u094b\u0916\u093f\u092e",
  },
  mr: {
    appTitle: "\u0926\u093f\u0936\u093e\u092d\u0942\u0932 \u0924\u092a\u093e\u0938",
    appSubtitle:
      "\u0939\u0947 \u092a\u093e\u0928 \u0938\u094d\u0915\u0945\u0928 \u0915\u0930\u093e, \u092b\u0947\u0915-\u0928\u094d\u092f\u0942\u091c \u0927\u094b\u0915\u093e \u092a\u0939\u093e, \u0906\u0923\u093f \u0928\u093f\u0935\u0921\u0932\u0947\u0932\u094d\u092f\u093e \u092d\u093e\u0937\u0947\u0924 \u0915\u093e\u0930\u0923 \u0938\u092e\u091c\u093e.",
    outputLanguage: "\u0906\u0909\u091f\u092a\u0941\u091f \u092d\u093e\u0937\u093e",
    outputLanguageHint:
      "\u0935\u094d\u0939\u0947\u0930\u093f\u091f\u094d\u0930\u0949\u0928 \u0928\u093f\u0915\u093e\u0932 \u0915\u094b\u0923\u0924\u094d\u092f\u093e \u092d\u093e\u0937\u0947\u0924 \u0938\u092e\u091c\u093e\u0935\u0947\u0932 \u0924\u0947 \u0928\u093f\u0935\u0921\u093e.",
    fakeNewsPercentage: "\u092b\u0947\u0915 \u0928\u094d\u092f\u0942\u091c %",
    falseRiskPercentage: "\u0916\u094b\u091f\u0947 \u0927\u094b\u0915\u093e",
    truthLikelihoodPercentage: "\u0916\u0930\u0947 \u0936\u0915\u094d\u092f\u0924\u093e",
    wrongnessPercentage: "\u091a\u0941\u0915\u0940 %",
    verdict: "\u0928\u093f\u0915\u093e\u0932",
    explanation: "\u0938\u094d\u092a\u0937\u094d\u091f\u0940\u0915\u0930\u0923",
    output: "\u0906\u0909\u091f\u092a\u0941\u091f",
    topReasons: "\u092e\u0941\u0916\u094d\u092f \u0915\u093e\u0930\u0923\u0947",
    noReasons: "\u092f\u093e \u092a\u093e\u0928\u093e\u0938\u093e\u0920\u0940 \u0938\u0935\u093f\u0938\u094d\u0924\u0930 \u0915\u093e\u0930\u0923\u0947 \u092e\u093f\u0933\u093e\u0932\u0940 \u0928\u093e\u0939\u0940\u0924.",
    readAloud: "\u092e\u094b\u0920\u094d\u092f\u093e\u0928\u0947 \u0935\u093e\u091a\u093e",
    playAudio: "\u0911\u0921\u093f\u0913 \u0938\u0941\u0930\u0942 \u0915\u0930\u093e",
    pauseAudio: "\u0911\u0921\u093f\u0913 \u0925\u093e\u0902\u092c\u0935\u093e",
    resumeAudio: "\u0911\u0921\u093f\u0913 \u092a\u0941\u0928\u094d\u0939\u093e \u0938\u0941\u0930\u0942 \u0915\u0930\u093e",
    stop: "\u0925\u093e\u0902\u092c\u0935\u093e",
    refreshAnalysis: "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u092a\u0941\u0928\u094d\u0939\u093e \u0915\u0930\u093e",
    scanPageAgain: "\u092a\u093e\u0928 \u092a\u0941\u0928\u094d\u0939\u093e \u0938\u094d\u0915\u0945\u0928 \u0915\u0930\u093e",
    analyzeThisPage: "\u0939\u0947 \u092a\u093e\u0928 \u0924\u092a\u093e\u0938\u093e",
    noAnalysisStored: "\u092f\u093e \u091f\u0945\u092c\u0938\u093e\u0920\u0940 \u0905\u091c\u0942\u0928 \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u0938\u093e\u0920\u0935\u0932\u0947\u0932\u0947 \u0928\u093e\u0939\u0940.",
    openRegularPage: "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923\u093e\u0938\u093e\u0920\u0940 \u0938\u093e\u092e\u093e\u0928\u094d\u092f http \u0915\u093f\u0902\u0935\u093e https \u092a\u093e\u0928 \u0909\u0918\u0921\u093e.",
    currentPage: "\u0938\u0927\u094d\u092f\u093e\u091a\u0947 \u092a\u093e\u0928",
    analysisError: "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u0924\u094d\u0930\u0941\u091f\u0940",
    tryAgain: "\u092a\u0941\u0928\u094d\u0939\u093e \u092a\u094d\u0930\u092f\u0924\u094d\u0928 \u0915\u0930\u093e",
    loadingTab: "\u0938\u0927\u094d\u092f\u093e\u091a\u093e \u091f\u0945\u092c \u0932\u094b\u0921 \u0939\u094b\u0924 \u0906\u0939\u0947...",
    checkingPage: "\u0938\u0902\u0936\u092f\u093e\u0938\u094d\u092a\u0926 \u0926\u093e\u0935\u094d\u092f\u093e\u0902\u0938\u093e\u0920\u0940 \u092a\u093e\u0928 \u0924\u092a\u093e\u0938\u0932\u0947 \u091c\u093e\u0924 \u0906\u0939\u0947...",
    loadingSignals: "\u092f\u093e \u092a\u093e\u0928\u093e\u0935\u0930\u0940\u0932 \u0926\u093f\u0936\u093e\u092d\u0942\u0932 \u0938\u0902\u0915\u0947\u0924 \u0924\u092a\u093e\u0938\u0932\u0947 \u091c\u093e\u0924 \u0906\u0939\u0947\u0924...",
    pageNotFound: "\u092f\u093e \u092a\u093e\u0928\u093e\u0935\u0930 \u092a\u0941\u0930\u0947\u0938\u093e \u0932\u0947\u0916\u093e\u0938\u093e\u0930\u0916\u093e \u092e\u091c\u0915\u0942\u0930 \u0938\u093e\u092a\u0921\u0932\u093e \u0928\u093e\u0939\u0940.",
    likelyTrue: "\u092c\u0939\u0941\u0927\u093e \u0916\u0930\u0947",
    mixedClaims: "\u092e\u093f\u0936\u094d\u0930\u093f\u0924 \u0915\u093f\u0902\u0935\u093e \u0905\u0938\u094d\u092a\u0937\u094d\u091f \u0926\u093e\u0935\u0947",
    likelyFalse: "\u092c\u0939\u0941\u0927\u093e \u0916\u094b\u091f\u0947",
    highFakeRisk: "\u092b\u0947\u0915 \u0928\u094d\u092f\u0942\u091c\u091a\u093e \u0909\u091a\u094d\u091a \u0927\u094b\u0915\u093e",
  },
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

export function getUiCopy(language: SupportedLanguage) {
  return UI_COPY[language] ?? UI_COPY.en;
}

export function getTruthLikelihood(score: number) {
  return Math.max(0, 100 - normalizePercentage(score));
}

export function getWrongnessPercentage(score: number) {
  return normalizePercentage(score);
}

export function getVerdictText(score: number, language: SupportedLanguage) {
  const copy = getUiCopy(language);

  if (score <= 30) {
    return copy.likelyTrue;
  }

  if (score <= 60) {
    return copy.mixedClaims;
  }

  if (score <= 80) {
    return copy.likelyFalse;
  }

  return copy.highFakeRisk;
}

function normalizePercentage(value: number) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}
