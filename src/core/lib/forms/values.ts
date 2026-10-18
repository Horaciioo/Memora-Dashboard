import { DEFAULT_ZONE } from '@/declarations/ui/dates'
import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'
import { instantToWall, isInstantText, isWallClock, wallToInstant } from '@/utils/format/zone'

/**
 * Build blank values from declarations
 * @param {FieldDefinition[]} fields - Field declarations
 * @return {FormValues} - Empty values
 */

export const emptyValues = (fields: FieldDefinition[]): FormValues =>
  Object.fromEntries(
    fields.map((field) => [
      field.name,
      field.kind === 'toggle'
        ? false
        : field.kind === 'multiselect' || field.kind === 'tags'
          ? []
          : null,
    ])
  )

/**
 * Overlay stored values onto blanks
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {Record<string, unknown>} source - Stored record
 * @return {FormValues} - Form values
 */

export const valuesFrom = (
  fields: FieldDefinition[],
  source: Record<string, unknown>
): FormValues => {
  const values = emptyValues(fields)

  for (const field of fields) {
    if (!(field.name in source)) continue

    const raw = source[field.name]
    if (raw === null || raw === undefined) continue

    // Dates arrive as Date objects from the database
    if (raw instanceof Date) {
      values[field.name] =
        field.kind === 'datetime' ? raw.toISOString() : raw.toISOString().slice(0, 10)
      continue
    }

    values[field.name] = raw as FieldValue
  }

  return values
}

/**
 * Read a text value
 * @param {FormValues} values - Form values
 * @param {string} name - Field name
 * @return {string | null} - Text or null
 */

export const readText = (values: FormValues, name: string): string | null => {
  const value = values[name]
  return typeof value === 'string' && value.length > 0 ? value : null
}

/**
 * Read a required text value
 * @param {FormValues} values - Form values
 * @param {string} name - Field name
 * @return {string} - Text
 */

export const readRequiredText = (values: FormValues, name: string): string =>
  readText(values, name) ?? ''

/**
 * Read a number value
 * @param {FormValues} values - Form values
 * @param {string} name - Field name
 * @return {number | null} - Number or null
 */

export const readNumberValue = (values: FormValues, name: string): number | null => {
  const value = values[name]
  return typeof value === 'number' ? value : null
}

/**
 * Read a boolean value
 * @param {FormValues} values - Form values
 * @param {string} name - Field name
 * @return {boolean} - Flag
 */

export const readFlag = (values: FormValues, name: string): boolean => values[name] === true

/**
 * Read a string list value
 * @param {FormValues} values - Form values
 * @param {string} name - Field name
 * @return {string[]} - Entries
 */

export const readList = (values: FormValues, name: string): string[] => {
  const value = values[name]
  return Array.isArray(value) ? value : []
}

/**
 * Wall-clock minutes read in the team zone
 * @param {string} text - Day, ISO minute or moment
 * @return {string} - Text a Date parses the same everywhere
 */

const wallClock = (text: string): string =>
  isWallClock(text) ? wallToInstant(text, DEFAULT_ZONE).toISOString() : text

/**
 * Read a date value
 * @param {FormValues} values - Form values
 * @param {string} name - Field name
 * @return {Date | null} - Date or null
 */

export const readDate = (values: FormValues, name: string): Date | null => {
  const text = readText(values, name)
  if (!text) return null

  // Moments arrive as instants, a stray wall clock reads in the team zone
  const parsed = new Date(wallClock(text))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Read a day range value
 * @param {FormValues} values - Form values
 * @param {string} name - Field name
 * @return {[Date, Date] | null} - Range or null
 */

export const readDateRange = (values: FormValues, name: string): [Date, Date] | null => {
  const value = values[name]
  if (!Array.isArray(value) || value.length !== 2) return null

  const start = new Date(wallClock(String(value[0])))
  const end = new Date(wallClock(String(value[1])))
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null

  return [start, end]
}

/**
 * Context a blank form presets from
 * @typedef {Object} PresetContext
 * @property {string | null} actorId - Signed-in member
 * @property {string} today - ISO day
 * @property {string} now - Datetime field value
 */

export interface PresetContext {
  actorId: string | null
  today: string
  now: string
}

/**
 * Preset value of one field
 * @param {FieldDefinition} field - Field declaration
 * @param {PresetContext} context - Actor and clock
 * @return {FieldValue | undefined} - Preset or nothing
 */

const presetOf = (field: FieldDefinition, context: PresetContext): FieldValue | undefined => {
  // Clock presets
  if (field.preset === 'today') {
    if (field.kind === 'datetime') return context.now
    if (field.kind === 'daterange') return [context.today, context.today]
    return context.today
  }

  // Monday to Sunday of the coming week
  if (field.preset === 'nextWeek') {
    const monday = new Date(`${context.today}T00:00:00Z`)
    monday.setUTCDate(monday.getUTCDate() + ((8 - monday.getUTCDay()) % 7 || 7))
    const sunday = new Date(monday)
    sunday.setUTCDate(monday.getUTCDate() + 6)

    const [opens, closes] = field.withTime ? (field.defaultTimes ?? ['00:00', '23:59']) : ['', '']
    const at = (day: Date, hour: string) =>
      `${day.toISOString().slice(0, 10)}${field.withTime ? `T${hour}` : ''}`

    return [at(monday, opens), at(sunday, closes)]
  }

  // Actor
  if (field.preset === 'actor') {
    const offered = field.options?.some((option) => option.value === context.actorId)
    if (!context.actorId || (field.options && !offered)) return undefined
    return field.kind === 'multiselect' ? [context.actorId] : context.actorId
  }

  // Flagged option
  if (field.preset === 'default') {
    const flagged = field.options?.find((option) => option.isDefault && !option.disabled)?.value
    if (flagged === undefined) return undefined

    return field.kind === 'multiselect' ? [flagged] : flagged
  }

  return undefined
}

/**
 * Blank values with presets
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {PresetContext} context - Actor and clock
 * @param {FormValues} [seed] - Values already known
 * @return {FormValues} - Starting values
 */

export const presetValues = (
  fields: FieldDefinition[],
  context: PresetContext,
  seed: FormValues = {}
): FormValues => {
  const values = emptyValues(fields)

  // Presets fill blanks only
  for (const field of fields) {
    const preset = presetOf(field, context)
    if (preset !== undefined) values[field.name] = preset
  }

  return { ...values, ...seed }
}

/**
 * Tell whether a field holds a moment of the day
 * @param {FieldDefinition} field - Field declaration
 * @return {boolean} - Datetime or timed range
 */

const isTimed = (field: FieldDefinition): boolean =>
  field.kind === 'datetime' || (field.kind === 'daterange' && Boolean(field.withTime))

/**
 * Convert the timed values of a form
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} values - Form values
 * @param {(text: string) => string} convert - Conversion of one text
 * @return {FormValues} - Converted values
 */

const mapTimed = (
  fields: FieldDefinition[],
  values: FormValues,
  convert: (text: string) => string
): FormValues => {
  const next = { ...values }

  for (const field of fields) {
    const value = next[field.name]
    if (!isTimed(field)) continue

    if (typeof value === 'string') next[field.name] = convert(value)
    else if (Array.isArray(value)) next[field.name] = value.map(convert)
  }

  return next
}

/**
 * Turn the wall clocks of a form into moments
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} values - Form values
 * @param {string} [zone] - IANA zone the clocks read in
 * @return {FormValues} - Values holding instants
 */

export const toInstantValues = (
  fields: FieldDefinition[],
  values: FormValues,
  zone?: string
): FormValues =>
  mapTimed(fields, values, (text) =>
    isWallClock(text) ? wallToInstant(text, zone).toISOString() : text
  )

/**
 * Turn the moments of a field text into a wall clock
 * @param {string} text - Moment or wall clock
 * @return {string} - Wall clock of the active zone
 */

export const toWallText = (text: string): string =>
  isInstantText(text) ? instantToWall(text) : text
