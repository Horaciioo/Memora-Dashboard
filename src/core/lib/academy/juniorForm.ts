import type { FieldDefinition } from '@/types/forms'

/**
 * Fields of a held seat
 * @param {FieldDefinition[]} fields - Junior form
 * @return {FieldDefinition[]} - Editable fields
 */

export const toJuniorEditFields = (fields: FieldDefinition[]): FieldDefinition[] =>
  fields
    .filter((field) => field.name !== 'accountId')
    // Empty until the integration form
    .map((field) => (field.name === 'dispositifId' ? { ...field, required: false } : field))
