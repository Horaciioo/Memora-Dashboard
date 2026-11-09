import 'server-only'
import { readList } from '@/core/lib/forms/values'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import type { FormValues } from '@/types/forms'
import type { WorkTag } from '@/types/work'
import type { WorkflowPhaseName } from '@/utils/constants/workflow'

/**
 * Reference row shaped like a tag
 * @typedef {Object} TagRow
 * @property {string} id - Row identifier
 * @property {string} name - Display name
 * @property {string | null} accent - Colour token
 */

interface TagRow {
  id: string
  name: string
  accent?: string | null
  phase?: WorkflowPhaseName | null
}

/**
 * Map a reference row to a tag
 * @param {TagRow | null} row - Reference row
 * @return {WorkTag | null} - Tag or null
 */

export const toTag = (row: TagRow | null | undefined): WorkTag | null =>
  row
    ? { id: row.id, label: row.name, accent: row.accent ?? null, phase: row.phase ?? undefined }
    : null

/**
 * Creator row shaped like a tag
 * @param {{ id: string, name: string, accent: string | null, avatarUrl: string | null } | null} row - Creator row
 * @return {WorkTag | null} - Tag or null
 */

export const toCreatorTag = (
  row: { id: string; name: string; accent: string | null; avatarUrl: string | null } | null
): WorkTag | null =>
  row ? { id: row.id, label: row.name, accent: row.accent, image: row.avatarUrl } : null

/**
 * Creator rows shaped like tags
 * @param {Array<{ id: string, name: string, accent: string | null, avatarUrl: string | null }>} rows - Creator rows
 * @return {WorkTag[]} - Tags
 */

export const toCreatorTags = (
  rows: { id: string; name: string; accent: string | null; avatarUrl: string | null }[]
): WorkTag[] => rows.map((row) => toCreatorTag(row)).filter((tag) => tag !== null)

// Creators a work card lists, in display order
export const YOUTUBERS_INCLUDE = { orderBy: { position: 'asc' } } as const

/**
 * Read the picked creators
 * @param {FormValues} values - Parsed body
 * @return {string[]} - Creator identifiers
 */

export const readCreatorIds = (values: FormValues): string[] => [
  ...new Set(readList(values, 'youtuberIds')),
]

/**
 * Creators a row ends up with
 * @param {string[]} picked - Creators chosen in the form
 * @param {AccessScope} scope - Editor perimeter
 * @param {string[]} [stored] - Creators the row already carries
 * @return {string[]} - Chosen creators, plus the stored ones the editor cannot see
 */

export const keptCreatorIds = (
  picked: string[],
  scope: AccessScope,
  stored: string[] = []
): string[] =>
  scope.isGlobal
    ? picked
    : [...picked, ...stored.filter((id) => !scope.youtuberIds.includes(id) && !picked.includes(id))]

/**
 * Identify creators for a relation write
 * @param {string[]} ids - Creator identifiers
 * @return {Array<{ id: string }>} - Relation targets
 */

export const creatorLinks = (ids: string[]): { id: string }[] => ids.map((id) => ({ id }))

/**
 * Project row shaped like a tag
 * @param {{ id: string, title: string, emoji: string | null } | null} row - Project row
 * @return {WorkTag | null} - Tag or null
 */

export const toProjectTag = (
  row: { id: string; title: string; emoji: string | null } | null
): WorkTag | null => (row ? { id: row.id, label: row.title, accent: null, emoji: row.emoji } : null)
