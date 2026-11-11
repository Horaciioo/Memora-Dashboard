import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import type { HandlerContext } from '@/core/services/nexus/handlers/types'
import { REALTIME_COPY } from '@/declarations/nexus/modulesCopy'

/**
 * Member a client command looks at
 * @typedef {Object} Subject
 */

export interface Subject {
  id: string
  discordId: string
  displayName: string
  role: string
  status: string
  isOther: boolean
}

/**
 * Resolve the owner or the member named by --user
 * @param {HandlerContext} context - Handler context
 * @return {Promise<Subject>} - Member
 */

export const subjectOf = async (context: HandlerContext): Promise<Subject> => {
  const wanted = context.args.user ? String(context.args.user) : context.accountId
  const row = await prisma.account.findFirst({
    where: { OR: [{ id: wanted }, { discordId: wanted }] },
    select: { id: true, discordId: true, displayName: true, role: true, status: true },
  })
  if (!row) throw notFound(REALTIME_COPY.userMissing)

  return { ...row, isOther: row.id !== context.accountId }
}
