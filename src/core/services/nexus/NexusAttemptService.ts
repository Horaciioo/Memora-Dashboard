import 'server-only'

import { prisma } from '@/core/lib/db'
import { rateLimited } from '@/core/lib/errors'
import { judgeAttempt } from '@/core/lib/nexus/attempts'
import { NEXUS_ATTEMPTS } from '@/declarations/nexus/settings'
import { NEXUS_COPY } from '@/declarations/nexus/copy'
import type { NexusAttemptKind } from '@prisma/client'
import { DAY_MS, HOUR_MS, MINUTE_MS } from '@/utils/constants/time'

/**
 * Who is trying
 * @typedef {Object} AttemptActor
 * @property {string} accountId - Member
 * @property {string} address - Client address
 */

export interface AttemptActor {
  accountId: string
  address: string
}

// One lockout row per member and address
const lockKey = ({ accountId, address }: AttemptActor): string => `${accountId}:${address}`

/**
 * Refuse a locked or too eager attempt
 * @param {AttemptActor} actor - Who is trying
 * @return {Promise<void>} - Throws when refused
 */

export const assertAttemptOpen = async (actor: AttemptActor): Promise<void> => {
  const now = new Date()

  // Standing lockout
  const lockout = await prisma.nexusLockout.findUnique({ where: { key: lockKey(actor) } })
  if (lockout && lockout.until > now) {
    throw rateLimited(
      Math.ceil((lockout.until.getTime() - now.getTime()) / 1000),
      NEXUS_COPY.locking
    )
  }

  // Backoff after recent failures
  const since = new Date(now.getTime() - NEXUS_ATTEMPTS.windowMinutes * MINUTE_MS)
  const failures = await prisma.nexusAttempt.findMany({
    where: { ...actor, succeeded: false, createdAt: { gt: since } },
    select: { createdAt: true },
    take: NEXUS_ATTEMPTS.maxFailures + 1,
  })

  const verdict = judgeAttempt(
    failures.map((failure) => failure.createdAt),
    now,
    NEXUS_ATTEMPTS
  )
  if (!verdict.allowed) throw rateLimited(verdict.retryAfterSeconds, NEXUS_COPY.locking)
}

/**
 * Open a lockout for this member and address
 * @param {AttemptActor} actor - Who failed
 * @param {number} duration - Milliseconds
 * @return {Promise<void>}
 */

const openLockout = async (actor: AttemptActor, duration: number): Promise<void> => {
  const until = new Date(Date.now() + duration)

  await prisma.nexusLockout.upsert({
    where: { key: lockKey(actor) },
    create: { key: lockKey(actor), until },
    update: { until, strikes: { increment: 1 } },
  })
}

/**
 * Record an attempt and lock when the failures pile up
 * @param {AttemptActor} actor - Who tried
 * @param {NexusAttemptKind} kind - Factor tried
 * @param {boolean} succeeded - Attempt outcome
 * @return {Promise<void>}
 */

export const recordAttempt = async (
  actor: AttemptActor,
  kind: NexusAttemptKind,
  succeeded: boolean
): Promise<void> => {
  await prisma.nexusAttempt.create({ data: { ...actor, kind, succeeded } })

  // A success clears the pause
  if (succeeded) {
    await prisma.nexusLockout.deleteMany({ where: { key: lockKey(actor) } })
    return
  }

  const now = Date.now()
  const windowStart = new Date(now - NEXUS_ATTEMPTS.windowMinutes * MINUTE_MS)
  const dayStart = new Date(now - DAY_MS)

  // Failures per window and per day
  const [recent, today] = await Promise.all([
    prisma.nexusAttempt.count({
      where: { ...actor, succeeded: false, createdAt: { gt: windowStart } },
    }),
    prisma.nexusAttempt.count({
      where: { accountId: actor.accountId, succeeded: false, createdAt: { gt: dayStart } },
    }),
  ])

  if (today >= NEXUS_ATTEMPTS.dayFailures) {
    await openLockout(actor, NEXUS_ATTEMPTS.dayLockoutHours * HOUR_MS)
  } else if (recent >= NEXUS_ATTEMPTS.maxFailures) {
    await openLockout(actor, NEXUS_ATTEMPTS.lockoutMinutes * MINUTE_MS)
  }
}
