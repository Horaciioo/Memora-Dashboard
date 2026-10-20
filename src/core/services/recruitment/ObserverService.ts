import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { readNumberValue, readText } from '@/core/lib/forms/values'
import { readObservers } from '@/core/services/recruitment/ObserverReader'
import { reachableSession } from '@/core/services/recruitment/RecruitmentService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { memberOptions } from '@/core/services/work/shared'
import { RECRUITMENT_FIELD_COPY } from '@/declarations/recruitment/copy'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { ObserverView } from '@/types/recruitment'
import { INTERVIEW_OBSERVERS_MAX, OBSERVER_QUOTA_MAX } from '@/utils/constants/recruitment'

/**
 * Declarations of the observer form
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const observerFields = async (): Promise<FieldDefinition[]> => [
  {
    name: 'personId',
    kind: 'select',
    label: RECRUITMENT_FIELD_COPY.observer,
    required: true,
    options: await memberOptions(),
    mark: 'avatar',
    span: 'half',
  },
  {
    name: 'quota',
    kind: 'number',
    label: RECRUITMENT_FIELD_COPY.observerQuota,
    required: true,
    min: 1,
    max: OBSERVER_QUOTA_MAX,
    span: 'half',
  },
]

/**
 * Give a member an observer seat
 * @param {string} sessionId - Session identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<ObserverView[]>} - Observers of the session
 */

export const addObserver = async (
  sessionId: string,
  values: FormValues,
  scope: AccessScope
): Promise<ObserverView[]> => {
  await reachableSession(sessionId, scope)

  const accountId = readText(values, 'personId')
  if (!accountId) throw invalidInput([{ field: 'personId', message: FORM_COPY.required }])

  const exists = await prisma.recruitmentObserver.count({ where: { sessionId, accountId } })
  if (exists > 0) throw conflict()

  await prisma.recruitmentObserver.create({
    data: { sessionId, accountId, quota: readNumberValue(values, 'quota') ?? 1 },
  })

  return readObservers(sessionId)
}

/**
 * Observer row of a reachable session
 * @param {string} id - Observer identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<string>} - Session identifier
 */

export const observerSession = async (id: string, scope: AccessScope): Promise<string> => {
  const row = await prisma.recruitmentObserver.findUnique({
    where: { id },
    select: { sessionId: true },
  })
  if (!row) throw notFound()

  await reachableSession(row.sessionId, scope)

  return row.sessionId
}

/**
 * Change how many interviews an observer may join
 * @param {string} id - Observer identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<ObserverView[]>} - Observers of the session
 */

export const updateObserver = async (
  id: string,
  values: FormValues,
  scope: AccessScope
): Promise<ObserverView[]> => {
  const sessionId = await observerSession(id, scope)

  await prisma.recruitmentObserver.update({
    where: { id },
    data: { quota: readNumberValue(values, 'quota') ?? 1 },
  })

  return readObservers(sessionId)
}

/**
 * Take an observer seat back, with the interviews joined
 * @param {string} id - Observer identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<ObserverView[]>} - Observers of the session
 */

export const removeObserver = async (id: string, scope: AccessScope): Promise<ObserverView[]> => {
  const sessionId = await observerSession(id, scope)
  const row = await prisma.recruitmentObserver.findUniqueOrThrow({ where: { id } })

  await prisma.$transaction([
    prisma.recruitmentSeat.deleteMany({
      where: { accountId: row.accountId, candidate: { sessionId } },
    }),
    prisma.recruitmentObserver.delete({ where: { id } }),
  ])

  return readObservers(sessionId)
}

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

  const already = await prisma.recruitmentSeat.count({
    where: { accountId, candidate: { sessionId: candidate.sessionId } },
  })
  const sitting = await prisma.recruitmentSeat.count({ where: { candidateId, accountId } })

  // Quota counts other interviews only
  if (seat && sitting === 0 && already >= seat.quota) throw conflict()

  // An observer never breaks the limit of an interview, a manager does by seating them
  const crowd = await prisma.recruitmentSeat.count({ where: { candidateId } })
  if (sitting === 0 && crowd >= INTERVIEW_OBSERVERS_MAX) throw conflict()

  await prisma.recruitmentSeat.upsert({
    where: { candidateId_accountId: { candidateId, accountId } },
    create: { candidateId, accountId },
    update: {},
  })

  return candidate.sessionId
}
