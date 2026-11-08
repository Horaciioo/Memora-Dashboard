import 'server-only'

import { prisma } from '@/core/lib/db'
import { FINISHED_RECRUITMENT_STATUSES } from '@/utils/constants/recruitment'
import type { RecruitmentStatusName } from '@/utils/constants/recruitment'

/**
 * What a member holds in one recruitment session
 * @typedef {Object} SeatState
 * @property {boolean} recruiting - Leads interviews and keeps the page
 * @property {boolean} observing - Sits in on interviews and keeps the page
 * @property {boolean} archived - Took part in an interview of a finished session, read only
 * @property {boolean} hidden - Archives deleted, nothing is held anymore
 */

export interface SeatState {
  recruiting: boolean
  observing: boolean
  archived: boolean
  hidden: boolean
}

// Rows read before they settle into a state
interface SeatDraft {
  isFinished: boolean
  recruiter: 'on' | 'off' | null
  observer: 'on' | 'off' | null
  leads: number
  sits: number
  hidden: boolean
}

interface SeatRow {
  sessionId: string
  revokedAt: Date | null
  forgottenAt: Date | null
  session: { status: RecruitmentStatusName }
}

/**
 * Whether the page of a session stays open to a seat
 * @param {SeatDraft} draft - Rows read
 * @param {'recruiter' | 'observer'} key - Seat looked at
 * @param {number} ties - Interviews tied to the member
 * @return {boolean} - Seat holds the page
 */

const holds = (draft: SeatDraft, key: 'recruiter' | 'observer', ties: number): boolean => {
  if (draft.hidden) return false

  // A named seat decides, an interview alone opens the session until it ends
  return draft[key] ? draft[key] === 'on' : ties > 0 && !draft.isFinished
}

/**
 * Seats a member holds, session by session
 * @param {string} accountId - Member
 * @param {string} [sessionId] - Narrows the read to one session
 * @return {Promise<Map<string, SeatState>>} - State by session identifier
 */

export const readSeatStates = async (
  accountId: string,
  sessionId?: string
): Promise<Map<string, SeatState>> => {
  const named = {
    where: { accountId, ...(sessionId ? { sessionId } : {}) },
    select: {
      sessionId: true,
      revokedAt: true,
      forgottenAt: true,
      session: { select: { status: true } },
    },
  }
  const tied = {
    where: { accountId, ...(sessionId ? { candidate: { sessionId } } : {}) },
    select: { candidate: { select: { sessionId: true, session: { select: { status: true } } } } },
  }

  const [recruiters, observers, leads, sits] = await Promise.all([
    prisma.recruitmentRecruiter.findMany(named),
    prisma.recruitmentObserver.findMany(named),
    prisma.candidateRecruiter.findMany(tied),
    prisma.recruitmentSeat.findMany(tied),
  ])

  const drafts = new Map<string, SeatDraft>()
  const draftOf = (id: string, status: RecruitmentStatusName): SeatDraft => {
    const draft = drafts.get(id) ?? {
      isFinished: FINISHED_RECRUITMENT_STATUSES.includes(status),
      recruiter: null,
      observer: null,
      leads: 0,
      sits: 0,
      hidden: false,
    }
    drafts.set(id, draft)

    return draft
  }

  const seatState = (row: SeatRow): 'on' | 'off' => (row.revokedAt ? 'off' : 'on')

  for (const row of recruiters) {
    const draft = draftOf(row.sessionId, row.session.status)
    draft.recruiter = seatState(row)
    draft.hidden ||= row.forgottenAt !== null
  }
  for (const row of observers) {
    const draft = draftOf(row.sessionId, row.session.status)
    draft.observer = seatState(row)
    draft.hidden ||= row.forgottenAt !== null
  }
  for (const { candidate } of leads) draftOf(candidate.sessionId, candidate.session.status).leads++
  for (const { candidate } of sits) draftOf(candidate.sessionId, candidate.session.status).sits++

  return new Map(
    [...drafts].map(([id, draft]) => [
      id,
      {
        recruiting: holds(draft, 'recruiter', draft.leads),
        observing: holds(draft, 'observer', draft.sits),
        archived: !draft.hidden && draft.isFinished && draft.leads + draft.sits > 0,
        hidden: draft.hidden,
      },
    ])
  )
}

/**
 * Sessions whose page a member keeps open
 * @param {string} accountId - Member
 * @return {Promise<string[]>} - Session identifiers
 */

export const readSeatSessionIds = async (accountId: string): Promise<string[]> => {
  const states = await readSeatStates(accountId)

  return [...states]
    .filter(([, state]) => state.recruiting || state.observing || state.archived)
    .map(([id]) => id)
}

/**
 * Members whose archives were deleted from a session
 * @param {string} sessionId - Session identifier
 * @return {Promise<Map<string, 'recruiter' | 'observer'>>} - Seat kind by account
 */

export const readHiddenSeats = async (
  sessionId: string
): Promise<Map<string, 'recruiter' | 'observer'>> => {
  const where = { sessionId, forgottenAt: { not: null } }
  const [recruiters, observers] = await Promise.all([
    prisma.recruitmentRecruiter.findMany({ where, select: { accountId: true } }),
    prisma.recruitmentObserver.findMany({ where, select: { accountId: true } }),
  ])

  return new Map([
    ...observers.map((row): [string, 'observer'] => [row.accountId, 'observer']),
    ...recruiters.map((row): [string, 'recruiter'] => [row.accountId, 'recruiter']),
  ])
}
