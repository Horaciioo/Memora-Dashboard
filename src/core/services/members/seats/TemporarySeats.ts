import 'server-only'

import { prisma } from '@/core/lib/db'
import { readText } from '@/core/lib/forms/values'
import { TEMPORARY_KINDS, TEMPORARY_SEATS } from '@/declarations/members/seats'
import type { TemporaryKind } from '@/declarations/members/seats'
import type { FormValues } from '@/types/forms'

// Seat rows a member holds in a session, whatever the kind
const LIVE_SEAT = { revokedAt: null, forgottenAt: null }

/**
 * Session each temporary function of a member currently points at
 * @param {string} accountId - Member
 * @return {Promise<Record<string, string | null>>} - Session identifier by form field
 */

export const readTemporaryValues = async (
  accountId: string
): Promise<Record<string, string | null>> => {
  const query = {
    where: { accountId, ...LIVE_SEAT },
    orderBy: { createdAt: 'desc' },
    take: 1,
  } as const
  const select = { select: { sessionId: true } }

  const [recruiter, observer, trainer] = await Promise.all([
    prisma.recruitmentRecruiter.findFirst({ ...query, ...select }),
    prisma.recruitmentObserver.findFirst({ ...query, ...select }),
    prisma.academySessionTrainer.findFirst({ ...query, ...select }),
  ])

  const rows: Record<TemporaryKind, { sessionId: string } | null> = { recruiter, observer, trainer }

  return Object.fromEntries(
    TEMPORARY_KINDS.map((kind) => [TEMPORARY_SEATS[kind].field, rows[kind]?.sessionId ?? null])
  )
}

/**
 * Seat a member in the sessions picked for the temporary functions they hold
 * @param {string} accountId - Member
 * @param {Set<string>} heldNames - Names of the functions held
 * @param {FormValues} values - Parsed body
 * @return {Promise<void>} - Seats written, a seat already there is left as it is
 */

export const syncTemporarySeats = async (
  accountId: string,
  heldNames: Set<string>,
  values: FormValues
): Promise<void> => {
  const picked = (kind: TemporaryKind): string | null =>
    heldNames.has(TEMPORARY_SEATS[kind].functionName)
      ? readText(values, TEMPORARY_SEATS[kind].field)
      : null

  const [recruiterId, observerId, trainerId] = TEMPORARY_KINDS.map(picked)
  const seat = (sessionId: string) => ({
    where: { sessionId_accountId: { sessionId, accountId } },
    create: { sessionId, accountId },
    update: {},
  })

  await prisma.$transaction([
    ...(recruiterId ? [prisma.recruitmentRecruiter.upsert(seat(recruiterId))] : []),
    ...(observerId ? [prisma.recruitmentObserver.upsert(seat(observerId))] : []),
    ...(trainerId ? [prisma.academySessionTrainer.upsert(seat(trainerId))] : []),
  ])
}
