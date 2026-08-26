// Service: PDF rendering helper (client-side)
// Used by Views to render PDFs as canvases for highlighting.
// No DB — ephemeral rendering only.

let pdfjsPromise = null

async function getPdfjs() {
  if (pdfjsPromise) return pdfjsPromise
  pdfjsPromise = import('pdfjs-dist').then((mod) => {
    // pdfjs-dist 4+ needs workerSrc configured; use CDN fallback if needed
    // Do not throw if already set
    try {
      if (mod.GlobalWorkerOptions && !mod.GlobalWorkerOptions.workerSrc) {
        mod.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${mod.version || '4.4.168'}/pdf.worker.min.mjs`
      }
    } catch {
      // ignore
    }
    return mod
  })
  return pdfjsPromise
}

export async function renderPdfPageToCanvas(file, pageNumber, canvas, scale = 1.8) {
  const pdfjs = await getPdfjs()
  const data = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data }).promise
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const context = canvas.getContext('2d')
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: context, viewport }).promise
  return { width: viewport.width, height: viewport.height, numPages: pdf.numPages }
}

export async function getPdfNumPages(file) {
  try {
    const pdfjs = await getPdfjs()
    const data = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data }).promise
    return pdf.numPages
  } catch {
    return 1
  }
}
