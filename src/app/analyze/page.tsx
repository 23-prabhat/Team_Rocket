"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Sun, Moon, Copy, CheckCircle, ChatCircleDots, X, Microphone } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { RiskMeter } from "@/components/RiskMeter";
import { PlainSummary } from "@/components/PlainSummary";
import { LangPills } from "@/components/LangPills";
import { ReadAloud } from "@/components/ReadAloud";
import { useTheme } from "@/contexts/theme";
import { useLanguage } from "@/contexts/language";
import { cn } from "@/lib/utils";
import type { Analysis, AnalysisSession } from "@/lib/types";

const STORAGE_KEY = "veritron_analysis";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

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

const STALE_COPY = {
  low: "Still timely",
  medium: "Needs context",
  high: "High chance this is stale",
} as const;

const SEVERITY_STYLES = {
  low: {
    badge: "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  medium: {
    badge: "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
    dot: "bg-yellow-500",
  },
  high: {
    badge: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  critical: {
    badge: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300",
    dot: "bg-red-500",
  },
} as const;

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
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

function formatMoment(value?: string) {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StorySection({
  index,
  title,
  description,
  children,
  className,
}: {
  index: string;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
      className={cn(
        "rounded-[2rem] border border-foreground/8 bg-card shadow-[0_30px_80px_-56px_rgba(20,30,60,0.2)]",
        className
      )}
    >
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="grid gap-4 border-b border-foreground/10 pb-6 sm:grid-cols-[96px_1fr] sm:items-end">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-warm/75">{index}</p>
          <div>
            <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
          </div>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </motion.section>
  );
}

function verdictClass(verdict: NonNullable<Analysis["verdict"]>) {
  if (verdict === "real") return "border-green-500/25 bg-green-500/12 text-green-600 dark:text-green-300";
  if (verdict === "fake") return "border-red-500/25 bg-red-500/12 text-red-600 dark:text-red-300";
  return "border-yellow-500/25 bg-yellow-500/12 text-yellow-700 dark:text-yellow-300";
}

function staleRiskClass(staleRisk: NonNullable<Analysis["timeline"]>["staleRisk"]) {
  if (staleRisk === "low") return "border-green-500/25 bg-green-500/12 text-green-600 dark:text-green-300";
  if (staleRisk === "high") return "border-red-500/25 bg-red-500/12 text-red-600 dark:text-red-300";
  return "border-yellow-500/25 bg-yellow-500/12 text-yellow-700 dark:text-yellow-300";
}

function ReliabilityBar({ score }: { score: number }) {
  return (
    <div className="h-2 rounded-full bg-foreground/10">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.9, ease: EASE }}
        className="h-2 rounded-full bg-warm"
      />
    </div>
  );
}

function TimelineRoad({
  timeline,
  analyzedAt,
}: {
  timeline: Analysis["timeline"];
  analyzedAt: string;
}) {
  const staleRisk = timeline?.staleRisk ?? "medium";
  const notes = timeline?.notes?.length ? timeline.notes : ["No strong timeline note was extracted."];
  const milestones = [
    {
      label: "Referenced event",
      date: formatMoment(timeline?.eventDateHint),
      copy: timeline?.eventDateHint
        ? "The moment the underlying event appears to have happened."
        : "No reliable event date was extracted from the claim.",
      desktopClass: "left-[3%] top-[58%]",
      delay: 0.1,
    },
    {
      label: "Published or posted",
      date: formatMoment(timeline?.publishedAt),
      copy: timeline?.publishedAt
        ? "When this version seems to have entered circulation."
        : "The original publish date is still unclear.",
      desktopClass: "left-[33%] top-[8%]",
      delay: 0.2,
    },
    {
      label: "This analysis",
      date: formatMoment(analyzedAt),
      copy: "When Veritron scored and explained the claim.",
      desktopClass: "left-[67%] top-[56%]",
      delay: 0.3,
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
      <div className="space-y-5">
        <div className="hidden overflow-hidden rounded-[1.75rem] border border-foreground/10 bg-background md:block">
          <div className="relative min-h-[420px] p-6">
            <svg viewBox="0 0 900 320" className="pointer-events-none absolute inset-0 h-full w-full">
              <motion.path
                d="M 70 230 C 190 95, 330 85, 455 165 S 700 270 830 135"
                fill="none"
                stroke="currentColor"
                strokeWidth="18"
                strokeLinecap="round"
                className="text-foreground/8"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.15, ease: EASE }}
              />
              <motion.path
                d="M 70 230 C 190 95, 330 85, 455 165 S 700 270 830 135"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="10 14"
                className="text-warm/70"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1, strokeDashoffset: [0, -72] }}
                transition={{
                  pathLength: { duration: 1.1, ease: EASE },
                  opacity: { duration: 0.45 },
                  strokeDashoffset: { duration: 3.5, ease: "linear", repeat: Number.POSITIVE_INFINITY },
                }}
              />
            </svg>

            {milestones.map((milestone) => (
              <motion.div
                key={milestone.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: milestone.delay, ease: EASE }}
                whileHover={{ y: -4, scale: 1.01 }}
                className={cn("absolute w-[240px]", milestone.desktopClass)}
              >
                <div className="relative rounded-[1.4rem] border border-foreground/10 bg-card p-4 shadow-[0_20px_50px_-40px_rgba(20,30,60,0.22)]">
                  <motion.span
                    className="absolute -left-2 top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-background bg-warm shadow-[0_0_0_6px_rgba(82,122,255,0.08)]"
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ duration: 2.1, delay: milestone.delay, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-warm/80">{milestone.label}</p>
                  <p className="mt-3 text-[1.05rem] leading-snug font-display text-foreground">{milestone.date}</p>
                  <p className="mt-3 break-words text-sm leading-relaxed text-muted-foreground">{milestone.copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative space-y-4 pl-6 md:hidden">
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-warm/20 via-warm/70 to-warm/20" />
          {milestones.map((milestone) => (
            <motion.div
              key={milestone.label}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: milestone.delay, ease: EASE }}
              className="relative rounded-[1.5rem] border border-foreground/10 bg-background p-4"
            >
              <motion.span
                className="absolute -left-[22px] top-6 size-3 rounded-full bg-warm shadow-[0_0_0_6px_rgba(82,122,255,0.08)]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2.1, delay: milestone.delay, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-warm/80">{milestone.label}</p>
              <p className="mt-2 break-words font-display text-lg text-foreground">{milestone.date}</p>
              <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">{milestone.copy}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-foreground/10 bg-background p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Freshness signal</p>
            <p className="mt-2 font-display text-2xl tracking-tight text-foreground">{STALE_COPY[staleRisk]}</p>
          </div>
          <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide", staleRiskClass(staleRisk))}>
            {staleRisk} stale risk
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {notes.map((note, index) => (
            <div key={`${note}-${index}`} className="flex gap-3 border-t border-foreground/10 pt-3 first:border-t-0 first:pt-0">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-warm" />
              <p className="break-words text-sm leading-relaxed text-foreground/80">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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

  const [session, setSession] = useState<AnalysisSession | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as AnalysisSession | Analysis;
      if ("analysis" in parsed && "text" in parsed && "readingLevel" in parsed) return parsed;
      return { analysis: parsed as Analysis, text: "", readingLevel: "simple" };
    } catch {
      return null;
    }
  });

  const analysis = session?.analysis ?? null;
  const chatCopy = CHAT_COPY[lang];
  const verdict = analysis?.verdict ?? "uncertain";
  const verdictText = VERDICT_LABELS[lang][verdict];
  const heroSummary = analysis?.summary?.split("\n").filter(Boolean)[0] ?? "";
  const leadingIndicators = analysis?.keyObligations.slice(0, 3) ?? [];
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
    let cancelled = false;

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
        });
        const nextAnalysis: Analysis = await response.json();
        if (!response.ok || cancelled) return;
        const nextSession: AnalysisSession = { ...session, analysis: nextAnalysis };
        setSession(nextSession);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      } catch {
        // keep previous language result if refresh fails
      }
    };

    void refreshAnalysis();
    return () => {
      cancelled = true;
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
        <div className="mx-auto flex h-16 max-w-[88rem] items-center justify-between px-4 sm:px-6 lg:px-8">
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

      <main className="pb-20 pt-24">
        <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="rounded-[2.3rem] border border-foreground/8 bg-card shadow-[0_40px_100px_-64px_rgba(20,30,60,0.22)]"
          >
            <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] 2xl:gap-10">
                <div className="space-y-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", verdictClass(verdict))}>
                      {verdictText}
                    </span>
                      <span className="rounded-full border border-foreground/10 bg-background px-3 py-1 font-mono text-xs text-foreground/80">
                        Score {analysis.riskScore}/100
                      </span>
                    <span className="rounded-full border border-foreground/10 bg-background px-3 py-1 font-mono text-xs text-foreground/80">
                      Confidence {analysis.confidence ?? 0}%
                    </span>
                    {analysis.sourceDomain ? (
                      <span className="max-w-full truncate rounded-full border border-foreground/10 bg-background px-3 py-1 font-mono text-xs text-foreground/80" title={analysis.sourceDomain}>
                        {analysis.sourceDomain}
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-warm/75">Analysis story</p>
                    <h1 className="mt-3 max-w-4xl font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
                      {t.analyze.title}
                    </h1>
                    <p className="mt-4 max-w-4xl text-base leading-relaxed break-words text-muted-foreground sm:text-lg">
                      {heroSummary || analysis.summary}
                    </p>
                    <p className="mt-4 break-words text-sm text-muted-foreground">
                      {t.analyze.analyzedAt} {formatMoment(analysis.createdAt)} · {t.analyze.language} {analysis.language.toUpperCase()}
                    </p>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] xl:items-start">
                    <div className="rounded-[1.5rem] border border-foreground/10 bg-background p-5">
                      <RiskMeter score={analysis.riskScore} level={analysis.riskLevel} labels={t.analyze.riskLevels} />
                    </div>
                    <div className="space-y-5">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-[1.25rem] border border-foreground/10 bg-background p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Audit ID</p>
                          <p className="mt-2 break-all font-mono text-sm text-foreground">{analysis.auditId}</p>
                        </div>
                        <div className="rounded-[1.25rem] border border-foreground/10 bg-background p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Verdict</p>
                          <p className="mt-2 break-words text-sm font-semibold text-foreground">{verdictText}</p>
                        </div>
                        <div className="rounded-[1.25rem] border border-foreground/10 bg-background p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Source</p>
                          <p className="mt-2 break-all text-sm text-foreground">{analysis.sourceDomain ?? "Direct text"}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">What to watch first</p>
                        <div className="mt-4 divide-y divide-foreground/10 rounded-[1.5rem] border border-foreground/10 bg-background">
                          {leadingIndicators.length > 0 ? (
                            leadingIndicators.map((indicator, index) => (
                              <div key={`${indicator}-${index}`} className="flex gap-3 px-4 py-3">
                                <span className="mt-1 size-2 shrink-0 rounded-full bg-warm" />
                                <p className="break-words text-sm leading-relaxed text-foreground/80">{indicator}</p>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3">
                              <p className="text-sm leading-relaxed text-muted-foreground">The detailed reasoning sits in the sections below.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex h-full flex-col rounded-[1.9rem] border border-foreground/10 bg-background p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Shareable brief</p>
                      <p className="mt-3 break-words font-display text-3xl tracking-tight text-foreground">{verdictText}</p>
                    </div>
                    <span className="rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-1 font-mono text-xs text-muted-foreground">
                      {analysis.riskScore}/100
                    </span>
                  </div>

                  <p className="mt-5 break-words text-sm leading-relaxed text-foreground/80">
                    {heroSummary || analysis.summary}
                  </p>

                  <div className="mt-6 space-y-3 border-t border-foreground/10 pt-5">
                    <div className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-mono text-foreground">{analysis.confidence ?? 0}%</span>
                    </div>
                    <div className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Language</span>
                      <span className="font-mono text-foreground">{analysis.language.toUpperCase()}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Analyzed</span>
                      <span className="max-w-[13rem] break-words text-right font-mono text-foreground">{formatMoment(analysis.createdAt)}</span>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(shareText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-[1.1rem] bg-warm px-4 py-3 text-sm font-semibold text-warm-foreground transition-all hover:bg-warm/90"
                  >
                    {copied ? <CheckCircle size={16} weight="fill" /> : <Copy size={16} />}
                    {copied ? "Copied" : "Copy share text"}
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

          <div className="mt-10 space-y-10">
            <StorySection
              index="01"
              title={t.analyze.plainSummary}
              description="Start with the plain-language explanation before getting into the proof trail."
            >
              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                <div className="space-y-6">
                  <PlainSummary
                    summary={analysis.summary}
                    keyObligations={analysis.keyObligations}
                    agreementListLabel={t.analyze.agreementList}
                  />
                  <ReadAloud
                    text={[analysis.summary, analysis.keyObligations.join(". ")].filter(Boolean).join("\n\n")}
                    lang={analysis.language}
                  />
                </div>

                <div className="rounded-[1.75rem] border border-foreground/10 bg-background p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">At a glance</p>
                  <div className="mt-5 divide-y divide-foreground/10">
                    <div className="flex items-start justify-between gap-4 py-3 first:pt-0">
                      <span className="text-sm text-muted-foreground">Overall risk</span>
                      <span className="text-sm font-semibold text-foreground">{t.analyze.riskLevels[analysis.riskLevel]}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4 py-3">
                      <span className="text-sm text-muted-foreground">Timeline signal</span>
                      <span className="text-sm font-semibold text-foreground">{STALE_COPY[analysis.timeline?.staleRisk ?? "medium"]}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4 py-3">
                      <span className="text-sm text-muted-foreground">Cross-source check</span>
                      <span className="max-w-[16rem] text-right text-sm font-semibold break-words text-foreground">
                        {CONSENSUS_LABELS[lang][analysis.corroboration?.consensus ?? "insufficient"]}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4 py-3">
                      <span className="text-sm text-muted-foreground">Source reliability</span>
                      <span className="max-w-[16rem] text-right text-sm font-semibold break-words text-foreground">
                        {analysis.sourceReliability
                          ? RELIABILITY_LABELS[lang][analysis.sourceReliability.level]
                          : "Available only for URL analysis"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </StorySection>

            <StorySection
              index="02"
              title="What moved the verdict"
              description="These are the concrete reasons the score changed, split between warning signals and claim-level evidence."
            >
              <div className="grid gap-10 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Signals that raised concern</p>
                  <div className="mt-5 space-y-5">
                    {analysis.hiddenClauses.length === 0 ? (
                      <p className="text-sm leading-relaxed text-muted-foreground">{t.analyze.noClauses}</p>
                    ) : (
                      analysis.hiddenClauses.map((clause, index) => {
                        const severityStyle = SEVERITY_STYLES[clause.severity];
                        return (
                          <motion.div
                            key={`${clause.text}-${index}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.06, ease: EASE }}
                            className="grid gap-4 sm:grid-cols-[48px_minmax(0,1fr)]"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-foreground/10 bg-background font-mono text-sm text-muted-foreground">
                              {String(index + 1).padStart(2, "0")}
                            </div>
                            <div className="border-l border-foreground/10 pl-5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  {clause.category}
                                </span>
                                <span className={cn("rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide", severityStyle.badge)}>
                                  {clause.severity}
                                </span>
                              </div>
                              <p className="mt-3 break-words text-base font-semibold leading-snug text-foreground">{clause.explanation}</p>
                              <blockquote className="mt-3 break-words border-l-2 border-foreground/15 pl-4 text-sm leading-relaxed text-muted-foreground italic">
                                {clause.text}
                              </blockquote>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Evidence mapping</p>
                  <div className="mt-5 space-y-4">
                    {analysis.evidence.length === 0 ? (
                      <p className="text-sm leading-relaxed text-muted-foreground">No strong claim-level evidence was extracted.</p>
                    ) : (
                      analysis.evidence.map((item, index) => {
                        const severityStyle = SEVERITY_STYLES[item.severity];
                        return (
                          <motion.div
                            key={`${item.claim}-${index}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.06, ease: EASE }}
                            className="rounded-[1.5rem] border border-foreground/10 bg-background p-5"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {item.category}
                              </span>
                              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground/80">
                                <span className={cn("size-2 rounded-full", severityStyle.dot)} />
                                {item.severity}
                              </span>
                            </div>
                            <p className="mt-3 break-words text-base font-semibold leading-snug text-foreground">{item.claim}</p>
                            <p className="mt-2 break-words text-sm leading-relaxed text-foreground/80">{item.finding}</p>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </StorySection>

            <StorySection
              index="03"
              title="How the story travels over time"
              description="Timing matters. Old events, recycled screenshots, and delayed reposts are a common reason claims become misleading."
            >
              <TimelineRoad timeline={analysis.timeline} analyzedAt={analysis.createdAt} />
            </StorySection>

            <StorySection
              index="04"
              title="How much the wider web agrees"
              description="This last check asks two things: whether the source itself looks dependable, and whether other outlets support or contradict the same claim."
            >
              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Source reliability</p>
                  {analysis.sourceReliability ? (
                    <div className="mt-5 rounded-[1.75rem] border border-foreground/10 bg-background p-6">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="font-display text-3xl tracking-tight text-foreground">
                            {RELIABILITY_LABELS[lang][analysis.sourceReliability.level]}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">A quick trust score for the origin of this claim.</p>
                        </div>
                        <span className="font-mono text-sm text-foreground/80">{analysis.sourceReliability.score}/100</span>
                      </div>
                      <div className="mt-5">
                        <ReliabilityBar score={analysis.sourceReliability.score} />
                      </div>
                      <div className="mt-6 divide-y divide-foreground/10">
                        {analysis.sourceReliability.reasons.map((reason, index) => (
                          <div key={`${reason}-${index}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                            <span className="mt-1 size-2 shrink-0 rounded-full bg-warm" />
                            <p className="break-words text-sm leading-relaxed text-foreground/80">{reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Source reliability is available for URL analysis.</p>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Cross-source consensus</p>
                    <span className="rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 font-mono text-xs text-foreground/80">
                      {analysis.corroboration?.score ?? 0}% match
                    </span>
                  </div>

                  <p className="mt-4 font-display text-3xl tracking-tight text-foreground">
                    {CONSENSUS_LABELS[lang][analysis.corroboration?.consensus ?? "insufficient"]}
                  </p>
                  <p className="mt-3 max-w-3xl break-words text-sm leading-relaxed text-muted-foreground">
                    {analysis.corroboration?.summary ?? "No consensus summary available."}
                  </p>
                  <div className="mt-5">
                    <ReliabilityBar score={analysis.corroboration?.score ?? 0} />
                  </div>

                  <div className="mt-6 divide-y divide-foreground/10 rounded-[1.75rem] border border-foreground/10 bg-background px-5">
                    {(analysis.corroboration?.matches ?? []).length > 0 ? (
                      (analysis.corroboration?.matches ?? []).map((match, index) => (
                        <a
                          key={`${match.url}-${index}`}
                          href={match.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group block py-4 transition-colors hover:text-warm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="break-words text-sm font-semibold leading-relaxed text-foreground transition-colors group-hover:text-warm">
                                {match.title}
                              </p>
                              <p className="mt-1 break-all text-xs text-muted-foreground">{match.source}</p>
                              {match.snippet ? (
                                <p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed text-foreground/70">{match.snippet}</p>
                              ) : null}
                            </div>
                            <span className="pt-1 font-mono text-xs text-muted-foreground">0{index + 1}</span>
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="py-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">No corroborating links were returned for this analysis.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </StorySection>

            <div className="text-center">
              <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
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

          <div ref={chatScrollRef} className="max-h-[22rem] space-y-3 overflow-y-auto bg-foreground/[0.02] p-4">
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
                  {message.role === "assistant" ? (
                    <div className="mb-1">
                      <ReadAloud text={message.content} lang={lang} />
                    </div>
                  ) : null}
                  <div className="whitespace-pre-wrap">{message.content}</div>
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
