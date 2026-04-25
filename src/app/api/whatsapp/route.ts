import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export const runtime = 'nodejs'
import { analyze } from '@/lib/analyze'
import { extractTextFromImage } from '@/lib/image'
import { extractTextFromUrl } from '@/lib/url'
import { assessSourceReliability } from '@/lib/source-signals'
import type { Analysis } from '@/lib/types'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const from = process.env.TWILIO_WHATSAPP_NUMBER ?? 'whatsapp:+14155238886'
const PENDING_TTL_MS = 15 * 60 * 1000

type LangChoice = 'en' | 'hi' | 'mr'
type PendingPayload = {
  createdAt: number
  url?: string
  mediaUrl?: string
  mediaContentType?: string
}

const pendingByUser = new Map<string, PendingPayload>()

const VERDICT_LABELS: Record<LangChoice, Record<NonNullable<Analysis['verdict']>, string>> = {
  en: { real: 'Likely Real', fake: 'Likely Fake', uncertain: 'Needs Verification' },
  hi: { real: 'संभवतः सही', fake: 'संभवतः फर्जी', uncertain: 'अधिक जाँच आवश्यक' },
  mr: { real: 'बहुधा खरे', fake: 'बहुधा खोटे', uncertain: 'अधिक पडताळणी हवी' },
}

const TEXTS: Record<
  LangChoice,
  {
    waiting: string
    unsupportedMedia: string
    chooseLanguage: string
    prompt: string
    summary: string
    reasoning: string
    sourceCheck: string
    nextStep: string
    noReasoning: string
    noCrossCheck: string
    noNextStep: string
    confidence: string
    sourceReliability: string
    timeline: string
    alsoReportedBy: string
    failed: string
  }
> = {
  en: {
    waiting: 'Analyzing now. This can take around 20-60 seconds.',
    unsupportedMedia: 'Please send a news URL or an image (PNG/JPG/JPEG/WEBP).',
    chooseLanguage:
      'Choose output language by replying with one option:\nEN = English\nHI = Hindi\nMR = Marathi',
    prompt:
      'Send a news URL or photo. Add language in the same message if you want:\nEN <url>\nHI <url>\nMR <url>',
    summary: 'Plain-language summary',
    reasoning: 'Why this result',
    sourceCheck: 'Source and cross-check',
    nextStep: 'Best next step',
    noReasoning: 'No strong reasoning signals were extracted from the content.',
    noCrossCheck: 'Not enough source or cross-source information was available.',
    noNextStep: 'Compare this claim with at least one trusted independent source.',
    confidence: 'Confidence',
    sourceReliability: 'Source reliability',
    timeline: 'Timeline',
    alsoReportedBy: 'Also reported by',
    failed: 'Sorry, I could not analyze this input.',
  },
  hi: {
    waiting: 'विश्लेषण शुरू है। इसमें लगभग 20-60 सेकंड लग सकते हैं।',
    unsupportedMedia: 'कृपया समाचार URL या इमेज (PNG/JPG/JPEG/WEBP) भेजें।',
    chooseLanguage:
      'आउटपुट भाषा चुनने के लिए उत्तर दें:\nEN = English\nHI = Hindi\nMR = Marathi',
    prompt:
      'समाचार URL या फोटो भेजें। चाहें तो उसी संदेश में भाषा जोड़ें:\nEN <url>\nHI <url>\nMR <url>',
    summary: 'सरल सार',
    reasoning: 'यह निष्कर्ष क्यों आया',
    sourceCheck: 'स्रोत और क्रॉस-जाँच',
    nextStep: 'सबसे अच्छा अगला कदम',
    noReasoning: 'सामग्री से कोई मजबूत कारण-संकेत स्पष्ट नहीं निकले।',
    noCrossCheck: 'पर्याप्त स्रोत या क्रॉस-सोर्स जानकारी उपलब्ध नहीं थी।',
    noNextStep: 'इस दावे को कम-से-कम एक विश्वसनीय स्वतंत्र स्रोत से मिलाइए।',
    confidence: 'विश्वास स्तर',
    sourceReliability: 'स्रोत विश्वसनीयता',
    timeline: 'समय-संदर्भ',
    alsoReportedBy: 'इन स्रोतों ने भी रिपोर्ट किया',
    failed: 'माफ़ कीजिए, मैं इस इनपुट का विश्लेषण नहीं कर सका।',
  },
  mr: {
    waiting: 'विश्लेषण सुरू आहे. यासाठी साधारण 20-60 सेकंद लागू शकतात.',
    unsupportedMedia: 'कृपया बातमीची URL किंवा इमेज (PNG/JPG/JPEG/WEBP) पाठवा.',
    chooseLanguage:
      'आउटपुट भाषा निवडण्यासाठी उत्तर द्या:\nEN = English\nHI = Hindi\nMR = Marathi',
    prompt:
      'बातमीची URL किंवा फोटो पाठवा. हवे असल्यास त्याच मेसेजमध्ये भाषा द्या:\nEN <url>\nHI <url>\nMR <url>',
    summary: 'सोपा सारांश',
    reasoning: 'हा निकाल का आला',
    sourceCheck: 'स्रोत आणि क्रॉस-पडताळणी',
    nextStep: 'सर्वात चांगले पुढचे पाऊल',
    noReasoning: 'मजकुरातून ठोस कारण-संकेत स्पष्टपणे मिळाले नाहीत.',
    noCrossCheck: 'पुरेशी स्रोत किंवा क्रॉस-सोर्स माहिती उपलब्ध नव्हती.',
    noNextStep: 'हा दावा किमान एका विश्वासार्ह स्वतंत्र स्रोताशी तपासा.',
    confidence: 'विश्वास पातळी',
    sourceReliability: 'स्रोत विश्वासार्हता',
    timeline: 'वेळ संदर्भ',
    alsoReportedBy: 'यांनीही ही बातमी दिली',
    failed: 'क्षमस्व, या इनपुटचे विश्लेषण करता आले नाही.',
  },
}

function riskEmoji(level: string): string {
  if (level === 'low') return '🟢'
  if (level === 'medium') return '🟡'
  if (level === 'high') return '🔴'
  return '🚨'
}

function extractFirstUrl(input: string): string | null {
  const match = input.match(/https?:\/\/[^\s]+/i)
  return match?.[0] ?? null
}

function parseLanguageChoice(input: string): LangChoice | null {
  const withoutUrls = input.replace(/https?:\/\/[^\s]+/gi, ' ')
  const normalized = withoutUrls.trim().toLowerCase()
  if (!normalized) return null
  if (/^(en|english)\b/.test(normalized) || /\b(en|english)\b/.test(normalized)) return 'en'
  if (/^(hi|hindi)\b/.test(normalized) || /\b(hi|hindi)\b/.test(normalized)) return 'hi'
  if (/^(mr|marathi)\b/.test(normalized) || /\b(mr|marathi)\b/.test(normalized)) return 'mr'
  return null
}

function cleanExpiredPending() {
  const now = Date.now()
  for (const [key, value] of pendingByUser.entries()) {
    if (now - value.createdAt > PENDING_TTL_MS) {
      pendingByUser.delete(key)
    }
  }
}

function toSafeMessage(text: string, max = 1500): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 3)}...`
}

function formatReasoning(analysis: Awaited<ReturnType<typeof analyze>>, t: (typeof TEXTS)[LangChoice]) {
  const reasons = analysis.hiddenClauses.length
    ? analysis.hiddenClauses.slice(0, 2).map((c) => `• ${c.explanation}`)
    : analysis.evidence.slice(0, 2).map((e) => `• ${e.finding}`)

  return reasons.length ? reasons.join('\n') : `• ${t.noReasoning}`
}

function formatSourceCheck(analysis: Awaited<ReturnType<typeof analyze>>, t: (typeof TEXTS)[LangChoice]) {
  const lines: string[] = []

  if (analysis.sourceReliability) {
    lines.push(
      `• ${t.sourceReliability}: ${analysis.sourceReliability.level} (${analysis.sourceReliability.score}/100)`
    )
  }

  if (analysis.corroboration) {
    lines.push(`• ${analysis.corroboration.summary}`)
    const matches = analysis.corroboration.matches
      .slice(0, 2)
      .map((m) => `• ${t.alsoReportedBy}: ${m.source}`)
    lines.push(...matches)
  }

  if (analysis.timeline?.notes?.[0]) {
    lines.push(`• ${t.timeline}: ${analysis.timeline.notes[0]}`)
  }

  return lines.length ? lines.join('\n') : `• ${t.noCrossCheck}`
}

function formatNextStep(analysis: Awaited<ReturnType<typeof analyze>>, t: (typeof TEXTS)[LangChoice]) {
  return analysis.keyObligations[0] ? `• ${analysis.keyObligations[0]}` : `• ${t.noNextStep}`
}

function formatReply(analysis: Awaited<ReturnType<typeof analyze>>, lang: LangChoice): string {
  const t = TEXTS[lang]
  const verdict = analysis.verdict ?? 'uncertain'
  const verdictLabel = VERDICT_LABELS[lang][verdict]
  const emoji = riskEmoji(analysis.riskLevel)

  return toSafeMessage(`${emoji} ${verdictLabel}
Risk: ${analysis.riskScore}/100 | ${t.confidence}: ${analysis.confidence ?? 0}%

${t.summary}:
${analysis.summary}

${t.reasoning}:
${formatReasoning(analysis, t)}

${t.sourceCheck}:
${formatSourceCheck(analysis, t)}

${t.nextStep}:
${formatNextStep(analysis, t)}`)
}

async function analyzeUrl(url: string, language: LangChoice): Promise<Awaited<ReturnType<typeof analyze>>> {
  const extracted = await extractTextFromUrl(url)
  const sourceReliability = assessSourceReliability(extracted.finalUrl)
  return analyze({
    text: extracted.text,
    sourceUrl: extracted.finalUrl,
    sourceDomain: extracted.domain,
    sourceTitle: extracted.title,
    sourceDescription: extracted.description,
    sourceReliability,
    source: 'bot',
    language,
    readingLevel: 'simple',
  })
}

async function analyzeImage(
  mediaUrl: string,
  mediaContentType: string,
  authHeader: string,
  language: LangChoice
): Promise<Awaited<ReturnType<typeof analyze>>> {
  if (!mediaContentType.toLowerCase().startsWith('image/')) {
    throw new Error('Unsupported media type. Please send an image.')
  }
  const mediaRes = await fetch(mediaUrl, { headers: { Authorization: authHeader } })
  if (!mediaRes.ok) throw new Error(`Failed to download image: ${mediaRes.status}`)
  const buffer = Buffer.from(await mediaRes.arrayBuffer())
  const imageText = await extractTextFromImage(buffer, mediaContentType)
  return analyze({
    text: imageText.text,
    source: 'bot',
    language,
    readingLevel: 'simple',
  })
}

export async function POST(req: NextRequest) {
  cleanExpiredPending()

  const body = await req.text()
  const params = new URLSearchParams(body)

  const numMedia = parseInt(params.get('NumMedia') ?? '0', 10)
  const sender = params.get('From') ?? ''
  const incomingText = (params.get('Body') ?? '').trim()
  const requestedLang = parseLanguageChoice(incomingText)
  const providedUrl = extractFirstUrl(incomingText)
  const mediaUrl = params.get('MediaUrl0') ?? ''
  const mediaContentType = params.get('MediaContentType0') ?? ''
  const client = twilio(accountSid, authToken)
  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  async function reply(text: string) {
    await client.messages.create({ from, to: sender, body: text })
  }

  const hasNewInput = Boolean(providedUrl || (numMedia > 0 && mediaUrl))
  const pending = pendingByUser.get(sender)

  if (!hasNewInput && !requestedLang && !pending) {
    await reply(TEXTS.en.prompt)
    return NextResponse.json({ ok: true })
  }

  let lang: LangChoice = requestedLang ?? 'en'
  let payload: PendingPayload | null = null

  if (hasNewInput) {
    payload = {
      createdAt: Date.now(),
      url: providedUrl ?? undefined,
      mediaUrl: numMedia > 0 ? mediaUrl : undefined,
      mediaContentType: numMedia > 0 ? mediaContentType : undefined,
    }

    if (!requestedLang) {
      pendingByUser.set(sender, payload)
      await reply(TEXTS.en.chooseLanguage)
      return NextResponse.json({ ok: true })
    }
  } else if (requestedLang && pending) {
    lang = requestedLang
    payload = pending
    pendingByUser.delete(sender)
  }

  if (!payload) {
    await reply(TEXTS[lang].prompt)
    return NextResponse.json({ ok: true })
  }

  if (!payload.url && !payload.mediaUrl) {
    await reply(TEXTS[lang].prompt)
    return NextResponse.json({ ok: true })
  }

  await reply(TEXTS[lang].waiting)

  try {
    let result: Awaited<ReturnType<typeof analyze>>

    if (payload.url) {
      result = await analyzeUrl(payload.url, lang)
    } else if (payload.mediaUrl && payload.mediaContentType) {
      if (!payload.mediaContentType.toLowerCase().startsWith('image/')) {
        await reply(TEXTS[lang].unsupportedMedia)
        return NextResponse.json({ ok: true })
      }
      result = await analyzeImage(
        payload.mediaUrl,
        payload.mediaContentType,
        authHeader,
        lang
      )
    } else {
      await reply(TEXTS[lang].prompt)
      return NextResponse.json({ ok: true })
    }

    await reply(formatReply(result, lang))
  } catch (err) {
    console.error('WhatsApp bot error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    await reply(`${TEXTS[lang].failed}\n${msg}`)
  }

  return NextResponse.json({ ok: true })
}
