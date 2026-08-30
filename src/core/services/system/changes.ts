import 'server-only'

import { CHANGE_COPY, FIELD_NOUNS } from '@/declarations/activity/changes'
import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'
import { formatDay } from '@/utils/format/dates'

/**
 * One-line change description, everything after the actor's name
 * @typedef {Object} ChangeSummary
 * @property {string} verb - Past participle, emphasised on screen
 * @property {string} rest - Remainder of the sentence
 */

export interface ChangeSummary {
  verb: string
  rest: string
}

// Field kinds whose value is too long to quote in a one-line sentence
const LONG_KINDS = new Set(['textarea', 'markdown'])

/**
 * Value counts as blank
 * @param {FieldValue | undefined} value - Stored value
 * @return {boolean} - Empty
 */

const isBlank = (value: FieldValue | undefined): boolean =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0)

/**
 * Two values are equal, arrays compared as unordered sets
 * @param {FieldValue | undefined} left - First value
 * @param {FieldValue | undefined} right - Second value
 * @return {boolean} - Equal
 */

const isSame = (left: FieldValue | undefined, right: FieldValue | undefined): boolean => {
  if (Array.isArray(left) || Array.isArray(right)) {
    const a = [...(Array.isArray(left) ? left : [])].map(String).sort()
    const b = [...(Array.isArray(right) ? right : [])].map(String).sort()

    return a.length === b.length && a.every((item, index) => item === b[index])
  }

  return left === right
}

/**
 * Noun naming a field, its declared label as a fallback
 * @param {FieldDefinition} field - Field declaration
 * @return {string} - Noun phrase
 */

const nounOf = (field: FieldDefinition): string =>
  FIELD_NOUNS[field.name as keyof typeof FIELD_NOUNS] ?? field.label.toLowerCase()

/**
 * Human form of a stored value, resolved through the field declaration
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
 * @param {string} template - Template holding {noun} and {value}
 * @param {Object} parts - Replacements
 * @param {string} [parts.noun] - Field noun
 * @param {string} [parts.value] - Readable value
 * @return {string} - Filled sentence
 */

const fill = (template: string, parts: { noun?: string; value?: string }): string =>
  template.replace('{noun}', parts.noun ?? '').replace('{value}', parts.value ?? '')

/**
 * Describe a single field's move on its own
 * @param {FieldDefinition} field - Field that moved
 * @param {FieldValue | undefined} before - Value before
 * @param {FieldValue | undefined} after - Value after
 * @return {ChangeSummary} - Sentence fragment
 */

const describeField = (
  field: FieldDefinition,
  before: FieldValue | undefined,
  after: FieldValue | undefined
): ChangeSummary => {
  const noun = nounOf(field)
  const wasBlank = isBlank(before)
  const isNowBlank = isBlank(after)

  // The emoji reads as decorating the title, whatever field carries it
  if (field.kind === 'emoji') {
    if (wasBlank)
      return {
        verb: CHANGE_COPY.verbAdded,
        rest: fill(CHANGE_COPY.restEmojiAdded, { value: display(field, after) }),
      }

    if (isNowBlank) return { verb: CHANGE_COPY.verbRemoved, rest: CHANGE_COPY.restEmojiRemoved }

    return {
      verb: CHANGE_COPY.verbReplaced,
      rest: fill(CHANGE_COPY.restEmojiReplaced, { value: display(field, after) }),
    }
  }

  if (field.kind === 'toggle') {
    return {
      verb: after === true ? CHANGE_COPY.verbEnabled : CHANGE_COPY.verbDisabled,
      rest: fill(CHANGE_COPY.restToggle, { noun }),
    }
  }

  if (isNowBlank)
    return { verb: CHANGE_COPY.verbCleared, rest: fill(CHANGE_COPY.restCleared, { noun }) }

  const value = clip(display(field, after))
  const withValue = value !== '' && !LONG_KINDS.has(field.kind)

  if (wasBlank)
    return {
      verb: CHANGE_COPY.verbSet,
      rest: withValue
        ? fill(CHANGE_COPY.restSet, { noun, value })
        : fill(CHANGE_COPY.restSetPlain, { noun }),
    }

  return {
    verb: CHANGE_COPY.verbChanged,
    rest: withValue
      ? fill(CHANGE_COPY.restChanged, { noun, value })
      : fill(CHANGE_COPY.restChangedPlain, { noun }),
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
 * Summarise what changed between two form snapshots, on a single line
 * @param {FieldDefinition[]} fields - Declarations bounding the comparison
 * @param {FormValues} before - Snapshot before the edit
 * @param {FormValues} after - Snapshot after the edit
 * @param {number} [maxListed] - Nouns spelled out before the rest is counted
 * @return {ChangeSummary | null} - Description, or null when nothing moved
 */

export const summariseChange = (
  fields: FieldDefinition[],
  before: FormValues,
  after: FormValues,
  maxListed: number = 3
): ChangeSummary | null => {
  const moves = fields
    .filter((field) => !isSame(before[field.name], after[field.name]))
    .map((field) => ({
      field,
      clause: describeField(field, before[field.name], after[field.name]),
    }))

  if (moves.length === 0) return null
  if (moves.length === 1) return moves[0].clause

  const nouns = moves.map((move) => nounOf(move.field))
  const rest =
    nouns.length > maxListed
      ? CHANGE_COPY.listOverflow
          .replace('{shown}', enumerate(nouns.slice(0, maxListed)))
          .replace('{count}', String(nouns.length - maxListed))
      : enumerate(nouns)

  return { verb: CHANGE_COPY.verbChanged, rest }
}
