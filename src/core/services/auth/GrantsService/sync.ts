import { ensureFixedFunctions } from '@/core/services/reference/FixedFunctions'
import 'server-only'
import { prisma } from '@/core/lib/db'
import { GRANT_ADDITIONS } from '@/declarations/access/grants'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { PermissionEffects } from '@/utils/constants/workflow'
import type { Account } from '@prisma/client'

// Account row carrying the functions it holds
export type HolderAccount = Account & { functions: { functionId: string }[] }

// Applied once per process
let synced = false

/**
 * Levels a batch aimed at one role lands on, the employee follows the Responsable
 * @param {MemberRoleName} role - Level the batch names
 * @return {MemberRoleName[]} - Levels receiving it
 */

const withEmployee = (role: MemberRoleName): MemberRoleName[] =>
  role === MemberRoles.Responsable ? [MemberRoles.Responsable, MemberRoles.Employe] : [role]

/**
 * Land every grant batch the database has not seen yet
 * @return {Promise<void>} - Synchronised
 */

export const syncRoleGrants = async (): Promise<void> => {
  if (synced) return

  const applied = await prisma.grantMigration.findMany({ select: { key: true } })
  const known = new Set(applied.map((entry) => entry.key))
  const pending = GRANT_ADDITIONS.filter((addition) => !known.has(addition.key))

  // A grant by function needs the function to exist, a new one is written first
  if (pending.length > 0) await ensureFixedFunctions()

  // One transaction per batch
  for (const addition of pending) {
    const rows = [
      ...Object.entries(addition.grants).flatMap(([role, permissions]) =>
        withEmployee(role as MemberRoleName).flatMap((holder) =>
          (permissions ?? []).map((permission) => ({ role: holder, permission }))
        )
      ),
      ...Object.entries(addition.roleDenies ?? {}).flatMap(([role, permissions]) =>
        withEmployee(role as MemberRoleName).flatMap((holder) =>
          (permissions ?? []).map((permission) => ({
            role: holder,
            permission,
            effect: PermissionEffects.Deny,
          }))
        )
      ),
    ]

    // Function grants resolved by name
    const functionNames = [
      ...Object.keys(addition.functions ?? {}),
      ...Object.keys(addition.denies ?? {}),
      ...Object.keys(addition.functionRevokes ?? {}),
    ]
    const holders =
      functionNames.length > 0
        ? await prisma.jobFunction.findMany({
            where: { name: { in: functionNames } },
            select: { id: true, name: true },
          })
        : []
    const existing = await prisma.functionPermission.findMany({
      where: { functionId: { in: holders.map((holder) => holder.id) }, youtuberId: null },
      select: { functionId: true, permission: true, effect: true },
    })
    const isHeld = (row: { functionId: string; permission: string; effect?: string }) =>
      existing.some(
        (held) =>
          held.functionId === row.functionId &&
          held.permission === row.permission &&
          held.effect === (row.effect ?? PermissionEffects.Allow)
      )
    const functionRows = holders
      .flatMap((holder) => [
        ...(addition.functions?.[holder.name] ?? []).map((permission) => ({
          functionId: holder.id,
          permission,
        })),
        ...(addition.denies?.[holder.name] ?? []).map((permission) => ({
          functionId: holder.id,
          permission,
          effect: PermissionEffects.Deny,
        })),
      ])
      // A grant already held is not written twice
      .filter((row) => !isHeld(row))

    // Function permissions taken back
    const functionRevoked = holders.map((holder) =>
      prisma.functionPermission.deleteMany({
        where: {
          functionId: holder.id,
          permission: { in: addition.functionRevokes?.[holder.name] ?? [] },
          effect: PermissionEffects.Allow,
          youtuberId: null,
        },
      })
    )

    // Global role rows only, creator overrides stay
    const revoked = Object.entries(addition.revokes ?? {}).map(([role, permissions]) =>
      prisma.rolePermission.deleteMany({
        where: {
          role: { in: withEmployee(role as MemberRoleName) },
          permission: { in: permissions ?? [] },
          youtuberId: null,
        },
      })
    )

    try {
      await prisma.$transaction([
        prisma.rolePermission.createMany({ data: rows, skipDuplicates: true }),
        prisma.functionPermission.createMany({ data: functionRows }),
        ...revoked,
        ...functionRevoked,
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
