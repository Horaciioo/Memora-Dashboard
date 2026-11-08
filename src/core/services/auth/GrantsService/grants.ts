import 'server-only'
import { prisma } from '@/core/lib/db'
import { resolveGrants } from '@/core/lib/permissions'
import type { PermissionOverwrite } from '@/core/lib/permissions'
import { ACCESS_CATEGORY_REGISTRY } from '@/declarations/access/categories'
import { FLOOR_ROLE, ROLE_PRESETS } from '@/declarations/access/roles'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { AccessCategoryName, MemberRoleName } from '@/utils/constants/hierarchy'
import { PermissionEffects } from '@/utils/constants/workflow'
import type { FunctionKindName } from '@/utils/constants/workflow'
import { isPermissionName, prunePermissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'
import { onLayers, readFloor, toOverwrites } from '@/core/services/auth/GrantsService/resolve'
import { syncRoleGrants } from '@/core/services/auth/GrantsService/sync'

/**
 * Read the baseline one role resolves against
 * @param {MemberRoleName} role - Hierarchy level
 * @return {Promise<PermissionName[]>} - Baseline permissions
 */

export const readRoleBaseline = async (role: MemberRoleName): Promise<PermissionName[]> =>
  role === FLOOR_ROLE ? [] : readFloor()

/**
 * Read the baseline one function resolves against
 * @param {AccessCategoryName} category - Rail section of the function
 * @return {Promise<PermissionName[]>} - Baseline permissions
 */

export const readFunctionBaseline = async (
  category: AccessCategoryName
): Promise<PermissionName[]> => {
  const tier = ACCESS_CATEGORY_REGISTRY.get(category).tier

  const [floor, roleRows] = await Promise.all([
    readFloor(),
    tier === FLOOR_ROLE
      ? Promise.resolve([])
      : prisma.rolePermission.findMany({ where: { role: tier, youtuberId: null } }),
  ])

  return resolveGrants(floor, [[toOverwrites(roleRows)]])
}

/**
 * Replace the overwrites of one role
 * @param {MemberRoleName} role - Hierarchy level
 * @param {PermissionOverwrite[]} overwrites - Overwrites to hold
 * @param {string | null} youtuberId - Creator the layer belongs to
 * @return {Promise<void>} - Replaced
 */

export const replaceRoleGrants = async (
  role: MemberRoleName,
  overwrites: PermissionOverwrite[],
  youtuberId: string | null = null
): Promise<void> => {
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { role, youtuberId } }),
    prisma.rolePermission.createMany({
      data: overwrites.map((entry) => ({
        role,
        permission: entry.permission,
        effect: entry.effect,
        youtuberId,
      })),
      skipDuplicates: true,
    }),
  ])
}

/**
 * Replace the overwrites of one function
 * @param {string} functionId - Function identifier
 * @param {PermissionOverwrite[]} overwrites - Overwrites to hold
 * @param {string | null} youtuberId - Creator the layer belongs to
 * @return {Promise<void>} - Replaced
 */

export const replaceFunctionGrants = async (
  functionId: string,
  overwrites: PermissionOverwrite[],
  youtuberId: string | null = null
): Promise<void> => {
  await prisma.$transaction([
    prisma.functionPermission.deleteMany({ where: { functionId, youtuberId } }),
    prisma.functionPermission.createMany({
      data: overwrites.map((entry) => ({
        functionId,
        permission: entry.permission,
        effect: entry.effect,
        youtuberId,
      })),
      skipDuplicates: true,
    }),
  ])
}

/**
 * Apply the declared preset to a role
 * @param {MemberRoleName} role - Hierarchy level
 * @return {Promise<void>} - Applied
 */

export const applyRolePreset = async (role: MemberRoleName): Promise<void> =>
  replaceRoleGrants(
    role,
    ROLE_PRESETS[role].map((permission) => ({ permission, effect: PermissionEffects.Allow })),
    null
  )

/**
 * Read the overwrites of every role on one layer
 * @param {string | null} youtuberId - Creator the layer belongs to
 * @return {Promise<Record<MemberRoleName, PermissionOverwrite[]>>} - Overwrites per role
 */

export const readRoleGrants = async (
  youtuberId: string | null = null
): Promise<Record<MemberRoleName, PermissionOverwrite[]>> => {
  await syncRoleGrants()

  const rows = await prisma.rolePermission.findMany({ where: { youtuberId } })
  const grants: Record<MemberRoleName, PermissionOverwrite[]> = {
    [MemberRoles.Admin]: [],
    [MemberRoles.Employe]: [],
    [MemberRoles.Responsable]: [],
    [MemberRoles.Moderateur]: [],
    [MemberRoles.Junior]: [],
  }

  for (const row of rows) {
    if (isPermissionName(row.permission)) {
      grants[row.role].push({
        permission: row.permission,
        effect:
          row.effect === PermissionEffects.Deny ? PermissionEffects.Deny : PermissionEffects.Allow,
      })
    }
  }

  return grants
}

/**
 * Function paired with the overwrites it carries
 * @typedef {Object} FunctionGrants
 * @property {string} id - Function identifier
 * @property {string} name - Function name
 * @property {FunctionKindName} kind - Primary or secondary holder slot
 * @property {AccessCategoryName} category - Rail section on the access console
 * @property {string | null} accent - Stored colour
 * @property {string | null} icon - Glyph key
 * @property {string | null} summary - Short description
 * @property {number} holders - Accounts assigned to it
 * @property {PermissionOverwrite[]} permissions - Overwrites carried
 */

export interface FunctionGrants {
  id: string
  name: string
  kind: FunctionKindName
  category: AccessCategoryName
  accent: string | null
  icon: string | null
  summary: string | null
  holders: number
  permissions: PermissionOverwrite[]
}

/**
 * Read the overwrites of every function on one layer
 * @param {string | null} youtuberId - Creator the layer belongs to
 * @return {Promise<FunctionGrants[]>} - Overwrites per function
 */

export const readFunctionGrants = async (
  youtuberId: string | null = null
): Promise<FunctionGrants[]> => {
  const rows = await prisma.jobFunction.findMany({
    include: {
      permissions: { where: { youtuberId } },
      _count: { select: { holders: true } },
    },
    orderBy: [{ category: 'asc' }, { position: 'asc' }],
  })

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    kind: row.kind,
    category: row.category,
    accent: row.accent,
    icon: row.icon,
    summary: row.summary,
    holders: row._count.holders,
    permissions: toOverwrites(row.permissions),
  }))
}

/**
 * Resolve what one role effectively grants
 * @param {MemberRoleName} role - Hierarchy level
 * @param {string | null} youtuberId - Creator the perimeter is narrowed to
 * @return {Promise<PermissionName[]>} - Effective permissions
 */

export const simulateRoleGrants = async (
  role: MemberRoleName,
  youtuberId: string | null = null
): Promise<PermissionName[]> => {
  const [floor, rows] = await Promise.all([
    readFloor(),
    prisma.rolePermission.findMany({ where: { role, ...onLayers(youtuberId) } }),
  ])

  if (role === FLOOR_ROLE) return prunePermissions(floor)

  return resolveGrants(floor, [
    [toOverwrites(rows.filter((row) => row.youtuberId === null))],
    [toOverwrites(rows.filter((row) => row.youtuberId !== null))],
  ])
}

/**
 * Resolve what one function effectively grants on top of its category
 * @param {string} functionId - Function identifier
 * @param {AccessCategoryName} category - Rail section of the function
 * @param {string | null} youtuberId - Creator the perimeter is narrowed to
 * @return {Promise<PermissionName[]>} - Effective permissions
 */

export const simulateFunctionGrants = async (
  functionId: string,
  category: AccessCategoryName,
  youtuberId: string | null = null
): Promise<PermissionName[]> => {
  const [baseline, rows] = await Promise.all([
    readFunctionBaseline(category),
    prisma.functionPermission.findMany({ where: { functionId, ...onLayers(youtuberId) } }),
  ])

  return resolveGrants(baseline, [
    [toOverwrites(rows.filter((row) => row.youtuberId === null))],
    [toOverwrites(rows.filter((row) => row.youtuberId !== null))],
  ])
}
