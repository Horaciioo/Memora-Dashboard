import { randomUUID } from 'node:crypto'

import { FORM_SETTINGS, UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { UNBAN_FORM_COPY } from '@/declarations/unban/copy'
import { UNBAN_QUESTION_TYPE_REGISTRY } from '@/declarations/unban/registries'
import { invalidInput, systemFailure } from '@/core/lib/errors'
import type { AppErrorIssue } from '@/core/lib/errors'
import type {
  UnbanFormSnapshot,
  UnbanOption,
  UnbanPage,
  UnbanQuestion,
  UnbanScale,
} from '@/declarations/unban/form'

// Longest label, question or option
const LABEL_MAX_LENGTH = 300

// Longest intro or outro
const TEXT_MAX_LENGTH = 2000

type Raw = Record<string, unknown>
type Issues = AppErrorIssue[]

/**
 * Plain object guard
 * @param {unknown} value - Raw value
 * @return {boolean} - Value is an object
 */

const isRecord = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Trimmed text or nothing
 * @param {unknown} value - Raw value
 * @return {string | undefined} - Clean text
 */

const cleanText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined

/**
 * Fresh identifier for a question or option
 * @return {string} - Identifier
 */

export const newQuestionId = (): string => randomUUID()

/**
 * Keep an address a choice leads to, secure ones only
 * @param {unknown} raw - Raw address
 * @param {string} path - Issue location
 * @param {Issues} issues - Collected issues
 * @return {string | undefined} - Clean address
 */

const readRedirect = (raw: unknown, path: string, issues: Issues): string | undefined => {
  const text = cleanText(raw)
  if (!text) return undefined

  try {
    if (new URL(text).protocol === 'https:' && text.length <= 500) return text
  } catch {
    // Falls through to the refusal
  }
  issues.push({ field: path, message: UNBAN_FORM_COPY.redirectInvalid })

  return undefined
}

/**
 * Check the choices of a question
 * @param {unknown} raw - Raw options
 * @param {string} path - Issue location
 * @param {Issues} issues - Collected issues
 * @return {UnbanOption[]} - Clean options
 */

const readOptions = (raw: unknown, path: string, issues: Issues): UnbanOption[] => {
  const list = Array.isArray(raw) ? raw : []
  if (list.length < 2) issues.push({ field: path, message: UNBAN_FORM_COPY.optionsRequired })
  if (list.length > UNBAN_SETTINGS.maxOptions) {
    issues.push({ field: path, message: UNBAN_FORM_COPY.tooManyOptions })
  }

  const seen = new Set<string>()

  return list.flatMap((entry): UnbanOption[] => {
    const id = isRecord(entry) ? cleanText(entry.id) : undefined
    const label = isRecord(entry) ? cleanText(entry.label) : undefined
    if (!label || label.length > LABEL_MAX_LENGTH) {
      issues.push({ field: path, message: UNBAN_FORM_COPY.optionLabelRequired })
    }
    if (!id || seen.has(id)) {
      issues.push({ field: path, message: UNBAN_FORM_COPY.duplicateOption })
    }
    if (!id || !label || seen.has(id)) return []
    seen.add(id)

    const redirectUrl = readRedirect(isRecord(entry) ? entry.redirectUrl : undefined, path, issues)

    return [{ id, label, ...(redirectUrl ? { redirectUrl } : {}) }]
  })
}

/**
 * Check the bounds of a scale
 * @param {unknown} raw - Raw scale
 * @param {string} path - Issue location
 * @param {Issues} issues - Collected issues
 * @return {UnbanScale | undefined} - Clean scale
 */

const readScale = (raw: unknown, path: string, issues: Issues): UnbanScale | undefined => {
  if (!isRecord(raw)) {
    issues.push({ field: path, message: UNBAN_FORM_COPY.scaleMissing })

    return undefined
  }

  const { min, max } = raw
  const isSound =
    Number.isInteger(min) &&
    Number.isInteger(max) &&
    (min as number) >= FORM_SETTINGS.scaleMin &&
    (max as number) <= FORM_SETTINGS.scaleMax &&
    (min as number) < (max as number)
  if (!isSound) issues.push({ field: path, message: UNBAN_FORM_COPY.badScale })

  return {
    min: min as number,
    max: max as number,
    lowLabel: cleanText(raw.lowLabel),
    highLabel: cleanText(raw.highLabel),
  }
}

/**
 * Check a text length limit
 * @param {unknown} raw - Raw limit
 * @param {string} path - Issue location
 * @param {Issues} issues - Collected issues
 * @return {number | undefined} - Clean limit
 */

const readMaxLength = (raw: unknown, path: string, issues: Issues): number | undefined => {
  if (raw === undefined || raw === null) return undefined
  const isSound =
    Number.isInteger(raw) &&
    (raw as number) >= 1 &&
    (raw as number) <= UNBAN_SETTINGS.answerMaxLength
  if (!isSound) issues.push({ field: path, message: UNBAN_FORM_COPY.badLength })

  return raw as number
}

/**
 * Check one question
 * @param {unknown} raw - Raw question
 * @param {number} index - Position in the form
 * @param {Issues} issues - Collected issues
 * @return {UnbanQuestion | null} - Clean question
 */

const readQuestion = (raw: unknown, index: number, issues: Issues): UnbanQuestion | null => {
  const path = `questions.${index}`
  if (!isRecord(raw)) {
    issues.push({ field: path, message: UNBAN_FORM_COPY.notAForm })

    return null
  }

  const id = cleanText(raw.id)
  const label = cleanText(raw.label)
  const type = typeof raw.type === 'string' ? raw.type : ''
  if (!id) issues.push({ field: path, message: UNBAN_FORM_COPY.notAForm })
  if (!label || label.length > LABEL_MAX_LENGTH) {
    issues.push({ field: `${path}.label`, message: UNBAN_FORM_COPY.labelRequired })
  }
  if (!UNBAN_QUESTION_TYPE_REGISTRY.has(type)) {
    issues.push({ field: `${path}.type`, message: UNBAN_FORM_COPY.unknownType })

    return null
  }

  const kind = UNBAN_QUESTION_TYPE_REGISTRY.get(type)
  const hasOptions = kind.hasOptions
  if (!hasOptions && raw.options !== undefined) {
    issues.push({ field: `${path}.options`, message: UNBAN_FORM_COPY.optionsNotAllowed })
  }

  return {
    id: id ?? '',
    type,
    label: label ?? '',
    hint: cleanText(raw.hint),
    pageId: cleanText(raw.pageId),
    required: raw.required === true,
    ...(hasOptions ? { options: readOptions(raw.options, `${path}.options`, issues) } : {}),
    ...(kind.fieldKind === 'scale' ? { scale: readScale(raw.scale, `${path}.scale`, issues) } : {}),
    ...(kind.fieldKind === 'text' || kind.fieldKind === 'textarea'
      ? { maxLength: readMaxLength(raw.maxLength, `${path}.maxLength`, issues) }
      : {}),
  }
}

/**
 * Check every question of a form
 * @param {unknown} raw - Raw questions
 * @param {Issues} issues - Collected issues
 * @return {UnbanQuestion[]} - Clean questions
 */

const readQuestions = (raw: unknown, issues: Issues): UnbanQuestion[] => {
  const list = Array.isArray(raw) ? raw : []
  if (list.length === 0) issues.push({ field: 'questions', message: UNBAN_FORM_COPY.noQuestion })
  if (list.length > UNBAN_SETTINGS.maxQuestions) {
    issues.push({ field: 'questions', message: UNBAN_FORM_COPY.tooManyQuestions })
  }

  const questions = list
    .map((entry, index) => readQuestion(entry, index, issues))
    .filter((question): question is UnbanQuestion => question !== null)

  if (new Set(questions.map((question) => question.id)).size !== questions.length) {
    issues.push({ field: 'questions', message: UNBAN_FORM_COPY.duplicateQuestion })
  }

  return questions
}

/**
 * Check the pages of a form
 * @param {unknown} raw - Raw pages
 * @param {Issues} issues - Collected issues
 * @return {UnbanPage[] | undefined} - Clean pages, none for a single page
 */

const readPages = (raw: unknown, issues: Issues): UnbanPage[] | undefined => {
  if (!Array.isArray(raw) || raw.length === 0) return undefined
  if (raw.length > UNBAN_SETTINGS.maxPages) {
    issues.push({ field: 'pages', message: UNBAN_FORM_COPY.tooManyPages })
  }

  const pages = raw.flatMap((entry, index): UnbanPage[] => {
    const id = isRecord(entry) ? cleanText(entry.id) : undefined
    const title = isRecord(entry) ? cleanText(entry.title) : undefined
    if (!id || (title?.length ?? 0) > LABEL_MAX_LENGTH) {
      issues.push({ field: `pages.${index}`, message: UNBAN_FORM_COPY.notAForm })

      return []
    }

    return [{ id, ...(title ? { title } : {}) }]
  })
  if (new Set(pages.map((page) => page.id)).size !== pages.length) {
    issues.push({ field: 'pages', message: UNBAN_FORM_COPY.notAForm })
  }

  return pages
}

/**
 * Questions tied to a page that exists, the pageId of a single page form is dropped
 * @param {UnbanQuestion[]} questions - Clean questions
 * @param {UnbanPage[] | undefined} pages - Clean pages
 * @return {UnbanQuestion[]} - Questions
 */

const tieToPages = (questions: UnbanQuestion[], pages: UnbanPage[] | undefined): UnbanQuestion[] =>
  questions.map(({ pageId, ...question }) =>
    pages && pages.some((page) => page.id === pageId) ? { ...question, pageId } : question
  )

/**
 * Result of checking a form
 * @typedef {Object} SnapshotCheck
 * @property {UnbanFormSnapshot} snapshot - Clean form
 * @property {AppErrorIssue[]} issues - Rejections
 */

export interface SnapshotCheck {
  snapshot: UnbanFormSnapshot
  issues: AppErrorIssue[]
}

/**
 * Check a form and clean it
 * @param {unknown} raw - Raw form
 * @return {SnapshotCheck} - Form and rejections
 */

export const checkSnapshot = (raw: unknown): SnapshotCheck => {
  const issues: Issues = []
  const source = isRecord(raw) ? raw : {}
  if (!isRecord(raw)) issues.push({ message: UNBAN_FORM_COPY.notAForm })

  const intro = cleanText(source.intro)
  const outro = cleanText(source.outro)
  if ((intro?.length ?? 0) > TEXT_MAX_LENGTH || (outro?.length ?? 0) > TEXT_MAX_LENGTH) {
    issues.push({ message: UNBAN_FORM_COPY.labelTooLong })
  }

  const pages = readPages(source.pages, issues)
  const questions = tieToPages(readQuestions(source.questions, issues), pages)

  return { snapshot: { questions, ...(pages ? { pages } : {}), intro, outro }, issues }
}

/**
 * Form written by a person, refused when wrong
 * @param {unknown} raw - Raw form
 * @return {UnbanFormSnapshot} - Clean form
 */

export const parseDraftSnapshot = (raw: unknown): UnbanFormSnapshot => {
  const { snapshot, issues } = checkSnapshot(raw)
  if (issues.length > 0) throw invalidInput(issues)

  return snapshot
}

/**
 * Form read from storage, never shown half way
 * @param {unknown} raw - Stored form
 * @return {UnbanFormSnapshot} - Clean form
 */

export const readStoredSnapshot = (raw: unknown): UnbanFormSnapshot => {
  const { snapshot, issues } = checkSnapshot(raw)
  if (issues.length > 0) throw systemFailure()

  return snapshot
}
