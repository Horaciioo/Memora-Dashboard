import 'server-only'
import { prisma } from '@/core/lib/db'
import { publishLive } from '@/core/lib/lives/bus'
import { logger } from '@/core/lib/logger'
import { syncJuniorLives } from '@/core/services/academy/parkour/LiveCountService'
import { readLiveTemplates } from '@/core/services/lives/LiveService/forms'
import { openLive } from '@/core/services/lives/LiveService/lifecycle'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { LiveStatuses } from '@/utils/constants/lives'
import { HOUR_MS, SECOND_MS } from '@/utils/constants/time'

// Whole perimeter, the platform acts
const EVERY_CREATOR = { isGlobal: true, youtuberIds: [], activeYoutuberId: null }

// Entries that failed once, retried after a restart only
const globalForFailed = globalThis as unknown as { orphanEntriesFailed?: Set<string> }
const failed = (globalForFailed.orphanEntriesFailed ??= new Set<string>())

/**
 * Oldest planned start an announced live may still begin from
 * @return {Date} - Limit
 */

export const missedBefore = (): Date =>
  new Date(Date.now() - LIVE_SETTINGS.missedLiveHours * HOUR_MS)

/**
 * Call off, silently, the announced lives whose stream never came
 * @return {Promise<void>} - Dropped
 */

export const dropMissedLives = async (): Promise<void> => {
  const missed = await prisma.live.findMany({
    where: { status: LiveStatuses.Announced, plannedStartAt: { lt: missedBefore() } },
    select: {
      id: true,
      youtuberId: true,
      calendarEventId: true,
      members: { select: { accountId: true } },
    },
  })

  for (const live of missed) {
    const moved = await prisma.live.updateMany({
      where: { id: live.id, status: LiveStatuses.Announced },
      data: { status: LiveStatuses.Cancelled, endedAt: new Date() },
    })
    if (moved.count === 0) continue

    if (live.calendarEventId) {
      await prisma.calendarEvent
        .update({ where: { id: live.calendarEventId }, data: { rollCall: false, remindAt: null } })
        .catch(() => null)
    }
    await publishLive(LIVE_TOPICS.lives, {
      liveId: live.id,
      youtuberId: live.youtuberId,
      status: LiveStatuses.Cancelled,
    })
    await syncJuniorLives(live.members.map((seat) => seat.accountId))
  }
}

/**
 * Open the live of the live entries left without one, the coming ones only
 * @return {Promise<void>} - Opened
 */

export const openOrphanLiveEntries = async (): Promise<void> => {
  const templates = await readLiveTemplates()
  if (templates.size === 0) return

  const orphans = await prisma.calendarEvent.findMany({
    where: {
      templateId: { in: [...templates.keys()] },
      rollCall: true,
      youtuberId: { not: null },
      live: { is: null },
      startsAt: { gte: missedBefore() },
      // One still being written opens its live itself
      createdAt: { lt: new Date(Date.now() - LIVE_SETTINGS.watchSyncSeconds * 2 * SECOND_MS) },
    },
    select: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      templateId: true,
      ownerId: true,
      youtuberId: true,
    },
  })

  for (const entry of orphans) {
    const platform = entry.templateId ? templates.get(entry.templateId) : undefined
    if (!platform || !entry.youtuberId || failed.has(entry.id)) continue

    await openLive({
      entry,
      live: {
        youtuberId: entry.youtuberId,
        platform,
        coordinatorIds: [],
        pickedIds: [],
        instructions: null,
      },
      actorId: entry.ownerId,
      scope: EVERY_CREATOR,
    }).catch((error: unknown) => {
      failed.add(entry.id)
      logger.warn(
        '[lives] orphan entry not opened',
        entry.id,
        error instanceof Error ? error.message : ''
      )
    })
  }
}
