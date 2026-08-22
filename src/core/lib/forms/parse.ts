import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { isFieldVisible } from '@/core/lib/forms/visibility'
import type {
  FieldDefinition,
  FieldIssue,
  FieldValue,
  FormValues,
  ParseOptions,
  ParseResult,
} from '@/types/forms'

// Digits only, Discord snowflake
const DISCORD_PATTERN = /^\d{15,25}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const COLOUR_PATTERN = /^#[0-9a-fA-F]{6}$/

/**
 * Treat a value as unfilled
 * @param {unknown} value - Raw value
 * @return {boolean} - Value is empty
 */

const isBlank = (value: unknown): boolean =>
  value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)

/**
 * Normalise raw text
 * @param {unknown} value - Raw value
 * @return {string} - Trimmed text
 */

const toText = (value: unknown): string => (typeof value === 'string' ? value.trim() : String(value ?? ''))

/**
 * Normalise a string list
 * @param {unknown} value - Raw value
 * @return {string[]} - Cleaned entries
 */

const toList = (value: unknown): string[] => {
  const source = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []

  return source.map((entry) => String(entry).trim()).filter((entry) => entry.length > 0)
}

/**
 * Parse one declared field
 * @param {FieldDefinition} field - Field declaration
 * @param {unknown} raw - Raw value
 * @param {FieldIssue[]} issues - Collected rejections
 * @return {FieldValue} - Normalised value
 */

const parseField = (field: FieldDefinition, raw: unknown, issues: FieldIssue[]): FieldValue => {
  const reject = (message: string): null => {
    issues.push({ field: field.name, message })
    return null
  }

  // Booleans never carry an empty state
  if (field.kind === 'toggle') return Boolean(raw)

  if (isBlank(raw)) return field.kind === 'multiselect' || field.kind === 'tags' ? [] : null

  // Multi-value fields
  if (field.kind === 'multiselect' || field.kind === 'tags') {
    const entries = toList(raw)
    if (field.maxItems !== undefined && entries.length > field.maxItems) {
      return reject(FORM_COPY.tooManyItems)
    }
    if (field.kind === 'multiselect' && field.options) {
      const allowed = new Set(field.options.map((option) => option.value))
      if (entries.some((entry) => !allowed.has(entry))) return reject(FORM_COPY.notAnOption)
    }
    return entries
  }

  // Numeric fields
  if (field.kind === 'number') {
    const parsed = typeof raw === 'number' ? raw : Number(toText(raw))
    if (!Number.isFinite(parsed)) return reject(FORM_COPY.notANumber)
    if (field.min !== undefined && parsed < field.min) return reject(FORM_COPY.tooSmall)
    if (field.max !== undefined && parsed > field.max) return reject(FORM_COPY.tooLarge)
    return parsed
  }

  // Date fields keep their ISO form
  if (field.kind === 'date' || field.kind === 'datetime') {
    const text = toText(raw)
    if (Number.isNaN(new Date(text).getTime())) return reject(FORM_COPY.notADate)
    return text
  }

  const text = toText(raw)

  if (field.maxLength !== undefined && text.length > field.maxLength) {
    return reject(FORM_COPY.tooLong)
  }

  // Shape checks per text flavour
  if (field.kind === 'discord' && !DISCORD_PATTERN.test(text)) return reject(FORM_COPY.notADiscordId)
  if (field.kind === 'email' && !EMAIL_PATTERN.test(text)) return reject(FORM_COPY.notAnEmail)
  if (field.kind === 'colour' && !COLOUR_PATTERN.test(text)) return reject(FORM_COPY.notAColour)
  if (field.kind === 'url' && !URL.canParse(text)) return reject(FORM_COPY.notAUrl)
  if (field.kind === 'select' && field.options) {
    const allowed = new Set(field.options.map((option) => option.value))
    if (!allowed.has(text)) return reject(FORM_COPY.notAnOption)
  }

  return text
}

/**
 * Validate and normalise raw values
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {Record<string, unknown>} raw - Raw values
 * @param {ParseOptions} [options] - Parsing knobs
 * @return {ParseResult} - Values and rejections
 */

export const parseFormValues = (
  fields: FieldDefinition[],
  raw: Record<string, unknown>,
  options: ParseOptions = {}
): ParseResult => {
  const { enforceRequired = true, fillMissing = false } = options
  const issues: FieldIssue[] = []
  const values: FormValues = {}

  // Resolve visibility against raw values first
  const draft: FormValues = {}
  for (const field of fields) {
    draft[field.name] = (raw[field.name] ?? null) as FieldValue
  }

  for (const field of fields) {
    // A hidden field is never required, and never carries a value
    if (!isFieldVisible(field, draft)) continue
    if (!(field.name in raw) && !fillMissing) continue

    const parsed = parseField(field, raw[field.name], issues)

    if (enforceRequired && field.required && isBlank(parsed) && parsed !== false) {
      issues.push({ field: field.name, message: FORM_COPY.required })
    }

    values[field.name] = parsed
  }

  return { values, issues, ok: issues.length === 0 }
}

/**
 * Build a reusable validator
 * @param {FieldDefinition[]} fields - Field declarations
 * @return {(raw: Record<string, unknown>, options?: ParseOptions) => ParseResult} - Validator
 */

export const buildFormSchema =
  (fields: FieldDefinition[]) =>
  (raw: Record<string, unknown>, options?: ParseOptions): ParseResult =>
    parseFormValues(fields, raw, options)
