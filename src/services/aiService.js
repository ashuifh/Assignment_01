const MODEL = 'google/gemini-2.5-flash'
// Served by the api/openrouter.js serverless function on Vercel, and by the Vite
// dev-server proxy locally — the key never has to live in the client bundle.
const API_URL = '/api/openrouter'

function fileToDataUrl(file) {
  if (!file.type.startsWith('image/') || file.size < 2 * 1024 * 1024) return readFile(file)
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.naturalWidth * scale)
      canvas.height = Math.round(image.naturalHeight * scale)
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.78))
      URL.revokeObjectURL(image.src)
    }
    image.onerror = () => reject(new Error(`Could not process ${file.name}`))
    image.src = URL.createObjectURL(file)
  })
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
    reader.readAsDataURL(file)
  })
}

function parseJson(text) {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(cleaned)
}

const MIN_REGION = 0.004

// Models drift between 0..1 and 0..1000 coordinate spaces; detect the scale, then clamp into 0..1.
function normalizeRect(raw) {
  if (!raw || typeof raw !== 'object') return null
  let { x, y, width, height } = raw
  const values = [x, y, width, height].map(Number)
  if (!values.every((value) => Number.isFinite(value))) return null
  if (values.some((value) => value > 1.5)) {
    [x, y, width, height] = values.map((value) => value / 1000)
  } else {
    [x, y, width, height] = values
  }
  const left = Math.min(Math.max(x, 0), 1)
  const top = Math.min(Math.max(y, 0), 1)
  const rect = { x: left, y: top, width: Math.min(Math.max(width, 0), 1 - left), height: Math.min(Math.max(height, 0), 1 - top) }
  return rect.width < MIN_REGION || rect.height < MIN_REGION ? null : rect
}

function sanitizeSegments(lines) {
  return Array.isArray(lines) ? lines.map(normalizeRect).filter(Boolean) : []
}

function unionOfSegments(segments) {
  if (!segments.length) return null
  const right = Math.max(...segments.map((segment) => segment.x + segment.width))
  const bottom = Math.max(...segments.map((segment) => segment.y + segment.height))
  return {
    x: Math.min(...segments.map((segment) => segment.x)),
    y: Math.min(...segments.map((segment) => segment.y)),
    width: right - Math.min(...segments.map((segment) => segment.x)),
    height: bottom - Math.min(...segments.map((segment) => segment.y)),
  }
}

async function requestOpenRouter(apiKey, content, maxTokens = 4096) {
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`
  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content }], response_format: { type: 'json_object' }, temperature: 0.1, max_tokens: maxTokens, provider: { sort: 'throughput' } }),
  })
  if (!response.ok) {
    let message = response.status === 404
      ? 'OpenRouter endpoint not found (404). If deployed, make sure the api/openrouter function exists and OPENROUTER_API_KEY is set in the hosting dashboard.'
      : `OpenRouter request failed (${response.status}). Check the API key and uploaded files.`
    try {
      const errorPayload = await response.json()
      message = errorPayload.error?.message || message
    } catch {
      // Keep the status-based message when the API response is not JSON.
    }
    throw new Error(message)
  }
  const payload = await response.json()
  const text = payload.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenRouter returned no assessment data.')
  return parseJson(text)
}

export async function extractAssessment(questionPaper, answerSheet, onStep) {
  // Optional: only local development needs it (the Vite proxy forwards this header).
  // On Vercel the serverless function injects OPENROUTER_API_KEY server-side instead.
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  const notify = (msg) => { try { onStep?.(msg) } catch { /* ignore */ } }

  notify('Reading files…')
  const [paperDataUrl, answerDataUrl] = await Promise.all([fileToDataUrl(questionPaper), fileToDataUrl(answerSheet)])
  const prompt = `You are an assessment document extraction engine. Analyze the question paper and the student's answer sheet.
Return ONLY valid JSON with this exact shape:
{
  "questions": [{ "id": "stable unique id", "number": "original printed number including subpart", "text": "question text", "maxMarks": number|null, "earnedMarks": number|null, "answerId": "matching answer id or null", "status": "answered|review|unanswered", "correctness": "correct|partially_correct|incorrect|unknown", "feedback": "brief evidence-based feedback", "confidence": number, "answer": "transcribed answer or empty string", "page": number|null, "lines": [{ "x": number, "y": number, "width": number, "height": number }], "box": { "x": number, "y": number, "width": number, "height": number }|null }],
  "unmatchedAnswers": [{ "id": "stable unique id", "answer": "transcribed text", "page": number|null, "box": { "x": number, "y": number, "width": number, "height": number }|null }],
  "summary": { "totalMarks": number|null, "score": number|null, "feedback": "brief overall feedback" }
}
Rules: preserve printed order and numbering; make labelled parts like 11(a) separate questions; match answers even when out of order; use unanswered when no answer exists; use review when mapping is uncertain; include any written answer that does not match a question in unmatchedAnswers. Grade only when the paper and answer provide enough evidence, otherwise use null/unknown. All coordinates are decimals between 0 and 1 relative to the FULL answer-sheet image (x and y are the top-left corner; never use a 0-1000 scale). For image uploads set page to 1. For PDFs, page is the actual answer-sheet page and coordinates are normalized 0..1 within that page. In lines, return one tight strip per visible handwritten line of that answer only — never one large rectangle, never the printed question, margins, ruled lines, or a neighboring answer. Each strip must start at the first written word and end at the last written word of that line. Calculate separate lines for every answered question, never copy the first answer region, and verify before returning JSON that each line contains text matching that question's transcribed answer: for 2(b), highlight only the practical shopping-cart lines, not 2(a)'s Newton law lines. If you cannot locate an answer confidently, return lines [] and box null with status review instead of guessing. Extract every question, never invent missing questions, and do not grade unless the paper provides enough information.`

  const filePart = (file, dataUrl) => file.type.startsWith('image/')
    ? { type: 'image_url', image_url: { url: dataUrl } }
    : { type: 'file', file: { filename: file.name, file_data: dataUrl } }
  notify('Extracting questions & mapping answers…')
  const result = await requestOpenRouter(apiKey, [{ type: 'text', text: prompt }, filePart(questionPaper, paperDataUrl), filePart(answerSheet, answerDataUrl)])
  const questions = Array.isArray(result.questions) ? result.questions : []
  const answerImage = filePart(answerSheet, answerDataUrl)
  if (questions.length) notify(`Locating ${questions.filter((q) => q.status !== 'unanswered' && q.answer).length} answer regions…`)
  const locatedQuestions = await Promise.all(questions.map(async (question, idx) => {
    if (question.status === 'unanswered' || !question.answer) {
      const segments = sanitizeSegments(question.lines)
      return { ...question, lines: segments, box: unionOfSegments(segments) || normalizeRect(question.box) }
    }
    const locationPrompt = `Locate ONLY the student's answer to this exact question on the answer sheet image.
Question number: ${question.number}
Question: ${question.text}
Transcribed answer to locate: ${question.answer}
Return ONLY JSON: { "page": number|null, "lines": [{ "x": number, "y": number, "width": number, "height": number }] }
Give one entry in "lines" per handwritten line of that answer, each strip tightly surrounding just its own line of text from first word to last word (normalized decimals 0..1 against the FULL answer-sheet image; x and y are the top-left corner; never use a 0-1000 scale). Include the student's own question-number label as a line only if it is handwritten next to this answer. Never include printed text, margins, ruled lines, other subparts, or neighboring answers. If the answer fills a paragraph, still return one strip per visual line of handwriting. If the supplied answer cannot be confidently located, return lines [].`
    try {
      if (idx === Math.floor(questions.length / 2)) notify('Refining highlights…')
      const location = await requestOpenRouter(apiKey, [{ type: 'text', text: locationPrompt }, answerImage], 1024)
      const segments = sanitizeSegments(location.lines)
      const box = unionOfSegments(segments) || normalizeRect(location.box)
      return { ...question, page: location.page ?? question.page, lines: segments, box, status: box ? question.status : 'review' }
    } catch {
      return { ...question, lines: [], box: null, status: 'review' }
    }
  }))
  notify('Finalizing…')
  return { ...result, questions: locatedQuestions }
}
