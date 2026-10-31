import 'server-only'

import { encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import type { FormValues } from '@/types/forms'
import type { CandidateView } from '@/types/recruitment'
import { sessionScope, reachableCandidate } from '@/core/services/recruitment/reach'
import { readCandidate } from '@/core/services/recruitment/CandidateService'
import { QUESTION_KEYS } from '@/core/services/recruitment/InterviewService'

/**
 * Leave a remark on a candidate
 * @param {string} candidateId - Candidate identifier
 * @param {FormValues} values - Parsed body
 * @param {string} authorId - Who writes it
 * @param {AccessScope} scope - Perimeter
 * @param {string | null} [questionKey] - Question it is left under
 * @return {Promise<CandidateView>} - Candidate card
 */

export const addComment = async (
  candidateId: string,
  values: FormValues,
  authorId: string,
  scope: AccessScope,
  questionKey: string | null = null
): Promise<CandidateView> => {
  await reachableCandidate(candidateId, scope)
  if (questionKey !== null && !QUESTION_KEYS.has(questionKey)) throw notFound()

  await prisma.recruitmentComment.create({
    data: {
      candidateId,
      authorId,
      questionKey,
      body: encryptField(readText(values, 'body')) ?? '',
    },
  })

  return readCandidate(candidateId)
}

/**
 * Drop a remark
 * @param {string} id - Comment identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CandidateView>} - Candidate card
 */

export const removeComment = async (id: string, scope: AccessScope): Promise<CandidateView> => {
  const row = await prisma.recruitmentComment.findFirst({
    where: { AND: [{ id }, { candidate: { session: sessionScope(scope) } }] },
    select: { candidateId: true },
  })

  if (!row?.candidateId) throw notFound()

  await prisma.recruitmentComment.delete({ where: { id } })

  return readCandidate(row.candidateId)
}

/**
 * Pin or unpin a remark
 * @param {string} id - Comment identifier
 * @param {boolean} pinned - Held on the rail
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CandidateView>} - Candidate card
 */

export const pinComment = async (
  id: string,
  pinned: boolean,
  scope: AccessScope
): Promise<CandidateView> => {
  const row = await prisma.recruitmentComment.findFirst({
    where: { AND: [{ id }, { candidate: { session: sessionScope(scope) } }] },
    select: { candidateId: true },
  })

  if (!row?.candidateId) throw notFound()

  await prisma.recruitmentComment.update({
    where: { id },
    data: { pinnedAt: pinned ? new Date() : null },
  })

  return readCandidate(row.candidateId)
}

/**
 * Read what a remark was left on
 * @param {string} id - Comment identifier
 * @return {Promise<'candidate' | 'session'>} - Kind of subject
 */

export const commentSubject = async (id: string): Promise<'candidate' | 'session'> => {
  const row = await prisma.recruitmentComment.findUnique({
    where: { id },
    select: { candidateId: true },
  })

  if (!row) throw notFound()

  return row.candidateId ? 'candidate' : 'session'
}

/**
 * Read the session a remark of the session itself belongs to
 * @param {string} id - Comment identifier
 * @return {Promise<string | null>} - Session identifier, null for a candidate remark
 */

export const commentSessionId = async (id: string): Promise<string | null> => {
  const row = await prisma.recruitmentComment.findUnique({
    where: { id },
    select: { sessionId: true },
  })

  return row?.sessionId ?? null
}
