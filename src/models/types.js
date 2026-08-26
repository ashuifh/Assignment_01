/**
 * Lightweight type definitions (MVC Model layer — in-memory only, no DB).
 * Used for JSDoc / documentation; no runtime persistence.
 * Remove this file entirely if you prefer zero Model folder.
 */

/**
 * @typedef {Object} Rect
 * @property {number} x - normalized 0..1
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} number - e.g. "11(a)"
 * @property {string} text
 * @property {number|null} maxMarks
 * @property {number|null} earnedMarks
 * @property {string|null} answerId
 * @property {'answered'|'review'|'unanswered'} status
 * @property {'correct'|'partially_correct'|'incorrect'|'unknown'} correctness
 * @property {string} feedback
 * @property {number} confidence
 * @property {string} answer
 * @property {number|null} page
 * @property {Rect[]} lines
 * @property {Rect|null} box
 */

/**
 * @typedef {Object} Summary
 * @property {number|null} totalMarks
 * @property {number|null} score
 * @property {string} feedback
 */

export const QuestionStatus = { ANSWERED: 'answered', REVIEW: 'review', UNANSWERED: 'unanswered' }
export const Correctness = { CORRECT: 'correct', PARTIAL: 'partially_correct', INCORRECT: 'incorrect', UNKNOWN: 'unknown' }
