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
 * Narrow owned options to the picked owners
 * @param {FieldDefinition} field - Field declaration
 * @param {FormValues} values - Current values
 * @return {FieldDefinition} - Field with its reachable options
 */

export const narrowOptions = (field: FieldDefinition, values: FormValues): FieldDefinition => {
  if (!field.ownerField || !field.options) return field

  const picked = values[field.ownerField]
  const owners = Array.isArray(picked) ? picked : picked ? [String(picked)] : []
  if (owners.length === 0) return field

  return {
    ...field,
    options: field.options.filter(
      (option) =>
        (!option.owner && !option.owners) ||
        (option.owner !== undefined && owners.includes(option.owner)) ||
        option.owners?.some((owner) => owners.includes(owner))
    ),
  }
}

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

/**
 * Settle the fields owned by a field that just changed: defaults are picked, stale picks dropped
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} values - Values after the change
 * @param {string} owner - Name of the field that changed
 * @return {FormValues} - Values with the owned fields settled
 */

export const settleOwned = (
  fields: FieldDefinition[],
  values: FormValues,
  owner: string
): FormValues => {
  const next = { ...values }

  for (const field of fields) {
    if (field.ownerField !== owner || !field.options) continue

    const reachable = new Set(
      (narrowOptions(field, next).options ?? [])
        .filter((option) => !option.disabled)
        .map((option) => option.value)
    )
    const current = next[field.name]

    if (field.defaultFromOwner) next[field.name] = values[owner] ? [...reachable] : []
    else if (Array.isArray(current))
      next[field.name] = current.filter((value) => reachable.has(value))
    else if (typeof current === 'string' && !reachable.has(current)) next[field.name] = null
  }

  return next
}
