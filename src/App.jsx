import { useState } from 'react'
import './App.css'
// MVC: Controller orchestrates Views ↔ Services
import { useAssessmentController } from './controllers/assessmentController'
import AppShell from './views/layouts/AppShell'
import AppRoutes from './routes'
import ProcessingStatus from './views/components/ProcessingStatus'

function App() {
  const [showUpload, setShowUpload] = useState(true)
  const [mobileTab, setMobileTab] = useState('questions')
  const {
    files,
    addFile,
    removeFile,
    questions,
    summary,
    unmatchedAnswers,
    activeQuestion,
    setActiveQuestion,
    processing,
    processingStep,
    error,
    analyze,
    reset,
  } = useAssessmentController()

  const startNewAssessment = () => {
    reset()
    setShowUpload(true)
    setMobileTab('questions')
  }

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      questionPaper: files.paper?.name || null,
      answerSheet: files.answers?.name || null,
      summary,
      questions,
      unmatchedAnswers,
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'assessment-report.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Global status handles extraction (isUploadMode false) and any error (MVC View concern)
  const showGlobalStatus = processing || !!error

  return (
    <AppShell processing={processing}>
      <AppRoutes
        files={files}
        questions={questions}
        summary={summary}
        unmatchedAnswers={unmatchedAnswers}
        activeQuestion={activeQuestion}
        setActiveQuestion={setActiveQuestion}
        processing={processing}
        processingStep={processingStep}
        error={error}
        showUpload={showUpload}
        setShowUpload={setShowUpload}
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
        onAnalyze={analyze}
        onNewAssessment={startNewAssessment}
        onExportReport={exportReport}
        onPick={addFile}
        onRemove={removeFile}
      />
      {showGlobalStatus && <ProcessingStatus processing={processing} processingStep={processingStep} error={error} />}
    </AppShell>
  )
}

export default App
