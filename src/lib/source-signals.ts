import type { CorroborationMatch, SourceReliability } from './types'

const TRUSTED_DOMAINS = [
  'reuters.com',
  'apnews.com',
  'bbc.com',
  'thehindu.com',
  'indianexpress.com',
  'ndtv.com',
  'thewire.in',
  'who.int',
  'un.org',
  'gov.in',
]

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.buzz', '.win', '.loan']

function decodeEntities(input: string): string {
  return input
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hostMatches(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`)
}

export function assessSourceReliability(sourceUrl: string): SourceReliability {
  const { hostname } = new URL(sourceUrl)
  let score = 55
  const reasons: string[] = []

  if (TRUSTED_DOMAINS.some((d) => hostMatches(hostname, d))) {
    score += 28
    reasons.push('Domain appears in common reputable news/public information sources.')
  }

  if (SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld))) {
    score -= 20
    reasons.push('Domain uses a TLD often associated with low-credibility sites.')
  }

  if ((hostname.match(/-/g) ?? []).length >= 3) {
    score -= 10
    reasons.push('Domain has unusual structure (many hyphens), which can indicate spoofing.')
  }

  if (/\d{3,}/.test(hostname)) {
    score -= 8
    reasons.push('Domain includes long numeric patterns, a common spam signal.')
  }

  if (hostMatches(hostname, 'gov.in') || hostMatches(hostname, 'nic.in')) {
    score += 18
    reasons.push('Government domain pattern detected.')
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  let level: SourceReliability['level'] = 'mixed'
  if (score >= 75) level = 'trusted'
  else if (score <= 35) level = 'suspicious'

  if (reasons.length === 0) {
    reasons.push('Domain does not strongly match trusted or suspicious heuristics.')
  }

  return { score, level, reasons: reasons.slice(0, 3) }
}

function bestSearchQuery(input: string): string {
  const cleaned = input.replace(/\s+/g, ' ').trim()
  return cleaned.split(' ').slice(0, 14).join(' ')
}

export async function fetchCorroborationMatches(input: string): Promise<CorroborationMatch[]> {
  const q = bestSearchQuery(input)
  if (!q) return []

  const response = await fetch(`https://duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; VeritronBot/1.0)',
      Accept: 'text/html,application/xhtml+xml',
    },
  })

  if (!response.ok) return []
  const html = await response.text()
  if (!html) return []

  const linkRegex =
    /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
  const snippetRegex =
    /<a[^>]*class="[^"]*result__a[^"]*"[\s\S]*?<\/a>[\s\S]*?<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/gi

  const links: Array<{ url: string; title: string }> = []
  for (const match of html.matchAll(linkRegex)) {
    const url = decodeEntities(match[1] ?? '')
    const title = decodeEntities(match[2] ?? '')
    if (!url || !title) continue
    try {
      const u = new URL(url)
      links.push({ url: u.toString(), title })
    } catch {
      continue
    }
    if (links.length >= 6) break
  }

  const snippets = Array.from(html.matchAll(snippetRegex)).map((m) => decodeEntities(m[1] ?? ''))

  return links.map((item, i) => {
    const domain = new URL(item.url).hostname
    return {
      title: item.title,
      url: item.url,
      source: domain,
      snippet: snippets[i] ?? '',
    }
  })
}
