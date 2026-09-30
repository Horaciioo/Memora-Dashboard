import 'server-only'

import {
  readFunctionBaseline,
  readFunctionGrants,
  readRoleBaseline,
  readRoleGrants,
} from '@/core/services/auth/GrantsService'
import {
  readAccessRoster,
  readCreatorPerimeter,
  readRoleAppearances,
} from '@/core/services/auth/RolesService'
import { ACCESS_CATEGORY_ORDER, ACCESS_CATEGORY_REGISTRY } from '@/declarations/access/categories'
import { ENCADREMENT_ROLES, FLOOR_ROLE, ROLE_REGISTRY } from '@/declarations/access/roles'
import type { AccessConsole, RoleGrantsView } from '@/types/access'
import type { MemberRoleName } from '@/utils/constants/hierarchy'

/**
 * Build everything the access console renders
 * @param {boolean} canManageEncadrement - Viewer may write the encadrement levels
 * @param {string | null} youtuberId - Creator the open overwrite layer belongs to
 * @return {Promise<AccessConsole>} - Console data
 */

export const readAccessConsole = async (
  canManageEncadrement: boolean,
  youtuberId: string | null = null
): Promise<AccessConsole> => {
  const [roleGrants, functions, appearances, roster, perimeter] = await Promise.all([
    readRoleGrants(youtuberId),
    readFunctionGrants(youtuberId),
    readRoleAppearances(),
    readAccessRoster(),
    readCreatorPerimeter(),
  ])

  // Every category that heads a hierarchy level, in rail order
  const headed = ACCESS_CATEGORY_ORDER.map((category) => ({
    category,
    role: ACCESS_CATEGORY_REGISTRY.get(category).role,
  })).filter(
    (entry): entry is { category: typeof entry.category; role: MemberRoleName } =>
      entry.role !== undefined
  )

  const baselines = await Promise.all(headed.map((entry) => readRoleBaseline(entry.role)))

  const roles: RoleGrantsView[] = headed.map((entry, index) => {
    const meta = ROLE_REGISTRY.get(entry.role)
    const look = appearances[entry.role]

    return {
      role: entry.role,
      label: meta.label,
      accent: look?.accent ?? meta.accent,
      icon: look?.icon ?? null,
      locked: ENCADREMENT_ROLES.includes(entry.role) && !canManageEncadrement,
      category: entry.category,
      isFloor: entry.role === FLOOR_ROLE,
      members: roster.filter((account) => account.role === entry.role).length,
      permissions: roleGrants[entry.role] ?? [],
      baseline: baselines[index],
    }
  })

  // One baseline read per category rather than per function, they share it
  const categoryBaselines = new Map(
    await Promise.all(
      ACCESS_CATEGORY_ORDER.map(
        async (category) => [category, await readFunctionBaseline(category)] as const
      )
    )
  )

  return {
    roles,
    functions: functions.map((entry) => ({
      ...entry,
      baseline: categoryBaselines.get(entry.category) ?? [],
    })),
    roster,
    perimeter,
    youtuberId,
  }
}
