import { visibleFields } from '@/core/lib/forms/visibility'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import type { IconName } from '@/declarations/ui/icons'
import type { FieldDefinition, FormValues } from '@/types/forms'

/**
 * Icon of each form category, keyed on its label since that is all a group carries
 * @type {Record<string, IconName>}
 */

export const FORM_GROUP_ICONS: Record<string, IconName> = {
  [FORM_GROUPS.essentials]: 'sheet',
  [FORM_GROUPS.assignment]: 'members',
  [FORM_GROUPS.planning]: 'clock',
  [FORM_GROUPS.details]: 'note',
  [FORM_GROUPS.identity]: 'sheet',
  [FORM_GROUPS.contact]: 'mail',
  [FORM_GROUPS.visibility]: 'visible',
  [FORM_GROUPS.encadrement]: 'shield',
}

/**
 * One category of a form declaration
 * @typedef {Object} FieldGroup
 * @property {string} name - Category label, also its key
 * @property {FieldDefinition[]} fields - Visible fields of the category
 */

export interface FieldGroup {
  name: string
  fields: FieldDefinition[]
}

/**
 * Split the visible fields into the categories they were declared under
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} values - Current values
 * @return {FieldGroup[]} - Categories in declaration order
 */

export const groupFields = (fields: FieldDefinition[], values: FormValues): FieldGroup[] => {
  const groups: FieldGroup[] = []

  for (const field of visibleFields(fields, values)) {
    const name = field.group ?? FORM_GROUPS.essentials
    const group = groups.find((entry) => entry.name === name)

    if (group) group.fields.push(field)
    else groups.push({ name, fields: [field] })
  }

  return groups
}
