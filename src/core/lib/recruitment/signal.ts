import 'server-only'

import { prisma } from '@/core/lib/db'
import { readOrigin } from '@/core/lib/http/requestOrigin'
import { publishLive } from '@/core/lib/lives/bus'
import { RECRUITMENT_STREAM_EVENTS, RECRUITMENT_TOPICS } from '@/declarations/recruitment/topics'
import type { AnswerState } from '@/types/recruitment'

/**
 * Tell a session's readers something moved, carrying identifiers only
 * @param {string} sessionId - Session
 * @param {string} type - Event
 * @param {string} [candidateId] - Candidate concerned
 * @return {Promise<void>} - Sent
 */

const signal = async (
  sessionId: string,
  type: string,
  detail: Record<string, unknown> = {}
): Promise<void> => {
  const { tab } = await readOrigin()

  await publishLive(RECRUITMENT_TOPICS.session(sessionId), { ...detail, type, tab, at: Date.now() })
}

/**
 * Tell a session's readers a candidate changed
 * @param {string} candidateId - Candidate
 * @param {string} [sessionId] - Session, read when unknown
 * @return {Promise<void>} - Sent
 */

export const signalCandidate = async (candidateId: string, sessionId?: string): Promise<void> => {
  const owner =
    sessionId ??
    (
      await prisma.recruitmentCandidate.findUnique({
        where: { id: candidateId },
        select: { sessionId: true },
      })
    )?.sessionId

  if (owner) await signal(owner, RECRUITMENT_STREAM_EVENTS.candidate, { candidateId })
}

/**
 * Tell a session's readers a candidate left
 * @param {string} sessionId - Session
 * @param {string} candidateId - Candidate
 * @return {Promise<void>} - Sent
 */

export const signalCandidateRemoved = (sessionId: string, candidateId: string): Promise<void> =>
  signal(sessionId, RECRUITMENT_STREAM_EVENTS.removed, { candidateId })

/**
 * Tell a session's readers the session itself changed
 * @param {string} sessionId - Session
 * @return {Promise<void>} - Sent
 */

export const signalSession = (sessionId: string): Promise<void> =>
  signal(sessionId, RECRUITMENT_STREAM_EVENTS.session)

/**
 * Hand a noted answer to the session's readers, no read back needed
 * @param {Object} input - Answer
 * @param {string} input.sessionId - Session
 * @param {string} input.candidateId - Candidate
 * @param {string} input.key - Question
 * @param {AnswerState} input.answer - Stored state
 * @return {Promise<void>} - Sent
 */

export const signalAnswer = ({
  sessionId,
  candidateId,
  key,
  answer,
}: {
  sessionId: string
  candidateId: string
  key: string
  answer: AnswerState
}): Promise<void> =>
  signal(sessionId, RECRUITMENT_STREAM_EVENTS.answer, { candidateId, key, answer })
