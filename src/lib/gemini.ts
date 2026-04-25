const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const STREAM = false

const NVIDIA_MODEL =
  process.env.NVIDIA_MISTRAL_MODEL ?? 'mistralai/mistral-large-3-675b-instruct-2512'
const DEFAULT_MODEL =
  process.env.GROQ_VERDICT_MODEL ?? process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile'
const DEFAULT_TIMEOUT_MS = 45_000

const NVIDIA_MODEL_FALLBACKS = [
  NVIDIA_MODEL,
  'mistralai/mistral-large-3-675b-instruct-2512',
  'mistralai/mixtral-8x7b-instruct-v0.1',
  'mistralai/mistral-7b-instruct-v0.2',
  'mistralai/mixtral-8x22b-instruct-v0.1',
]

interface GenerateContentOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  timeoutMs?: number
}

function resolveApiKeys(): { nvidiaKey?: string; groqKey?: string } {
  const nvidiaKey = process.env.NVIDIA_MISTRAL_API_KEY
  const groqKey = process.env.GROQ_API_KEY ?? process.env.GROQ ?? process.env.GROQ_KEY
  return { nvidiaKey, groqKey }
}

async function requestChatCompletion(
  endpoint: string,
  apiKey: string,
  provider: 'nvidia' | 'groq',
  model: string,
  prompt: string,
  options: GenerateContentOptions
): Promise<Response> {
  const timeoutMs = Math.max(5_000, options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  const messages = [
    ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
    { role: 'user', content: prompt },
  ]

  try {
    return await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: provider === 'nvidia' && STREAM ? 'text/event-stream' : 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens ?? 2200,
        temperature: options.temperature ?? 0.2,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: provider === 'nvidia' ? STREAM : undefined,
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`${provider === 'nvidia' ? 'NVIDIA Mistral' : 'Groq'} request timed out after ${timeoutMs}ms`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export async function generateContent(
  prompt: string,
  options: GenerateContentOptions = {}
): Promise<string> {
  const { nvidiaKey, groqKey } = resolveApiKeys()
  const useNvidia = Boolean(nvidiaKey)

  const apiKey = useNvidia ? nvidiaKey : groqKey
  if (!apiKey) {
    throw new Error(
      'Missing API key. Set NVIDIA_MISTRAL_API_KEY (recommended) or GROQ_API_KEY in your environment.'
    )
  }

  if (useNvidia) {
    const candidates = Array.from(new Set([options.model ?? NVIDIA_MODEL, ...NVIDIA_MODEL_FALLBACKS]))
    let lastStatus = 0
    let lastErrorBody = ''

    for (const candidateModel of candidates) {
      const res = await requestChatCompletion(
        NVIDIA_URL,
        apiKey,
        'nvidia',
        candidateModel,
        prompt,
        options
      )
      if (res.ok) {
        const data = await res.json()
        return data.choices?.[0]?.message?.content?.trim?.() ?? ''
      }

      lastStatus = res.status
      lastErrorBody = await res.text()

      // NVIDIA can return 404 when a model mapping is unavailable for the account.
      if (res.status !== 404) {
        break
      }
    }

    throw new Error(
      `NVIDIA Mistral error ${lastStatus}: ${lastErrorBody}. Try setting NVIDIA_MISTRAL_MODEL to an available model for your account.`
    )
  }

  const model = options.model ?? DEFAULT_MODEL
  const res = await requestChatCompletion(GROQ_CHAT_URL, apiKey, 'groq', model, prompt, options)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq chat error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim?.() ?? ''
}
