import { v4 as uuidv4 } from 'uuid'
import { generateContent } from './gemini'
import { buildAnalysisPrompt } from './prompts'
import type { Analysis, AnalyzeRequest } from './types'

const MAX_TEXT_CHARS = 4_000

export async function analyze(req: AnalyzeRequest): Promise<Analysis> {
  const text = (req.text ?? '').slice(0, MAX_TEXT_CHARS)
  if (!text || text.trim().length < 20) {
    throw new Error('No valid text provided.')
  }
  const language = req.language ?? 'en'
  const readingLevel = req.readingLevel ?? 'simple'

  const prompt = buildAnalysisPrompt(text, language, readingLevel, {
    sourceUrl: req.sourceUrl,
    sourceDomain: req.sourceDomain,
    sourceTitle: req.sourceTitle,
    sourceDescription: req.sourceDescription,
    sourceReliability: req.sourceReliability,
    corroborationMatches: req.corroborationMatches,
  })

  const raw = (await generateContent(prompt)).trim()

  // Extract the JSON object robustly — find first { and last }
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    console.error('Raw AI response:', raw.slice(0, 500))
    throw new Error('AI returned malformed JSON. Please try again.')
  }
  const cleaned = raw.slice(start, end + 1)

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('Failed to parse JSON:', cleaned.slice(0, 500))
    throw new Error('AI returned malformed JSON. Please try again.')
  }

  // Clamp and validate riskScore
  const riskScore = Math.max(0, Math.min(100, Math.round(Number(parsed.riskScore) || 0)))
  const confidence = Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 0)))
  const verdict = normalizeVerdict(parsed.verdict)
  const hiddenClauses = normalizeHiddenClauses(parsed.hiddenClauses)
  const keyObligations = normalizeStringArray(parsed.keyObligations, 3)
  const quiz = normalizeQuiz(parsed.quiz)
  const evidence = normalizeEvidence(parsed.evidence)
  const timeline = normalizeTimeline(parsed.timeline)
  const corroboration = normalizeCorroboration(parsed.corroboration, req.corroborationMatches ?? [])

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    riskScore,
    riskLevel: normalizeRiskLevel(parsed.riskLevel) ?? scoreToLevel(riskScore),
    verdict,
    confidence,
    keyObligations,
    hiddenClauses,
    evidence,
    timeline,
    corroboration,
    sourceReliability: req.sourceReliability,
    quiz,
    sourceUrl: req.sourceUrl,
    sourceDomain: req.sourceDomain,
    language,
    auditId: uuidv4(),
    createdAt: new Date().toISOString(),
  }
}

function scoreToLevel(score: number): Analysis['riskLevel'] {
  if (score <= 30) return 'low'
  if (score <= 60) return 'medium'
  if (score <= 80) return 'high'
  return 'critical'
}

function normalizeRiskLevel(value: unknown): Analysis['riskLevel'] | null {
  if (value === 'low' || value === 'medium' || value === 'high' || value === 'critical') {
    return value
  }
  return null
}

function normalizeVerdict(value: unknown): Analysis['verdict'] {
  if (value === 'real' || value === 'fake' || value === 'uncertain') {
    return value
  }
  return 'uncertain'
}

function normalizeSeverity(value: unknown): Analysis['hiddenClauses'][number]['severity'] {
  if (value === 'low' || value === 'medium' || value === 'high' || value === 'critical') {
    return value
  }
  return 'medium'
}

function normalizeStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .slice(0, max)
}

function normalizeHiddenClauses(value: unknown): Analysis['hiddenClauses'] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const maybe = item as Record<string, unknown>
      const text = typeof maybe.text === 'string' ? maybe.text : ''
      const explanation = typeof maybe.explanation === 'string' ? maybe.explanation : ''
      if (!text || !explanation) return null
      return {
        text,
        explanation,
        severity: normalizeSeverity(maybe.severity),
        category: typeof maybe.category === 'string' ? maybe.category : 'credibility signal',
      }
    })
    .filter((item): item is Analysis['hiddenClauses'][number] => Boolean(item))
    .slice(0, 8)
}

function normalizeQuiz(value: unknown): Analysis['quiz'] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const maybe = item as Record<string, unknown>
      const question = typeof maybe.question === 'string' ? maybe.question : ''
      const options = Array.isArray(maybe.options)
        ? maybe.options.filter((v): v is string => typeof v === 'string').slice(0, 4)
        : []
      const correctIndex = Number.isInteger(maybe.correctIndex)
        ? Number(maybe.correctIndex)
        : 0
      if (!question || options.length !== 4) return null
      return {
        question,
        options,
        correctIndex: Math.max(0, Math.min(3, correctIndex)),
      }
    })
    .filter((item): item is Analysis['quiz'][number] => Boolean(item))
    .slice(0, 3)
}

function normalizeEvidence(value: unknown): Analysis['evidence'] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const maybe = item as Record<string, unknown>
      const claim = typeof maybe.claim === 'string' ? maybe.claim : ''
      const finding = typeof maybe.finding === 'string' ? maybe.finding : ''
      if (!claim || !finding) return null
      return {
        claim,
        finding,
        severity: normalizeSeverity(maybe.severity),
        category: typeof maybe.category === 'string' ? maybe.category : 'claim-check',
      }
    })
    .filter((item): item is Analysis['evidence'][number] => Boolean(item))
    .slice(0, 6)
}

function normalizeStaleRisk(value: unknown): 'low' | 'medium' | 'high' {
  if (value === 'low' || value === 'medium' || value === 'high') return value
  return 'medium'
}

function normalizeTimeline(value: unknown): Analysis['timeline'] {
  if (!value || typeof value !== 'object') {
    return {
      staleRisk: 'medium',
      notes: ['No timeline signal was confidently extracted.'],
    }
  }
  const maybe = value as Record<string, unknown>
  return {
    publishedAt: typeof maybe.publishedAt === 'string' ? maybe.publishedAt : undefined,
    eventDateHint: typeof maybe.eventDateHint === 'string' ? maybe.eventDateHint : undefined,
    staleRisk: normalizeStaleRisk(maybe.staleRisk),
    notes: normalizeStringArray(maybe.notes, 4),
  }
}

function normalizeConsensus(value: unknown): 'supports' | 'mixed' | 'contradicts' | 'insufficient' {
  if (value === 'supports' || value === 'mixed' || value === 'contradicts' || value === 'insufficient') {
    return value
  }
  return 'insufficient'
}

function normalizeCorroboration(
  value: unknown,
  fallbackMatches: AnalyzeRequest['corroborationMatches']
): Analysis['corroboration'] {
  const fallback = (fallbackMatches ?? []).slice(0, 5)
  if (!value || typeof value !== 'object') {
    return {
      consensus: 'insufficient',
      score: 0,
      summary: 'Not enough corroboration context was available.',
      matches: fallback,
    }
  }
  const maybe = value as Record<string, unknown>
  const matches = Array.isArray(maybe.matches)
    ? maybe.matches
        .map((item) => {
          if (!item || typeof item !== 'object') return null
          const m = item as Record<string, unknown>
          if (
            typeof m.title !== 'string' ||
            typeof m.url !== 'string' ||
            typeof m.source !== 'string' ||
            typeof m.snippet !== 'string'
          ) {
            return null
          }
          return {
            title: m.title,
            url: m.url,
            source: m.source,
            snippet: m.snippet,
          }
        })
        .filter((m): m is NonNullable<typeof m> => Boolean(m))
        .slice(0, 5)
    : fallback
  return {
    consensus: normalizeConsensus(maybe.consensus),
    score: Math.max(0, Math.min(100, Math.round(Number(maybe.score) || 0))),
    summary:
      typeof maybe.summary === 'string'
        ? maybe.summary
        : 'Corroboration signals are currently limited.',
    matches,
  }
}
