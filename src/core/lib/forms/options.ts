import type { Registry } from '@/core/lib/registry'
import { ROLE_REGISTRY, byRoleRank } from '@/declarations/access/roles'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import type { FieldOption } from '@/types/forms'

/**
 * Turn a registry into select options
 * @param {Registry<TKey, TValue>} registry - Registry to read
 * @return {FieldOption[]} - Select options
 */

export const toOptions = <
  TKey extends string,
  TValue extends { label: string; accent?: string | null },
>(
  registry: Registry<TKey, TValue>
): FieldOption[] =>
  registry.keys.map((key) => ({
    value: key,
    label: registry.label(key),
    accent: registry.get(key).accent ?? undefined,
  }))

/**
 * Turn database rows into select options
 * @param {Array<{ id: string, name: string, accent?: string, avatarUrl?: string }>} rows - Rows to map
 * @return {FieldOption[]} - Select options
 */

export const rowsToOptions = (
  rows: {
    id: string
    name: string
    accent?: string | null
    avatarUrl?: string | null
    icon?: string | null
  }[]
): FieldOption[] =>
  rows.map((row) => ({
    value: row.id,
    label: row.name,
    accent: row.accent ?? undefined,
    image: row.avatarUrl ?? undefined,
    icon: row.icon ?? undefined,
  }))

/**
 * Account row a people picker reads
 * @typedef {Object} PersonRow
 * @property {string} id - Account identifier
 * @property {string} displayName - Display name
 * @property {string | null} avatarUrl - Portrait
 * @property {MemberRoleName} role - Hierarchy level
 */

export interface PersonRow {
  id: string
  displayName: string
  avatarUrl: string | null
  role: MemberRoleName
}

/**
 * People options sorted and headed by role, highest first
 * @param {TRow[]} rows - Account rows
 * @param {(row: TRow) => Partial<FieldOption>} [extra] - Per-row additions
 * @return {FieldOption[]} - Select options
 */

export const roleGroupedOptions = <TRow extends PersonRow>(
  rows: TRow[],
  extra?: (row: TRow) => Partial<FieldOption>
): FieldOption[] =>
  [...rows]
    .sort(
      (left, right) =>
        byRoleRank(left.role, right.role) || left.displayName.localeCompare(right.displayName, 'fr')
    )
    .map((row) => ({
      value: row.id,
      label: row.displayName,
      image: row.avatarUrl,
      group: ROLE_REGISTRY.get(row.role).plural,
      ...extra?.(row),
    }))
