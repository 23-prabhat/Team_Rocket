# Veritron

Veritron is a multilingual misinformation detection platform built for the MIT Build for Bharat problem statement on fake or misleading content in regional Indian languages.

It lets users verify content through three interfaces:

- Web app
- Chrome extension
- WhatsApp bot

The current implementation supports English, Hindi, and Marathi, and focuses on explainable results instead of a raw binary label. Each analysis returns a verdict, risk score, reasoning signals, corroboration context, timeline cues, and next-step checks.

## Problem We Are Solving

Fake news spreads quickly in regional-language ecosystems, especially when users receive content as forwarded messages, screenshots, or article links with little context. Most users do not need just a classifier. They need:

- A plain-language explanation
- A trust signal for the source
- Evidence from other sources
- Actionable steps before resharing

Veritron is designed around that workflow.

## What The Product Does

Users can submit content as:

- Plain text
- A news/article URL
- A PDF or TXT document
- An image containing text
- A webpage currently open in the browser extension
- A WhatsApp message containing a URL or image

Veritron then:

1. Extracts readable text from the input.
2. Pulls out the most important factual claims.
3. Uses Tavily to search the web for corroborating or contradictory evidence.
4. Scores the source with lightweight domain heuristics.
5. Sends the content plus external evidence into the LLM analysis pipeline.
6. Returns an explainable misinformation assessment in the user’s selected language.

## Tech Stack

### Web app

- Next.js `16.2.3`
- React `19.2.4`
- TypeScript
- Tailwind CSS `4`
- Framer Motion

### AI and analysis

- Groq chat models for claim extraction, verdict generation, OCR-style image understanding, and follow-up chat
- Optional NVIDIA-hosted Mistral fallback for text generation
- Tavily Search API for live claim corroboration

### Integrations

- Twilio WhatsApp API for chatbot delivery
- Chrome Extension APIs for page analysis in-browser
- `pdf-parse` for PDF text extraction

### UX features

- Multilingual UI and outputs
- Read-aloud support in the extension and web experience
- Explainable verdicts with evidence and quiz prompts

## Why Tavily Matters

Tavily is a core part of the fact-checking workflow in this project.

A language model alone can summarize and reason, but misinformation detection is much stronger when the system can compare a claim against current web evidence. That is where Tavily is important.

In Veritron, Tavily is used to:

- Search the web for each extracted factual claim
- Return supporting or contradictory results from external sources
- Provide snippets that help the final analysis reason about corroboration
- Reduce the chance of giving a verdict based only on the submitted text

### How we use Tavily in code

- `src/lib/analyze.ts` extracts key claims from the input text
- `src/lib/tavily.ts` runs Tavily searches for those claims
- Tavily results are flattened into corroboration matches
- `src/lib/prompts.ts` injects that evidence into the final analysis prompt
- The final response includes a `corroboration` block summarizing whether outside sources support, contradict, or do not sufficiently verify the claim

### Why that matters for misinformation detection

This project is not just trying to classify tone or sensational language. It is trying to answer a harder question: "Does this claim hold up when compared with what other sources are reporting?" Tavily gives the system a retrieval layer for that step.

## High-Level Architecture

```text
User Input
  -> Web app / Chrome extension / WhatsApp
  -> Input normalization and text extraction
  -> Claim extraction
  -> Tavily web search for corroboration
  -> Source reliability heuristics
  -> LLM verdict generation
  -> Structured analysis response
  -> User-facing explanation in selected language
```

### Main application layers

#### 1. Interface layer

- `src/app/page.tsx` - landing page and upload entry flow
- `src/app/analyze/page.tsx` - rich analysis results UI
- `extension/src/*` - Chrome extension popup, background script, and content script
- `src/app/api/whatsapp/route.ts` - WhatsApp bot webhook

#### 2. API layer

- `src/app/api/analyze/route.ts` - main misinformation analysis endpoint
- `src/app/api/upload/route.ts` - PDF, TXT, and image text extraction
- `src/app/api/chat/route.ts` - follow-up chatbot for a completed analysis
- `src/app/api/whatsapp/route.ts` - Twilio webhook handler

#### 3. Analysis layer

- `src/lib/analyze.ts` - core pipeline orchestration
- `src/lib/prompts.ts` - prompt construction for claim extraction and verdict analysis
- `src/lib/gemini.ts` - LLM provider wrapper for Groq and NVIDIA
- `src/lib/tavily.ts` - Tavily search integration
- `src/lib/source-signals.ts` - source reliability heuristics

#### 4. Extraction layer

- `src/lib/url.ts` - article text extraction from URLs
- `src/lib/pdf.ts` - PDF and TXT extraction
- `src/lib/image.ts` - image text extraction via vision model

## Data Flow

### 1. Web app flow

1. User uploads a file, pastes text, or submits a URL.
2. If needed, `/api/upload` converts the file into text.
3. `/api/analyze` decides whether it is analyzing raw text or fetching article text from a URL.
4. The server extracts key claims from the content.
5. Each claim is searched with Tavily.
6. Source reliability is scored if a URL is available.
7. All of that context is sent into the final LLM prompt.
8. The response is parsed into a typed `Analysis` object.
9. The UI renders verdict, risk score, evidence, timeline, corroboration, and recommended checks.

### 2. Chrome extension flow

1. The content script extracts the most relevant article text from the open page.
2. The background script sends that text to the Next.js `/api/analyze` endpoint.
3. The backend runs the same shared analysis pipeline as the web app.
4. The result is cached in extension session storage and shown in the popup/sidebar.

### 3. WhatsApp flow

1. A user sends a URL or image to the Twilio WhatsApp number.
2. The webhook asks for an output language if one was not included.
3. The backend extracts text from the URL or image.
4. The same analysis pipeline runs on the server.
5. A shortened WhatsApp-friendly explanation is sent back with verdict, confidence, reasoning, and next step.

## Repository Structure

```text
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── analyze/
│   │   └── page.tsx
│   ├── components/
│   ├── contexts/
│   └── lib/
├── extension/
│   ├── src/
│   ├── manifest.json
│   └── vite.config.ts
├── public/
├── problemstatement.txt
└── README.md
```

## Local Setup

### Prerequisites

- Node.js `20+` recommended
- `pnpm`
- A Groq API key or NVIDIA Mistral API key
- A Tavily API key
- Twilio credentials if you want the WhatsApp bot

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd hack-for-impact
```

### 2. Install dependencies

For the web app:

```bash
pnpm install
```

For the Chrome extension:

```bash
cd extension
pnpm install
cd ..
```

### 3. Configure environment variables

Create a local `.env` file in the project root and define the variables you need:

```bash
GROQ_API_KEY=your_groq_key
NVIDIA_MISTRAL_API_KEY=your_nvidia_key_optional
TAVILY_API_KEY=your_tavily_key

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
WEBHOOK_URL=https://your-public-webhook-url

GROQ_VERDICT_MODEL=llama-3.3-70b-versatile
GROQ_CLAIMS_MODEL=llama-3.1-8b-instant
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
CLAIM_CHECK_MAX_CLAIMS=3
TAVILY_RESULTS_PER_CLAIM=2
```

Notes:

- `TAVILY_API_KEY` can also be provided as `TAVILY`
- `GROQ_API_KEY` can also be provided as `GROQ` or `GROQ_KEY`
- If `NVIDIA_MISTRAL_API_KEY` is present, the app prefers NVIDIA for text generation
- WhatsApp is optional for local web-only usage

### 4. Run the web app

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Running The Chrome Extension

The extension is a separate Vite app inside `extension/`.

### 1. Set the API URL

Create `extension/.env`:

```bash
VITE_API_URL=http://localhost:3000
```

### 2. Build the extension

```bash
cd extension
pnpm build
```

### 3. Load it in Chrome

1. Open `chrome://extensions`
2. Turn on Developer Mode
3. Click "Load unpacked"
4. Select the `extension/dist` folder

The extension will then send extracted article text to the local Next.js backend.

## Running The WhatsApp Bot

To use the WhatsApp flow:

1. Start the Next.js app locally or deploy it
2. Expose the server with a public URL such as ngrok
3. Point your Twilio WhatsApp webhook to:

```text
/api/whatsapp
```

4. Send a message containing:

- A URL
- Or an image
- Optionally prefixed with `EN`, `HI`, or `MR`

Example:

```text
HI https://example.com/article
```

## API Endpoints

### `POST /api/analyze`

Main analysis endpoint for text and URLs.

Expected input:

```json
{
  "text": "content to analyze",
  "url": "https://example.com/article",
  "language": "en",
  "readingLevel": "simple",
  "source": "web"
}
```

### `POST /api/upload`

Accepts:

- PDF
- TXT
- PNG
- JPG / JPEG
- WEBP

Returns extracted text for later analysis.

### `POST /api/chat`

Follow-up assistant for asking questions about an existing analysis result.

### `POST /api/whatsapp`

Twilio webhook endpoint for WhatsApp-based analysis.

## Analysis Output Shape

The backend returns a structured `Analysis` object with fields such as:

- `summary`
- `riskScore`
- `riskLevel`
- `verdict`
- `confidence`
- `hiddenClauses`
- `evidence`
- `timeline`
- `corroboration`
- `quiz`
- `sourceReliability`

This structure is shared across the web app, extension, and WhatsApp formatter.

## Current Language Support

- English
- Hindi
- Marathi

The product goal is broader regional-language misinformation support, but this repository currently implements these three languages in the analysis and interface layers.

## Important Design Decisions

### Explainability over binary classification

Instead of only saying "fake" or "real," the system explains why the result was produced and what the user should verify next.

### Retrieval-backed analysis

Tavily provides live corroboration signals so the model is not forced to rely only on the submitted content.

### Shared backend, multiple frontends

The web app, extension, and WhatsApp bot all use the same backend analysis pipeline. That keeps verdict logic centralized and easier to improve.

### Source heuristics plus external search

The project combines:

- Domain trust heuristics
- Claim-level Tavily search
- LLM reasoning

That layered approach is stronger than any one of those techniques on its own.

## Known Gaps / Next Improvements

Based on the current codebase and TODOs, the next useful improvements are:

- Stronger misinformation prompts for regional languages
- Better URL, image, and WhatsApp ingestion coverage
- Evaluation with benchmark datasets
- More robust source ranking and corroboration scoring
- Production-ready persistence instead of in-memory WhatsApp pending state

## Team Context

This project was built for:

- MIT Build for Bharat
- Problem Statement 3: Misinformation Detection in Regional Languages

Team: `Team_Rocket`

## Notes For Contributors

- Keep secrets out of the repository and use local environment files
- If you change the analysis schema, update all three surfaces: web, extension, and WhatsApp formatting
- If you change prompts or Tavily evidence shape, review `src/lib/analyze.ts`, `src/lib/prompts.ts`, and `src/lib/tavily.ts` together

