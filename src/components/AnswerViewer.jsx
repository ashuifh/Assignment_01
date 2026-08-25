import { useEffect, useMemo, useState } from 'react'
import { refineAnswerRegions } from '../services/refineHighlights'

export default function AnswerViewer({ question, answerFile }) {
  const imageUrl = useMemo(() => answerFile?.type.startsWith('image/') ? URL.createObjectURL(answerFile) : null, [answerFile])
  const [snapped, setSnapped] = useState(null)
  useEffect(() => {
    if (imageUrl) return () => URL.revokeObjectURL(imageUrl)
    return undefined
  }, [imageUrl])
  useEffect(() => {
    if (!question || question.status === 'unanswered' || !imageUrl || !answerFile) return undefined
    const seeds = Array.isArray(question.lines) && question.lines.length > 0 ? question.lines : question.box ? [question.box] : []
    if (!seeds.length) return undefined
    let cancelled = false
    refineAnswerRegions(answerFile, seeds).then((regions) => {
      if (!cancelled && regions.length > 0) setSnapped({ id: question.id, lines: regions })
    }).catch(() => {})
    return () => { cancelled = true }
  }, [question, answerFile, imageUrl])
  if (!question) return <div className="answer-panel empty-state">Upload both documents to start extracting questions.</div>
  const box = question.box
  // Snapped strips belong to a specific question; ignore them once another question is selected.
  const lines = snapped && snapped.id === question.id ? snapped.lines : Array.isArray(question.lines) ? question.lines : []
  const rectStyle = ({ x, y, width, height }) => ({ left: `${x * 100}%`, top: `${y * 100}%`, width: `${width * 100}%`, height: `${height * 100}%` })
  return <div className="answer-panel"><div className="answer-toolbar"><div><p className="eyebrow">ANSWER SHEET</p><h2>{question.number} <span>·</span> {question.status === 'unanswered' ? 'No answer found' : 'Mapped answer'}</h2></div><div className="page-control"><span>{question.page ? `Page ${question.page}` : 'Page unavailable'}</span></div></div>
    <div className="paper-stage">{imageUrl ? <div className="uploaded-preview"><img src={imageUrl} alt="Uploaded student answer sheet" />{box && question.status !== 'unanswered' && (lines.length > 0 ? lines.map((line, index) => <div key={index} className="answer-line" style={rectStyle(line)}>{index === 0 && <span className="highlight-tag">{question.number}</span>}</div>) : <div className="answer-box" style={rectStyle(box)}><span className="highlight-tag">{question.number}</span></div>)}</div> : <div className="paper-sheet"><div className="paper-header"><span>UPLOADED ANSWER SHEET</span><span>{answerFile?.name || 'Preview'}</span></div><div className="paper-rule" /><div className="handwriting title-line">{question.status === 'unanswered' ? 'No written response detected' : 'PDF uploaded'}</div><div className="answer-highlight"><span className="highlight-tag">{question.number}</span><p>{question.status === 'unanswered' ? 'This question was not answered on the submitted sheet.' : question.answer || 'Answer extracted from uploaded PDF. Open the PDF to inspect the highlighted region.'}</p></div><div className="paper-lines" /></div>}</div>
    <div className="answer-footer"><div className="mapping-status"><span className={`status-dot ${question.status}`} /><strong>{question.status === 'unanswered' ? 'No matching answer' : 'Answer region highlighted'}</strong><span>·</span><span>{question.confidence ? `Confidence ${Math.round(question.confidence * 100)}%` : 'AI mapped'}</span>{question.correctness && question.correctness !== 'unknown' && <span className="correctness">{question.correctness.replace('_', ' ')}</span>}</div><button className="feedback-button">Add feedback <span>＋</span></button></div>{question.feedback && <div className="question-feedback"><strong>AI feedback</strong><span>{question.feedback}</span></div>}
  </div>
}
