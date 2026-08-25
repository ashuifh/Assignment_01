const statusLabels = { answered: 'Answered', review: 'Needs review', unanswered: 'Unanswered' }

export default function QuestionList({ questions, activeQuestion, onSelect, unmatchedCount }) {
  const needsReview = questions.filter((question) => question.status === 'review').length
  return <aside className="question-panel">
    <div className="panel-title"><div><p className="eyebrow">EXTRACTED QUESTIONS</p><h2>Question list</h2></div><span className="count-badge">{questions.length}</span></div>
    <div className="filter-row"><button className="filter active">All <span>{questions.length}</span></button><button className="filter">Needs review <span>{needsReview}</span></button></div>
    <div className="question-list">{questions.map((question) => <button key={question.id} className={`question-item ${activeQuestion === question.id ? 'selected' : ''}`} onClick={() => onSelect(question.id)}><div className="question-top"><span className="question-number">{question.number}</span><span className={`status-dot ${question.status}`} /></div><span className="question-label">{question.text}</span><div className="question-meta"><span className={`status-text ${question.status}`}>{statusLabels[question.status] || 'Mapped'}</span><span>{question.earnedMarks == null ? '—' : `${question.earnedMarks} / ${question.maxMarks || '?'}`}</span></div></button>)}{unmatchedCount > 0 && <div className="unmatched-note"><strong>{unmatchedCount} unmatched answer{unmatchedCount > 1 ? 's' : ''}</strong><span>Written response not linked to a question</span></div>}</div>
    <div className="panel-note"><span>✧</span> Answers are mapped by content and handwriting position.</div>
  </aside>
}
