import 'server-only'

import { prisma } from '@/core/lib/db'
import { recordEvent } from '@/core/services/system/ActivityService'
import { RETENTION_POLICIES } from '@/declarations/system/security/privacy'
import { DAY_MS } from '@/utils/constants/time'
import { UnbanStatuses } from '@/utils/constants/unban'

/**
 * Journal the links that just ran out, once each
 * @param {Date} [now] - Moment of the pass
 * @return {Promise<number>} - Links journaled
 */

export const markExpiredLinks = async (now: Date = new Date()): Promise<number> => {
  const due = await prisma.unbanLink.findMany({
    where: { expiresAt: { lte: now }, expiredLoggedAt: null, revokedAt: null },
    select: { id: true, label: true, youtuber: { select: { name: true } } },
  })
  if (due.length === 0) return 0

  // Marked first so a replayed pass finds nothing left
  const ids = due.map((link) => link.id)
  const { count } = await prisma.unbanLink.updateMany({
    where: { id: { in: ids }, expiredLoggedAt: null },
    data: { expiredLoggedAt: now },
  })

  await Promise.all(
    due.map((link) =>
      recordEvent({
        eventType: 'UnbanLinkExpired',
        origin: 'Scheduler',
        targetType: 'unbanLink',
        targetId: link.id,
        summary: link.youtuber.name,
      })
    )
  )

  return count
}

// Cut-off date of one retention window
const horizon = (days: number, now: Date): Date => new Date(now.getTime() - days * DAY_MS)

/**
 * Drop the links nobody ever used, a while after they stopped working
 * @param {Date} [now] - Moment of the pass
 * @return {Promise<number>} - Links removed
 */

export const purgeUnusedLinks = async (now: Date = new Date()): Promise<number> => {
  const cutoff = horizon(RETENTION_POLICIES.unbanUnusedLinks, now)

  const { count } = await prisma.unbanLink.deleteMany({
    where: {
      usedAt: null,
      OR: [{ revokedAt: { lt: cutoff } }, { revokedAt: null, expiresAt: { lt: cutoff } }],
    },
  })

  return count
}

/**
 * Drop the requests decided long ago, with their link and comments
 * @param {Date} [now] - Moment of the pass
 * @return {Promise<number>} - Requests removed
 */

export const purgeDecidedRequests = async (now: Date = new Date()): Promise<number> => {
  const cutoff = horizon(RETENTION_POLICIES.unbanDecided, now)
  const old = await prisma.unbanRequest.findMany({
    where: {
      decidedAt: { lt: cutoff },
      status: { in: [UnbanStatuses.Accepted, UnbanStatuses.Refused] },
    },
    select: { id: true, linkId: true },
  })
  if (old.length === 0) return 0

  // The request holds its link with Restrict: the request goes first, comments follow by cascade
  const { count } = await prisma.unbanRequest.deleteMany({
    where: { id: { in: old.map((request) => request.id) } },
  })
  await prisma.unbanLink.deleteMany({ where: { id: { in: old.map((request) => request.linkId) } } })

  return count
}
