import { NextRequest } from 'next/server'
import { generateContent } from '@/lib/gemini'

export const runtime = 'nodejs'

type ChatRole = 'user' | 'assistant'

interface ChatMessage {
  role?: unknown
  content?: unknown
}

interface ChatRequestBody {
  question?: unknown
  language?: unknown
  analysisContext?: unknown
  history?: unknown
}

const LANGUAGE_LABELS = {
  en: 'English',
  hi: 'Hindi (Devanagari script)',
  mr: 'Marathi (Devanagari script)',
} as const

function normalizeLanguage(value: unknown): keyof typeof LANGUAGE_LABELS {
  return value === 'hi' || value === 'mr' ? value : 'en'
}

function sanitizeText(value: unknown, maxLen: number): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, maxLen) : ''
}

function normalizeHistory(value: unknown): Array<{ role: ChatRole; content: string }> {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const maybe = item as ChatMessage
      if (maybe.role !== 'user' && maybe.role !== 'assistant') return null
      const content = sanitizeText(maybe.content, 500)
      if (!content) return null
      return { role: maybe.role, content }
    })
    .filter((item): item is { role: ChatRole; content: string } => Boolean(item))
    .slice(-8)
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody

    const question = sanitizeText(body.question, 700)
    if (!question) {
      return Response.json({ error: 'Question is required.' }, { status: 400 })
    }

    const language = normalizeLanguage(body.language)
    const analysisContext = sanitizeText(body.analysisContext, 6000)
    const history = normalizeHistory(body.history)

    const historyBlock = history
      .map((msg, index) => `${index + 1}. ${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n')

    const prompt = `User question: ${question}

Analysis context:
${analysisContext || 'No analysis context provided.'}

Recent chat history:
${historyBlock || 'No history.'}

Instruction:
- Answer only in ${LANGUAGE_LABELS[language]}.
- Be concise and practical.
- Focus on explaining the analysis result and what user should verify next.
- If question is unrelated to analysis, politely redirect to analysis-related help.
- Do not output markdown.`

    const answer = await generateContent(prompt, {
      temperature: 0.2,
      maxTokens: 650,
      timeoutMs: Math.max(10_000, Number(process.env.GROQ_CHAT_TIMEOUT_MS ?? 25_000)),
      systemPrompt:
        'You are Veritron Assistant, a misinformation analysis helper. Be factual, neutral, and easy to understand.',
    })

    const cleanAnswer = answer.replace(/\s+/g, ' ').trim()
    if (!cleanAnswer) {
      return Response.json({ error: 'Empty chat response. Please try again.' }, { status: 502 })
    }

    return Response.json({ answer: cleanAnswer, language })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chat failed. Please try again.'
    return Response.json({ error: message }, { status: 500 })
  }
}
