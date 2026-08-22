import type { FieldDefinition, FormValues } from '@/types/forms'

/**
 * Check field visibility
 * @param {FieldDefinition} field - Field declaration
 * @param {FormValues} values - Current values
 * @return {boolean} - Field shows
 */

export const isFieldVisible = (field: FieldDefinition, values: FormValues): boolean => {
  const condition = field.visibleWhen
  if (!condition) return true

  const watched = values[condition.field] ?? null

  // Presence check wins over value checks
  if (condition.truthy !== undefined) {
    const filled = Array.isArray(watched) ? watched.length > 0 : Boolean(watched)
    return condition.truthy ? filled : !filled
  }

  if (condition.oneOf) return condition.oneOf.includes(String(watched))

  return watched === condition.equals
}

/**
 * Keep visible fields only
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} values - Current values
 * @return {FieldDefinition[]} - Visible fields
 */

export const visibleFields = (fields: FieldDefinition[], values: FormValues): FieldDefinition[] =>
  fields.filter((field) => isFieldVisible(field, values))

/**
 * List unfilled required fields
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} values - Current values
 * @return {string[]} - Field names
 */

export const collectMissingRequired = (fields: FieldDefinition[], values: FormValues): string[] =>
  visibleFields(fields, values)
    .filter((field) => field.required)
    .filter((field) => {
      const value = values[field.name]
      if (Array.isArray(value)) return value.length === 0
      if (typeof value === 'boolean') return false
      return value === null || value === undefined || value === ''
    })
    .map((field) => field.name)
