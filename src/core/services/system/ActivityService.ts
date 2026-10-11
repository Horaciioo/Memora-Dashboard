import 'server-only'

import { prisma } from '@/core/lib/db'
import type { ChangeSummary } from '@/core/services/system/changes'
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
 * @property {ChangeSummary | null} [change] - What an edit moved
 * @property {ActivityError} [error] - Failure behind the event
 * @property {Prisma.InputJsonValue} [payload] - Extra detail
 */

/**
 * Failure kept with an entry
 * @typedef {Object} ActivityError
 * @property {string} message - What went wrong
 * @property {string} route - Request that failed
 * @property {string} [trace] - Stack of the failure
 */

export interface ActivityError {
  message: string
  route: string
  trace?: string
}

export interface EventInput {
  eventType: EventTypeName
  origin?: EventOriginName
  actorId?: string | null
  subjectId?: string | null
  targetType?: string
  targetId?: string
  summary: string
  change?: ChangeSummary | null
  error?: ActivityError
  payload?: Prisma.InputJsonValue
}

/**
 * Stored shape of an event's detail
 * @param {EventInput} input - Event to record
 * @return {Prisma.InputJsonValue | undefined} - Payload
 */

const toPayload = (input: EventInput): Prisma.InputJsonValue | undefined => {
  if (!input.change && !input.error) return undefined

  return {
    ...(input.change ? { change: input.change } : {}),
    ...(input.error ? { error: input.error } : {}),
  } as Prisma.InputJsonValue
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
      payload: input.payload ?? toPayload(input),
    },
  })
}

/**
 * Journal entry ready for display
 * @typedef {Object} ActivityEntry
 * @property {EventTypeName | null} event - Event kind
 * @property {string} id - Entry identifier
 * @property {string} origin - Origin label
 * @property {string} summary - One line description
 * @property {string | null} actorName - Who did it
 * @property {string | null} actorAvatar - Portrait of who did it
 * @property {string} createdAt - ISO timestamp
 * @property {string | null} targetType - Target resource kind
 * @property {string | null} targetId - Target resource identifier
 * @property {ChangeSummary | null} change - What the edit moved
 * @property {ActivityError | null} error - Failure behind the entry
 */

export interface ActivityEntry {
  id: string
  event: EventTypeName | null
  origin: string
  summary: string
  actorName: string | null
  actorAvatar: string | null
  createdAt: string
  targetType: string | null
  targetId: string | null
  change: ChangeSummary | null
  error: ActivityError | null
}

// Stored payload read as a loose record
const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

/**
 * Read the change description off a stored payload
 * @param {Prisma.JsonValue} payload - Stored payload
 * @return {ChangeSummary | null} - Change description
 */

const readChange = (payload: Prisma.JsonValue): ChangeSummary | null => {
  const change = asRecord(asRecord(payload)?.change)
  if (!change || typeof change.verb !== 'string' || typeof change.rest !== 'string') return null

  const lines = Array.isArray(change.lines) ? (change.lines as ChangeSummary['lines']) : undefined

  return { verb: change.verb, rest: change.rest, ...(lines ? { lines } : {}) }
}

/**
 * Read the failure off a stored payload
 * @param {Prisma.JsonValue} payload - Stored payload
 * @return {ActivityError | null} - Failure
 */

const readError = (payload: Prisma.JsonValue): ActivityError | null => {
  const error = asRecord(asRecord(payload)?.error)
  if (!error || typeof error.message !== 'string') return null

  return {
    message: error.message,
    route: typeof error.route === 'string' ? error.route : '',
    ...(typeof error.trace === 'string' ? { trace: error.trace } : {}),
  }
}

// Row shape every reader maps from
type ActivityRow = Prisma.ActivityLogGetPayload<{
  include: { actor: { select: { displayName: true; avatarUrl: true } } }
}>

/**
 * Map a journal row to its display shape
 * @param {ActivityRow} row - Journal row with its actor
 * @return {ActivityEntry} - Journal entry
 */

const toEntry = (row: ActivityRow): ActivityEntry => ({
  id: row.id,
  event: EVENT_TYPES.byId(row.eventType)?.name ?? null,
  origin: EVENT_ORIGINS.label(row.origin),
  summary: row.summary,
  actorName: row.actor?.displayName ?? null,
  actorAvatar: row.actor?.avatarUrl ?? null,
  createdAt: row.createdAt.toISOString(),
  targetType: row.targetType,
  targetId: row.targetId,
  change: readChange(row.payload),
  error: readError(row.payload),
})

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
    include: { actor: { select: { displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take,
  })

  return rows.map(toEntry)
}

/**
 * Read the journal of one record
 * @param {string} targetType - Target resource kind
 * @param {string} targetId - Target resource identifier
 * @param {number} [take] - Entry count
 * @return {Promise<ActivityEntry[]>} - Journal entries
 */

export const readRecordActivity = async (
  targetType: string,
  targetId: string,
  take: number = PAGINATION_SETTINGS.defaultPerPage
): Promise<ActivityEntry[]> => {
  const rows = await prisma.activityLog.findMany({
    where: { targetType, targetId },
    include: { actor: { select: { displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take,
  })

  return rows.map(toEntry)
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
    include: { actor: { select: { displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take,
  })

  return rows.map(toEntry)
}
