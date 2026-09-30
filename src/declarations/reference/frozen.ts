import type { ReferenceKey } from '@/declarations/reference/sections'

/**
 * Frozen reference row
 * @typedef {Object} FrozenRow
 * @property {string} id - Row key
 * @property {string} label - Display name
 * @property {string} hint - Supporting line
 * @property {string} accent - Colour token
 */

export interface FrozenRow {
  id: string
  label: string
  hint: string
  accent: string
}

/**
 * Rows a collection carries but never lets anyone write
 * @type {Partial<Record<ReferenceKey, FrozenRow[]>>}
 */

export const FROZEN_REFERENCE_ROWS: Partial<Record<ReferenceKey, FrozenRow[]>> = {}

/**
 * Read the frozen rows of a collection
 * @param {ReferenceKey} key - Collection key
 * @return {FrozenRow[]} - Frozen rows
 */

export const frozenRows = (key: ReferenceKey): FrozenRow[] => FROZEN_REFERENCE_ROWS[key] ?? []
