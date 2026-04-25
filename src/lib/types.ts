export interface Clause {
  text: string
  explanation: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
}

export interface EvidencePoint {
  claim: string
  finding: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
}

export interface SourceReliability {
  score: number
  level: 'trusted' | 'mixed' | 'suspicious'
  reasons: string[]
}

export interface CorroborationMatch {
  title: string
  url: string
  source: string
  snippet: string
}

export interface CorroborationSummary {
  consensus: 'supports' | 'mixed' | 'contradicts' | 'insufficient'
  score: number
  summary: string
  matches: CorroborationMatch[]
}

export interface TimelineSignal {
  publishedAt?: string
  eventDateHint?: string
  staleRisk: 'low' | 'medium' | 'high'
  notes: string[]
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
}

export interface Analysis {
  summary: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  verdict?: 'real' | 'fake' | 'uncertain'
  confidence?: number
  keyObligations: string[]
  hiddenClauses: Clause[]
  evidence: EvidencePoint[]
  sourceReliability?: SourceReliability
  corroboration?: CorroborationSummary
  timeline?: TimelineSignal
  quiz: QuizQuestion[]
  sourceUrl?: string
  sourceDomain?: string
  language: string
  auditId: string
  createdAt: string
}

export interface AnalysisSession {
  analysis: Analysis
  text: string
  readingLevel: NonNullable<AnalyzeRequest['readingLevel']>
}

export interface AnalyzeRequest {
  text?: string
  url?: string
  sourceUrl?: string
  sourceDomain?: string
  sourceTitle?: string
  sourceDescription?: string
  sourceReliability?: SourceReliability
  corroborationMatches?: CorroborationMatch[]
  language?: string
  readingLevel?: 'eli5' | 'simple' | 'standard' | 'expert'
  source?: 'web' | 'extension' | 'bot'
}
