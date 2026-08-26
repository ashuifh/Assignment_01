const statusLabels = { answered: 'Answered', review: 'Needs review', unanswered: 'Unanswered' }

function ScoreBadge({ earned, max }) {
  if (earned == null || max == null) return <span className="score-badge score-unknown">—</span>
  let tone = 'amber'
  if (earned === 0) tone = 'red'
  else if (earned === max) tone = 'green'
  return <span className={`score-badge score-${tone}`}>{earned}/{max}</span>
}

import { useState } from 'react'

export default function QuestionList({ questions, activeQuestion, onSelect, unmatchedCount, unmatchedAnswers }) {
  const [filter, setFilter] = useState('all')
  const [expandAll, setExpandAll] = useState(false)
  const needsReview = questions.filter((q) => q.status === 'review').length
  const filtered = filter === 'review' ? questions.filter((q) => q.status === 'review') : questions
  return (
    <aside className="question-panel">
      <div className="panel-title">
        <div>
          <p className="eyebrow">EXTRACTED QUESTIONS</p>
          <h2>Question list</h2>
          <span className="panel-sub">Extracted Questions (from question paper)</span>
        </div>
        <span className="count-badge">{questions.length}</span>
      </div>
      <div className="filter-row">
        <button className={`filter ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')} type="button">
          All <span>{questions.length}</span>
        </button>
        <button className={`filter ${filter === 'review' ? 'active' : ''}`} onClick={() => setFilter('review')} type="button">
          Needs review <span>{needsReview}</span>
        </button>
        <button className="expand-all" type="button" onClick={() => setExpandAll((v) => !v)}>
          {expandAll ? 'Collapse' : 'Expand All'}
        </button>
      </div>
      <div className="question-list">
        {filtered.map((q) => {
          const isActive = activeQuestion === q.id
          return (
            <button key={q.id} className={`question-item ${isActive ? 'selected' : ''}`} onClick={() => onSelect(q.id)} type="button">
              <div className="question-top">
                <span className="question-number">{q.number}</span>
                <ScoreBadge earned={q.earnedMarks} max={q.maxMarks} />
              </div>
              <span className="question-label">{q.text}</span>
              <div className="question-meta">
                <span className={`status-text ${q.status}`}>{statusLabels[q.status] || 'Mapped'}</span>
                <span className={`status-dot ${q.status}`} aria-hidden="true" />
              </div>
              {(isActive || expandAll) && q.feedback && (
                <div className="q-feedback">
                  <strong>AI Feedback</strong>
                  <p>{q.feedback}</p>
                </div>
              )}
            </button>
          )
        })}
        {unmatchedCount > 0 && (
          <div className="unmatched-note">
            <strong>
              {unmatchedCount} unmatched answer{unmatchedCount > 1 ? 's' : ''}
            </strong>
            <span>Written response not linked to a question</span>
            {Array.isArray(unmatchedAnswers) && unmatchedAnswers.length > 0 && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 16, color: '#6b5a45' }}>
                {unmatchedAnswers.slice(0, 3).map((u) => (
                  <li key={u.id} style={{ fontSize: 11, lineHeight: 1.4 }}>
                    {u.answer?.slice(0, 80) || 'Unlinked region'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="panel-note">
        <span>✧</span> Answers are mapped by content and handwriting position.
      </div>
    </aside>
  )
}
