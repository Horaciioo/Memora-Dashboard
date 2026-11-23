import 'server-only'

import { prisma } from '@/core/lib/db'
import { RECAP_SETTINGS } from '@/declarations/configurations/settings'
import type { RecapContext, RecapDraft } from '@/types/recap'
import type { Prisma } from '@prisma/client'

// Pages the member owns or was given
const reachedBy = (accountId: string): Prisma.PageWhereInput => ({
  trashedAt: null,
  OR: [{ ownerId: accountId }, { grants: { some: { accountId } } }],
})

/**
 * Remarks on the member's pages and pages handed to them
 * @param {RecapContext} context - Member and window
 * @return {Promise<RecapDraft[]>} - Beats
 */

export const readPageBeats = async ({
  accountId,
  since,
  until,
}: RecapContext): Promise<RecapDraft[]> => {
  const window = { gt: since, lte: until }
  const [comments, grants] = await Promise.all([
    prisma.pageComment.findMany({
      where: {
        authorId: { not: accountId },
        createdAt: window,
        page: { is: reachedBy(accountId) },
      },
      select: { authorId: true, createdAt: true, page: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
      take: RECAP_SETTINGS.sourceTake,
    }),
    prisma.pageGrant.findMany({
      where: {
        accountId,
        createdAt: window,
        grantedById: { not: accountId },
        page: { is: { trashedAt: null } },
      },
      select: { grantedById: true, createdAt: true, page: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
      take: RECAP_SETTINGS.sourceTake,
    }),
  ])

  const talked = [...Map.groupBy(comments, (row) => row.page.id).values()].map(
    (group): RecapDraft => ({
      beat: 'comments',
      at: group[0].createdAt,
      actorIds: [...new Set(group.flatMap((row) => (row.authorId ? [row.authorId] : [])))],
      count: group.length,
      target: 'page',
      targetId: group[0].page.id,
      subject: group[0].page.title || null,
      figures: group.length > 1 ? [{ key: 'comments', count: group.length }] : [],
    })
  )

  const shared = grants.map((grant): RecapDraft => ({
    beat: 'pageShared',
    at: grant.createdAt,
    actorIds: grant.grantedById ? [grant.grantedById] : [],
    count: 1,
    target: 'page',
    targetId: grant.page.id,
    subject: grant.page.title || null,
  }))

  return [...talked, ...shared]
}
