import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export const runtime = 'nodejs'
import { extractTextFromPDF } from '@/lib/pdf'
import { analyze } from '@/lib/analyze'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const from = process.env.TWILIO_WHATSAPP_NUMBER ?? 'whatsapp:+14155238886'

function riskEmoji(level: string): string {
  if (level === 'low') return '🟢'
  if (level === 'medium') return '🟡'
  if (level === 'high') return '🔴'
  return '🚨'
}

function formatReply(analysis: Awaited<ReturnType<typeof analyze>>): string {
  const emoji = riskEmoji(analysis.riskLevel)
  const warnings = analysis.hiddenClauses
    .slice(0, 2)
    .map((c) => `• ${c.category}: ${c.explanation}`)
    .join('\n')

  return `${emoji} Risk: ${analysis.riskLevel.toUpperCase()} (${analysis.riskScore}/100)

${analysis.summary}

⚠️ Watch out for:
${warnings || '• No major red flags found'}

Key obligations:
${analysis.keyObligations
  .slice(0, 3)
  .map((o) => `• ${o}`)
  .join('\n')}`
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const params = new URLSearchParams(body)

  const numMedia = parseInt(params.get('NumMedia') ?? '0', 10)
  const to = params.get('From') ?? ''
  const client = twilio(accountSid, authToken)

  async function reply(text: string) {
    await client.messages.create({ from, to, body: text })
  }

  // No media attached — prompt user
  if (numMedia === 0) {
    await reply(
      'Hi! Send me a PDF document and I will analyze it for hidden risks and obligations.'
    )
    return NextResponse.json({ ok: true })
  }

  const mediaUrl = params.get('MediaUrl0') ?? ''
  const contentType = params.get('MediaContentType0') ?? ''

  if (!contentType.includes('pdf')) {
    await reply('Please send a PDF file. Other file types are not supported yet.')
    return NextResponse.json({ ok: true })
  }

  await reply('Analyzing your document... this may take a few seconds.')

  try {
    // Download the PDF using Twilio authenticated fetch
    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const mediaRes = await fetch(mediaUrl, { headers: { Authorization: authHeader } })
    if (!mediaRes.ok) throw new Error(`Failed to download PDF: ${mediaRes.status}`)

    const buffer = Buffer.from(await mediaRes.arrayBuffer())
    const text = await extractTextFromPDF(buffer)

    const result = await analyze({ text, source: 'bot' })
    await reply(formatReply(result))
  } catch (err) {
    console.error('WhatsApp bot error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    await reply(`Sorry, I could not analyze that document. ${msg}`)
  }

  return NextResponse.json({ ok: true })
}
