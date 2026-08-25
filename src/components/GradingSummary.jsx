export default function GradingSummary({ questions, summary, unmatchedCount }) {
  const answered = questions.filter((question) => question.status !== 'unanswered').length
  const unanswered = questions.filter((question) => question.status === 'unanswered').length
  const review = questions.filter((question) => question.status === 'review').length
  const totalMarks = summary?.totalMarks ?? questions.reduce((total, question) => total + (question.maxMarks || 0), 0)
  const score = summary?.score
  return <><section className="metrics"><Metric value={questions.length} label="Questions found" detail="All parts preserved" tone="teal" /><Metric value={answered} label="Answered" detail={`${review} needs review`} tone="blue" /><Metric value={unanswered} label="Unanswered" detail={unmatchedCount ? `${unmatchedCount} unmatched response${unmatchedCount > 1 ? 's' : ''}` : 'No matching response'} tone="coral" /><Metric value={score == null ? '—' : `${score} / ${totalMarks || '—'}`} label="Current score" detail={score == null ? 'Not graded' : 'AI suggested'} tone="yellow" /></section>{summary?.feedback && <div className="insight-banner"><strong>AI insight</strong><span>{summary.feedback}</span></div>}</>
}
function Metric({ value, label, detail, tone }) { return <div className={`metric metric-${tone}`}><div className="metric-value">{value}</div><div><strong>{label}</strong><span>{detail}</span></div></div> }
