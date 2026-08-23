import type { FieldDefinition, FormValues } from '@/types/forms'
import type { ReferenceKey } from '@/declarations/reference/sections'

/**
 * Row of a reference collection, normalised for the admin console
 * @typedef {Object} ReferenceRow
 * @property {string} id - Row identifier
 * @property {string} label - Primary line
 * @property {string | null} hint - Secondary line
 * @property {string | null} accent - Colour token
 * @property {string | null} [image] - Portrait shown beside the label
 * @property {string[]} badges - Short qualifiers
 * @property {number} position - Display order
 * @property {number} usage - Records pointing at the row
 * @property {FormValues} values - Values feeding the edit form
 */

export interface ReferenceRow {
  id: string
  label: string
  hint: string | null
  accent: string | null
  image?: string | null
  badges: string[]
  position: number
  usage: number
  values: FormValues
}

/**
 * Everything a reference page needs to render
 * @typedef {Object} ReferencePayload
 * @property {ReferenceKey} key - Collection key
 * @property {FieldDefinition[]} fields - Form declarations
 * @property {ReferenceRow[]} rows - Existing rows
 */

export interface ReferencePayload {
  key: ReferenceKey
  fields: FieldDefinition[]
  rows: ReferenceRow[]
}
