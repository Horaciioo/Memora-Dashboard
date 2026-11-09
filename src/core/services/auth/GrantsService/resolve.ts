import 'server-only'
import { prisma } from '@/core/lib/db'
import { resolveGrants } from '@/core/lib/permissions'
import type { PermissionGroup, PermissionOverwrite } from '@/core/lib/permissions'
import { FLOOR_ROLE } from '@/declarations/access/roles'
import { PermissionEffects } from '@/utils/constants/workflow'
import { isPermissionName } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'
import { syncRoleGrants } from '@/core/services/auth/GrantsService/sync'
import type { HolderAccount } from '@/core/services/auth/GrantsService/sync'

/**
 * Keep the rows that carry a declared permission
 * @param {Array<{ permission: string, effect: string }>} rows - Stored grants
 * @return {PermissionOverwrite[]} - Known overwrites
 */

export const toOverwrites = (
  rows: { permission: string; effect: string }[]
): PermissionOverwrite[] =>
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

export const onLayers = (youtuberId: string | null) => ({
  OR: youtuberId === null ? [{ youtuberId: null }] : [{ youtuberId: null }, { youtuberId }],
})

/**
 * Read what the floor role grants every account
 * @return {Promise<PermissionName[]>} - Floor permissions
 */

export const readFloor = async (): Promise<PermissionName[]> => {
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
 * @param {boolean} ownOverwrites - Member's own rows count
 * @return {Promise<PermissionName[]>} - Granted permissions
 */

export const resolveAccountPermissions = async (
  account: HolderAccount,
  youtuberId: string | null = null,
  ownOverwrites = true
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
    ownOverwrites
      ? prisma.accountPermission.findMany({ where: { accountId: account.id, ...layers } })
      : Promise.resolve([]),
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
