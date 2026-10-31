import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'

/**
 * Narrow a session query to the creators in perimeter
 * @param {AccessScope} scope - Perimeter
 * @return {object} - Where clause
 */

export const sessionScope = (scope: AccessScope) => scopedWhere('recruitmentSession', scope)

/**
 * Read the session a candidate belongs to, whoever asks
 * @param {string} candidateId - Candidate identifier
 * @return {Promise<string>} - Session identifier
 */

export const candidateSessionId = async (candidateId: string): Promise<string> => {
  const row = await prisma.recruitmentCandidate.findUnique({
    where: { id: candidateId },
    select: { sessionId: true },
  })

  if (!row) throw notFound()

  return row.sessionId
}

/**
 * Read the session a candidate belongs to
 * @param {string} candidateId - Candidate identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<string>} - Session identifier
 */

export const reachableCandidate = async (
  candidateId: string,
  scope: AccessScope
): Promise<string> => {
  const row = await prisma.recruitmentCandidate.findFirst({
    where: { AND: [{ id: candidateId }, { session: sessionScope(scope) }] },
    select: { sessionId: true },
  })

  if (!row) throw notFound()

  return row.sessionId
}

/**
 * Read the session an application belongs to
 * @param {string} candidateId - Candidate identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<string>} - Session identifier
 */

export const candidateSession = (candidateId: string, scope: AccessScope): Promise<string> =>
  reachableCandidate(candidateId, scope)

/**
 * Read the session a step belongs to
 * @param {string} stepId - Step identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<string>} - Session identifier
 */

export const stepSession = async (stepId: string, scope: AccessScope): Promise<string> => {
  const row = await prisma.recruitmentStep.findFirst({
    where: { AND: [{ id: stepId }, { session: sessionScope(scope) }] },
    select: { sessionId: true },
  })

  if (!row) throw notFound()

  return row.sessionId
}

/**
 * Read a session the viewer may reach
 * @param {string} id - Session identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<{ id: string, youtuberId: string, functionId: string, academySessionId: string | null, opensAt: Date | null }>} - Session anchors
 */

export const reachableSession = async (id: string, scope: AccessScope) => {
  const row = await prisma.recruitmentSession.findFirst({
    where: { AND: [{ id }, sessionScope(scope)] },
    select: {
      id: true,
      name: true,
      youtuberId: true,
      functionId: true,
      academySessionId: true,
      opensAt: true,
    },
  })

  if (!row) throw notFound()

  return row
}
