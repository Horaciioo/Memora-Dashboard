import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import { syncJuniorLives } from '@/core/services/academy/parkour/LiveCountService'
import { notify } from '@/core/services/system/NotificationService'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { NOTIFICATION_KINDS } from '@/utils/constants/notifications'
import { OPEN_LIVE_STATUSES } from '@/utils/constants/lives'
import { AttendanceStatuses } from '@/utils/constants/workflow'

const MINUTE_MS = 60_000

// Lives still to come or running
const openLive: Prisma.LiveWhereInput = { status: { in: [...OPEN_LIVE_STATUSES] } }

/**
 * Tell every member who said they come that their service is about to begin
 * @return {Promise<void>} - Pinged, once per member and live
 */

export const runServiceStartSweep = async (): Promise<void> => {
  try {
    const lead = ASSISTANT_SETTINGS.serviceLeadMinutes * MINUTE_MS
    const now = Date.now()

    const rows = await prisma.eventAttendance.findMany({
      where: {
        status: AttendanceStatuses.Present,
        event: { rollCall: true, live: { is: openLive } },
      },
      select: {
        accountId: true,
        availableFrom: true,
        event: { select: { startsAt: true, title: true, live: { select: { id: true } } } },
      },
    })

    // The hours the member gave open their service, the live's start otherwise
    const due = rows.filter((row) => {
      const start = (row.availableFrom ?? row.event.startsAt).getTime()

      return row.event.live && start - now <= lead && start - now > -lead
    })
    if (due.length === 0) return

    // One push per member and live, whatever the number of sweeps
    const told = await prisma.notification.findMany({
      where: {
        kind: NOTIFICATION_KINDS.ids.ServiceStarting,
        targetId: { in: due.map((row) => row.event.live?.id ?? '') },
        recipientId: { in: due.map((row) => row.accountId) },
      },
      select: { recipientId: true, targetId: true },
    })
    const done = new Set(told.map((row) => `${row.recipientId}:${row.targetId}`))

    const fresh = due.filter((row) => !done.has(`${row.accountId}:${row.event.live?.id}`))
    const byLive = new Map<string, { title: string; recipients: string[] }>()
    for (const row of fresh) {
      const liveId = row.event.live?.id
      if (!liveId) continue

      const entry = byLive.get(liveId) ?? { title: row.event.title, recipients: [] }
      entry.recipients.push(row.accountId)
      byLive.set(liveId, entry)
    }

    for (const [liveId, entry] of byLive) {
      await notify({
        kind: 'ServiceStarting',
        recipients: entry.recipients,
        target: 'live',
        targetId: liveId,
        subject: entry.title,
      })
    }

    // A junior in a running session sees their live count move as they begin
    await syncJuniorLives(fresh.map((row) => row.accountId))
  } catch (error) {
    logger.warn('[lives] service start sweep failed', error)
  }
}
