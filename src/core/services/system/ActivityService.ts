import 'server-only'

import { prisma } from '@/core/lib/db'
import { PAGINATION_SETTINGS } from '@/declarations/configurations/settings'
import { EVENT_ORIGINS, EVENT_TYPES } from '@/utils/constants/events'
import type { EventOriginName, EventTypeName } from '@/utils/constants/events'
import type { Prisma } from '@prisma/client'

/**
 * Fact worth keeping in the journal
 * @typedef {Object} EventInput
 * @property {EventTypeName} eventType - Event kind
 * @property {EventOriginName} [origin] - Where it came from
 * @property {string} [actorId] - Who did it
 * @property {string} [subjectId] - Whose file it lands on
 * @property {string} [targetType] - Target resource kind
 * @property {string} [targetId] - Target resource identifier
 * @property {string} summary - One line description
 * @property {Prisma.InputJsonValue} [payload] - Extra detail
 */

export interface EventInput {
  eventType: EventTypeName
  origin?: EventOriginName
  actorId?: string | null
  subjectId?: string | null
  targetType?: string
  targetId?: string
  summary: string
  payload?: Prisma.InputJsonValue
}

/**
 * Write one journal entry
 * @param {EventInput} input - Event to record
 * @return {Promise<void>} - Recorded
 */

export const recordEvent = async (input: EventInput): Promise<void> => {
  await prisma.activityLog.create({
    data: {
      eventType: EVENT_TYPES.ids[input.eventType],
      origin: EVENT_ORIGINS.ids[input.origin ?? 'User'],
      actorId: input.actorId ?? null,
      subjectId: input.subjectId ?? null,
      targetType: input.targetType,
      targetId: input.targetId,
      summary: input.summary,
      payload: input.payload,
    },
  })
}

/**
 * Journal entry ready for display
 * @typedef {Object} ActivityEntry
 * @property {string} id - Entry identifier
 * @property {string} label - Event label
 * @property {string} origin - Origin label
 * @property {string} summary - One line description
 * @property {string | null} actorName - Who did it
 * @property {string} createdAt - ISO timestamp
 * @property {string | null} targetType - Target resource kind
 * @property {string | null} targetId - Target resource identifier
 */

export interface ActivityEntry {
  id: string
  label: string
  origin: string
  summary: string
  actorName: string | null
  createdAt: string
  targetType: string | null
  targetId: string | null
}

/**
 * Read the journal of one member
 * @param {string} accountId - Account identifier
 * @param {number} [take] - Entry count
 * @return {Promise<ActivityEntry[]>} - Journal entries
 */

export const readMemberActivity = async (
  accountId: string,
  take: number = PAGINATION_SETTINGS.defaultPerPage
): Promise<ActivityEntry[]> => {
  const rows = await prisma.activityLog.findMany({
    where: { OR: [{ subjectId: accountId }, { actorId: accountId }] },
    include: { actor: { select: { displayName: true } } },
    orderBy: { createdAt: 'desc' },
    take,
  })

  return rows.map((row) => ({
    id: row.id,
    label: EVENT_TYPES.label(row.eventType),
    origin: EVENT_ORIGINS.label(row.origin),
    summary: row.summary,
    actorName: row.actor?.displayName ?? null,
    createdAt: row.createdAt.toISOString(),
    targetType: row.targetType,
    targetId: row.targetId,
  }))
}

/**
 * Read the latest journal entries
 * @param {number} [take] - Entry count
 * @return {Promise<ActivityEntry[]>} - Journal entries
 */

export const readRecentActivity = async (
  take: number = PAGINATION_SETTINGS.defaultPerPage
): Promise<ActivityEntry[]> => {
  const rows = await prisma.activityLog.findMany({
    include: { actor: { select: { displayName: true } } },
    orderBy: { createdAt: 'desc' },
    take,
  })

  return rows.map((row) => ({
    id: row.id,
    label: EVENT_TYPES.label(row.eventType),
    origin: EVENT_ORIGINS.label(row.origin),
    summary: row.summary,
    actorName: row.actor?.displayName ?? null,
    createdAt: row.createdAt.toISOString(),
    targetType: row.targetType,
    targetId: row.targetId,
  }))
}
