import { useRef } from 'react'

function UploadBox({ label, file, inputRef, onPick }) {
  return <div className={`upload-box ${file ? 'has-file' : ''}`} onClick={() => inputRef.current?.click()} role="button" tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()}>
    <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => onPick(event.target.files[0])} />
    <div className="upload-icon">{file ? '✓' : '↑'}</div>
    <strong>{file ? file.name : label}</strong>
    <span>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Ready` : 'Drop file here or browse'}</span>
  </div>
}

export default function UploadSection({ files, onPick, onAnalyze, processing, onClose }) {
  const paperInput = useRef(null)
  const answerInput = useRef(null)
  return <section className="upload-panel">
    <div className="panel-heading"><div><p className="eyebrow">NEW ASSESSMENT</p><h2>Add source files</h2></div><button className="close-button" onClick={onClose} aria-label="Close">×</button></div>
    <div className="upload-grid"><UploadBox label="Question paper" file={files.paper} inputRef={paperInput} onPick={(file) => onPick('paper', file)} /><UploadBox label="Student answer sheet" file={files.answers} inputRef={answerInput} onPick={(file) => onPick('answers', file)} /></div>
    <div className="upload-footer"><span>PDF, JPG or PNG · Max 20 MB each</span><button className="primary-button" disabled={!files.paper || !files.answers || processing} onClick={onAnalyze}>{processing ? 'Processing…' : 'Start extraction'} <span>→</span></button></div>
  </section>
}
