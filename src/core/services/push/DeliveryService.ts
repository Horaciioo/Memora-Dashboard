import 'server-only'

import { API_ROUTES } from '@/core/lib/api/routes'
import { isAccessClosed } from '@/core/lib/auth/closed'
import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import { toEntry } from '@/core/lib/notifications/entry'
import type { NotificationRow } from '@/core/lib/notifications/entry'
import { buildPushPayload, pushOutcomeOf } from '@/core/lib/push'
import type { PushOutcome } from '@/core/lib/push'
import { sendPush } from '@/core/services/push/transport'
import type { PushTarget } from '@/core/services/push/transport'
import {
  PUSH_CATEGORY_OF_KIND,
  PUSH_CATEGORY_REGISTRY,
} from '@/declarations/notifications/categories'
import { isPushConfigured } from '@/declarations/pwa/vapid'
import type { PushPayload } from '@/declarations/pwa/worker'
import type { NotificationKindName } from '@/utils/constants/notifications'
import { NOTIFICATION_KINDS } from '@/utils/constants/notifications'
import { PUSH_DELIVERY_STATUSES } from '@/utils/constants/push'

// Outcomes that close a delivery for good
const SETTLED = [PUSH_DELIVERY_STATUSES.ids.Sent, PUSH_DELIVERY_STATUSES.ids.Expired]

// Stored status of each outcome
const STATUS_OF: Record<PushOutcome, number> = {
  sent: PUSH_DELIVERY_STATUSES.ids.Sent,
  expired: PUSH_DELIVERY_STATUSES.ids.Expired,
  retry: PUSH_DELIVERY_STATUSES.ids.Failed,
  failed: PUSH_DELIVERY_STATUSES.ids.Failed,
}

// Devices still behind a live session
const liveDevices = () => ({
  where: { session: { expiresAt: { gt: new Date() } } },
  select: { id: true, endpoint: true, p256dh: true, auth: true, device: true },
})

/**
 * Raised so the queue tries the failed pushes again
 * @typedef {Object} PushRetryError
 */

export class PushRetryError extends Error {
  constructor(count: number) {
    super(`${count} push deliveries will be retried`)
    this.name = 'PushRetryError'
  }
}

/**
 * One push to one device
 * @typedef {Object} PushAttempt
 * @property {string} accountId - Recipient
 * @property {string | null} notificationId - Row it copies, none for a test
 * @property {number} kind - Notification kind identifier
 * @property {PushTarget & { id: string, device: string | null }} device - Subscription
 * @property {PushPayload} payload - What the worker draws
 * @property {boolean} isUrgent - Wakes a sleeping phone
 */

interface PushAttempt {
  accountId: string
  notificationId: string | null
  kind: number
  device: PushTarget & { id: string; device: string | null }
  payload: PushPayload
  isUrgent: boolean
}

/**
 * Send one push and write its outcome to the journal
 * @param {PushAttempt} attempt - Push to send
 * @return {Promise<PushOutcome>} - Outcome
 */

const attempt = async ({
  accountId,
  notificationId,
  kind,
  device,
  payload,
  isUrgent,
}: PushAttempt): Promise<PushOutcome> => {
  const statusCode = await sendPush(device, payload, isUrgent)
  const outcome = pushOutcomeOf(statusCode)
  const line = {
    status: STATUS_OF[outcome],
    statusCode,
    sentAt: outcome === 'sent' ? new Date() : null,
  }

  // A notification has one line per device, a test a fresh line each time
  await (notificationId
    ? prisma.pushDelivery.upsert({
        where: { notificationId_subscriptionId: { notificationId, subscriptionId: device.id } },
        create: {
          accountId,
          notificationId,
          subscriptionId: device.id,
          kind,
          device: device.device,
          ...line,
        },
        update: line,
      })
    : prisma.pushDelivery.create({
        data: {
          accountId,
          subscriptionId: device.id,
          kind,
          device: device.device,
          isTest: true,
          ...line,
        },
      }))

  // A gone browser never comes back
  if (outcome === 'expired') await prisma.pushSubscription.deleteMany({ where: { id: device.id } })
  if (outcome === 'sent') {
    await prisma.pushSubscription.updateMany({
      where: { id: device.id },
      data: { lastSentAt: new Date() },
    })
  }

  return outcome
}

/**
 * Unread count of each member, for the home screen badge
 * @param {string[]} accountIds - Members
 * @return {Promise<Map<string, number>>} - Count per member
 */

const unreadCounts = async (accountIds: string[]): Promise<Map<string, number>> => {
  const rows = await prisma.notification.groupBy({
    by: ['recipientId'],
    where: { recipientId: { in: accountIds }, readAt: null },
    _count: { _all: true },
  })

  return new Map(rows.map((row) => [row.recipientId, row._count._all]))
}

/**
 * Read the notifications to push, with their recipients and devices
 * @param {string[]} ids - Notification identifiers
 * @return {Promise<Object[]>} - Rows
 */

const readPending = (ids: string[]) =>
  prisma.notification.findMany({
    where: { id: { in: ids }, readAt: null },
    include: {
      actor: { select: { displayName: true, avatarUrl: true } },
      recipient: {
        select: {
          status: true,
          frozenAt: true,
          pushMutedCategories: true,
          pushSubscriptions: liveDevices(),
        },
      },
      deliveries: { where: { status: { in: SETTLED } }, select: { subscriptionId: true } },
    },
  })

/**
 * Turn one notification into the pushes it still owes
 * @param {Awaited<ReturnType<typeof readPending>>[number]} row - Notification
 * @param {number} unread - Badge count of its recipient
 * @return {PushAttempt[]} - Pushes to send
 */

const attemptsOf = (
  row: Awaited<ReturnType<typeof readPending>>[number],
  unread: number
): PushAttempt[] => {
  const kind = NOTIFICATION_KINDS.byId(row.kind)?.name
  if (!kind || isAccessClosed(row.recipient)) return []

  // A silenced family stays in the bell only
  const category = PUSH_CATEGORY_OF_KIND[kind]
  if (row.recipient.pushMutedCategories.includes(category)) return []

  const payload = buildPushPayload({
    entry: toEntry(row as NotificationRow),
    unread,
    readUrl: API_ROUTES.notification(row.id),
  })
  if (!payload) return []

  const done = new Set(row.deliveries.map((line) => line.subscriptionId))

  return row.recipient.pushSubscriptions
    .filter((device) => !done.has(device.id))
    .map((device) => ({
      accountId: row.recipientId,
      notificationId: row.id,
      kind: row.kind,
      device,
      payload,
      isUrgent: Boolean(PUSH_CATEGORY_REGISTRY.get(category).urgent),
    }))
}

/**
 * Push fresh notifications to every device of their recipients, once per device
 * @param {string[]} ids - Notification identifiers
 * @return {Promise<void>} - Throws PushRetryError while some service asks to come back
 */

export const deliverPushes = async (ids: string[]): Promise<void> => {
  if (!isPushConfigured() || ids.length === 0) return

  const rows = await readPending(ids)
  const unread = await unreadCounts([...new Set(rows.map((row) => row.recipientId))])
  const attempts = rows.flatMap((row) => attemptsOf(row, unread.get(row.recipientId) ?? 0))

  const outcomes = await Promise.all(attempts.map(attempt))
  const retries = outcomes.filter((outcome) => outcome === 'retry').length

  logger.info('[push] delivered', {
    notifications: rows.length,
    sent: outcomes.filter((outcome) => outcome === 'sent').length,
    expired: outcomes.filter((outcome) => outcome === 'expired').length,
    failed: outcomes.filter((outcome) => outcome === 'failed').length,
    retries,
  })

  if (retries > 0) throw new PushRetryError(retries)
}

/**
 * Send one catalogue entry to every device of a member
 * @param {Object} input - Test push
 * @param {string} input.accountId - Member asking
 * @param {PushPayload} input.payload - What the worker draws
 * @param {NotificationKindName} input.kind - Kind shown
 * @return {Promise<number>} - Devices reached
 */

export const sendTestPush = async ({
  accountId,
  payload,
  kind,
}: {
  accountId: string
  payload: PushPayload
  kind: NotificationKindName
}): Promise<number> => {
  if (!isPushConfigured()) return 0

  const { where, select } = liveDevices()
  const devices = await prisma.pushSubscription.findMany({ where: { ...where, accountId }, select })
  const isUrgent = Boolean(PUSH_CATEGORY_REGISTRY.get(PUSH_CATEGORY_OF_KIND[kind]).urgent)
  const outcomes = await Promise.all(
    devices.map((device) =>
      attempt({
        accountId,
        notificationId: null,
        kind: NOTIFICATION_KINDS.ids[kind],
        device,
        payload,
        isUrgent,
      })
    )
  )

  return outcomes.filter((outcome) => outcome === 'sent').length
}
