import type { FieldDefinition, FieldKind, FormValues } from '@/types/forms'

// Inputs that can rewrite a whole selection
const BULK_KINDS: FieldKind[] = ['select', 'multiselect', 'date', 'datetime']

/**
 * Fields a selection can be rewritten with
 * @param {FieldDefinition[]} fields - Declarations of the record form
 * @return {FieldDefinition[]} - Optional, standalone declarations
 */

export const bulkFieldsOf = (fields: FieldDefinition[]): FieldDefinition[] =>
  fields
    .filter((field) => BULK_KINDS.includes(field.kind) && !field.readOnly)
    .map((field) => ({
      ...field,
      required: false,
      span: 'full',
      // Nothing a bulk form reads from its sibling fields
      preset: undefined,
      visibleWhen: undefined,
      ownerField: undefined,
      defaultFromOwner: undefined,
      prefixFrom: undefined,
    }))

/**
 * Values the user actually filled
 * @param {FormValues} values - Bulk form values
 * @return {FormValues} - Touched fields only
 */

export const filledValues = (values: FormValues): FormValues =>
  Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)
    )
  )
