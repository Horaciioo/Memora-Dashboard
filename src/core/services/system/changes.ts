import 'server-only'

import { isBlankValue as isBlank, isSameValue as isSame } from '@/core/lib/forms/compare'
import { isSensitiveField } from '@/declarations/access/sensitive'
import { CHANGE_COPY, FIELD_NOUNS } from '@/declarations/activity/changes'
import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'
import { formatDay } from '@/utils/format/dates'

/**
 * One-line change description
 * @typedef {Object} ChangeSummary
 * @property {string} verb - Past participle
 * @property {string} rest - Remainder of the sentence
 * @property {ChangeLine[]} [lines] - Field by field detail
 */

export interface ChangeSummary {
  verb: string
  rest: string
  lines?: ChangeLine[]
}

/**
 * One field's move
 * @typedef {Object} ChangeLine
 * @property {string} label - Field label
 * @property {string | null} before - Value before, null when hidden
 * @property {string | null} after - Value after, null when hidden
 */

export interface ChangeLine {
  label: string
  before: string | null
  after: string | null
}

/**
 * Wording around a summary
 * @typedef {Object} SummaryOptions
 * @property {number} [maxListed] - Nouns spelled out before the rest is counted
 * @property {string} [context] - Phrase naming what the field belongs to
 */

export interface SummaryOptions {
  maxListed?: number
  context?: string
}

// Field kinds whose value is too long to quote in a one-line sentence
const LONG_KINDS = new Set(['textarea', 'markdown'])

/**
 * Noun naming a field
 * @param {FieldDefinition} field - Field declaration
 * @return {string} - Noun phrase
 */

const nounOf = (field: FieldDefinition): string =>
  FIELD_NOUNS[field.name as keyof typeof FIELD_NOUNS] ?? field.label.toLowerCase()

/**
 * Human form of a stored value
 * @param {FieldDefinition} field - Field declaration
 * @param {FieldValue | undefined} value - Stored value
 * @return {string} - Readable value
 */

const display = (field: FieldDefinition, value: FieldValue | undefined): string => {
  if (isBlank(value)) return ''

  if (Array.isArray(value)) {
    return value
      .map((item) => field.options?.find((option) => option.value === item)?.label ?? String(item))
      .join(CHANGE_COPY.listSeparator)
  }

  if ((field.kind === 'select' || field.kind === 'multiselect') && field.options) {
    return field.options.find((option) => option.value === String(value))?.label ?? String(value)
  }

  if (field.kind === 'date' || field.kind === 'datetime') return formatDay(String(value))

  return String(value)
}

/**
 * Trim an interpolated value to a single readable token
 * @param {string} text - Raw value
 * @return {string} - Clipped value
 */

const clip = (text: string): string => {
  const flat = text.replace(/\s+/g, ' ').trim()

  return flat.length > CHANGE_COPY.valueMaxLength
    ? `${flat.slice(0, CHANGE_COPY.valueMaxLength).trimEnd()}${CHANGE_COPY.ellipsis}`
    : flat
}

/**
 * Fill a sentence template
 * @param {string} template - Template holding {noun}, {value} and {context}
 * @param {Object} parts - Replacements
 * @param {string} [parts.noun] - Field noun
 * @param {string} [parts.value] - Readable value
 * @param {string} [parts.context] - Owner phrase
 * @return {string} - Filled sentence
 */

const fill = (
  template: string,
  parts: { noun?: string; value?: string; context?: string }
): string =>
  template
    .replace('{noun}', parts.noun ?? '')
    .replace('{value}', parts.value ?? '')
    .replace('{context}', parts.context ?? '')

/**
 * Describe a single field's move on its own
 * @param {FieldDefinition} field - Field that moved
 * @param {FieldValue | undefined} before - Value before
 * @param {FieldValue | undefined} after - Value after
 * @param {string} context - Owner phrase
 * @return {ChangeSummary} - Sentence fragment
 */

const describeField = (
  field: FieldDefinition,
  before: FieldValue | undefined,
  after: FieldValue | undefined,
  context: string
): ChangeSummary => {
  const noun = nounOf(field)
  const wasBlank = isBlank(before)
  const isNowBlank = isBlank(after)

  // The emoji reads as decorating the title
  if (field.kind === 'emoji') {
    if (wasBlank)
      return {
        verb: CHANGE_COPY.verbAdded,
        rest: fill(CHANGE_COPY.restEmojiAdded, { value: display(field, after), context }),
      }

    if (isNowBlank)
      return {
        verb: CHANGE_COPY.verbRemoved,
        rest: fill(CHANGE_COPY.restEmojiRemoved, { context }),
      }

    return {
      verb: CHANGE_COPY.verbReplaced,
      rest: fill(CHANGE_COPY.restEmojiReplaced, { value: display(field, after), context }),
    }
  }

  if (field.kind === 'toggle') {
    return {
      verb: after === true ? CHANGE_COPY.verbEnabled : CHANGE_COPY.verbDisabled,
      rest: fill(CHANGE_COPY.restToggle, { noun, context }),
    }
  }

  if (isNowBlank)
    return { verb: CHANGE_COPY.verbCleared, rest: fill(CHANGE_COPY.restCleared, { noun, context }) }

  const value = clip(display(field, after))
  const withValue = value !== '' && !LONG_KINDS.has(field.kind) && !isSensitiveField(field.name)

  if (wasBlank)
    return {
      verb: CHANGE_COPY.verbSet,
      rest: withValue
        ? fill(CHANGE_COPY.restSet, { noun, value, context })
        : fill(CHANGE_COPY.restSetPlain, { noun, context }),
    }

  return {
    verb: CHANGE_COPY.verbChanged,
    rest: withValue
      ? fill(CHANGE_COPY.restChanged, { noun, value, context })
      : fill(CHANGE_COPY.restChangedPlain, { noun, context }),
  }
}

/**
 * Join field nouns into a readable enumeration
 * @param {string[]} nouns - Field nouns
 * @return {string} - Enumeration
 */

const enumerate = (nouns: string[]): string => {
  if (nouns.length <= 1) return nouns[0] ?? ''

  return `${nouns.slice(0, -1).join(CHANGE_COPY.listSeparator)}${CHANGE_COPY.listLast}${nouns[nouns.length - 1]}`
}

/**
 * Field's move as a detail line
 * @param {FieldDefinition} field - Field that moved
 * @param {FieldValue | undefined} before - Value before
 * @param {FieldValue | undefined} after - Value after
 * @return {ChangeLine} - Detail line
 */

const toLine = (
  field: FieldDefinition,
  before: FieldValue | undefined,
  after: FieldValue | undefined
): ChangeLine => {
  const isHidden = LONG_KINDS.has(field.kind) || isSensitiveField(field.name)
  const show = (value: FieldValue | undefined) =>
    isHidden ? null : clip(display(field, value)) || CHANGE_COPY.blankValue

  return { label: field.label, before: show(before), after: show(after) }
}

/**
 * Summarise what changed between two form snapshots
 * @param {FieldDefinition[]} fields - Declarations bounding the comparison
 * @param {FormValues} before - Snapshot before the edit
 * @param {FormValues} after - Snapshot after the edit
 * @param {SummaryOptions} [options] - Wording around the summary
 * @return {ChangeSummary | null} - Description
 */

export const summariseChange = (
  fields: FieldDefinition[],
  before: FormValues,
  after: FormValues,
  { maxListed = 3, context = '' }: SummaryOptions = {}
): ChangeSummary | null => {
  const moves = fields
    .filter((field) => !isSame(before[field.name], after[field.name]))
    .map((field) => ({
      field,
      clause: describeField(field, before[field.name], after[field.name], context),
      line: toLine(field, before[field.name], after[field.name]),
    }))

  if (moves.length === 0) return null
  if (moves.length === 1) return { ...moves[0].clause, lines: [moves[0].line] }

  // One verb when every move shares it
  const verbs = new Set(moves.map((move) => move.clause.verb))
  const nouns = moves.map((move) => nounOf(move.field))
  const listed =
    nouns.length > maxListed
      ? CHANGE_COPY.listOverflow
          .replace('{shown}', enumerate(nouns.slice(0, maxListed)))
          .replace('{count}', String(nouns.length - maxListed))
      : enumerate(nouns)

  return {
    verb: verbs.size === 1 ? moves[0].clause.verb : CHANGE_COPY.verbChanged,
    rest: fill(CHANGE_COPY.restMany.replace('{nouns}', listed), { context }),
    lines: moves.map((move) => move.line),
  }
}
