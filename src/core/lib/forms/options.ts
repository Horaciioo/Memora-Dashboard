import type { Registry } from '@/core/lib/registry'
import { ACCESS_CATEGORY_REGISTRY } from '@/declarations/access/categories'
import { ROLE_REGISTRY, byRoleRank } from '@/declarations/access/roles'
import { FUNCTION_KIND_REGISTRY } from '@/declarations/reference/registries'
import type { AccessCategoryName, MemberRoleName } from '@/utils/constants/hierarchy'
import type { FunctionKindName } from '@/utils/constants/workflow'
import type { FieldDefinition, FieldOption, FieldValue } from '@/types/forms'

/**
 * Turn a registry into select options
 * @param {Registry<TKey, TValue>} registry - Registry to read
 * @return {FieldOption[]} - Select options
 */

export const toOptions = <
  TKey extends string,
  TValue extends { label: string; accent?: string | null; icon?: string },
>(
  registry: Registry<TKey, TValue>
): FieldOption[] =>
  registry.keys.map((key) => ({
    value: key,
    label: registry.label(key),
    accent: registry.get(key).accent ?? undefined,
    icon: registry.get(key).icon,
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
    bannerUrl?: string | null
    icon?: string | null
  }[]
): FieldOption[] =>
  rows.map((row) => ({
    value: row.id,
    label: row.name,
    accent: row.accent ?? undefined,
    image: row.avatarUrl ?? undefined,
    banner: row.bannerUrl ?? undefined,
    icon: row.icon ?? undefined,
  }))

/**
 * Function options headed by category, principal ones before secondary ones
 * @param {Array<{ id: string, name: string, kind: FunctionKindName, category: AccessCategoryName }>} rows - Function rows
 * @return {FieldOption[]} - Select options
 */

export const functionOptions = (
  rows: {
    id: string
    name: string
    kind: FunctionKindName
    category: AccessCategoryName
    position?: number
    accent?: string | null
    icon?: string | null
  }[]
): FieldOption[] =>
  [...rows]
    .sort(
      (left, right) =>
        ACCESS_CATEGORY_REGISTRY.get(left.category).position -
          ACCESS_CATEGORY_REGISTRY.get(right.category).position ||
        FUNCTION_KIND_REGISTRY.keys.indexOf(left.kind) -
          FUNCTION_KIND_REGISTRY.keys.indexOf(right.kind) ||
        (left.position ?? 0) - (right.position ?? 0)
    )
    .flatMap((row) =>
      rowsToOptions([row]).map((option) => ({
        ...option,
        group: ACCESS_CATEGORY_REGISTRY.get(row.category).label,
      }))
    )

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
 * People options sorted and headed by role
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

/**
 * Options a select or multiselect value points at
 * @param {FieldDefinition} field - Select declaration
 * @param {FieldValue | undefined} value - Picked identifier or identifiers
 * @return {FieldOption[]} - Picked options in the field order
 */

export const pickedOptions = (
  field: FieldDefinition,
  value: FieldValue | undefined
): FieldOption[] => {
  const picked = Array.isArray(value) ? value : typeof value === 'string' ? [value] : []

  return field.options?.filter((option) => picked.includes(option.value)) ?? []
}
