import 'server-only'
import { prisma } from '@/core/lib/db'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { LivePlatformName } from '@/utils/constants/lives'
import { HOUR_MS, MINUTE_MS } from '@/utils/constants/time'

/**
 * Entry the responsables planned for a creator's stream, the nearest one still without a live
 * @param {Object} input - Search
 * @param {string} input.youtuberId - Creator
 * @param {string[]} input.liveTemplates - Live templates
 * @return {Promise<{ id: string, hasLive: boolean } | null>} - Entry around now
 */

export const findPlannedEntry = async ({
  youtuberId,
  liveTemplates,
}: {
  youtuberId: string
  liveTemplates: string[]
}): Promise<{ id: string; hasLive: boolean } | null> => {
  const now = Date.now()
  const rows = await prisma.calendarEvent.findMany({
    where: {
      youtuberId,
      OR: [{ templateId: { in: liveTemplates } }, { rollCall: true }],
      startsAt: {
        gte: new Date(now - LIVE_SETTINGS.missedLiveHours * 60 * MINUTE_MS),
        lte: new Date(now + LIVE_SETTINGS.watchLeadMinutes * MINUTE_MS),
      },
    },
    select: { id: true, startsAt: true, live: { select: { id: true } } },
  })
  const [nearest] = rows.sort(
    (a, b) => Math.abs(a.startsAt.getTime() - now) - Math.abs(b.startsAt.getTime() - now)
  )

  return nearest ? { id: nearest.id, hasLive: nearest.live !== null } : null
}

/**
 * Stream Memora already detected for a creator around a planned start
 * @param {Object} input - Search
 * @param {string} input.youtuberId - Creator
 * @param {string} input.platform - Live platform
 * @param {Date} input.startsAt - Planned start
 * @return {Promise<{ id: string, calendarEventId: string } | null>} - Detected live
 */

export const findDetectedLive = async ({
  youtuberId,
  platform,
  startsAt,
}: {
  youtuberId: string
  platform: LivePlatformName
  startsAt: Date
}): Promise<{ id: string; calendarEventId: string } | null> => {
  const span = LIVE_SETTINGS.missedLiveHours * HOUR_MS
  const live = await prisma.live.findFirst({
    where: {
      youtuberId,
      platform,
      announcedById: null,
      calendarEventId: { not: null },
      startedAt: {
        gte: new Date(startsAt.getTime() - span),
        lte: new Date(startsAt.getTime() + span),
      },
    },
    orderBy: { startedAt: 'desc' },
    select: { id: true, calendarEventId: true },
  })

  return live?.calendarEventId ? { id: live.id, calendarEventId: live.calendarEventId } : null
}

/**
 * Fold a detected entry into the planned one: the live and its stats move onto the entry holding the plan, answers of the detected roll win where given
 * @param {Object} input - Merge
 * @param {string} input.liveId - Live holding the stats
 * @param {string} input.keepId - Entry kept
 * @param {string} input.dropId - Duplicate entry
 * @param {Object} input.plan - Fields the planned live carries
 * @return {Promise<void>} - Merged
 */

export const mergeEntries = async ({
  liveId,
  keepId,
  dropId,
  plan,
}: {
  liveId: string
  keepId: string
  dropId: string
  plan: {
    announcedById: string | null
    instructions: string
    plannedStartAt: Date
    plannedEndAt: Date | null
  }
}): Promise<void> => {
  if (keepId === dropId) return

  await prisma.$transaction(async (tx) => {
    const live = await tx.live.findUniqueOrThrow({ where: { id: liveId }, select: { title: true } })
    const answered = await tx.eventAttendance.findMany({
      where: { eventId: dropId, status: { not: AttendanceStatuses.Pending } },
    })
    for (const row of answered) {
      const data = {
        status: row.status,
        respondedAt: row.respondedAt,
        availableFrom: row.availableFrom,
        availableTo: row.availableTo,
      }
      await tx.eventAttendance.upsert({
        where: { eventId_accountId: { eventId: keepId, accountId: row.accountId } },
        update: data,
        create: { eventId: keepId, accountId: row.accountId, ...data },
      })
    }

    // Detach first, the entry link is unique
    await tx.live.update({ where: { id: liveId }, data: { calendarEventId: null } })
    await tx.calendarEvent.delete({ where: { id: dropId } })
    await tx.live.update({ where: { id: liveId }, data: { ...plan, calendarEventId: keepId } })
    await tx.calendarEvent.update({
      where: { id: keepId },
      data: { title: live.title, rollCall: true },
    })
  })
}
