import 'server-only'
import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import { notify } from '@/core/services/system/NotificationService'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import { NOTIFY } from '@/core/services/calendar/attendance/shared'

/**
 * Read the accounts still owing an answer
 * @param {string} eventId - Roll-call event
 * @return {Promise<string[]>} - Account identifiers
 */

const pendingIds = async (eventId: string): Promise<string[]> => {
  const rows = await prisma.eventAttendance.findMany({
    where: { eventId, status: AttendanceStatuses.Pending },
    select: { accountId: true },
  })

  return rows.map((row) => row.accountId)
}

/**
 * Ping the members still owing an answer
 * @param {Object} event - Roll-call event
 * @param {string} event.id - Event identifier
 * @param {string} event.title - Event title
 * @param {string | null} event.ownerId - Who posted it
 * @param {string | null} [actorId] - Who pressed the reminder, defaults to the poster
 * @return {Promise<void>} - Pinged
 */

export const notifyPending = async (
  event: { id: string; title: string; ownerId: string | null },
  actorId?: string
): Promise<void> => {
  const recipients = await pendingIds(event.id)
  if (recipients.length === 0) return

  await notify({
    ...NOTIFY,
    recipients,
    actorId: actorId ?? event.ownerId,
    targetId: event.id,
    subject: event.title,
    // A pressed reminder always lands, the automatic one stays quiet while one waits unread
    once: actorId === undefined,
  })
}

/**
 * Ping the members still owing an answer and mark the reminder as fired
 * @param {Object} event - Roll-call event
 * @param {string} event.id - Event identifier
 * @param {string} event.title - Event title
 * @param {string | null} event.ownerId - Who posted it
 * @param {string} [actorId] - Who pressed the reminder
 * @return {Promise<void>} - Pinged
 */

export const remindPending = async (
  event: { id: string; title: string; ownerId: string | null },
  actorId?: string
): Promise<void> => {
  await notifyPending(event, actorId)

  await prisma.calendarEvent.update({
    where: { id: event.id },
    data: { remindedAt: new Date() },
  })
}

// Flipped by the runtime once a worker owns the sweep
let isScheduled = false

/**
 * Tell the request path a worker now owns the sweep
 * @return {void}
 */

export const markRemindersScheduled = (): void => {
  isScheduled = true
}

/**
 * Take ownership of one due reminder
 * @param {string} eventId - Event identifier
 * @return {Promise<boolean>} - Caller owns the reminder
 */

const claimReminder = async (eventId: string): Promise<boolean> => {
  const { count } = await prisma.calendarEvent.updateMany({
    where: { id: eventId, remindedAt: null },
    data: { remindedAt: new Date() },
  })

  return count === 1
}

/**
 * Fire every roll-call reminder now due
 * @return {Promise<void>} - Swept
 */

export const runReminderSweep = async (): Promise<void> => {
  try {
    const due = await prisma.calendarEvent.findMany({
      where: { rollCall: true, remindAt: { lte: new Date() }, remindedAt: null },
      select: { id: true, title: true, ownerId: true },
    })

    // Claiming before notifying is what makes a parallel sweep harmless
    const claimed = await Promise.all(
      due.map(async (event) => ((await claimReminder(event.id)) ? event : null))
    )

    await Promise.all(
      claimed
        .filter((event): event is (typeof due)[number] => event !== null)
        .map((event) => notifyPending(event))
    )
  } catch (error) {
    // A missed sweep is caught by the next read
    logger.warn('[calendar] reminder sweep failed', error)
  }
}

/**
 * Sweep from the request path
 * @return {Promise<void>} - Swept
 */

export const sweepDueReminders = async (): Promise<void> => {
  if (isScheduled) return

  await runReminderSweep()
}

/**
 * Notify a fresh set of convened members
 * @param {Object} event - Roll-call event
 * @param {string} event.id - Event identifier
 * @param {string} event.title - Event title
 * @param {string | null} event.ownerId - Who posted it
 * @param {string[]} recipients - Accounts to reach
 * @return {Promise<void>} - Notified
 */

export const notifyConvened = async (
  event: { id: string; title: string; ownerId: string | null },
  recipients: string[]
): Promise<void> => {
  if (recipients.length === 0) return

  await notify({
    ...NOTIFY,
    recipients,
    actorId: event.ownerId,
    targetId: event.id,
    subject: event.title,
  })
}
