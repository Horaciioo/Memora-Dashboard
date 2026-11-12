import 'server-only'

import { prisma } from '@/core/lib/db'
import { messageOf, rootCauseOf, traceOf } from '@/core/lib/errors/text'
import { readRequestId } from '@/core/lib/http/requestOrigin'
import { fingerprintOf } from '@/core/lib/nexus/observe/fingerprint'
import { redactRecord } from '@/core/lib/nexus/redact'
import { NEXUS_OBSERVABILITY } from '@/declarations/nexus/observability'
import { APP_ENVIRONMENT } from '@/declarations/system/environments'
import { DAY_MS, MINUTE_MS, SECOND_MS } from '@/utils/constants/time'
import type { ErrorSeverity, ErrorSource, Prisma } from '@prisma/client'

/**
 * One error to keep
 * @typedef {Object} ErrorInput
 * @property {ErrorSeverity} severity - Gravity
 * @property {ErrorSource} source - Where it came from
 * @property {unknown} [error] - Thrown value
 * @property {string} [stack] - Frames when the error came from elsewhere
 * @property {string} [message] - Text when nothing was thrown
 * @property {string | null} [route] - Method and path
 * @property {string | null} [accountId] - Member who lived it
 * @property {string | null} [sessionId] - Sign-in session row, never the token
 * @property {string | null} [requestId] - Request identifier
 * @property {Record<string, unknown>} [context] - Extra facts, masked
 */

export interface ErrorInput {
  severity: ErrorSeverity
  source: ErrorSource
  error?: unknown
  stack?: string
  message?: string
  route?: string | null
  accountId?: string | null
  sessionId?: string | null
  requestId?: string | null
  context?: Record<string, unknown>
}

// Service name written on every line
const SERVICE = 'memora-web'

// Last write of each fingerprint and the hits that waited
const lastWrite = new Map<string, number>()
const waiting = new Map<string, number>()

// Lines written this minute
let minuteStart = 0
let minuteCount = 0

// A write must never report its own failure
let isWriting = false

// Under the cap for this minute
const hasRoom = (now: number): boolean => {
  if (now - minuteStart >= MINUTE_MS) {
    minuteStart = now
    minuteCount = 0
  }
  minuteCount += 1

  return minuteCount <= NEXUS_OBSERVABILITY.perMinuteCap
}

// Masked and bounded context
const safeContext = (
  context: Record<string, unknown> | undefined
): Prisma.InputJsonValue | undefined => {
  if (!context) return undefined
  const text = JSON.stringify(redactRecord(context))
  if (text.length > NEXUS_OBSERVABILITY.contextMaxBytes) return { truncated: true }

  return JSON.parse(text) as Prisma.InputJsonValue
}

/**
 * Keep an error, same ones fold into one counted line
 * @param {ErrorInput} input - Error to keep
 * @return {Promise<void>} - Never rejects
 */

export const recordError = async (input: ErrorInput): Promise<void> => {
  if (isWriting) return

  try {
    const now = Date.now()
    const message = input.message ?? messageOf(input.error)
    const stack = input.stack ?? traceOf(input.error)
    const fingerprint = fingerprintOf({ source: input.source, route: input.route, message, stack })

    // Bursts of one error wait, floods stop
    const last = lastWrite.get(fingerprint)
    if (last !== undefined && now - last < NEXUS_OBSERVABILITY.minIntervalSeconds * SECOND_MS) {
      waiting.set(fingerprint, (waiting.get(fingerprint) ?? 0) + 1)
      return
    }
    if (!hasRoom(now)) return

    lastWrite.set(fingerprint, now)
    const extra = waiting.get(fingerprint) ?? 0
    waiting.delete(fingerprint)

    const requestId = input.requestId ?? readRequestId()
    const fields = {
      severity: input.severity,
      route: input.route ?? null,
      accountId: input.accountId ?? null,
      sessionId: input.sessionId ?? null,
      requestId,
      traceId: requestId,
      message,
      stack: stack ?? null,
      rootCause: rootCauseOf(input.error) ?? null,
      context: safeContext(input.context),
      lastAt: new Date(now),
    }

    isWriting = true
    await prisma.errorEvent.upsert({
      where: { fingerprint },
      create: {
        ...fields,
        fingerprint,
        occurrences: 1 + extra,
        source: input.source,
        service: SERVICE,
        environment: APP_ENVIRONMENT,
      },
      // A returning error reopens
      update: { ...fields, occurrences: { increment: 1 + extra }, resolvedAt: null },
    })
  } catch {
    // Reporting is best effort
  } finally {
    isWriting = false
  }
}

/**
 * Drop old lines and keep the table bounded
 * @return {Promise<void>} - Purged
 */

export const purgeErrorEvents = async (): Promise<void> => {
  await prisma.errorEvent.deleteMany({
    where: {
      lastAt: { lt: new Date(Date.now() - NEXUS_OBSERVABILITY.errorRetentionDays * DAY_MS) },
    },
  })

  // Oldest leave first past the ceiling
  const extra = (await prisma.errorEvent.count()) - NEXUS_OBSERVABILITY.maxErrorRows
  if (extra <= 0) return

  const oldest = await prisma.errorEvent.findMany({
    orderBy: { lastAt: 'asc' },
    take: extra,
    select: { id: true },
  })
  await prisma.errorEvent.deleteMany({ where: { id: { in: oldest.map((row) => row.id) } } })
}
