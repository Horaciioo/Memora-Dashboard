import 'server-only'

import { prisma } from '@/core/lib/db'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import { NOTIFICATION_TARGETS } from '@/declarations/notifications/targets'
import type { NotificationTargetName } from '@/declarations/notifications/targets'
import { NOTIFICATION_KINDS } from '@/utils/constants/notifications'
import type { NotificationKindName } from '@/utils/constants/notifications'
import type { NotificationEntry, NotificationFeed } from '@/types/notifications'
import type { Prisma } from '@prisma/client'

/**
 * Alert worth reaching one member
 * @typedef {Object} NotificationInput
 * @property {NotificationKindName} kind - Nature of the act
 * @property {(string | null | undefined)[]} recipients - Who it concerns
 * @property {string} [actorId] - Who caused it
 * @property {NotificationTargetName} [target] - Kind of record it points at
 * @property {string} [targetId] - Record identifier
 * @property {string} [subject] - Title of that record
 * @property {boolean} [once] - Stays silent while an identical one is unread
 */

export interface NotificationInput {
  kind: NotificationKindName
  recipients: (string | null | undefined)[]
  actorId?: string | null
  target?: NotificationTargetName
  targetId?: string | null
  subject?: string | null
  once?: boolean
}

/**
 * Raise one alert per concerned member
 * @param {NotificationInput} input - Alert to raise
 * @return {Promise<void>} - Raised
 */

export const notify = async (input: NotificationInput): Promise<void> => {
  // One row per person, each named once, and never the author of the act
  let recipients = [...new Set(input.recipients)].filter(
    (id): id is string => Boolean(id) && id !== input.actorId
  )

  if (recipients.length === 0) return

  /*
   * An edit fires as often as it is saved. Under the once flag, whoever still has the same
   * alert unopened is left out rather than piling up rows saying the same thing.
   */

  if (input.once) {
    const pending = await prisma.notification.findMany({
      where: {
        recipientId: { in: recipients },
        kind: NOTIFICATION_KINDS.ids[input.kind],
        targetType: input.target,
        targetId: input.targetId,
        readAt: null,
      },
      select: { recipientId: true },
    })

    const notified = new Set(pending.map((row) => row.recipientId))
    recipients = recipients.filter((id) => !notified.has(id))

    if (recipients.length === 0) return
  }

  await prisma.notification.createMany({
    data: recipients.map((recipientId) => ({
      recipientId,
      actorId: input.actorId ?? null,
      kind: NOTIFICATION_KINDS.ids[input.kind],
      targetType: input.target,
      targetId: input.targetId,
      subject: input.subject,
    })),
  })
}

// Handle written as an at sign followed by one or two words of a display name
const MENTION_PATTERN = /@([\p{L}\p{N}._-]+(?:\s+[\p{L}\p{N}._-]+)?)/gu

/**
 * Collect the handles written in a body
 * @param {string} body - Written text
 * @return {string[]} - Candidate display names
 */

const readHandles = (body: string): string[] => {
  const handles = new Set<string>()

  for (const [, handle] of body.matchAll(MENTION_PATTERN)) {
    handles.add(handle)

    // A two word handle also stands for the first word alone
    const [first] = handle.split(/\s+/)
    if (first !== handle) handles.add(first)
  }

  return [...handles].slice(0, NOTIFICATION_SETTINGS.maxMentions)
}

/**
 * Raise a mention for every member named in a body
 * @param {string | null | undefined} body - Written text
 * @param {Omit<NotificationInput, 'kind' | 'recipients'>} input - Where the mention sits
 * @return {Promise<void>} - Raised
 */

export const notifyMentions = async (
  body: string | null | undefined,
  input: Omit<NotificationInput, 'kind' | 'recipients'>
): Promise<void> => {
  // No at sign, no lookup — the common case never reaches the database
  if (!body?.includes('@')) return

  const handles = readHandles(body)
  if (handles.length === 0) return

  const accounts = await prisma.account.findMany({
    where: {
      OR: handles.map((handle) => ({ displayName: { equals: handle, mode: 'insensitive' } })),
    },
    select: { id: true },
  })

  await notify({
    ...input,
    kind: 'Mentioned',
    recipients: accounts.map((account) => account.id),
  })
}

// Row shape every reader maps from, the actor carrying the portrait drawn on the row
type NotificationRow = Prisma.NotificationGetPayload<{
  include: { actor: { select: { displayName: true; avatarUrl: true } } }
}>

/**
 * Map a notification row to its display shape
 * @param {NotificationRow} row - Notification row with its actor
 * @return {NotificationEntry} - Display entry
 */

const toEntry = (row: NotificationRow): NotificationEntry => {
  // An unknown target kind simply loses its link, the sentence still reads
  const target = row.targetType ?? ''

  return {
    id: row.id,
    kind: NOTIFICATION_KINDS.byId(row.kind)?.name ?? null,
    actorName: row.actor?.displayName ?? null,
    actorAvatar: row.actor?.avatarUrl ?? null,
    target: NOTIFICATION_TARGETS.has(target) ? target : null,
    targetId: row.targetId,
    subject: row.subject,
    isRead: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  }
}

/**
 * Count what is still unopened
 * @param {string} accountId - Account identifier
 * @return {Promise<number>} - Unopened count
 */

export const countUnread = (accountId: string): Promise<number> =>
  prisma.notification.count({ where: { recipientId: accountId, readAt: null } })

/**
 * Read one page of notifications and its badge in a single round trip
 * @param {string} accountId - Account identifier
 * @param {number} [take] - Entry count
 * @return {Promise<NotificationFeed>} - Entries and unopened count
 */

export const readNotifications = async (
  accountId: string,
  take: number = NOTIFICATION_SETTINGS.pageSize
): Promise<NotificationFeed> => {
  const [rows, unread] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { recipientId: accountId },
      include: { actor: { select: { displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take,
    }),
    prisma.notification.count({ where: { recipientId: accountId, readAt: null } }),
  ])

  return { entries: rows.map(toEntry), unread }
}

/**
 * Mark one notification as opened
 * @param {string} id - Notification identifier
 * @param {string} accountId - Account identifier
 * @return {Promise<void>} - Marked
 */

export const markRead = async (id: string, accountId: string): Promise<void> => {
  await prisma.notification.updateMany({
    where: { id, recipientId: accountId, readAt: null },
    data: { readAt: new Date() },
  })
}

/**
 * Mark every notification as opened
 * @param {string} accountId - Account identifier
 * @return {Promise<void>} - Marked
 */

export const markAllRead = async (accountId: string): Promise<void> => {
  await prisma.notification.updateMany({
    where: { recipientId: accountId, readAt: null },
    data: { readAt: new Date() },
  })
}
