import 'server-only'

import { prisma } from '@/core/lib/db'
import { readMemberModeration } from '@/core/services/lives/MemberModerationService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { LIVE_HUB } from '@/declarations/lives/hub'
import type { LiveHubCreator, LiveHubFigure } from '@/types/lives'
import { LiveStatuses } from '@/utils/constants/lives'
import { DAY_MS } from '@/utils/constants/time'

// Gestures counted as infractions handled
const INFRACTION_KINDS = ['DELETE', 'TIMEOUT', 'BAN', 'WARN'] as const

/**
 * Figures on one creator over a period, the whole team's when no member is given
 * @param {string | null} accountId - Member, null for the team
 * @param {string} youtuberId - Creator
 * @param {Date} from - Period start
 * @param {Date} to - Period end
 * @return {Promise<number[]>} - Infractions, seconds, messages, lives, moderators
 */

const figuresOver = async (accountId: string | null, youtuberId: string, from: Date, to: Date) => {
  const live = { youtuberId }
  const who = accountId ? { actorAccountId: accountId } : {}
  const [infractions, messages, presence, lives, moderators] = await Promise.all([
    prisma.moderationAction.count({
      where: {
        ...who,
        live,
        kind: { in: [...INFRACTION_KINDS] },
        status: 'SUCCEEDED',
        occurredAt: { gte: from, lt: to },
      },
    }),
    prisma.moderationAction.count({
      where: {
        ...who,
        live,
        kind: 'MESSAGE_SEND',
        occurredAt: { gte: from, lt: to },
      },
    }),
    prisma.modViewPresence.aggregate({
      where: { ...(accountId ? { accountId } : {}), live, openedAt: { gte: from, lt: to } },
      _sum: { activeSeconds: true },
    }),
    prisma.modViewPresence.groupBy({
      by: ['liveId'],
      where: { ...(accountId ? { accountId } : {}), live, openedAt: { gte: from, lt: to } },
    }),
    prisma.modViewPresence.groupBy({
      by: ['accountId'],
      where: { live, openedAt: { gte: from, lt: to } },
    }),
  ])

  return [infractions, presence._sum.activeSeconds ?? 0, messages, lives.length, moderators.length]
}

/**
 * Personal Live hub: for each creator of the perimeter, the member's figures, latest lives and next live
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} accountId - Signed-in member
 * @return {Promise<LiveHubCreator[]>} - One entry per creator
 */

export const readLiveHub = async (
  scope: AccessScope,
  accountId: string
): Promise<LiveHubCreator[]> => {
  const creators = await prisma.youtuber.findMany({
    where: { archived: false, ...(scope.isGlobal ? {} : { id: { in: scope.youtuberIds } }) },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      accent: true,
      bannerUrl: true,
      fadeBannerUrl: true,
      lives: {
        where: { status: { in: [LiveStatuses.Live, LiveStatuses.Announced] } },
        orderBy: { plannedStartAt: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          platform: true,
          plannedStartAt: true,
          plannedEndAt: true,
        },
      },
    },
    orderBy: { position: 'asc' },
  })

  const now = Date.now()
  const split = new Date(now - LIVE_HUB.periodDays * DAY_MS)
  const start = new Date(now - 2 * LIVE_HUB.periodDays * DAY_MS)
  const history = await readMemberModeration(accountId)

  return Promise.all(
    creators.map(async (creator) => {
      const [latest, before, teamLatest, teamBefore] = await Promise.all([
        figuresOver(accountId, creator.id, split, new Date(now + DAY_MS)),
        figuresOver(accountId, creator.id, start, split),
        figuresOver(null, creator.id, split, new Date(now + DAY_MS)),
        figuresOver(null, creator.id, start, split),
      ])
      const keys: LiveHubFigure['key'][] = ['infractions', 'time', 'messages', 'lives']
      const teamKeys: LiveHubFigure['key'][] = [...keys, 'moderators']
      // On air first, else the soonest
      const next = creator.lives.find((row) => row.status === LiveStatuses.Live) ?? creator.lives[0]

      return {
        id: creator.id,
        name: creator.name,
        avatarUrl: creator.avatarUrl,
        accent: creator.accent,
        banner: creator.fadeBannerUrl ?? creator.bannerUrl,
        figures: keys.map((key, index) => ({
          key,
          value: latest[index],
          previous: before[index],
        })),
        team: teamKeys.map((key, index) => ({
          key,
          value: teamLatest[index],
          previous: teamBefore[index],
        })),
        recent: (history?.lives ?? [])
          .filter((live) => live.creator === creator.name)
          .slice(0, LIVE_HUB.recentCount),
        live: next
          ? {
              id: next.id,
              title: next.title,
              platform: next.platform,
              isOnAir: next.status === LiveStatuses.Live,
              plannedStartAt: next.plannedStartAt.toISOString(),
              plannedEndAt: next.plannedEndAt?.toISOString() ?? null,
            }
          : null,
      }
    })
  )
}
