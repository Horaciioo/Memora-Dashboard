import 'server-only'

import { prisma } from '@/core/lib/db'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import type { MemberLiveSummary, MemberModerationView } from '@/types/lives'

/**
 * Moderation history of one member: time in the Mod View and gestures, live by live
 * @param {string} accountId - Member
 * @return {Promise<MemberModerationView | null>} - History, none while the tables are missing
 */

export const readMemberModeration = async (
  accountId: string
): Promise<MemberModerationView | null> => {
  const since = new Date(Date.now() - LIVE_SETTINGS.hoursWindowDays * 24 * 60 * 60 * 1000)

  try {
    // Lives the member was in, by presence or by gesture
    const [presences, actions, windowTime] = await Promise.all([
      prisma.modViewPresence.groupBy({
        by: ['liveId'],
        where: { accountId },
        _sum: { activeSeconds: true, visibleSeconds: true },
        _max: { openedAt: true },
        orderBy: { _max: { openedAt: 'desc' } },
        take: LIVE_SETTINGS.memberLives,
      }),
      prisma.moderationAction.findMany({
        where: { actorAccountId: accountId },
        orderBy: { occurredAt: 'desc' },
        take: LIVE_SETTINGS.logLines,
      }),
      prisma.modViewPresence.aggregate({
        where: { accountId, openedAt: { gte: since } },
        _sum: { visibleSeconds: true },
      }),
    ])

    const liveIds = [
      ...new Set([...presences.map((row) => row.liveId), ...actions.map((row) => row.liveId)]),
    ]
    const lives = await prisma.live.findMany({
      where: { id: { in: liveIds } },
      select: {
        id: true,
        platform: true,
        startedAt: true,
        plannedStartAt: true,
        youtuber: { select: { name: true } },
      },
    })

    const summaries: MemberLiveSummary[] = lives.map((live) => {
      const time = presences.find((row) => row.liveId === live.id)
      const own = actions.filter((row) => row.liveId === live.id)
      const kinds = new Map<MemberLiveSummary['kinds'][number]['kind'], number>()
      own
        .filter((row) => row.status === 'SUCCEEDED')
        .forEach((row) => kinds.set(row.kind, (kinds.get(row.kind) ?? 0) + 1))

      return {
        liveId: live.id,
        creator: live.youtuber.name,
        platform: live.platform,
        startedAt: (live.startedAt ?? live.plannedStartAt).toISOString(),
        activeSeconds: time?._sum.activeSeconds ?? 0,
        visibleSeconds: time?._sum.visibleSeconds ?? 0,
        kinds: [...kinds.entries()]
          .map(([kind, count]) => ({ kind, count }))
          .sort((left, right) => right.count - left.count),
        lines: own.map((row) => ({
          id: row.id,
          kind: row.kind,
          actorKey: accountId,
          actorName: row.actorLogin ?? '',
          isMember: true,
          targetLogin: row.targetLogin,
          durationSeconds: row.durationSeconds,
          reason: row.reason,
          excerpt: row.messageExcerpt,
          origin: row.origin,
          status: row.status,
          liveconLevel: row.liveconLevel,
          occurredAt: row.occurredAt.toISOString(),
        })),
      }
    })

    return {
      windowSeconds: windowTime._sum.visibleSeconds ?? 0,
      lives: summaries
        .sort((left, right) => Date.parse(right.startedAt) - Date.parse(left.startedAt))
        .slice(0, LIVE_SETTINGS.memberLives),
    }
  } catch {
    // Tables not migrated yet
    return null
  }
}
