import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import type { SeatAction, SeatFamily } from '@/declarations/members/seats'

/**
 * State written on a seat for each gesture
 * @param {SeatAction} action - Gesture
 * @param {Date} now - Moment of the gesture
 * @return {{ revokedAt?: Date | null, forgottenAt?: Date }} - Columns to write
 */

const stateOf = (action: SeatAction, now: Date) =>
  action === 'restore'
    ? { revokedAt: null }
    : action === 'revoke'
      ? { revokedAt: now }
      : { revokedAt: now, forgottenAt: now }

/**
 * Session-level seats a member holds through the interviews they led or sat in
 * @param {string} accountId - Member
 * @param {string} sessionId - Recruitment session
 * @return {Promise<{ recruiter: boolean, observer: boolean }>} - Seats to carry the state
 */

const interviewTies = async (accountId: string, sessionId: string) => {
  const candidate = { sessionId }
  const [leads, sits] = await Promise.all([
    prisma.candidateRecruiter.count({ where: { accountId, candidate } }),
    prisma.recruitmentSeat.count({ where: { accountId, candidate } }),
  ])

  return { recruiter: leads > 0, observer: sits > 0 }
}

/**
 * Take back, give back or delete the participation of a member in a recruitment session
 * @param {string} accountId - Member
 * @param {string} sessionId - Recruitment session
 * @param {SeatAction} action - Gesture
 * @return {Promise<void>} - Seats rewritten
 */

const actOnRecruitment = async (
  accountId: string,
  sessionId: string,
  action: SeatAction
): Promise<void> => {
  const state = stateOf(action, new Date())
  const where = { sessionId, accountId }
  const [recruiter, observer, ties] = await Promise.all([
    prisma.recruitmentRecruiter.count({ where }),
    prisma.recruitmentObserver.count({ where }),
    interviewTies(accountId, sessionId),
  ])

  // An interview alone holds no seat, the state needs a row to live on
  const seat = {
    where: { sessionId_accountId: { sessionId, accountId } },
    create: { sessionId, accountId, ...state },
    update: state,
  }

  await prisma.$transaction([
    ...(recruiter > 0 || ties.recruiter ? [prisma.recruitmentRecruiter.upsert(seat)] : []),
    ...(observer > 0 || ties.observer ? [prisma.recruitmentObserver.upsert(seat)] : []),
  ])
}

/**
 * Take back, give back or delete the participation of a member in a promotion
 * @param {string} accountId - Member
 * @param {string} sessionId - Promotion
 * @param {SeatAction} action - Gesture
 * @return {Promise<void>} - Seat rewritten
 */

const actOnAcademy = async (
  accountId: string,
  sessionId: string,
  action: SeatAction
): Promise<void> => {
  const { count } = await prisma.academySessionReferent.updateMany({
    where: { sessionId, accountId },
    data: stateOf(action, new Date()),
  })

  if (count === 0) throw notFound()
}

/**
 * Apply a gesture on the temporary seats a member holds in one session
 * @param {string} accountId - Member
 * @param {SeatFamily} family - Family of the session
 * @param {string} sessionId - Session identifier
 * @param {SeatAction} action - Gesture
 * @return {Promise<void>} - Seats rewritten, comments and reviews untouched
 */

export const applySeatAction = async (
  accountId: string,
  family: SeatFamily,
  sessionId: string,
  action: SeatAction
): Promise<void> =>
  family === 'academy'
    ? actOnAcademy(accountId, sessionId, action)
    : actOnRecruitment(accountId, sessionId, action)
