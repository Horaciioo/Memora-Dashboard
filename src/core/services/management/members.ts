import 'server-only'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { BELOW_LEAD_ROLES } from '@/core/services/members/MemberService/rules'
import type { ManagedMember } from '@/types/management'
import type { Prisma } from '@prisma/client'

// Columns every management row needs from its member
export const MANAGED_MEMBER_SELECT = {
  id: true,
  displayName: true,
  avatarUrl: true,
  youtubers: { select: { id: true, name: true, accent: true, avatarUrl: true } },
} satisfies Prisma.AccountSelect

type ManagedMemberRow = Prisma.AccountGetPayload<{ select: typeof MANAGED_MEMBER_SELECT }>

/**
 * Accounts a viewer manages, a Responsable never reads a peer or a superior
 * @param {AccessScope} scope - Perimeter
 * @param {boolean} isAdmin - Viewer sits at admin level
 * @return {Prisma.AccountWhereInput} - Owner clause
 */

export const managedAccounts = (scope: AccessScope, isAdmin: boolean): Prisma.AccountWhereInput =>
  scopedWhere<Prisma.AccountWhereInput>('account', scope, {
    leftAt: null,
    anonymisedAt: null,
    ...(isAdmin ? {} : { role: { in: BELOW_LEAD_ROLES } }),
  })

/**
 * Map an account row to its management shape
 * @param {ManagedMemberRow} row - Account row
 * @return {ManagedMember} - Member shown on a row
 */

export const toManagedMember = (row: ManagedMemberRow): ManagedMember => ({
  id: row.id,
  displayName: row.displayName,
  avatarUrl: row.avatarUrl,
  youtubers: row.youtubers.map((youtuber) => ({
    id: youtuber.id,
    label: youtuber.name,
    accent: youtuber.accent,
    image: youtuber.avatarUrl,
  })),
})
