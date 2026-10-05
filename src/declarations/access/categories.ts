import { createRegistry } from '@/core/lib/registry'
import { AccessCategories, MemberRoles } from '@/utils/constants/hierarchy'
import type { AccessCategoryName, MemberRoleName } from '@/utils/constants/hierarchy'

/**
 * Access console category metadata
 * @typedef {Object} AccessCategoryOption
 * @property {string} label - Heading of the rail section
 * @property {number} position - Display order
 * @property {MemberRoleName} tier - Hierarchy level the functions of the section sit at
 * @property {MemberRoleName} [role] - Hierarchy level shown as the base row of the section
 */

interface AccessCategoryOption {
  label: string
  position: number
  tier: MemberRoleName
  role?: MemberRoleName
}

// Leaders sit above the administration
const ACCESS_CATEGORY_MAP: Record<AccessCategoryName, AccessCategoryOption> = {
  [AccessCategories.Leader]: {
    label: 'Leader',
    position: 0,
    tier: MemberRoles.Admin,
    role: MemberRoles.Admin,
  },
  [AccessCategories.Administration]: {
    label: 'Administration',
    position: 1,
    tier: MemberRoles.Responsable,
    role: MemberRoles.Responsable,
  },
  [AccessCategories.Responsabilite]: {
    label: 'Responsabilité',
    position: 2,
    tier: MemberRoles.Responsable,
  },
  [AccessCategories.Moderation]: {
    label: 'Modérateurs',
    position: 3,
    tier: MemberRoles.Moderateur,
    role: MemberRoles.Moderateur,
  },
}

export const ACCESS_CATEGORY_REGISTRY = createRegistry(ACCESS_CATEGORY_MAP)

/**
 * Categories in rail order
 * @type {AccessCategoryName[]}
 */

export const ACCESS_CATEGORY_ORDER: AccessCategoryName[] = ACCESS_CATEGORY_REGISTRY.keys
  .slice()
  .sort(
    (left, right) =>
      ACCESS_CATEGORY_REGISTRY.get(left).position - ACCESS_CATEGORY_REGISTRY.get(right).position
  )

/**
 * Category heading a hierarchy level sits under
 * @param {MemberRoleName} role - Hierarchy level
 * @return {AccessCategoryName} - Category holding it
 */

export const categoryOfRole = (role: MemberRoleName): AccessCategoryName =>
  ACCESS_CATEGORY_ORDER.find((entry) => ACCESS_CATEGORY_REGISTRY.get(entry).role === role) ??
  AccessCategories.Moderation

/**
 * Hierarchy level the functions of one category sit at
 * @param {AccessCategoryName} category - Category key
 * @return {MemberRoleName} - Hierarchy level
 */

export const tierOfCategory = (category: AccessCategoryName): MemberRoleName =>
  ACCESS_CATEGORY_REGISTRY.get(category).tier

/**
 * Fallback category when a raw value is not a known one
 * @param {string} value - Raw category
 * @return {AccessCategoryName} - Known category
 */

export const readCategory = (value: string): AccessCategoryName =>
  ACCESS_CATEGORY_REGISTRY.has(value) ? (value as AccessCategoryName) : AccessCategories.Moderation
