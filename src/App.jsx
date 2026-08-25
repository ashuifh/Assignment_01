import { useState } from 'react'
import './App.css'
import AnswerViewer from './components/AnswerViewer'
import GradingSummary from './components/GradingSummary'
import ProcessingStatus from './components/ProcessingStatus'
import QuestionList from './components/QuestionList'
import UploadSection from './components/UploadSection'
import { useAssessment } from './hooks/useAssessment'

function App() {
  const [showUpload, setShowUpload] = useState(true)
  const { files, addFile, questions, summary, unmatchedAnswers, activeQuestion, setActiveQuestion, processing, error, analyze, reset } = useAssessment()
  const active = questions.find((question) => question.id === activeQuestion)

  const startNewAssessment = () => {
    reset()
    setShowUpload(true)
  }

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      questionPaper: files.paper?.name || null,
      answerSheet: files.answers?.name || null,
      summary,
      questions,
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'assessment-report.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="/" aria-label="VedaAI home"><span className="brand-mark">✦</span><span>veda<span>ai</span></span></a>
      <div className="breadcrumb"><span>Workspace</span><span className="crumb-chevron">›</span><strong>Assessment review</strong></div>
      <div className="top-actions"><button className="icon-button" aria-label="Help">?</button><div className="avatar">AK</div></div>
    </header>

    <main>
      <section className="workspace-heading">
        <div><p className="eyebrow">AI ASSESSMENT REVIEW <span>•</span> LIVE EXTRACTION</p><h1>Paper review</h1><p className="subheading">Upload a question paper and answer sheet to map every response.</p></div>
        <div className="heading-actions"><button className="secondary-button" onClick={startNewAssessment}><span>＋</span> New assessment</button><button className="primary-button" disabled={!questions.length} onClick={exportReport}>Export report <span>↗</span></button></div>
      </section>

      {showUpload && <UploadSection files={files} onPick={addFile} onAnalyze={async () => { if (await analyze()) setShowUpload(false) }} processing={processing} onClose={() => setShowUpload(false)} />}
      <ProcessingStatus processing={processing} error={error} />
      {questions.length > 0 && <>
        <GradingSummary questions={questions} summary={summary} unmatchedCount={unmatchedAnswers.length} />
        <section className="review-layout">
          <QuestionList questions={questions} activeQuestion={activeQuestion} onSelect={setActiveQuestion} unmatchedCount={unmatchedAnswers.length} />
          <AnswerViewer question={active} answerFile={files.answers} />
        </section>
      </>}
      {!questions.length && !processing && !error && <div className="empty-state intro-state"><span className="upload-icon">↑</span><h2>Your extracted questions will appear here</h2><p>Choose both files above, then start extraction.</p></div>}
    </main>
  </div>
}
export default App