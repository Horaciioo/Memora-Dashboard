import 'server-only'

import { recordEvent } from '@/core/services/system/ActivityService'
import type { EventTypeName } from '@/utils/constants/events'

/**
 * Kinds of file whose journal is read on its own page
 * @type {Record<string, string>}
 */

export const JOURNAL_FILES = {
  Recruitment: 'recruitment',
  Academy: 'academy',
} as const

export type JournalFileName = (typeof JOURNAL_FILES)[keyof typeof JOURNAL_FILES]

/**
 * Fact kept on the journal of one file
 * @typedef {Object} FileEvent
 * @property {EventTypeName} eventType - Event kind
 * @property {JournalFileName} file - File kind
 * @property {string} fileId - File identifier
 * @property {string} actorId - Who did it
 * @property {string} summary - One line description
 */

export interface FileEvent {
  eventType: EventTypeName
  file: JournalFileName
  fileId: string
  actorId: string
  summary: string
}

/**
 * Write one entry on a file's journal
 * @param {FileEvent} event - Fact to keep
 * @return {Promise<void>} - Recorded
 */

export const recordFileEvent = ({
  eventType,
  file,
  fileId,
  actorId,
  summary,
}: FileEvent): Promise<void> =>
  recordEvent({ eventType, actorId, targetType: file, targetId: fileId, summary })
