import 'server-only'

import type { NextRequest } from 'next/server'

import { toAppError } from '@/core/lib/errors'
import { recordEvent } from '@/core/services/system/ActivityService'
import type { ActivityError } from '@/core/services/system/ActivityService'
import { ACTIVITY_COPY } from '@/declarations/activity/copy'
import { FAILURE_SETTINGS } from '@/declarations/configurations/settings'
import { ErrorCodes } from '@/utils/constants/errors'
import { Prisma } from '@prisma/client'

// Moments each failure was last kept
const lastKept = new Map<string, number>()

// Stack lines only, the first line repeats the message
const STACK_LINE = /^\s+at /

/**
 * Check a failure was kept lately
 * @param {string} key - Route and message
 * @return {boolean} - Already in the journal
 */

const isRecent = (key: string): boolean => {
  const now = Date.now()
  const last = lastKept.get(key)
  if (last !== undefined && now - last < FAILURE_SETTINGS.repeatWindowSeconds * 1000) return true

  // Keep the table small
  if (lastKept.size >= FAILURE_SETTINGS.repeatKeysMax) {
    lastKept.delete(lastKept.keys().next().value as string)
  }
  lastKept.set(key, now)

  return false
}

/**
 * Message safe for the journal
 * @param {unknown} error - Thrown value
 * @return {string} - First line, no query values
 */

const messageOf = (error: unknown): string => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ACTIVITY_COPY.errorDatabase.replace('{code}', error.code)
  }
  if (!(error instanceof Error)) return ACTIVITY_COPY.errorFallback

  // Query values sit below the first line
  return (error.message.split('\n')[0] ?? ACTIVITY_COPY.errorFallback).slice(
    0,
    FAILURE_SETTINGS.messageMaxLength
  )
}

/**
 * Stack without the message or machine paths
 * @param {unknown} error - Thrown value
 * @return {string | undefined} - Frames kept
 */

const traceOf = (error: unknown): string | undefined => {
  if (!(error instanceof Error) || !error.stack) return undefined

  return error.stack
    .split('\n')
    .filter((line) => STACK_LINE.test(line))
    .join('\n')
    .replaceAll(process.cwd(), '')
    .slice(0, FAILURE_SETTINGS.traceMaxLength)
}

/**
 * Keep an unexpected failure in the journal
 * @param {NextRequest} request - Failed request
 * @param {string | null} actorId - Signed-in member
 * @param {unknown} error - Thrown value
 * @return {Promise<void>} - Recorded
 */

export const reportFailure = async (
  request: NextRequest,
  actorId: string | null,
  error: unknown
): Promise<void> => {
  if (!actorId || toAppError(error).code !== ErrorCodes.SystemFailure) return

  const route = `${request.method} ${request.nextUrl.pathname}`
  const message = messageOf(error)
  if (isRecent(`${route} ${message}`)) return

  const failure: ActivityError = { message, route, trace: traceOf(error) }

  // A journal failure never masks the real one
  await recordEvent({
    eventType: 'ErrorRaised',
    origin: 'System',
    actorId,
    summary: route,
    error: failure,
  }).catch(() => undefined)
}
