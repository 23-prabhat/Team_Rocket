import type { AnalyzeRequest } from './types'
import type { ClaimSearchEvidence } from './tavily'

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
  readingLevel: NonNullable<AnalyzeRequest['readingLevel']> = 'simple',
  source?: Pick<
    AnalyzeRequest,
    | 'sourceUrl'
    | 'sourceDomain'
    | 'sourceTitle'
    | 'sourceDescription'
    | 'sourceReliability'
    | 'corroborationMatches'
  >,
  claimEvidence: ClaimSearchEvidence[] = []
): string {
  const lang = LANGUAGE_INSTRUCTIONS[language] ?? 'English'
  const level = READING_LEVEL_INSTRUCTIONS[readingLevel]
  const sourceUrl = source?.sourceUrl ? `URL: ${source.sourceUrl}` : ''
  const sourceDomain = source?.sourceDomain ? `Domain: ${source.sourceDomain}` : ''
  const sourceTitle = source?.sourceTitle ? `Title: ${source.sourceTitle}` : ''
  const sourceDescription = source?.sourceDescription ? `Description: ${source.sourceDescription}` : ''
  const sourceReliability = source?.sourceReliability
    ? `Source reliability heuristic: ${source.sourceReliability.level} (${source.sourceReliability.score}/100). Reasons: ${source.sourceReliability.reasons.join(
        '; '
      )}`
    : ''
  const corroborationSnippets = (source?.corroborationMatches ?? [])
    .slice(0, 5)
    .map((m, i) => `${i + 1}. [${m.source}] ${m.title} | ${m.snippet}`)
    .join('\n')
  const claimEvidenceText = claimEvidence
    .slice(0, 6)
    .map((entry, index) => {
      const sources = entry.results
        .slice(0, 4)
        .map(
          (result, sourceIndex) =>
            `  ${sourceIndex + 1}. [${result.source}] ${result.title} | ${result.snippet}`
        )
        .join('\n')
      return `${index + 1}) Claim: ${entry.claim}\n${sources || '  No web results found.'}`
    })
    .join('\n\n')

  return `You are a misinformation analyst. Determine if the claim/article is likely real, fake, or uncertain.
Output language: ${lang}. Reading level: ${level}.

SOURCE:
${sourceUrl}
${sourceDomain}
${sourceTitle}
${sourceDescription}
${sourceReliability}

POSSIBLE CORROBORATION SNIPPETS:
${corroborationSnippets || 'none'}

TAVILY CLAIM EVIDENCE:
${claimEvidenceText || 'none'}

CONTENT TO ANALYZE:
${text}

Return ONLY raw JSON (no markdown, no fences):
{"summary":"2-3 short paragraphs explaining credibility verdict and why","riskScore":0,"riskLevel":"low","verdict":"real","confidence":0,"keyObligations":["..."],"hiddenClauses":[{"text":"quote or claim fragment","explanation":"why concerning","severity":"low","category":"signal type"}],"evidence":[{"claim":"specific claim","finding":"why this claim is risky or supported","severity":"medium","category":"evidence type"}],"timeline":{"publishedAt":"YYYY-MM-DD or unknown","eventDateHint":"YYYY-MM-DD or unknown","staleRisk":"low","notes":["...","..."]},"corroboration":{"consensus":"supports","score":0,"summary":"short summary","matches":[{"title":"...","url":"...","source":"...","snippet":"..."}]},"quiz":[{"question":"...","options":["A","B","C","D"],"correctIndex":0},{"question":"...","options":["A","B","C","D"],"correctIndex":0},{"question":"...","options":["A","B","C","D"],"correctIndex":0}]}

Rules:
- verdict must be one of: real, fake, uncertain.
- confidence must be integer 0-100 and reflect certainty of verdict.
- riskScore means misinformation risk (higher = more likely misleading).
- riskScore bands: 0-30 low, 31-60 medium, 61-80 high, 81-100 critical.
- riskLevel must match riskScore.
- hiddenClauses are red flags/signals (sensational language, no source, manipulated context, impossible claim, suspicious domain, etc).
- evidence must map specific claims to concrete findings.
- timeline must estimate stale/recycled context risk from dates/time references.
- corroboration must summarize whether external snippets support/contradict/mix/insufficient, prioritizing TAVILY CLAIM EVIDENCE.
- Provide exactly 3 keyObligations as actionable checks the reader should do next (short phrases).
- quiz can be empty.
- summary max 4 sentences.
- All values in ${lang}. Be concise and factual.`
}

export function buildClaimExtractionPrompt(text: string, language: string = 'en'): string {
  const lang = LANGUAGE_INSTRUCTIONS[language] ?? 'English'
  return `Extract the most important factual claims from the article below.
Output language: ${lang}.

ARTICLE:
${text}

Return ONLY raw JSON:
{"claims":["claim 1","claim 2","claim 3","claim 4","claim 5"]}

Rules:
- Extract only factual/checkable claims, not opinions.
- Keep each claim under 25 words.
- Do not exceed 5 claims.
- If the article has little verifiable content, return fewer claims.
- No markdown, no explanation outside JSON.`
}

export function buildBotSummaryPrompt(text: string, language: string = 'en'): string {
  const lang = LANGUAGE_INSTRUCTIONS[language] ?? 'English'

  return `Analyze this document. Output language: ${lang}.

DOCUMENT:
${text}

Return ONLY raw JSON: {"riskScore":0,"riskLevel":"low","summary":"1-2 sentences","topWarnings":["...","...","..."]}`
}
