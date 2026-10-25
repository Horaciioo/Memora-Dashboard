import 'server-only'

import { prisma } from '@/core/lib/db'
import { isStale, tallyBeat } from '@/core/lib/lives/presence'
import { closeLiveStints, ensureStint, stopStintAt } from '@/core/services/lives/ModStintService'
import { channelAccess } from '@/core/services/lives/ModViewService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { FunctionNames } from '@/declarations/reference/fixed'
import type { SessionUser } from '@/types/auth'
import { ADMIN_ROLES, MemberRoles } from '@/utils/constants/hierarchy'

// Verdicts per live and member, until when they hold
const countCache = new Map<string, { allowed: boolean; until: number }>()

// Entries the verdict cache holds at most
const COUNT_CACHE_LIMIT = 1000

// Lives function identifiers, fixed once seeded
let livesFunctionIds: Promise<Set<string>> | null = null

/**
 * Identifiers of the Lives function
 * @return {Promise<Set<string>>} - Identifiers
 */

const readLivesFunctionIds = (): Promise<Set<string>> => {
  livesFunctionIds ??= prisma.jobFunction
    .findMany({ where: { name: FunctionNames.Lives }, select: { id: true } })
    .then((rows) => new Set(rows.map((row) => row.id)))
    .catch((error: unknown) => {
      livesFunctionIds = null
      throw error
    })

  return livesFunctionIds
}

/**
 * Whether a member's time counts on a live: Admins, Responsables Lives, reinforcements and the
 * channel's Twitch moderators. Cheapest checks first, the verdict kept a moment
 * @param {string} liveId - Live
 * @param {SessionUser} member - Member beating
 * @return {Promise<boolean>} - Time counts
 */

export const mayCountTime = async (liveId: string, member: SessionUser): Promise<boolean> => {
  if (ADMIN_ROLES.includes(member.role)) return true

  const key = `${liveId}:${member.id}`
  const known = countCache.get(key)
  if (known && known.until > Date.now()) return known.allowed

  const allowed = await judgeCount(liveId, member)
  if (countCache.size >= COUNT_CACHE_LIMIT) countCache.clear()
  countCache.set(key, { allowed, until: Date.now() + LIVE_SETTINGS.moderatorCacheSeconds * 1000 })

  return allowed
}

/**
 * Verdict behind mayCountTime, read fresh
 * @param {string} liveId - Live
 * @param {SessionUser} member - Member beating
 * @return {Promise<boolean>} - Time counts
 */

const judgeCount = async (liveId: string, member: SessionUser): Promise<boolean> => {
  if (member.role === MemberRoles.Responsable) {
    const ids = await readLivesFunctionIds()
    if (member.functionIds.some((id) => ids.has(id))) return true
  }

  const live = await prisma.live.findUnique({
    where: { id: liveId },
    select: {
      platform: true,
      youtuberId: true,
      members: {
        where: { accountId: member.id, reinforcement: true },
        select: { accountId: true },
      },
    },
  })
  if (!live) return false
  if (live.members.length > 0) return true

  const verdict = await channelAccess(member.id, {
    platform: live.platform,
    youtuber: { id: live.youtuberId },
  })

  return verdict.allowed
}

/**
 * Count one heartbeat of a member's Mod View
 * @param {string} liveId - Live
 * @param {string} accountId - Member
 * @param {Object} beat - Beat
 * @param {boolean} beat.visible - Tab shown
 * @param {boolean} beat.active - Member acting recently
 * @param {boolean} beat.closing - Tab closing
 * @return {Promise<void>} - Counted
 */

export const beatPresence = async (
  liveId: string,
  accountId: string,
  beat: { visible: boolean; active: boolean; closing: boolean }
): Promise<void> => {
  const now = new Date()

  // One beat at a time per member
  const { stoppedAt, opened } = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`presence:${liveId}:${accountId}`}))`
    let open = await tx.modViewPresence.findFirst({
      where: { liveId, accountId, closedAt: null },
      orderBy: { openedAt: 'desc' },
    })
    let stale: Date | null = null

    // A long silence closes the old presence where it stopped
    if (open && isStale(open.lastBeatAt, now, LIVE_SETTINGS.staleSeconds)) {
      await tx.modViewPresence.update({
        where: { id: open.id },
        data: { closedAt: open.lastBeatAt, closeReason: 'TIMEOUT' },
      })
      stale = open.lastBeatAt
      open = null
    }

    if (!open) {
      if (!beat.closing) {
        await tx.modViewPresence.create({
          data: { liveId, accountId, openedAt: now, lastBeatAt: now },
        })
      }

      return { stoppedAt: stale, opened: !beat.closing }
    }

    // Several tabs beat the same presence
    const next = tallyBeat(open, { at: now, ...beat }, LIVE_SETTINGS.heartbeatSeconds * 2)
    await tx.modViewPresence.update({
      where: { id: open.id },
      data: {
        ...next,
        ...(beat.closing ? { closedAt: now, closeReason: 'CLOSED' as const } : {}),
      },
    })

    return { stoppedAt: beat.closing ? now : null, opened: false }
  })

  // Moderating follows the presence
  if (stoppedAt) await stopStintAt(liveId, accountId, stoppedAt)
  if (opened) await ensureStint(liveId, accountId)
}

/**
 * Close every presence of a live that ended
 * @param {string} liveId - Live
 * @return {Promise<void>} - Closed
 */

export const closeLivePresences = async (liveId: string): Promise<void> => {
  // Stretches first: they read the last beat of each member before it is closed
  await closeLiveStints(liveId)
  const now = new Date()
  await prisma.modViewPresence.updateMany({
    where: { liveId, closedAt: null },
    data: { closedAt: now, closeReason: 'LIVE_ENDED' },
  })
  // Focuses end with the live
  await prisma.modViewFocus.updateMany({ where: { liveId, endedAt: null }, data: { endedAt: now } })
}

/**
 * Close presences whose tab went silent
 * @return {Promise<number>} - Closed
 */

export const sweepStalePresences = async (): Promise<number> => {
  const horizon = new Date(Date.now() - LIVE_SETTINGS.staleSeconds * 1000)
  const stale = await prisma.modViewPresence.findMany({
    where: { closedAt: null, lastBeatAt: { lt: horizon } },
    select: { id: true, lastBeatAt: true, liveId: true, accountId: true },
    take: 200,
  })

  await prisma.$transaction(
    stale.map((row) =>
      prisma.modViewPresence.update({
        where: { id: row.id },
        data: { closedAt: row.lastBeatAt, closeReason: 'TIMEOUT' },
      })
    )
  )

  // A member who went silent stops moderating where they left
  await Promise.all(stale.map((row) => stopStintAt(row.liveId, row.accountId, row.lastBeatAt)))

  return stale.length
}

/**
 * Members with a Mod View open on a live right now
 * @param {string} liveId - Live
 * @return {Promise<string[]>} - Connected accounts
 */

export const connectedMemberIds = async (liveId: string): Promise<string[]> => {
  const horizon = new Date(Date.now() - LIVE_SETTINGS.staleSeconds * 1000)
  const rows = await prisma.modViewPresence.findMany({
    where: { liveId, closedAt: null, lastBeatAt: { gte: horizon } },
    select: { accountId: true },
    distinct: ['accountId'],
  })

  return rows.map((row) => row.accountId)
}
