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
  Candidate: 'candidate',
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
 * @property {string} [candidateId] - Candidate it also belongs to
 */

export interface FileEvent {
  eventType: EventTypeName
  file: JournalFileName
  fileId: string
  actorId: string
  summary: string
  candidateId?: string
}

/**
 * Write one entry on a file's journal
 * @param {FileEvent} event - Fact to keep
 * @return {Promise<void>} - Recorded
 */

export const recordFileEvent = async ({
  eventType,
  file,
  fileId,
  actorId,
  summary,
  candidateId,
}: FileEvent): Promise<void> => {
  await recordEvent({ eventType, actorId, targetType: file, targetId: fileId, summary })

  // The candidate keeps its own line
  if (candidateId) {
    await recordEvent({
      eventType,
      actorId,
      targetType: JOURNAL_FILES.Candidate,
      targetId: candidateId,
      summary,
    })
  }
}
