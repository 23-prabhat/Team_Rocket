import pdfParse from 'pdf-parse'

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer)
  if (data.text && data.text.trim().length >= 50) {
    return data.text.trim()
  }
  throw new Error('No extractable text found. Please upload a selectable-text PDF.')
}

export function extractTextFromTXT(buffer: Buffer): string {
  return buffer.toString('utf8').trim()
}
