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

/**
 * Leave a remark on a candidate
 * @param {string} candidateId - Candidate identifier
 * @param {FormValues} values - Parsed body
 * @param {string} authorId - Who writes it
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CandidateView>} - Candidate card
 */

export const addComment = async (
  candidateId: string,
  values: FormValues,
  authorId: string,
  scope: AccessScope
): Promise<CandidateView> => {
  await reachableCandidate(candidateId, scope)

  await prisma.recruitmentComment.create({
    data: { candidateId, authorId, body: encryptField(readText(values, 'body')) ?? '' },
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
