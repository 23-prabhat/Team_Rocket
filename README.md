# ConsentIQ — Understand Before You Sign

> Built at MIT Hack for Impact 2026

Many users with low literacy, language barriers, or limited digital familiarity are required to approve financial actions — loans, mandates, recurring payments, insurance terms — without fully understanding what they're agreeing to. Consent is captured digitally but not meaningfully understood.

**ConsentIQ** transforms how intent, obligations, and risk are communicated *before* someone clicks "I Agree".

Live demo: **https://t07-jo-jo.vercel.app**

---

## What It Does

Upload or send any legal/financial document — a PDF, a terms-of-service page, a loan agreement — and ConsentIQ will:

- Score the document's risk level (0–100)
- Rewrite it in plain language at your chosen reading level
- Flag hidden or dangerous clauses with explanations
- List exactly what you're agreeing to
- Quiz you on the key points before letting you consent

---

## Three Products, One AI Backend

| Product | Channel | How to use |
|---|---|---|
| **Web App** | Browser | Upload a PDF or paste text, get a full risk report |
| **Browser Extension** | Chrome | Analyze any T&C page in real time without leaving the site |
| **WhatsApp Bot** | WhatsApp (Twilio) | Send a PDF to the bot, get a risk summary back |

All three share the same AI analysis pipeline powered by **Groq (Llama 3.3 70B)**.

---

## Product 1: Web App

**URL:** https://t07-jo-jo.vercel.app

### Features

**Upload & Analyze**
- Drag-and-drop or click to upload a `.pdf` or `.txt` file
- Paste text directly into the upload zone
- Select output language: English, Hindi, Marathi
- Select reading level: ELI5 / Simple / Standard / Expert

**Risk Meter**
- Animated gauge from 0–100
- Color-coded: green (low) → yellow (medium) → orange (high) → red (critical)

**Plain Language Summary**
- 2–3 sentence rewrite of the document in your chosen language and reading level

**Flagged Clauses**
- Cards for each risky or unusual clause
- Shows original text, plain-language explanation, severity badge, and category (e.g. Auto-renewal, Data sharing, Arbitration)

**Key Obligations**
- Bullet list of exactly what you're committing to

**Comprehension Quiz**
- 3 multiple-choice questions generated from the document
- "I Understand" consent button stays locked until you answer at least 2/3 correctly

**Session Activity Log**
- Timestamped timeline of: Uploaded → Analyzed → Quiz Passed → Confirmed

---

## Product 2: Browser Extension

The Chrome extension lets you analyze any webpage's terms and conditions without leaving the page.

### How it works
1. Click the extension icon on any page with legal/T&C text
2. The content script extracts the relevant legal text from the page
3. The result appears in a sidebar injected into the page — risk score, summary, flagged clauses

### Build locally
```bash
cd extension
pnpm install
pnpm build
```
Then go to `chrome://extensions` → Enable Developer Mode → Load Unpacked → select `extension/dist/`.

---

## Product 3: WhatsApp Bot

Send a PDF to the bot on WhatsApp and get an instant risk analysis — no app download needed.

### How to use
1. Send `join <sandbox-keyword>` to **+1 415 523 8886** on WhatsApp to join the Twilio sandbox
2. Send any selectable-text PDF
3. Receive a reply with risk level, summary, warnings, and key obligations

### Example reply
```
🔴 Risk: HIGH (72/100)

This agreement auto-renews annually and shares your data with third parties.
Cancellation requires 30 days written notice.

⚠️ Watch out for:
• Auto-renewal: You will be charged yearly unless you cancel in writing
• Data sharing: Your information is sold to marketing partners

Key obligations:
• Pay monthly fees on time
• Provide 30 days written notice to cancel
• Allow data sharing with third parties
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, React 19, TypeScript) |
| AI | Groq API — Llama 3.3 70B Versatile |
| PDF Extraction | pdf-parse (server-side, selectable-text PDFs) |
| WhatsApp | Twilio Sandbox |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI, Phosphor Icons |
| Animations | Framer Motion |
| Package Manager | pnpm |
| Deployment | Vercel |

---

## API Reference

### `POST /api/upload`
Accepts a multipart form upload (`file` field). Supports `.pdf` and `.txt`.
Returns `{ text: string }` — extracted plain text.

### `POST /api/analyze`
Accepts JSON `{ text, language?, readingLevel?, source? }`.
Returns a full `Analysis` object:
```json
{
  "summary": "...",
  "riskScore": 72,
  "riskLevel": "high",
  "keyObligations": ["..."],
  "hiddenClauses": [{ "text": "...", "explanation": "...", "severity": "high", "category": "..." }],
  "quiz": [{ "question": "...", "options": ["A","B","C","D"], "correctIndex": 2 }],
  "language": "en",
  "auditId": "uuid",
  "createdAt": "2026-04-11T10:00:00Z"
}
```

### `POST /api/whatsapp`
Twilio webhook. Accepts PDF media messages, returns analysis as a WhatsApp reply.

---

## Running Locally

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in GROQ_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```bash
# Required
GROQ_API_KEY=                   # Groq API key

# WhatsApp bot (Twilio Sandbox)
TWILIO_ACCOUNT_SID=             # From Twilio console
TWILIO_AUTH_TOKEN=              # From Twilio console
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Extension (set in extension/.env)
VITE_API_URL=https://t07-jo-jo.vercel.app
```

---

## Deployment

The app is deployed on Vercel. To deploy your own instance:

1. Push to GitHub and connect the repo to Vercel
2. Add all environment variables in the Vercel dashboard
3. Set the Twilio Sandbox webhook to `https://your-vercel-url.vercel.app/api/whatsapp`

---

## Limitations (Demo Scope)

- PDF extraction requires selectable/copyable text — scanned image PDFs are not supported
- WhatsApp bot is on the Twilio Sandbox — users must join with a keyword before messaging
- Session activity log is client-side only — not a durable audit record
