import { TeacherIllustration } from '../components/Icons'
import UploadSection from '../components/UploadSection'

export default function UploadPage({ files, onPick, onRemove, onAnalyze, processing, error, showUpload, setShowUpload }) {
  const isUploadMode = true
  return (
    <>
      <section className="workspace-heading upload-heading">
        <div>
          <h1>
            Upload <em>Question Paper &amp; Answer Sheets</em>
          </h1>
          <p className="subheading">Upload both files to get started</p>
          <div className="hero-illustration" aria-hidden="true">
            <TeacherIllustration size={120} />
          </div>
        </div>
      </section>

      {showUpload && isUploadMode && (
        <UploadSection
          files={files}
          onPick={onPick}
          onRemove={onRemove}
          onAnalyze={async () => {
            if (await onAnalyze()) setShowUpload(false)
          }}
          processing={processing}
          onClose={() => setShowUpload(false)}
        />
      )}

      {!processing && !error && !showUpload && (
        <div className="empty-state intro-state">
          <span className="upload-icon">↑</span>
          <h2>Your extracted questions will appear here</h2>
          <p>Choose both files above, then start extraction.</p>
          <button className="secondary-button" onClick={() => setShowUpload(true)} style={{ marginTop: 16 }}>
            Show upload
          </button>
        </div>
      )}
    </>
  )
}
