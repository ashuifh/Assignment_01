const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
const ALLOWED_EXTS = ['.pdf', '.jpg', '.jpeg', '.png']

export function validateFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' }
  if (file.size > MAX_BYTES) {
    return { valid: false, error: `${file.name} exceeds 10 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).` }
  }
  const extOk = ALLOWED_EXTS.some((ext) => file.name.toLowerCase().endsWith(ext))
  const typeOk = !file.type || ALLOWED_TYPES.includes(file.type) || file.type.startsWith('image/')
  if (!extOk && !typeOk) {
    return { valid: false, error: `${file.name}: only PDF, JPG, PNG are allowed.` }
  }
  return { valid: true, error: '' }
}

export function formatFileMeta(file) {
  if (!file) return 'Drop file here or browse'
  const mb = (file.size / 1024 / 1024).toFixed(1)
  return `${mb}MB · Ready`
}

export async function getPdfPageCount(file) {
  if (!file || file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return null
  try {
    const { getDocument } = await import('pdfjs-dist')
    // Use worker from CDN if not already set; pdfjs-dist v4+ requires workerSrc
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: arrayBuffer }).promise
    return pdf.numPages
  } catch {
    return null
  }
}
