import { useState } from 'react'
import { extractAssessment } from '../services/aiService'

const initialFiles = { paper: null, answers: null }

export function useAssessment() {
  const [files, setFiles] = useState(initialFiles)
  const [questions, setQuestions] = useState([])
  const [summary, setSummary] = useState(null)
  const [unmatchedAnswers, setUnmatchedAnswers] = useState([])
  const [activeQuestion, setActiveQuestion] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const addFile = (type, file) => {
    if (!file) return
    setFiles((current) => ({ ...current, [type]: file }))
    setError('')
  }

  const analyze = async () => {
    if (!files.paper || !files.answers) return
    setProcessing(true)
    setError('')
    try {
      const result = await extractAssessment(files.paper, files.answers)
      const extracted = Array.isArray(result.questions) ? result.questions : []
      setQuestions(extracted)
      setSummary(result.summary || null)
      setUnmatchedAnswers(Array.isArray(result.unmatchedAnswers) ? result.unmatchedAnswers : [])
      setActiveQuestion(extracted[0]?.id || '')
      return true
    } catch (analysisError) {
      setError(analysisError.message)
      return false
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => {
    setFiles(initialFiles)
    setQuestions([])
    setSummary(null)
    setUnmatchedAnswers([])
    setActiveQuestion('')
    setError('')
  }

  return { files, addFile, questions, summary, unmatchedAnswers, activeQuestion, setActiveQuestion, processing, error, analyze, reset }
}
