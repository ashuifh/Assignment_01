import { Sparkle } from './Icons'

export default function ProcessingStatus({ processing, processingStep, error }) {
  if (error) return <div className="error-banner" role="alert">{error}</div>
  if (!processing) return null
  return (
    <div className="processing-banner" role="status" aria-live="polite">
      <div className="extracting-art" aria-hidden="true">
        <Sparkle size={56} style={{ color: '#ff572f' }} />
        <Sparkle size={32} style={{ color: '#ff7049', position: 'absolute', left: -8, top: 24 }} />
        <Sparkle size={18} style={{ color: '#ffb399', position: 'absolute', right: -4, top: 40 }} />
        <span className="dot" style={{ left: 6, top: 8 }} />
      </div>
      <strong>{processingStep || 'Extracting...'}</strong>
      <span>{processingStep ? 'AI is analyzing your documents' : 'This may take a while'}</span>
      <div className="progress-steps" aria-hidden="true" style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <span className="dot" style={{ width: 8, height: 8, borderRadius: 999, background: '#ff7049', opacity: 1 }} />
        <span className="dot" style={{ width: 8, height: 8, borderRadius: 999, background: '#ffd0c0', opacity: processingStep?.includes('mapping') ? 1 : 0.5 }} />
        <span className="dot" style={{ width: 8, height: 8, borderRadius: 999, background: '#ffe9e0', opacity: processingStep?.includes('Finalizing') ? 1 : 0.5 }} />
      </div>
    </div>
  )
}
