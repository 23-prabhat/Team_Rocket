import type { AnalyzeRequest } from './types'

const READING_LEVEL_INSTRUCTIONS: Record<NonNullable<AnalyzeRequest['readingLevel']>, string> = {
  eli5: 'Use very simple words a child can understand.',
  simple: '6th-grade reading level, no jargon.',
  standard: 'Clear adult language, brief explanations of technical terms.',
  expert: 'Full legal/financial precision.',
}

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (Devanagari)',
  mr: 'Marathi (Devanagari)',
}

export function buildAnalysisPrompt(
  text: string,
  language: string = 'en',
  readingLevel: NonNullable<AnalyzeRequest['readingLevel']> = 'simple'
): string {
  const lang = LANGUAGE_INSTRUCTIONS[language] ?? 'English'
  const level = READING_LEVEL_INSTRUCTIONS[readingLevel]

  return `Analyze the following news-like or social-media content for misinformation. Output language: ${lang}. Reading level: ${level}.

CONTENT:
${text}

Return ONLY raw JSON (no markdown, no fences):
{"summary":"2-3 paragraph plain-language summary","riskScore":0,"riskLevel":"low","keyObligations":["..."],"hiddenClauses":[{"text":"quote","explanation":"why concerning","severity":"low","category":"type"}],"quiz":[{"question":"...","options":["A","B","C","D"],"correctIndex":0},{"question":"...","options":["A","B","C","D"],"correctIndex":0},{"question":"...","options":["A","B","C","D"],"correctIndex":0}]}

Field meaning:
- summary: explain in simple language whether the content looks trustworthy, misleading, false, exaggerated, or unverified, and why.
- riskScore: percentage chance the content is misleading or false.
- riskLevel: low, medium, high, or critical matching the score.
- keyObligations: exactly 3 short user actions such as verify source, check date, compare headlines, look for evidence.
- hiddenClauses: exactly 2 suspicious claims or red flags from the content, with explanation, severity, and category.
- quiz: exactly 3 short comprehension questions about the verdict.

Rules: Treat missing evidence, emotional manipulation, unverifiable claims, recycled old news, and lack of source attribution as strong misinformation signals. Do not claim certainty unless the text supports it. riskScore 0-30=low,31-60=medium,61-80=high,81-100=critical. riskLevel must match. Exactly 2 hiddenClauses. Exactly 3 keyObligations. Exactly 3 quiz questions with 4 short options each. summary max 3 sentences. All values in ${lang}. Be concise and user-friendly.`
}

export function buildBotSummaryPrompt(text: string, language: string = 'en'): string {
  const lang = LANGUAGE_INSTRUCTIONS[language] ?? 'English'

  return `Analyze this content for misinformation. Output language: ${lang}.

CONTENT:
${text}

Return ONLY raw JSON: {"riskScore":0,"riskLevel":"low","summary":"1-2 sentences","topWarnings":["...","...","..."]}`
}
