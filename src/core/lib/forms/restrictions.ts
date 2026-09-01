import type { FieldDefinition, FormValues } from '@/types/forms'

/**
 * Lock restricted fields
 * @param {FieldDefinition[]} fields - Form declarations
 * @param {boolean} isAdmin - Viewer sits at admin level
 * @return {FieldDefinition[]} - Declarations, restricted ones read-only
 */

export const applyRestrictions = (
  fields: FieldDefinition[],
  isAdmin: boolean
): FieldDefinition[] => {
  if (isAdmin) return fields

  return fields.map((field) => (field.adminOnly ? { ...field, readOnly: true } : field))
}

/**
 * Drop restricted values
 * @param {FieldDefinition[]} fields - Form declarations
 * @param {FormValues} values - Submitted values
 * @param {boolean} isAdmin - Viewer sits at admin level
 * @return {FormValues} - Values the viewer may actually write
 */

export const stripRestricted = (
  fields: FieldDefinition[],
  values: FormValues,
  isAdmin: boolean
): FormValues => {
  if (isAdmin) return values

  const locked = new Set(fields.filter((field) => field.adminOnly).map((field) => field.name))

  return Object.fromEntries(Object.entries(values).filter(([name]) => !locked.has(name)))
}
