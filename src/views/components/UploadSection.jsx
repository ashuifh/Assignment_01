import { useRef, useState } from 'react'
import { CloseIcon, PdfBadge, UploadIcon } from './Icons'
import { formatFileMeta } from '../../utils/fileValidation'

function formatMeta(file) {
  return formatFileMeta(file)
}

function UploadBox({ label, orangeLabel, file, inputRef, onPick, onRemove }) {
  const [dragging, setDragging] = useState(false)
  const handleClick = () => inputRef.current?.click()
  const handleKeyDown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }

  return (
    <div
      className={`upload-box ${file ? 'has-file' : ''} ${dragging ? 'dragging' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) onPick(e.dataTransfer.files[0]) }}
      aria-label={label}
    >
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onPick(e.target.files[0])} hidden />
      {!file ? (
        <>
          <div className="upload-icon">
            <UploadIcon width={16} height={16} />
          </div>
          <strong className="upload-label">
            {label} <em>{orangeLabel}</em>
          </strong>
          <span className="upload-hint">Max 10MB</span>
        </>
      ) : (
        <div className="file-pill" onClick={(e) => e.stopPropagation()}>
          <PdfBadge size={28} />
          <div className="file-meta">
            <strong title={file.name}>{file.name}</strong>
            <span>{formatMeta(file)}</span>
          </div>
          <button
            className="pill-close"
            aria-label={`Remove ${file.name}`}
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            type="button"
          >
            <CloseIcon width={12} height={12} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function UploadSection({ files, onPick, onRemove, onAnalyze, processing, onClose }) {
  const paperInput = useRef(null)
  const answerInput = useRef(null)
  const canMap = files.paper && files.answers && !processing

  return (
    <section className="upload-panel" aria-label="Upload files">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">NEW ASSESSMENT</p>
          <h2>Add source files</h2>
        </div>
        <button className="close-button" onClick={onClose} aria-label="Close">
          <CloseIcon width={16} height={16} />
        </button>
      </div>
      <div className="upload-grid">
        <UploadBox label="Upload" orangeLabel="Question Paper" file={files.paper} inputRef={paperInput} onPick={(f) => onPick('paper', f)} onRemove={() => onRemove('paper')} />
        <UploadBox label="Upload" orangeLabel="Answer Sheet" file={files.answers} inputRef={answerInput} onPick={(f) => onPick('answers', f)} onRemove={() => onRemove('answers')} />
      </div>
      <div className="upload-footer">
        <span>PDF, JPG or PNG · Max 10 MB each</span>
        <button className="primary-button start-mapping" disabled={!canMap} onClick={onAnalyze} type="button">
          {processing ? 'Mapping…' : 'Start Mapping'} <span aria-hidden="true">→</span>
        </button>
      </div>
      {!canMap && <p className="upload-caption">Once both files are uploaded, you&apos;ll be able to map answers with questions</p>}
    </section>
  )
}
