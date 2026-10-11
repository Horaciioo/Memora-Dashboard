import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { loadTarget } from '@/core/services/members/admin/guards'
import type { AdminActor } from '@/core/services/members/admin/guards'

/**
 * Shut a member's access: no sign-in, open sessions closed
 * @param {string} id - Account identifier
 * @param {AdminActor} actor - Who is acting
 * @return {Promise<void>} - Frozen
 */

export const freezeMember = async (id: string, actor: AdminActor): Promise<void> => {
  const row = await loadTarget(id, actor)
  if (row.frozenAt) throw conflict()

  await prisma.$transaction([
    prisma.account.update({ where: { id }, data: { frozenAt: new Date() } }),
    prisma.session.deleteMany({ where: { accountId: id } }),
  ])
}

/**
 * Give a frozen member their access back
 * @param {string} id - Account identifier
 * @param {AdminActor} actor - Who is acting
 * @return {Promise<void>} - Thawed
 */

export const unfreezeMember = async (id: string, actor: AdminActor): Promise<void> => {
  const row = await loadTarget(id, actor)
  if (!row.frozenAt) throw conflict()

  await prisma.account.update({ where: { id }, data: { frozenAt: null } })
}
