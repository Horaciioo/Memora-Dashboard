import 'server-only'

import { prisma } from '@/core/lib/db'
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
 * Candidate and session names that make an entry readable
 * @param {JournalFileName} file - File kind
 * @param {string} fileId - File identifier
 * @param {string} [candidateId] - Candidate concerned
 * @return {Promise<string[]>} - Candidate then session
 */

const subjectParts = async (
  file: JournalFileName,
  fileId: string,
  candidateId?: string
): Promise<string[]> => {
  const [candidate, session] = await Promise.all([
    candidateId
      ? prisma.recruitmentCandidate.findUnique({
          where: { id: candidateId },
          select: { displayName: true, discordId: true },
        })
      : null,
    file === JOURNAL_FILES.Recruitment
      ? prisma.recruitmentSession.findUnique({ where: { id: fileId }, select: { name: true } })
      : null,
  ])

  return [candidate?.displayName ?? candidate?.discordId, session?.name].filter(
    (part): part is string => !!part
  )
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
  const subject = { parts: [summary, ...(await subjectParts(file, fileId, candidateId))] }
  await recordEvent({ eventType, actorId, targetType: file, targetId: fileId, summary, subject })

  // The candidate keeps its own line
  if (candidateId) {
    await recordEvent({
      eventType,
      actorId,
      targetType: JOURNAL_FILES.Candidate,
      targetId: candidateId,
      summary,
      subject,
    })
  }
}
