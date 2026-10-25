import 'server-only'

import { prisma } from '@/core/lib/db'
import { readMemberSpans } from '@/core/services/lives/ModStintService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import type { MemberLiveSummary, MemberModerationView } from '@/types/lives'
import { DAY_MS } from '@/utils/constants/time'

/**
 * Moderation history of one member: time in the Mod View and gestures
 * @param {string} accountId - Member
 * @return {Promise<MemberModerationView | null>} - History
 */

export const readMemberModeration = async (
  accountId: string
): Promise<MemberModerationView | null> => {
  const since = new Date(Date.now() - LIVE_SETTINGS.hoursWindowDays * DAY_MS)

  try {
    // Lives the member was in
    const [presences, actions, windowTime, windowLives] = await Promise.all([
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
        _sum: { visibleSeconds: true, activeSeconds: true },
      }),
      prisma.modViewPresence.groupBy({
        by: ['liveId'],
        where: { accountId, openedAt: { gte: since } },
      }),
    ])

    const known = [
      ...new Set([...presences.map((row) => row.liveId), ...actions.map((row) => row.liveId)]),
    ]
    const spans = await readMemberSpans(accountId, known)
    const reinforced = new Set(
      (
        await prisma.liveMember.findMany({
          where: { accountId, reinforcement: true },
          select: { liveId: true },
        })
      ).map((row) => row.liveId)
    )
    const liveIds = [...new Set([...known, ...spans.keys()])]
    const lives = await prisma.live.findMany({
      where: { id: { in: liveIds } },
      select: {
        id: true,
        platform: true,
        startedAt: true,
        plannedStartAt: true,
        title: true,
        youtuber: { select: { name: true, avatarUrl: true } },
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
        creatorAvatar: live.youtuber.avatarUrl,
        title: live.title,
        platform: live.platform,
        startedAt: (live.startedAt ?? live.plannedStartAt).toISOString(),
        activeSeconds: time?._sum.activeSeconds ?? 0,
        visibleSeconds: time?._sum.visibleSeconds ?? 0,
        span: spans.get(live.id) ?? null,
        isReinforcement: reinforced.has(live.id),
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
      windowActiveSeconds: windowTime._sum.activeSeconds ?? 0,
      windowLives: windowLives.length,
      lives: summaries
        .sort((left, right) => Date.parse(right.startedAt) - Date.parse(left.startedAt))
        .slice(0, LIVE_SETTINGS.memberLives),
    }
  } catch {
    // Tables not migrated yet
    return null
  }
}
