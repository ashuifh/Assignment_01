export default function ProcessingStatus({ processing, error }) {
  if (error) return <div className="error-banner">{error}</div>
  if (!processing) return null
  return <div className="processing-banner"><span className="spinner" /> Reading documents, extracting questions and mapping answers<span className="processing-dots">...</span></div>
}
