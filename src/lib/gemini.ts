const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = process.env.GROQ_VERDICT_MODEL ?? 'llama-3.3-70b-versatile'
const DEFAULT_TIMEOUT_MS = 45_000

function resolveGroqApiKey(): string {
  const key =
    process.env.GROQ_API_KEY ??
    process.env.GROQ ??
    process.env.GROQ_KEY

  if (!key) {
    throw new Error('Missing GROQ_API_KEY in environment.')
  }
  return key
}

interface GenerateContentOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  timeoutMs?: number
}

export async function generateContent(
  prompt: string,
  options: GenerateContentOptions = {}
): Promise<string> {
  const apiKey = resolveGroqApiKey()
  const model = options.model ?? DEFAULT_MODEL
  const temperature = options.temperature ?? 0.2
  const maxTokens = options.maxTokens ?? 2200
  const timeoutMs = Math.max(5_000, options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  const messages = [
    ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
    { role: 'user', content: prompt },
  ]

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  let res: Response
  try {
    res = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Groq request timed out after ${timeoutMs}ms`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq chat error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim?.() ?? ''
}
