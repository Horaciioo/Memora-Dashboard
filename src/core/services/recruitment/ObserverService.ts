import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'

/**
 * Observer sits in on, or leaves, one interview
 * @param {string} candidateId - Candidate identifier
 * @param {string} accountId - Observer
 * @param {boolean} joined - Wanted state
 * @param {boolean} canObserve - Holds the right to follow every session
 * @return {Promise<string>} - Session identifier
 */

export const setObserving = async (
  candidateId: string,
  accountId: string,
  joined: boolean,
  canObserve: boolean
): Promise<string> => {
  const candidate = await prisma.recruitmentCandidate.findUnique({
    where: { id: candidateId },
    select: { sessionId: true },
  })
  if (!candidate) throw notFound()

  // A named seat of the session, or the Observateurs function which opens every session
  const seat = await prisma.recruitmentObserver.findUnique({
    where: { sessionId_accountId: { sessionId: candidate.sessionId, accountId } },
  })
  if (!seat && !canObserve) throw forbidden()

  // Leaving always works
  if (!joined) {
    await prisma.recruitmentSeat.deleteMany({ where: { candidateId, accountId } })

    return candidate.sessionId
  }

  await prisma.recruitmentSeat.upsert({
    where: { candidateId_accountId: { candidateId, accountId } },
    create: { candidateId, accountId },
    update: {},
  })

  return candidate.sessionId
}
