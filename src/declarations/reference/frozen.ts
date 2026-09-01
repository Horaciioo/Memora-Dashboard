import { ENCADREMENT_ROLES, ROLE_REGISTRY } from '@/declarations/access/roles'
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

// The encadrement reads top down, the widest level first
const ENCADREMENT_ROWS: FrozenRow[] = [...ENCADREMENT_ROLES].reverse().map((role) => {
  const meta = ROLE_REGISTRY.get(role)

  return { id: role, label: meta.label, hint: meta.summary, accent: meta.accent }
})

/**
 * Rows a collection carries but never lets anyone write
 * @type {Partial<Record<ReferenceKey, FrozenRow[]>>}
 */

export const FROZEN_REFERENCE_ROWS: Partial<Record<ReferenceKey, FrozenRow[]>> = {
  fonctions: ENCADREMENT_ROWS,
}

/**
 * Read the frozen rows of a collection
 * @param {ReferenceKey} key - Collection key
 * @return {FrozenRow[]} - Frozen rows
 */

export const frozenRows = (key: ReferenceKey): FrozenRow[] => FROZEN_REFERENCE_ROWS[key] ?? []
