const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const NVIDIA_MODEL =
  process.env.NVIDIA_MISTRAL_MODEL ?? 'mistralai/mistral-large-3-675b-instruct-2512'
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile'
const STREAM = false

const NVIDIA_MODEL_FALLBACKS = [
  NVIDIA_MODEL,
  'mistralai/mistral-large-3-675b-instruct-2512',
  'mistralai/mixtral-8x7b-instruct-v0.1',
  'mistralai/mistral-7b-instruct-v0.2',
  'mistralai/mixtral-8x22b-instruct-v0.1',
]

async function requestChatCompletion(
  endpoint: string,
  apiKey: string,
  model: string,
  prompt: string,
  provider: 'nvidia' | 'groq'
) {
  const isNvidia = provider === 'nvidia'

  return fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: isNvidia && STREAM ? 'text/event-stream' : 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.15,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: STREAM,
    }),
  })
}

export async function generateContent(prompt: string): Promise<string> {
  const nvidiaKey = process.env.NVIDIA_MISTRAL_API_KEY
  const groqKey = process.env.GROQ_API_KEY

  const useNvidia = Boolean(nvidiaKey)
  const endpoint = useNvidia ? NVIDIA_URL : GROQ_URL
  const apiKey = nvidiaKey || groqKey
  const model = useNvidia ? NVIDIA_MODEL : GROQ_MODEL
  const providerName = useNvidia ? 'NVIDIA Mistral' : 'Groq'

  if (!apiKey) {
    throw new Error(
      'Missing API key. Set NVIDIA_MISTRAL_API_KEY (recommended) or GROQ_API_KEY in your environment.'
    )
  }

  if (useNvidia) {
    const candidates = Array.from(new Set(NVIDIA_MODEL_FALLBACKS))

    let lastStatus = 0
    let lastErrorBody = ''
    for (const candidateModel of candidates) {
      const res = await requestChatCompletion(endpoint, apiKey, candidateModel, prompt, 'nvidia')
      if (res.ok) {
        const data = await res.json()
        return data.choices?.[0]?.message?.content ?? ''
      }

      lastStatus = res.status
      lastErrorBody = await res.text()

      // NVIDIA can return 404 when a model function mapping is unavailable for the account.
      if (res.status !== 404) {
        break
      }
    }

    throw new Error(
      `NVIDIA Mistral error ${lastStatus}: ${lastErrorBody}. Try setting NVIDIA_MISTRAL_MODEL to an available model for your account.`
    )
  }

  const res = await requestChatCompletion(endpoint, apiKey, model, prompt, 'groq')

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`${providerName} error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}
