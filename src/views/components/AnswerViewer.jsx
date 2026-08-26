/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from 'react'
import { refineAnswerRegions } from '../../services/refineHighlights'
import { getPdfNumPages, renderPdfPageToCanvas } from '../../services/pdfService'
import { MinusIcon, PlusIcon } from './Icons'

function isPdfFile(file) {
  return file && (file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf'))
}

export default function AnswerViewer({ question, answerFile, allQuestions }) {
  const isPdf = isPdfFile(answerFile)
  const imageUrl = useMemo(() => {
    if (!answerFile || isPdf) return null
    return answerFile.type?.startsWith('image/') ? URL.createObjectURL(answerFile) : null
  }, [answerFile, isPdf])

  const [snapped, setSnapped] = useState(null)
  const [zoom, setZoom] = useState(100)
  const [page, setPage] = useState(1)
  const [pdfPages, setPdfPages] = useState(null)
  const canvasRef = useRef(null)

  const totalPages = useMemo(() => {
    if (pdfPages) return pdfPages
    const maxPage = Math.max(1, ...((allQuestions || []).map((q) => q.page || 1)))
    return Math.max(maxPage, 1)
  }, [allQuestions, pdfPages])

  useEffect(() => {
    if (imageUrl) return () => URL.revokeObjectURL(imageUrl)
    return undefined
  }, [imageUrl])

  useEffect(() => {
    if (question?.page) setPage(question.page)
  }, [question?.id, question?.page])

  // Resolve actual PDF page count when file changes
  useEffect(() => {
    if (!isPdf || !answerFile) {
      setPdfPages(null)
      return
    }
    let cancelled = false
    getPdfNumPages(answerFile).then((n) => {
      if (!cancelled) setPdfPages(n)
    })
    return () => {
      cancelled = true
    }
  }, [answerFile, isPdf])

  // Render PDF page to canvas when page or file changes
  useEffect(() => {
    if (!isPdf || !answerFile || !canvasRef.current) return
    let cancelled = false
    const canvas = canvasRef.current
    renderPdfPageToCanvas(answerFile, page, canvas, 1.6).catch(() => {})
    return () => {
      cancelled = !cancelled
    }
  }, [isPdf, answerFile, page])

  // Re-render PDF canvas after it mounts / page changes (handle ref timing)
  useEffect(() => {
    if (!isPdf || !answerFile) return
    const canvas = canvasRef.current
    if (!canvas) return
    renderPdfPageToCanvas(answerFile, page, canvas, 1.6).catch(() => {})
  }, [isPdf, answerFile, page])

  useEffect(() => {
    if (!question || question.status === 'unanswered' || !answerFile) return undefined
    // For PDFs we still try to refine via image snapshot; skip snapping if PDF (canvas-based highlight will use raw lines)
    if (isPdf) return undefined
    if (!imageUrl) return undefined
    const seeds = Array.isArray(question.lines) && question.lines.length > 0 ? question.lines : question.box ? [question.box] : []
    if (!seeds.length) return undefined
    let cancelled = false
    // clear previous snapped when question changes
    setSnapped((prev) => (prev?.id === question.id ? prev : null))
    refineAnswerRegions(answerFile, seeds)
      .then((regions) => {
        if (!cancelled && regions.length > 0) setSnapped({ id: question.id, lines: regions })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [question, answerFile, imageUrl, isPdf])

  if (!question) return <div className="answer-panel empty-state">Select a question to view its mapped answer.</div>

  const box = question.box
  const lines = snapped && snapped.id === question.id ? snapped.lines : Array.isArray(question.lines) ? question.lines : []
  const rectStyle = ({ x, y, width, height }) => ({ left: `${x * 100}%`, top: `${y * 100}%`, width: `${width * 100}%`, height: `${height * 100}%` })

  const zoomIn = () => setZoom((z) => Math.min(200, z + 10))
  const zoomOut = () => setZoom((z) => Math.max(50, z - 10))

  return (
    <div className="answer-panel">
      <div className="answer-toolbar">
        <div>
          <p className="eyebrow">ANSWER SHEET</p>
          <h2>
            {question.number} <span>·</span> {question.status === 'unanswered' ? 'No answer found' : 'Mapped answer'}
          </h2>
        </div>
        <div className="toolbar-actions">
          <div className="zoom-control" aria-label="Zoom">
            <button className="zoom-btn" onClick={zoomOut} aria-label="Zoom out" type="button">
              <MinusIcon width={14} height={14} />
            </button>
            <span className="zoom-label">{zoom}%</span>
            <button className="zoom-btn" onClick={zoomIn} aria-label="Zoom in" type="button">
              <PlusIcon width={14} height={14} />
            </button>
          </div>
          <div className="page-control">
            <button className="page-btn" aria-label="Previous page" type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              ‹
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button className="page-btn" aria-label="Next page" type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="paper-stage">
        {isPdf ? (
          <div className="uploaded-preview" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', position: 'relative' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 4 }} />
            {/* Highlight overlay for PDF — uses same normalized coords; if answer spans pages, only show when page matches */}
            {question.page && question.page !== page ? null : box && question.status !== 'unanswered' && (lines.length > 0 ? (
              lines.map((line, index) => (
                <div key={index} className="answer-line" style={rectStyle(line)}>
                  {index === 0 && <span className="highlight-tag">{question.number}</span>}
                </div>
              ))
            ) : (
              <div className="answer-box" style={rectStyle(box)}>
                <span className="highlight-tag">{question.number}</span>
              </div>
            ))}
          </div>
        ) : imageUrl ? (
          <div className="uploaded-preview" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
            <img src={imageUrl} alt="Uploaded student answer sheet" />
            {box &&
              question.status !== 'unanswered' &&
              (lines.length > 0 ? (
                lines.map((line, index) => (
                  <div key={index} className="answer-line" style={rectStyle(line)}>
                    {index === 0 && <span className="highlight-tag">{question.number}</span>}
                  </div>
                ))
              ) : (
                <div className="answer-box" style={rectStyle(box)}>
                  <span className="highlight-tag">{question.number}</span>
                </div>
              ))}
          </div>
        ) : (
          <div className="paper-sheet">
            <div className="paper-header">
              <span>UPLOADED ANSWER SHEET</span>
              <span>{answerFile?.name || 'Preview'}</span>
            </div>
            <div className="paper-rule" />
            <div className="handwriting title-line">{question.status === 'unanswered' ? 'No written response detected' : 'Preview unavailable'}</div>
            <div className="answer-highlight">
              <span className="highlight-tag">{question.number}</span>
              <p>
                {question.status === 'unanswered'
                  ? 'This question was not answered on the submitted sheet.'
                  : question.answer || 'Answer extracted. Switch to image preview for pixel-exact highlight.'}
              </p>
            </div>
            <div className="paper-lines" />
          </div>
        )}
      </div>

      <div className="answer-footer">
        <div className="mapping-status">
          <span className={`status-dot ${question.status}`} />
          <strong>{question.status === 'unanswered' ? 'No matching answer' : 'Answer region highlighted'}</strong>
          <span>·</span>
          <span>{question.confidence ? `Confidence ${Math.round(question.confidence * 100)}%` : 'AI mapped'}</span>
          {question.correctness && question.correctness !== 'unknown' && <span className="correctness">{question.correctness.replace('_', ' ')}</span>}
        </div>
        <button className="feedback-button" type="button">
          Add feedback <span>＋</span>
        </button>
      </div>
      {question.feedback && (
        <div className="question-feedback">
          <strong>AI feedback</strong>
          <span>{question.feedback}</span>
        </div>
      )}
    </div>
  )
}
