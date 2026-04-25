import type { CorroborationMatch } from './types'

const TAVILY_SEARCH_URL = 'https://api.tavily.com/search'
const DEFAULT_TAVILY_TIMEOUT_MS = 12_000

interface TavilyResult {
  title?: string
  url?: string
  content?: string
  score?: number
}

interface TavilySearchResponse {
  results?: TavilyResult[]
}

export interface ClaimSearchEvidence {
  claim: string
  results: Array<CorroborationMatch & { score?: number }>
}

function resolveTavilyApiKey(): string {
  const key = process.env.TAVILY_API_KEY ?? process.env.TAVILY
  if (!key) {
    throw new Error('Missing Tavily API key. Set TAVILY_API_KEY (or TAVILY) in environment.')
  }
  return key
}

function normalizeClaimQuery(claim: string): string {
  return claim
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220)
}

export async function searchClaimWithTavily(
  claim: string,
  maxResults: number
): Promise<ClaimSearchEvidence> {
  const apiKey = resolveTavilyApiKey()
  const query = normalizeClaimQuery(claim)
  if (!query) return { claim: '', results: [] }
  const timeoutMs = Math.max(3_000, Number(process.env.TAVILY_TIMEOUT_MS ?? DEFAULT_TAVILY_TIMEOUT_MS))
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(TAVILY_SEARCH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        topic: 'general',
        search_depth: 'advanced',
        max_results: Math.max(1, Math.min(8, maxResults)),
        include_answer: false,
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Tavily request timed out after ${timeoutMs}ms`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Tavily search error ${res.status}: ${err}`)
  }

  const data: TavilySearchResponse = await res.json()
  const results = Array.isArray(data.results) ? data.results : []

  return {
    claim: query,
    results: results
      .map((item) => {
        if (!item.url || !item.title) return null
        try {
          const parsedUrl = new URL(item.url)
          return {
            title: item.title.trim(),
            url: parsedUrl.toString(),
            source: parsedUrl.hostname,
            snippet: (item.content ?? '').replace(/\s+/g, ' ').trim().slice(0, 400),
            score: typeof item.score === 'number' ? item.score : undefined,
          }
        } catch {
          return null
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
  }
}

export async function searchClaimsWithTavily(
  claims: string[],
  maxResultsPerClaim = 3
): Promise<ClaimSearchEvidence[]> {
  if (!claims.length) return []
  const work = claims
    .map((claim) => claim.trim())
    .filter((claim) => claim.length > 0)
    .slice(0, Math.max(1, Number(process.env.CLAIM_CHECK_MAX_CLAIMS ?? 3)))

  const settled = await Promise.allSettled(
    work.map((claim) => searchClaimWithTavily(claim, maxResultsPerClaim))
  )
  return settled
    .flatMap((item) => (item.status === 'fulfilled' ? [item.value] : []))
    .filter((item) => item.claim.length > 0)
}
