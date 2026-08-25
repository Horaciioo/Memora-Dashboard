import 'server-only'

import { prisma } from '@/core/lib/db'
import { GRANT_ADDITIONS } from '@/declarations/access/grants'
import { ROLE_PRESETS } from '@/declarations/access/roles'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { PermissionEffects } from '@/utils/constants/workflow'
import { isPermissionName } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'
import type { Account } from '@prisma/client'

// Applied once per process, every later call costing nothing
let synced = false

/**
 * Land every grant batch the database has not seen yet, adding only — a permission
 * an administrator removed after a batch applied never comes back
 * @return {Promise<void>} - Synchronised
 */

export const syncRoleGrants = async (): Promise<void> => {
  if (synced) return

  const applied = await prisma.grantMigration.findMany({ select: { key: true } })
  const known = new Set(applied.map((entry) => entry.key))
  const pending = GRANT_ADDITIONS.filter((addition) => !known.has(addition.key))

  // One transaction per batch, so a half-applied key is never recorded
  for (const addition of pending) {
    const rows = Object.entries(addition.grants).flatMap(([role, permissions]) =>
      (permissions ?? []).map((permission) => ({ role: role as MemberRoleName, permission }))
    )

    try {
      await prisma.$transaction([
        prisma.rolePermission.createMany({ data: rows, skipDuplicates: true }),
        prisma.grantMigration.create({ data: { key: addition.key } }),
      ])
    } catch (error) {
      // A concurrent request already recorded this key, nothing left to apply
      const isDuplicateKey =
        typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002'
      if (!isDuplicateKey) throw error
    }
  }

  synced = true
}

// Role and function grants, overrides excluded
const inheritedGrants = async (account: Account): Promise<Set<string>> => {
  await syncRoleGrants()

  const functionIds = [account.primaryFunctionId, account.secondaryFunctionId].filter(
    (id): id is string => id !== null
  )

  // Role grants and function grants, overrides excluded
  const [roleGrants, functionGrants] = await Promise.all([
    prisma.rolePermission.findMany({ where: { role: account.role } }),
    functionIds.length > 0
      ? prisma.functionPermission.findMany({ where: { functionId: { in: functionIds } } })
      : Promise.resolve([]),
  ])

  const granted = new Set<string>()
  for (const grant of roleGrants) granted.add(grant.permission)
  for (const grant of functionGrants) granted.add(grant.permission)

  return granted
}

/**
 * Resolve every permission held by an account, the root bypass living in resolvePermissions
 * @param {Account} account - Account row
 * @return {Promise<PermissionName[]>} - Granted permissions
 */

export const resolveAccountPermissions = async (account: Account): Promise<PermissionName[]> => {
  const granted = await inheritedGrants(account)
  const overrides = await prisma.accountPermission.findMany({ where: { accountId: account.id } })

  // Overrides run last so a deny always wins
  for (const override of overrides) {
    if (override.effect === PermissionEffects.Allow) granted.add(override.permission)
    else granted.delete(override.permission)
  }

  return [...granted].filter(isPermissionName)
}

/**
 * Read what inheritance alone grants an account
 * @param {string} accountId - Account identifier
 * @return {Promise<PermissionName[]>} - Inherited permissions
 */

export const readInheritedGrants = async (accountId: string): Promise<PermissionName[]> => {
  const account = await prisma.account.findUnique({ where: { id: accountId } })
  if (!account) return []

  return [...(await inheritedGrants(account))].filter(isPermissionName)
}

/**
 * Replace the grants of one role
 * @param {MemberRoleName} role - Hierarchy level
 * @param {PermissionName[]} permissions - Permissions to hold
 * @return {Promise<void>} - Replaced
 */

export const replaceRoleGrants = async (
  role: MemberRoleName,
  permissions: PermissionName[]
): Promise<void> => {
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { role } }),
    prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({ role, permission })),
      skipDuplicates: true,
    }),
  ])
}

/**
 * Replace the grants of one function
 * @param {string} functionId - Function identifier
 * @param {PermissionName[]} permissions - Permissions to hold
 * @return {Promise<void>} - Replaced
 */

export const replaceFunctionGrants = async (
  functionId: string,
  permissions: PermissionName[]
): Promise<void> => {
  await prisma.$transaction([
    prisma.functionPermission.deleteMany({ where: { functionId } }),
    prisma.functionPermission.createMany({
      data: permissions.map((permission) => ({ functionId, permission })),
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
  replaceRoleGrants(role, ROLE_PRESETS[role])

/**
 * Read the grants of every role
 * @return {Promise<Record<MemberRoleName, PermissionName[]>>} - Grants per role
 */

export const readRoleGrants = async (): Promise<Record<MemberRoleName, PermissionName[]>> => {
  await syncRoleGrants()

  const rows = await prisma.rolePermission.findMany()
  const grants: Record<MemberRoleName, PermissionName[]> = {
    [MemberRoles.Admin]: [],
    [MemberRoles.Responsable]: [],
    [MemberRoles.Moderateur]: [],
  }

  for (const row of rows) {
    if (isPermissionName(row.permission)) grants[row.role].push(row.permission)
  }

  return grants
}

/**
 * Function paired with the permissions it carries
 * @typedef {Object} FunctionGrants
 * @property {string} id - Function identifier
 * @property {string} name - Function name
 * @property {string} kind - Primary or secondary
 * @property {PermissionName[]} permissions - Permissions carried
 */

export interface FunctionGrants {
  id: string
  name: string
  kind: string
  permissions: PermissionName[]
}

/**
 * Read the grants of every function
 * @return {Promise<FunctionGrants[]>} - Grants per function
 */

export const readFunctionGrants = async (): Promise<FunctionGrants[]> => {
  const rows = await prisma.jobFunction.findMany({
    include: { permissions: true },
    orderBy: [{ kind: 'asc' }, { position: 'asc' }],
  })

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    kind: row.kind,
    permissions: row.permissions.map((grant) => grant.permission).filter(isPermissionName),
  }))
}
