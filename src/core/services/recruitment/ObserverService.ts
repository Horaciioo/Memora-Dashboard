import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { readSeatStates } from '@/core/services/recruitment/SeatReader'

/**
 * Observer sits in on, or leaves, one interview
 * @param {string} candidateId - Candidate identifier
 * @param {string} accountId - Observer
 * @param {boolean} joined - Wanted state
 * @param {boolean} canManage - Manages recruitment, follows every session
 * @return {Promise<string>} - Session identifier
 */

export const setObserving = async (
  candidateId: string,
  accountId: string,
  joined: boolean,
  canManage: boolean
): Promise<string> => {
  const candidate = await prisma.recruitmentCandidate.findUnique({
    where: { id: candidateId },
    select: { sessionId: true },
  })
  if (!candidate) throw notFound()

  // Leaving always works, a seat given by a manager included
  if (!joined) {
    await prisma.recruitmentSeat.deleteMany({ where: { candidateId, accountId } })

    return candidate.sessionId
  }

  // A seat of the session keeps the page open, managers follow any of them
  const state = (await readSeatStates(accountId, candidate.sessionId)).get(candidate.sessionId)
  if (!canManage && !state?.observing && !state?.recruiting) throw forbidden()

  // The recruiter of a candidate never observes the same interview
  const leads = await prisma.candidateRecruiter.findUnique({
    where: { candidateId_accountId: { candidateId, accountId } },
  })
  if (leads) throw conflict()

  await prisma.recruitmentSeat.upsert({
    where: { candidateId_accountId: { candidateId, accountId } },
    create: { candidateId, accountId },
    update: {},
  })

  return candidate.sessionId
}
