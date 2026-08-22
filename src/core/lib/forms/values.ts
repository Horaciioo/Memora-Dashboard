import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'

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
        field.kind === 'datetime' ? raw.toISOString().slice(0, 16) : raw.toISOString().slice(0, 10)
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
 * Read a date value
 * @param {FormValues} values - Form values
 * @param {string} name - Field name
 * @return {Date | null} - Date or null
 */

export const readDate = (values: FormValues, name: string): Date | null => {
  const text = readText(values, name)
  if (!text) return null

  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
