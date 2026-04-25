"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Sun, Moon, SpinnerGap } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { RiskMeter } from "@/components/RiskMeter";
import { RiskClauses } from "@/components/RiskClauses";
import { PlainSummary } from "@/components/PlainSummary";
import { ComprehensionQuiz } from "@/components/ComprehensionQuiz";
import { SessionActivity, type ActivityEvent } from "@/components/SessionActivity";
import { LangPills } from "@/components/LangPills";
import { ReadAloud } from "@/components/ReadAloud";
import { useTheme } from "@/contexts/theme";
import { useLanguage } from "@/contexts/language";
import type { Analysis, AnalysisSession } from "@/lib/types";

const STORAGE_KEY = "clearconsent_analysis";

function fmt(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 font-display text-2xl text-foreground">{children}</h2>
  );
}

function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border border-foreground/[0.07] bg-card p-6 sm:p-8 ${className ?? ""}`}
    >
      {children}
    </motion.section>
  );
}

export default function AnalyzePage() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { t, lang } = useLanguage();
  const [session, setSession] = useState<AnalysisSession | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as AnalysisSession | Analysis;
      if ("analysis" in parsed && "text" in parsed && "readingLevel" in parsed) {
        return parsed;
      }
      return {
        analysis: parsed as Analysis,
        text: "",
        readingLevel: "simple",
      };
    } catch {
      return null;
    }
  });
  const [quizPassedAt, setQuizPassedAt] = useState<string | null>(null);
  const [consentedAt, setConsentedAt] = useState<string | null>(null);
  const analysis = session?.analysis ?? null;
  const isRefreshingLanguage =
    session !== null && session.text.length > 0 && analysis !== null && analysis.language !== lang;

  const events: ActivityEvent[] = [
    {
      label: t.analyze.events.uploaded,
      timestamp: analysis ? fmt(new Date(analysis.createdAt)) : null,
      done: Boolean(analysis),
    },
    {
      label: t.analyze.events.completed,
      timestamp: analysis ? fmt(new Date(analysis.createdAt)) : null,
      done: Boolean(analysis),
    },
    {
      label: t.analyze.events.quizPassed,
      timestamp: quizPassedAt,
      done: Boolean(quizPassedAt),
    },
    {
      label: t.analyze.events.consented,
      timestamp: consentedAt,
      done: Boolean(consentedAt),
    },
  ];

  useEffect(() => {
    if (!analysis) {
      router.replace("/");
    }
  }, [analysis, router]);

  useEffect(() => {
    if (!session || !session.text || session.analysis.language === lang) {
      return;
    }

    let cancelled = false;

    const refreshAnalysis = async () => {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: session.text,
            language: lang,
            readingLevel: session.readingLevel,
            source: "web",
          }),
        });

        const nextAnalysis: Analysis = await response.json();
        if (!response.ok) {
          throw new Error((nextAnalysis as { error?: string }).error ?? "Analysis failed.");
        }

        if (cancelled) {
          return;
        }

        const nextSession: AnalysisSession = {
          ...session,
          analysis: nextAnalysis,
        };
        setSession(nextSession);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to refresh analysis language", error);
        }
      }
    };

    void refreshAnalysis();

    return () => {
      cancelled = true;
    };
  }, [lang, session]);

  const handleQuizPass = useCallback(() => {
    setQuizPassedAt(fmt(new Date()));
  }, []);

  const handleConsent = useCallback(() => {
    setConsentedAt(fmt(new Date()));
  }, []);

  const quizPassed = Boolean(quizPassedAt);
  const consented = Boolean(consentedAt);

  if (!analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-warm border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-foreground/[0.06]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-warm text-warm-foreground">
              <Shield size={18} weight="bold" />
            </div>
            <span className="font-display text-xl tracking-tight text-foreground">
              ClearConsent
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LangPills />
            <span className="rounded-full bg-foreground/[0.05] px-3 py-1 font-mono text-xs text-muted-foreground">
              #{analysis.auditId.slice(0, 8)}
            </span>
            <button
              onClick={toggle}
              className="flex size-8 items-center justify-center rounded-full border border-foreground/10 text-muted-foreground transition-all hover:border-warm/30 hover:text-warm cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun size={16} weight="bold" />
              ) : (
                <Moon size={16} weight="bold" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6">
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl text-foreground sm:text-4xl"
          >
            {t.analyze.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"
          >
            {t.analyze.analyzedAt} {new Date(analysis.createdAt).toLocaleString()} · {t.analyze.language}:{" "}
            {analysis.language.toUpperCase()}
            {isRefreshingLanguage ? (
              <>
                <SpinnerGap size={14} className="animate-spin" />
                <span>{t.upload.analyzing}</span>
              </>
            ) : null}
          </motion.p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* Left column */}
          <div className="space-y-5">
            {/* Risk score */}
            <Section>
              <SectionHeading>{t.analyze.riskAssessment}</SectionHeading>
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
                <RiskMeter
                  score={analysis.riskScore}
                  level={analysis.riskLevel}
                  labels={t.analyze.riskLevels}
                />
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    {t.analyze.quickSummary}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {analysis.summary.split("\n")[0]}
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] p-3">
                      <p className="text-xs text-muted-foreground">{t.analyze.flaggedClauses}</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                        {analysis.hiddenClauses.length}
                      </p>
                    </div>
                    <div className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] p-3">
                      <p className="text-xs text-muted-foreground">{t.analyze.keyObligations}</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                        {analysis.keyObligations.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Plain summary */}
            <Section>
              <SectionHeading>{t.analyze.plainSummary}</SectionHeading>
              <PlainSummary
                summary={analysis.summary}
                keyObligations={analysis.keyObligations}
                agreementListLabel={t.analyze.agreementList}
              />
              <ReadAloud
                text={[
                  analysis.summary,
                  analysis.keyObligations.length
                    ? `What you are agreeing to: ${analysis.keyObligations.join(". ")}`
                    : "",
                ]
                  .filter(Boolean)
                  .join("\n\n")}
                lang={analysis.language}
              />
            </Section>

            {/* Flagged clauses */}
            <Section>
              <SectionHeading>{t.analyze.clausesTitle} ({analysis.hiddenClauses.length})</SectionHeading>
              <RiskClauses
                clauses={analysis.hiddenClauses}
                originalClauseLabel={t.analyze.originalClause}
                emptyLabel={t.analyze.noClauses}
              />
            </Section>

            {/* Quiz */}
            <Section>
              <SectionHeading>{t.analyze.quizTitle}</SectionHeading>
              <p className="mb-5 text-sm text-muted-foreground">
                {t.analyze.quizPrompt}
              </p>
              {analysis.quiz.length > 0 ? (
                <ComprehensionQuiz
                  questions={analysis.quiz}
                  onPass={handleQuizPass}
                  submitLabel={t.analyze.submitAnswers}
                  retryLabel={t.analyze.tryAgain}
                  passSuffix={t.analyze.quizPass}
                  failSuffix={t.analyze.quizFail}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{t.analyze.noQuiz}</p>
              )}
            </Section>

            {/* Consent button */}
            <Section>
              <SectionHeading>{t.analyze.consentTitle}</SectionHeading>
              <p className="mb-5 text-sm text-muted-foreground">
                {quizPassed
                  ? t.analyze.consentReady
                  : t.analyze.consentLocked}
              </p>
              {consented ? (
                <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 px-5 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                  ✓ {t.analyze.consentRecorded} — {events[3].timestamp}
                </div>
              ) : (
                <button
                  onClick={handleConsent}
                  disabled={!quizPassed}
                  className="rounded-xl bg-warm px-8 py-3.5 text-sm font-semibold text-warm-foreground transition-all hover:bg-warm/90 hover:shadow-lg hover:shadow-warm/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {t.analyze.consentButton}
                </button>
              )}
            </Section>
          </div>

          {/* Right column — session activity */}
          <div className="space-y-5">
            <Section>
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t.analyze.sessionActivity}
              </p>
              <SessionActivity events={events} />
            </Section>

            <Section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t.analyze.auditInfo}
              </p>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{t.analyze.auditId}</dt>
                  <dd className="font-mono text-foreground/70 truncate">
                    {analysis.auditId.slice(0, 16)}…
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{t.analyze.auditRisk}</dt>
                  <dd className="font-mono text-foreground/70">
                    {analysis.riskScore}/100
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{t.analyze.language}</dt>
                  <dd className="font-mono text-foreground/70 uppercase">
                    {analysis.language}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{t.analyze.auditAnalyzed}</dt>
                  <dd className="font-mono text-foreground/70">
                    {new Date(analysis.createdAt).toLocaleTimeString()}
                  </dd>
                </div>
              </dl>
            </Section>

            <div className="text-center">
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← {t.analyze.analyzeAnother}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
