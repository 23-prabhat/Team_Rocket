export interface UrlExtractionResult {
  finalUrl: string
  domain: string
  title: string
  description: string
  text: string
}

const MAX_TEXT_CHARS = 9000

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

function stripTags(input: string): string {
  return decodeEntities(input.replace(/<[^>]+>/g, ' '))
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim()
}

function extractMeta(html: string, name: string): string {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    'i'
  )
  return normalizeWhitespace(stripTags(html.match(re)?.[1] ?? ''))
}

function extractBodyText(html: string): string {
  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')

  const articleMatch = withoutNoise.match(/<article[\s\S]*?<\/article>/i)
  const mainMatch = withoutNoise.match(/<main[\s\S]*?<\/main>/i)
  const root = articleMatch?.[0] ?? mainMatch?.[0] ?? withoutNoise

  const chunkMatches = root.match(/<(p|li|h1|h2|h3|blockquote)[^>]*>[\s\S]*?<\/\1>/gi) ?? []
  const chunks = chunkMatches
    .map((chunk) => normalizeWhitespace(stripTags(chunk)))
    .filter((line) => line.length >= 40)

  if (chunks.length === 0) {
    return normalizeWhitespace(stripTags(root)).slice(0, MAX_TEXT_CHARS)
  }

  return chunks.join('\n').slice(0, MAX_TEXT_CHARS)
}

export async function extractTextFromUrl(rawUrl: string): Promise<UrlExtractionResult> {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error('Invalid URL. Please include http:// or https://')
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http/https URLs are supported.')
  }

  const response = await fetch(parsed.toString(), {
    redirect: 'follow',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; VeritronBot/1.0; +https://veritron.local)',
      Accept: 'text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.5',
    },
  })

  if (!response.ok) {
    throw new Error(`Could not fetch URL (${response.status}).`)
  }

  const finalUrl = response.url || parsed.toString()
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  const body = await response.text()
  if (!body || body.trim().length < 100) {
    throw new Error('This URL did not contain enough readable content.')
  }

  const urlObj = new URL(finalUrl)

  if (contentType.includes('text/plain')) {
    return {
      finalUrl,
      domain: urlObj.hostname,
      title: '',
      description: '',
      text: body.slice(0, MAX_TEXT_CHARS),
    }
  }

  const title = normalizeWhitespace(stripTags(body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''))
  const description =
    extractMeta(body, 'description') ||
    extractMeta(body, 'og:description') ||
    extractMeta(body, 'twitter:description')
  const text = extractBodyText(body)

  if (text.trim().length < 200) {
    throw new Error('Could not extract enough article text from this URL.')
  }

  return {
    finalUrl,
    domain: urlObj.hostname,
    title,
    description,
    text,
  }
}
