import 'server-only'

import { prisma } from '@/core/lib/db'
import { resolveGrants } from '@/core/lib/permissions'
import type { PermissionGroup, PermissionOverwrite } from '@/core/lib/permissions'
import { GRANT_ADDITIONS } from '@/declarations/access/grants'
import { ACCESS_CATEGORY_REGISTRY } from '@/declarations/access/categories'
import { FLOOR_ROLE, ROLE_PRESETS } from '@/declarations/access/roles'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { AccessCategoryName, MemberRoleName } from '@/utils/constants/hierarchy'
import { PermissionEffects } from '@/utils/constants/workflow'
import type { FunctionKindName } from '@/utils/constants/workflow'
import { isPermissionName, prunePermissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'
import type { Account } from '@prisma/client'

// Account row carrying the functions it holds
export type HolderAccount = Account & { functions: { functionId: string }[] }

// Applied once per process
let synced = false

/**
 * Land every grant batch the database has not seen yet
 * @return {Promise<void>} - Synchronised
 */

export const syncRoleGrants = async (): Promise<void> => {
  if (synced) return

  const applied = await prisma.grantMigration.findMany({ select: { key: true } })
  const known = new Set(applied.map((entry) => entry.key))
  const pending = GRANT_ADDITIONS.filter((addition) => !known.has(addition.key))

  // One transaction per batch
  for (const addition of pending) {
    const rows = Object.entries(addition.grants).flatMap(([role, permissions]) =>
      (permissions ?? []).map((permission) => ({ role: role as MemberRoleName, permission }))
    )

    // Function grants resolved by name
    const functionNames = Object.keys(addition.functions ?? {})
    const holders =
      functionNames.length > 0
        ? await prisma.jobFunction.findMany({
            where: { name: { in: functionNames } },
            select: { id: true, name: true },
          })
        : []
    const functionRows = holders.flatMap((holder) =>
      (addition.functions?.[holder.name] ?? []).map((permission) => ({
        functionId: holder.id,
        permission,
      }))
    )

    try {
      await prisma.$transaction([
        prisma.rolePermission.createMany({ data: rows, skipDuplicates: true }),
        prisma.functionPermission.createMany({ data: functionRows }),
        prisma.grantMigration.create({ data: { key: addition.key } }),
      ])
    } catch (error) {
      // A concurrent request already recorded this key
      const isDuplicateKey =
        typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002'
      if (!isDuplicateKey) throw error
    }
  }

  synced = true
}

/**
 * Keep the rows that carry a declared permission
 * @param {Array<{ permission: string, effect: string }>} rows - Stored grants
 * @return {PermissionOverwrite[]} - Known overwrites
 */

const toOverwrites = (rows: { permission: string; effect: string }[]): PermissionOverwrite[] =>
  rows
    .filter((row) => isPermissionName(row.permission))
    .map((row) => ({
      permission: row.permission as PermissionName,
      effect:
        row.effect === PermissionEffects.Deny ? PermissionEffects.Deny : PermissionEffects.Allow,
    }))

/**
 * Build the clause reading the global layer plus
 * @param {string | null} youtuberId - Creator the perimeter is narrowed to
 * @return {{ OR: { youtuberId: string | null }[] }} - Scope clause
 */

const onLayers = (youtuberId: string | null) => ({
  OR: youtuberId === null ? [{ youtuberId: null }] : [{ youtuberId: null }, { youtuberId }],
})

/**
 * Read what the floor role grants every account
 * @return {Promise<PermissionName[]>} - Floor permissions
 */

const readFloor = async (): Promise<PermissionName[]> => {
  await syncRoleGrants()

  const rows = await prisma.rolePermission.findMany({
    where: { role: FLOOR_ROLE, youtuberId: null, effect: PermissionEffects.Allow },
  })

  return rows.map((row) => row.permission).filter(isPermissionName)
}

/**
 * Resolve every permission an account holds on one creator
 * @param {HolderAccount} account - Account row with the functions it holds
 * @param {string | null} youtuberId - Creator the perimeter is narrowed to
 * @return {Promise<PermissionName[]>} - Granted permissions
 */

export const resolveAccountPermissions = async (
  account: HolderAccount,
  youtuberId: string | null = null
): Promise<PermissionName[]> => {
  const functionIds = account.functions.map((held) => held.functionId)

  const layers = onLayers(youtuberId)

  const [floor, roleRows, functionRows, accountRows] = await Promise.all([
    readFloor(),
    prisma.rolePermission.findMany({ where: { role: account.role, ...layers } }),
    functionIds.length > 0
      ? prisma.functionPermission.findMany({
          where: { functionId: { in: functionIds }, ...layers },
        })
      : Promise.resolve([]),
    prisma.accountPermission.findMany({ where: { accountId: account.id, ...layers } }),
  ])

  const globalOf = <T extends { youtuberId: string | null }>(rows: T[]): T[] =>
    rows.filter((row) => row.youtuberId === null)
  const scopedOf = <T extends { youtuberId: string | null }>(rows: T[]): T[] =>
    rows.filter((row) => row.youtuberId !== null)

  // The floor role already stands in the base
  const holderGlobal: PermissionGroup = [
    account.role === FLOOR_ROLE ? [] : toOverwrites(globalOf(roleRows)),
    toOverwrites(globalOf(functionRows)),
  ]

  const holderScoped: PermissionGroup = [
    toOverwrites(scopedOf(roleRows)),
    toOverwrites(scopedOf(functionRows)),
  ]

  return resolveGrants(floor, [
    holderGlobal,
    holderScoped,
    [toOverwrites(globalOf(accountRows))],
    [toOverwrites(scopedOf(accountRows))],
  ])
}

/**
 * Read what everything but an account's own overrides grants it
 * @param {string} accountId - Account identifier
 * @param {string | null} youtuberId - Creator the perimeter is narrowed to
 * @return {Promise<PermissionName[]>} - Inherited permissions
 */

export const readInheritedGrants = async (
  accountId: string,
  youtuberId: string | null = null
): Promise<PermissionName[]> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { functions: { select: { functionId: true } } },
  })
  if (!account) return []

  const functionIds = account.functions.map((held) => held.functionId)
  const layers = onLayers(youtuberId)

  const [floor, roleRows, functionRows] = await Promise.all([
    readFloor(),
    prisma.rolePermission.findMany({ where: { role: account.role, ...layers } }),
    functionIds.length > 0
      ? prisma.functionPermission.findMany({
          where: { functionId: { in: functionIds }, ...layers },
        })
      : Promise.resolve([]),
  ])

  const holders: PermissionGroup = [
    account.role === FLOOR_ROLE ? [] : toOverwrites(roleRows),
    toOverwrites(functionRows),
  ]

  return resolveGrants(floor, [holders])
}

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
