// Routes layer — single-page app with conditional Views (MVC).
// No react-router needed (no DB/auth); keeps bundle small.
// Adding a router later is trivial: wrap pages in <Routes>.

import UploadPage from '../views/pages/UploadPage'
import ReviewPage from '../views/pages/ReviewPage'

export default function AppRoutes({
  files,
  questions,
  summary,
  unmatchedAnswers,
  activeQuestion,
  setActiveQuestion,
  processing,
  processingStep,
  error,
  showUpload,
  setShowUpload,
  mobileTab,
  setMobileTab,
  onAnalyze,
  onNewAssessment,
  onExportReport,
  onPick,
  onRemove,
}) {
  const isUploadMode = !questions.length && !processing
  const isMapped = questions.length > 0

  if (isUploadMode) {
    return (
      <UploadPage
        files={files}
        onPick={onPick}
        onRemove={onRemove}
        onAnalyze={onAnalyze}
        processing={processing}
        processingStep={processingStep}
        error={error}
        showUpload={showUpload}
        setShowUpload={setShowUpload}
      />
    )
  }

  if (isMapped) {
    return (
      <ReviewPage
        files={files}
        questions={questions}
        summary={summary}
        unmatchedAnswers={unmatchedAnswers}
        activeQuestion={activeQuestion}
        setActiveQuestion={setActiveQuestion}
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
        onNewAssessment={onNewAssessment}
        onExportReport={onExportReport}
      />
    )
  }

  // Fallback during processing (neither upload nor mapped yet) — let App.jsx show ProcessingStatus
  return null
}
