import GradingSummary from '../components/GradingSummary'
import QuestionList from '../components/QuestionList'
import AnswerViewer from '../components/AnswerViewer'

export default function ReviewPage({ files, questions, summary, unmatchedAnswers, activeQuestion, setActiveQuestion, mobileTab, setMobileTab, onNewAssessment, onExportReport }) {
  const active = questions.find((question) => question.id === activeQuestion)
  return (
    <>
      <section className="workspace-heading mapped-heading">
        <div>
          <p className="eyebrow">
            AI ASSESSMENT REVIEW <span>•</span> LIVE EXTRACTION
          </p>
          <h1>Paper review</h1>
          <p className="subheading">Upload a question paper and answer sheet to map every response.</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-button" onClick={onNewAssessment}>
            <span>＋</span> New assessment
          </button>
          <button className="primary-button" onClick={onExportReport}>
            Export report <span>↗</span>
          </button>
        </div>
      </section>

      <GradingSummary questions={questions} summary={summary} unmatchedCount={unmatchedAnswers.length} />

      <div className="mobile-tabs" role="tablist" aria-label="Review sections">
        <button role="tab" aria-selected={mobileTab === 'questions'} className={mobileTab === 'questions' ? 'active' : ''} onClick={() => setMobileTab('questions')}>
          Questions
        </button>
        <button role="tab" aria-selected={mobileTab === 'sheet'} className={mobileTab === 'sheet' ? 'active' : ''} onClick={() => setMobileTab('sheet')}>
          Answer Sheet
        </button>
      </div>

      <section className="review-layout">
        <div className={`q-panel-wrap ${mobileTab === 'questions' ? 'is-visible' : ''}`}>
          <QuestionList
            questions={questions}
            activeQuestion={activeQuestion}
            onSelect={(id) => {
              setActiveQuestion(id)
              setMobileTab('sheet')
            }}
            unmatchedCount={unmatchedAnswers.length}
            unmatchedAnswers={unmatchedAnswers}
          />
        </div>
        <div className={`a-panel-wrap ${mobileTab === 'sheet' ? 'is-visible' : ''}`}>
          <AnswerViewer question={active} answerFile={files.answers} allQuestions={questions} />
        </div>
      </section>
    </>
  )
}
