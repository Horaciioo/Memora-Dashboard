import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, immutable, notFound } from '@/core/lib/errors'
import { BELOW_LEAD_ROLES } from '@/core/services/members/MemberService'
import { isRootIdentity } from '@/declarations/access/identity'
import { MEMBER_COPY } from '@/declarations/members/copy'

/**
 * Who is acting
 * @typedef {Object} AdminActor
 * @property {string} id - Account identifier
 * @property {boolean} isAdmin - Sits at admin level
 */

export interface AdminActor {
  id: string
  isAdmin: boolean
}

// Everything a heavy gesture reads on its target
const TARGET_SELECT = {
  id: true,
  discordId: true,
  discordUsername: true,
  displayName: true,
  role: true,
  status: true,
  frozenAt: true,
  functions: { select: { jobFunction: { select: { name: true, kind: true } } } },
} as const

/**
 * Load the member a heavy gesture lands on, refusing what it must never touch
 * @param {string} id - Account identifier
 * @param {AdminActor} actor - Who is acting
 * @return {Promise<TargetRow>} - Target
 */

export const loadTarget = async (id: string, actor: AdminActor) => {
  const row = await prisma.account.findUnique({ where: { id }, select: TARGET_SELECT })
  if (!row) throw notFound()

  // Neither the root account nor oneself
  if (isRootIdentity(row.discordId)) throw immutable(MEMBER_COPY.rootLocked)
  if (row.id === actor.id) throw forbidden()

  // A Responsable only reaches those below them
  if (!actor.isAdmin && !BELOW_LEAD_ROLES.includes(row.role)) throw forbidden()

  return row
}

export type TargetRow = Awaited<ReturnType<typeof loadTarget>>
