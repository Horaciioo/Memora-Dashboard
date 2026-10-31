import 'server-only'

import { prisma } from '@/core/lib/db'
import { syncAdmission } from '@/core/services/academy/AdmissionService'
import { readDate, readFlag, readList, readText } from '@/core/lib/forms/values'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { positionAt } from '@/core/services/work/shared'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { readPortraits } from '@/core/services/recruitment/CandidatePortraits'
import type { FormValues } from '@/types/forms'
import type { CandidateView } from '@/types/recruitment'
import { assertNotBanned } from '@/core/services/recruitment/BanService'
import { rethrowCandidate, toCandidate, CANDIDATE_INCLUDE } from '@/core/services/recruitment/shape'
import {
  sessionScope,
  reachableSession,
  reachableCandidate,
} from '@/core/services/recruitment/reach'

/**
 * Read one candidate back with the moderator its Discord identifier resolves to
 * @param {string} id - Candidate identifier
 * @return {Promise<CandidateView>} - Candidate card
 */

export const readCandidate = async (id: string): Promise<CandidateView> => {
  const row = await prisma.recruitmentCandidate.findUniqueOrThrow({
    where: { id },
    include: CANDIDATE_INCLUDE,
  })

  const member = await prisma.account.findUnique({
    where: { discordId: row.discordId },
    select: { id: true, discordId: true, displayName: true },
  })

  return toCandidate(
    row,
    new Map(member ? [[member.discordId, member]] : []),
    await readPortraits([row.discordId])
  )
}

/**
 * Read the outcome a new candidate lands in
 * @return {Promise<string | null>} - Outcome identifier
 */

export const defaultOutcome = async (): Promise<string | null> => {
  const outcome =
    (await prisma.recruitmentOutcome.findFirst({ where: { archived: false, isDefault: true } })) ??
    (await prisma.recruitmentOutcome.findFirst({
      where: { archived: false },
      orderBy: { position: 'asc' },
    }))

  return outcome?.id ?? null
}

/**
 * Observers without the recruiters, nobody sits on both sides of an interview
 * @param {string[]} observerIds - Wanted observers
 * @param {string[]} recruiterIds - Recruiters of the candidate
 * @return {string[]} - Observers left
 */

const apartFrom = (observerIds: string[], recruiterIds: string[]): string[] =>
  observerIds.filter((id) => !recruiterIds.includes(id))

/**
 * Add a candidate to a session
 * @param {string} sessionId - Session identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CandidateView>} - Candidate card
 */

export const createCandidate = async (
  sessionId: string,
  values: FormValues,
  scope: AccessScope
): Promise<CandidateView> => {
  await reachableSession(sessionId, scope)
  // A barred identifier never joins a new session
  await assertNotBanned(readText(values, 'discordId') ?? '')

  const recruiterIds = readList(values, 'recruiterIds')
  const observerIds = apartFrom(readList(values, 'observerIds'), recruiterIds)
  const last = await prisma.recruitmentCandidate.findFirst({
    where: { sessionId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  const row = await prisma.recruitmentCandidate
    .create({
      data: {
        sessionId,
        discordId: readText(values, 'discordId') ?? '',
        displayName: readText(values, 'displayName'),
        formId: readText(values, 'formId'),
        outcomeId: readText(values, 'outcomeId') ?? (await defaultOutcome()),
        interviewAt: readDate(values, 'interviewAt'),
        attended: readFlag(values, 'attended'),
        position: (last?.position ?? 0) + FORM_SETTINGS.positionStep,
        recruiters: {
          create: recruiterIds.map((accountId) => ({ accountId })),
        },
        observers: { create: observerIds.map((accountId) => ({ accountId })) },
      },
    })
    .catch(rethrowCandidate)

  await syncAdmission(row.id)

  return readCandidate(row.id)
}

/**
 * Edit a candidate
 * @param {string} id - Candidate identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CandidateView>} - Candidate card
 */

export const updateCandidate = async (
  id: string,
  values: FormValues,
  scope: AccessScope
): Promise<CandidateView> => {
  await reachableCandidate(id, scope)

  // Only a changed identifier is checked
  const discordId = readText(values, 'discordId')
  const current = await prisma.recruitmentCandidate.findUniqueOrThrow({
    where: { id },
    select: { discordId: true },
  })
  if (discordId && discordId !== current.discordId) await assertNotBanned(discordId)

  const recruiterIds = readList(values, 'recruiterIds')
  const observerIds = apartFrom(readList(values, 'observerIds'), recruiterIds)

  await prisma.recruitmentCandidate
    .update({
      where: { id },
      data: {
        discordId: readText(values, 'discordId') ?? undefined,
        displayName: readText(values, 'displayName'),
        formId: readText(values, 'formId'),
        outcomeId: readText(values, 'outcomeId'),
        interviewAt: readDate(values, 'interviewAt'),
        attended: readFlag(values, 'attended'),
        // The seats are replaced wholesale
        recruiters: {
          deleteMany: {},
          create: recruiterIds.map((accountId) => ({ accountId })),
        },
        observers: {
          deleteMany: {},
          create: observerIds.map((accountId) => ({ accountId })),
        },
      },
    })
    .catch(rethrowCandidate)

  await syncAdmission(id)

  return readCandidate(id)
}

/**
 * Write the bilan of a candidate
 * @param {string} id - Candidate identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CandidateView>} - Candidate card
 */

export const saveReview = async (
  id: string,
  values: FormValues,
  scope: AccessScope
): Promise<CandidateView> => {
  await reachableCandidate(id, scope)

  await prisma.recruitmentCandidate.update({
    where: { id },
    data: { review: readText(values, 'review') ?? '' },
  })

  return readCandidate(id)
}

/**
 * Move a candidate into an outcome column
 * @param {string} id - Candidate identifier
 * @param {string} outcomeId - Column dropped into
 * @param {number} index - Drop index
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CandidateView>} - Candidate card
 */

export const moveCandidate = async (
  id: string,
  outcomeId: string,
  index: number,
  scope: AccessScope
): Promise<CandidateView> => {
  const sessionId = await reachableCandidate(id, scope)

  const column = await prisma.recruitmentCandidate.findMany({
    where: { sessionId, outcomeId, id: { not: id } },
    orderBy: { position: 'asc' },
    select: { id: true, position: true },
  })

  await prisma.recruitmentCandidate.update({
    where: { id },
    data: { outcomeId, position: positionAt(column, index) },
  })

  await syncAdmission(id)

  return readCandidate(id)
}

/**
 * Drop a candidate
 * @param {string} id - Candidate identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<void>} - Dropped
 */

export const removeCandidate = async (id: string, scope: AccessScope): Promise<void> => {
  await reachableCandidate(id, scope)
  await prisma.recruitmentCandidate.delete({ where: { id } })
}

/**
 * Read the recruitment file a moderator's Discord identifier resolves to
 * @param {string} discordId - Discord identifier of the moderator
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<{ sessionId: string, candidateId: string } | null>} - Where the file lives
 */

export const findCandidateFile = async (
  discordId: string,
  scope: AccessScope
): Promise<{ sessionId: string; candidateId: string } | null> => {
  const row = await prisma.recruitmentCandidate.findFirst({
    where: { AND: [{ discordId }, { session: sessionScope(scope) }] },
    orderBy: { createdAt: 'desc' },
    select: { id: true, sessionId: true },
  })

  return row ? { sessionId: row.sessionId, candidateId: row.id } : null
}

/**
 * Read who leads the interview of a candidate
 * @param {string} id - Candidate identifier
 * @return {Promise<string[]>} - Recruiter identifiers
 */

export const recruiterIdsOf = async (id: string): Promise<string[]> => {
  const rows = await prisma.candidateRecruiter.findMany({
    where: { candidateId: id },
    select: { accountId: true },
  })

  return rows.map((row) => row.accountId)
}

/**
 * Read who observes the interview of a candidate
 * @param {string} id - Candidate identifier
 * @return {Promise<string[]>} - Observer identifiers
 */

export const observerIdsOf = async (id: string): Promise<string[]> => {
  const rows = await prisma.recruitmentSeat.findMany({
    where: { candidateId: id },
    select: { accountId: true },
  })

  return rows.map((row) => row.accountId)
}
