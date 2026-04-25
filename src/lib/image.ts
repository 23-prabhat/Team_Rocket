interface VisionExtractionPayload {
  extractedText?: unknown
  observations?: unknown
  claims?: unknown
}

interface VisionExtractionResult {
  text: string
  claims: string[]
  observations: string[]
}

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_VISION_MODEL = process.env.GROQ_VISION_MODEL ?? 'meta-llama/llama-4-scout-17b-16e-instruct'
const DEFAULT_TIMEOUT_MS = 30_000

function resolveGroqApiKey(): string {
  const key = process.env.GROQ_API_KEY ?? process.env.GROQ ?? process.env.GROQ_KEY
  if (!key) throw new Error('Missing GROQ_API_KEY in environment.')
  return key
}

function normalizeStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .slice(0, max)
}

function ensureSupportedImageType(mimeType: string): void {
  const allowed = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])
  if (!allowed.has(mimeType.toLowerCase())) {
    throw new Error('Unsupported image type. Upload PNG, JPG, JPEG, or WEBP.')
  }
}

export async function extractTextFromImage(
  buffer: Buffer,
  mimeType: string
): Promise<VisionExtractionResult> {
  ensureSupportedImageType(mimeType)

  const apiKey = resolveGroqApiKey()
  const model = DEFAULT_VISION_MODEL
  const timeoutMs = Math.max(8_000, Number(process.env.GROQ_VISION_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS))
  const base64 = buffer.toString('base64')
  const dataUrl = `data:${mimeType};base64,${base64}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  let response: Response

  try {
    response = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 1400,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'Extract text and key factual claims from this image for fact-checking. Return ONLY JSON: {"extractedText":"...","observations":["..."],"claims":["..."]}. Keep claims concise and checkable.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Groq vision request timed out after ${timeoutMs}ms`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq vision error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const raw = data?.choices?.[0]?.message?.content
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Groq vision returned empty output.')
  }

  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Groq vision returned malformed JSON.')
  }

  let parsed: VisionExtractionPayload
  try {
    parsed = JSON.parse(raw.slice(start, end + 1)) as VisionExtractionPayload
  } catch {
    throw new Error('Could not parse vision extraction JSON.')
  }

  const extractedText =
    typeof parsed.extractedText === 'string'
      ? parsed.extractedText.replace(/\s+/g, ' ').trim()
      : ''
  const observations = normalizeStringArray(parsed.observations, 6)
  const claims = normalizeStringArray(parsed.claims, 6)

  const mergedText = [extractedText, ...claims, ...observations].join('\n').trim()

  if (!mergedText || mergedText.length < 20) {
    throw new Error('No usable text could be extracted from the image.')
  }

  return {
    text: mergedText,
    claims,
    observations,
  }
}

