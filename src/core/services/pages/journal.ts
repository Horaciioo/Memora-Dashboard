import 'server-only'

import type { Prisma } from '@prisma/client'

import { recordEvent } from '@/core/services/system/ActivityService'
import type { EventTypeName } from '@/utils/constants/events'

/**
 * Target type of page events
 * @type {string}
 */

export const PAGE_TARGET = 'page'

/**
 * Keep one page fact in the journal, never its content
 * @param {Object} input - Event
 * @param {EventTypeName} input.eventType - Event kind
 * @param {string} input.actorId - Who did it
 * @param {string} input.pageId - Page touched
 * @param {string} input.summary - One line
 * @param {Prisma.InputJsonValue} [input.payload] - Detail
 * @return {Promise<void>} - Recorded
 */

export const journalPage = async (input: {
  eventType: EventTypeName
  actorId: string
  pageId: string
  summary: string
  payload?: Prisma.InputJsonValue
}): Promise<void> =>
  recordEvent({
    eventType: input.eventType,
    actorId: input.actorId,
    targetType: PAGE_TARGET,
    targetId: input.pageId,
    summary: input.summary,
    ...(input.payload ? { payload: input.payload } : {}),
  })
