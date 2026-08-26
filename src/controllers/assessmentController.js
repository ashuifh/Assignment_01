import { useCallback, useState } from 'react'
import { extractAssessment } from '../services/aiService'

// MVC Controller layer: orchestrates Views (App/routes/components) ↔ Services.
// Holds the assessment state and exposes actions consumed by the Views.
export function useAssessmentController() {
  const [files, setFiles] = useState({ paper: null, answers: null })
  const [questions, setQuestions] = useState([])
  const [summary, setSummary] = useState(null)
  const [unmatchedAnswers, setUnmatchedAnswers] = useState([])
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [error, setError] = useState(null)

  const addFile = useCallback((key, file) => {
    setFiles((prev) => ({ ...prev, [key]: file }))
    setError(null)
  }, [])

  const removeFile = useCallback((key) => {
    setFiles((prev) => ({ ...prev, [key]: null }))
  }, [])

  const reset = useCallback(() => {
    setFiles({ paper: null, answers: null })
    setQuestions([])
    setSummary(null)
    setUnmatchedAnswers([])
    setActiveQuestion(null)
    setProcessing(false)
    setProcessingStep('')
    setError(null)
  }, [])

  const analyze = useCallback(async () => {
    if (!files.paper || !files.answers) {
      setError('Please upload both the question paper and answer sheet.')
      return false
    }
    setProcessing(true)
    setError(null)
    setProcessingStep('Preparing…')
    try {
      const result = await extractAssessment(files.paper, files.answers, setProcessingStep)
      const extractedQuestions = Array.isArray(result?.questions) ? result.questions : []
      setQuestions(extractedQuestions)
      setUnmatchedAnswers(Array.isArray(result?.unmatchedAnswers) ? result.unmatchedAnswers : [])
      setSummary(result?.summary ?? null)
      setActiveQuestion(extractedQuestions.length ? extractedQuestions[0].id : null)
      return true
    } catch (err) {
      setError(err?.message || 'Failed to analyze the assessment.')
      return false
    } finally {
      setProcessing(false)
    }
  }, [files])

  return {
    files,
    addFile,
    removeFile,
    questions,
    summary,
    unmatchedAnswers,
    activeQuestion,
    setActiveQuestion,
    processing,
    processingStep,
    error,
    analyze,
    reset,
  }
}

// Backwards-compatible alias (legacy hook name).
export const useAssessment = useAssessmentController
