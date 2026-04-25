"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Sun, Moon, Copy, CheckCircle, ChatCircleDots, X, Microphone } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { RiskMeter } from "@/components/RiskMeter";
import { RiskClauses } from "@/components/RiskClauses";
import { PlainSummary } from "@/components/PlainSummary";
import { LangPills } from "@/components/LangPills";
import { ReadAloud } from "@/components/ReadAloud";
import { useTheme } from "@/contexts/theme";
import { useLanguage } from "@/contexts/language";
import type { Analysis, AnalysisSession } from "@/lib/types";

const STORAGE_KEY = "veritron_analysis";

const VERDICT_LABELS = {
  en: { real: "Likely Real", fake: "Likely Fake", uncertain: "Needs Verification" },
  hi: { real: "संभवतः सही", fake: "संभवतः फर्जी", uncertain: "और जाँच करें" },
  mr: { real: "बहुधा खरे", fake: "बहुधा खोटे", uncertain: "अधिक पडताळणी हवी" },
} as const;

const RELIABILITY_LABELS = {
  en: { trusted: "Trusted", mixed: "Mixed", suspicious: "Suspicious" },
  hi: { trusted: "विश्वसनीय", mixed: "मिश्रित", suspicious: "संदिग्ध" },
  mr: { trusted: "विश्वसनीय", mixed: "मिश्र", suspicious: "संशयास्पद" },
} as const;

const CONSENSUS_LABELS = {
  en: {
    supports: "Cross-sources support this",
    mixed: "Cross-sources are mixed",
    contradicts: "Cross-sources contradict this",
    insufficient: "Not enough corroboration",
  },
  hi: {
    supports: "अन्य स्रोत समर्थन करते हैं",
    mixed: "अन्य स्रोतों में मतभेद है",
    contradicts: "अन्य स्रोत विरोध करते हैं",
    insufficient: "पर्याप्त पुष्टिकरण नहीं",
  },
  mr: {
    supports: "इतर स्रोत समर्थन करतात",
    mixed: "इतर स्रोत मिश्र संकेत देतात",
    contradicts: "इतर स्रोत विरोध करतात",
    insufficient: "पुरेशी पुष्टी नाही",
  },
} as const;

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type AnalysisSessionCache = AnalysisSession & {
  analysisByLanguage?: Record<string, Analysis>;
};

const CHAT_COPY = {
  en: {
    title: "Analysis Chatbot",
    subtitle: "Ask follow-up questions about this result.",
    placeholder: "Ask about risk, evidence, source reliability, or next steps...",
    send: "Send",
    listening: "Listening...",
    startMic: "Use mic",
    stopMic: "Stop mic",
    empty: "Ask your first question to start the conversation.",
    error: "Could not get assistant reply. Please try again.",
  },
  hi: {
    title: "विश्लेषण चैटबॉट",
    subtitle: "इस परिणाम पर आगे के सवाल पूछें।",
    placeholder: "जोखिम, प्रमाण, स्रोत विश्वसनीयता या अगले कदम पूछें...",
    send: "भेजें",
    listening: "सुन रहा है...",
    startMic: "माइक से बोलें",
    stopMic: "माइक रोकें",
    empty: "बातचीत शुरू करने के लिए अपना पहला सवाल पूछें।",
    error: "उत्तर नहीं मिल पाया। कृपया फिर से प्रयास करें।",
  },
  mr: {
    title: "विश्लेषण चॅटबॉट",
    subtitle: "या निकालाबद्दल पुढचे प्रश्न विचारा.",
    placeholder: "धोका, पुरावे, स्रोत विश्वासार्हता किंवा पुढचे पाऊल विचारा...",
    send: "पाठवा",
    listening: "ऐकत आहे...",
    startMic: "माइक वापरा",
    stopMic: "माइक थांबवा",
    empty: "संवाद सुरू करण्यासाठी तुमचा पहिला प्रश्न विचारा.",
    error: "उत्तर मिळाले नाही. कृपया पुन्हा प्रयत्न करा.",
  },
} as const;

const CHAT_INPUT_LOCALE = {
  en: "en-US",
  hi: "hi-IN",
  mr: "mr-IN",
} as const;

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-5 font-display text-2xl text-foreground">{children}</h2>;
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-foreground/[0.07] bg-card p-6 sm:p-8"
    >
      {children}
    </motion.section>
  );
}

function verdictClass(verdict: NonNullable<Analysis["verdict"]>) {
  if (verdict === "real") return "border-green-500/25 bg-green-500/12 text-green-500";
  if (verdict === "fake") return "border-red-500/25 bg-red-500/12 text-red-500";
  return "border-yellow-500/25 bg-yellow-500/12 text-yellow-500";
}

function staleRiskClass(staleRisk: NonNullable<Analysis["timeline"]>["staleRisk"]) {
  if (staleRisk === "low") return "border-green-500/25 bg-green-500/12 text-green-500";
  if (staleRisk === "high") return "border-red-500/25 bg-red-500/12 text-red-500";
  return "border-yellow-500/25 bg-yellow-500/12 text-yellow-500";
}

export default function AnalyzePage() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { t, lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const [session, setSession] = useState<AnalysisSessionCache | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as AnalysisSessionCache | Analysis;
      const normalized: AnalysisSessionCache =
        "analysis" in parsed && "text" in parsed && "readingLevel" in parsed
          ? parsed
          : { analysis: parsed as Analysis, text: "", readingLevel: "simple" };

      if (!normalized.analysisByLanguage) {
        normalized.analysisByLanguage = { [normalized.analysis.language]: normalized.analysis };
      }
      return normalized;
    } catch {
      return null;
    }
  });

  const analysis = session?.analysis ?? null;
  const chatCopy = CHAT_COPY[lang];
  const verdict = analysis?.verdict ?? "uncertain";
  const verdictText = VERDICT_LABELS[lang][verdict];
  const shareText = useMemo(() => {
    if (!analysis) return "";
    const lines = [
      `Veritron Verdict: ${VERDICT_LABELS.en[analysis.verdict ?? "uncertain"]}`,
      `Credibility Score: ${analysis.riskScore}/100`,
      analysis.sourceUrl ? `Source: ${analysis.sourceUrl}` : "",
      `Summary: ${analysis.summary.split("\n")[0] ?? analysis.summary}`,
      `Audit ID: ${analysis.auditId}`,
    ].filter(Boolean);
    return lines.join("\n");
  }, [analysis]);

  const analysisContext = useMemo(() => {
    if (!analysis) return "";
    const payload = {
      language: analysis.language,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      verdict: analysis.verdict ?? "uncertain",
      confidence: analysis.confidence ?? 0,
      summary: analysis.summary,
      keyObligations: analysis.keyObligations,
      evidence: analysis.evidence,
      hiddenClauses: analysis.hiddenClauses,
      sourceReliability: analysis.sourceReliability,
      corroboration: analysis.corroboration,
      timeline: analysis.timeline,
      sourceUrl: analysis.sourceUrl,
      sourceDomain: analysis.sourceDomain,
    };
    return JSON.stringify(payload);
  }, [analysis]);

  useEffect(() => {
    if (!analysis) router.replace("/");
  }, [analysis, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const withSpeech = window as Window & {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const SpeechRecognitionCtor = withSpeech.SpeechRecognition ?? withSpeech.webkitSpeechRecognition;
    setMicSupported(Boolean(SpeechRecognitionCtor));

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = CHAT_INPUT_LOCALE[lang];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const finalTranscript = Array.from(event.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (finalTranscript) {
        setChatInput((prev) => `${prev}${prev ? " " : ""}${finalTranscript}`);
      }
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
      setIsListening(false);
    };
  }, [lang]);

  useEffect(() => {
    if (!session || !session.text || session.analysis.language === lang) return;

    const cached = session.analysisByLanguage?.[lang];
    if (cached) {
      const nextSession: AnalysisSessionCache = {
        ...session,
        analysis: cached,
      };
      setSession(nextSession);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      return;
    }

    const controller = new AbortController();

    const refreshAnalysis = async () => {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: session.text,
            language: lang,
            source: "web",
          }),
          signal: controller.signal,
        });
        const nextAnalysis: Analysis = await response.json();
        if (!response.ok || controller.signal.aborted) return;
        const nextSession: AnalysisSessionCache = {
          ...session,
          analysis: nextAnalysis,
          analysisByLanguage: {
            ...(session.analysisByLanguage ?? {}),
            [nextAnalysis.language]: nextAnalysis,
          },
        };
        setSession(nextSession);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      } catch {
        // keep previous language result if refresh fails
      }
    };

    void refreshAnalysis();
    return () => {
      controller.abort();
    };
  }, [lang, session]);

  useEffect(() => {
    if (!chatOpen || !chatScrollRef.current) return;
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages, chatLoading, chatOpen]);

  const submitChat = async () => {
    const question = chatInput.trim();
    if (!question || !analysis || chatLoading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}_user`,
      role: "user",
      content: question,
    };

    const nextMessages = [...chatMessages, userMessage];
    setChatMessages(nextMessages);
    setChatInput("");
    setChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          language: lang,
          analysisContext,
          history: nextMessages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const payload = (await response.json()) as { answer?: string; error?: string };
      const assistantAnswer = payload.answer?.trim() ?? "";
      if (!response.ok || !assistantAnswer) {
        throw new Error(payload.error || chatCopy.error);
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}_assistant`,
          role: "assistant",
          content: assistantAnswer,
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : chatCopy.error;
      setChatError(message);
    } finally {
      setChatLoading(false);
    }
  };

  const toggleMicInput = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    recognition.lang = CHAT_INPUT_LOCALE[lang] ?? "en-US";
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  if (!analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-warm border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-foreground/[0.06] bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-warm text-warm-foreground">
              <Shield size={18} weight="bold" />
            </div>
            <span className="font-display text-xl tracking-tight text-foreground">Veritron</span>
          </Link>
          <div className="flex items-center gap-3">
            <LangPills />
            <button
              onClick={toggle}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-foreground/10 text-muted-foreground transition-all hover:border-warm/30 hover:text-warm"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} weight="bold" /> : <Moon size={16} weight="bold" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">{t.analyze.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.analyze.analyzedAt} {new Date(analysis.createdAt).toLocaleString()} · {t.analyze.language}:{" "}
            {analysis.language.toUpperCase()}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <Section>
              <SectionHeading>{t.analyze.riskAssessment}</SectionHeading>
              <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
                <RiskMeter score={analysis.riskScore} level={analysis.riskLevel} labels={t.analyze.riskLevels} />
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${verdictClass(verdict)}`}>
                      {verdictText}
                    </span>
                    <span className="rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 font-mono text-xs text-foreground/80">
                      Confidence {analysis.confidence ?? 0}%
                    </span>
                    {analysis.sourceDomain ? (
                      <span className="rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 font-mono text-xs text-foreground/80">
                        {analysis.sourceDomain}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80">{analysis.summary}</p>
                </div>
              </div>
            </Section>

            <Section>
              <SectionHeading>{t.analyze.plainSummary}</SectionHeading>
              <PlainSummary
                summary={analysis.summary}
                keyObligations={analysis.keyObligations}
                agreementListLabel={t.analyze.agreementList}
              />
              <ReadAloud
                text={[analysis.summary, analysis.keyObligations.join(". ")].filter(Boolean).join("\n\n")}
                lang={analysis.language}
              />
            </Section>

            <Section>
              <SectionHeading>Evidence Mapping</SectionHeading>
              {analysis.evidence.length === 0 ? (
                <p className="text-sm text-muted-foreground">No strong claim-level evidence was extracted.</p>
              ) : (
                <div className="space-y-3">
                  {analysis.evidence.map((item, index) => (
                    <div key={index} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.category}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{item.claim}</p>
                      <p className="mt-2 text-sm text-foreground/80">{item.finding}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section>
              <SectionHeading>{t.analyze.clausesTitle} ({analysis.hiddenClauses.length})</SectionHeading>
              <RiskClauses
                clauses={analysis.hiddenClauses}
                originalClauseLabel={t.analyze.originalClause}
                emptyLabel={t.analyze.noClauses}
              />
            </Section>
          </div>

          <div className="space-y-5">
            <Section>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Source Reliability
              </p>
              {analysis.sourceReliability ? (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-foreground">
                      {RELIABILITY_LABELS[lang][analysis.sourceReliability.level]}
                    </span>
                    <span className="font-mono text-sm text-foreground/80">{analysis.sourceReliability.score}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-foreground/10">
                    <div
                      className="h-2 rounded-full bg-warm"
                      style={{ width: `${analysis.sourceReliability.score}%` }}
                    />
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {analysis.sourceReliability.reasons.map((reason, i) => (
                      <li key={i}>• {reason}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Source reliability is available for URL analysis.</p>
              )}
            </Section>

            <Section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cross-Source Consensus</p>
              <p className="text-sm font-semibold text-foreground">
                {CONSENSUS_LABELS[lang][analysis.corroboration?.consensus ?? "insufficient"]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{analysis.corroboration?.summary ?? "No consensus summary available."}</p>
              <div className="mt-3 h-2 rounded-full bg-foreground/10">
                <div
                  className="h-2 rounded-full bg-warm"
                  style={{ width: `${analysis.corroboration?.score ?? 0}%` }}
                />
              </div>
              <div className="mt-4 space-y-3">
                {(analysis.corroboration?.matches ?? []).map((m, i) => (
                  <a
                    key={`${m.url}-${i}`}
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 transition-colors hover:bg-foreground/[0.04]"
                  >
                    <p className="line-clamp-2 text-sm font-medium text-foreground">{m.title}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{m.source}</p>
                  </a>
                ))}
              </div>
            </Section>

            <Section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Timeline Risk</p>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${staleRiskClass(
                  analysis.timeline?.staleRisk ?? "medium"
                )}`}
              >
                Stale Risk: {(analysis.timeline?.staleRisk ?? "medium").toUpperCase()}
              </span>
              <dl className="mt-4 space-y-2 text-xs text-foreground/80">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Published</dt>
                  <dd className="font-mono">{analysis.timeline?.publishedAt ?? "Unknown"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Event Date Hint</dt>
                  <dd className="font-mono">{analysis.timeline?.eventDateHint ?? "Unknown"}</dd>
                </div>
              </dl>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {(analysis.timeline?.notes ?? []).map((note, i) => (
                  <li key={i}>• {note}</li>
                ))}
              </ul>
            </Section>

            <Section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Share Verdict Card</p>
              <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4">
                <p className="text-sm font-semibold text-foreground">{verdictText}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">Score {analysis.riskScore}/100</p>
                <p className="mt-2 line-clamp-3 text-xs text-foreground/80">{analysis.summary}</p>
              </div>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(shareText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-warm px-4 py-3 text-sm font-semibold text-warm-foreground transition-all hover:bg-warm/90"
              >
                {copied ? <CheckCircle size={16} weight="fill" /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy Share Text"}
              </button>
            </Section>

            <div className="text-center">
              <Link href="/" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                ← {t.analyze.analyzeAnother}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <button
        type="button"
        onClick={() => setChatOpen((prev) => !prev)}
        className="fixed right-4 bottom-4 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-warm text-warm-foreground shadow-xl shadow-warm/35 transition hover:scale-105 hover:bg-warm/90 sm:right-6 sm:bottom-6"
        aria-label={chatOpen ? "Close chatbot" : "Open chatbot"}
      >
        {chatOpen ? <X size={24} weight="bold" /> : <ChatCircleDots size={26} weight="fill" />}
      </button>

      {chatOpen ? (
        <div className="fixed right-4 bottom-20 z-[65] w-[min(92vw,26rem)] overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-2xl sm:right-6 sm:bottom-24">
          <div className="border-b border-foreground/10 bg-card px-4 py-3">
            <p className="font-display text-base text-foreground">{chatCopy.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{chatCopy.subtitle}</p>
          </div>

          <div
            ref={chatScrollRef}
            className="max-h-[22rem] space-y-3 overflow-y-auto bg-foreground/[0.02] p-4"
          >
            {chatMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">{chatCopy.empty}</p>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[92%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "ml-auto bg-warm text-warm-foreground"
                      : "border border-foreground/10 bg-card text-foreground"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.role === "assistant" && (
                    <div className="-mt-1 mb-1">
                      <ReadAloud text={message.content} lang={lang} />
                    </div>
                  )}
                </div>
              ))
            )}
            {chatLoading ? <p className="text-xs text-muted-foreground">...</p> : null}
          </div>

          <div className="border-t border-foreground/10 bg-background p-3">
            {chatError ? <p className="mb-2 text-xs text-red-500">{chatError}</p> : null}

            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void submitChat();
                  }
                }}
                placeholder={chatCopy.placeholder}
                className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-warm"
                maxLength={700}
              />
              {micSupported ? (
                <button
                  onClick={toggleMicInput}
                  className={`flex shrink-0 items-center justify-center rounded-xl border px-3 transition ${
                    isListening
                      ? "border-red-500/30 bg-red-500/10 text-red-500"
                      : "border-foreground/20 bg-background text-foreground hover:border-warm/40 hover:text-warm"
                  }`}
                  title={isListening ? chatCopy.stopMic : chatCopy.startMic}
                >
                  <Microphone size={18} weight={isListening ? "fill" : "regular"} />
                </button>
              ) : null}
              <button
                onClick={() => void submitChat()}
                disabled={chatLoading || !chatInput.trim()}
                className="rounded-xl bg-warm px-3 py-2.5 text-xs font-semibold text-warm-foreground transition hover:bg-warm/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {chatCopy.send}
              </button>
            </div>

            {isListening ? <p className="mt-2 text-xs text-muted-foreground">{chatCopy.listening}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
