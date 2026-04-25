import { NextRequest } from 'next/server'
import { analyze } from '@/lib/analyze'
import type { AnalyzeRequest } from '@/lib/types'
import { extractTextFromUrl } from '@/lib/url'
import { assessSourceReliability, fetchCorroborationMatches } from '@/lib/source-signals'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const rawText = typeof body.text === 'string' ? body.text.trim() : ''
    const rawUrl = typeof body.url === 'string' ? body.url.trim() : ''

    const looksLikeUrl = (value: string) => /^https?:\/\//i.test(value)

    let analysisInput: AnalyzeRequest

    if (rawUrl || looksLikeUrl(rawText)) {
      const targetUrl = rawUrl || rawText
      const extracted = await extractTextFromUrl(targetUrl)
      const sourceReliability = assessSourceReliability(extracted.finalUrl)
      const corroborationMatches = await fetchCorroborationMatches(
        extracted.title || extracted.description || extracted.text.slice(0, 220)
      )
      analysisInput = {
        ...body,
        text: extracted.text,
        sourceUrl: extracted.finalUrl,
        sourceDomain: extracted.domain,
        sourceTitle: extracted.title,
        sourceDescription: extracted.description,
        sourceReliability,
        corroborationMatches,
      }
    } else if (rawText.length >= 20) {
      analysisInput = {
        ...body,
        text: rawText,
      }
    } else {
      return Response.json(
        { error: 'Provide a valid URL or enough text to analyze.' },
        { status: 400 }
      )
    }

    const result = await analyze(analysisInput)
    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.'
    return Response.json({ error: message }, { status: 500 })
  }
}
