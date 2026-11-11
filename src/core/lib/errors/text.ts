import 'server-only'

import { ACTIVITY_COPY } from '@/declarations/activity/copy'
import { FAILURE_SETTINGS } from '@/declarations/configurations/settings'
import { Prisma } from '@prisma/client'

// Stack lines only, the first line repeats the message
const STACK_LINE = /^\s+at /

/**
 * Message safe for a journal
 * @param {unknown} error - Thrown value
 * @return {string} - First line, no query values
 */

export const messageOf = (error: unknown): string => {
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

export const traceOf = (error: unknown): string | undefined => {
  if (!(error instanceof Error) || !error.stack) return undefined

  return error.stack
    .split('\n')
    .filter((line) => STACK_LINE.test(line))
    .join('\n')
    .replaceAll(process.cwd(), '')
    .slice(0, FAILURE_SETTINGS.traceMaxLength)
}

/**
 * Cause chain down to the database code
 * @param {unknown} error - Thrown value
 * @return {string | undefined} - Causes joined, undefined without any
 */

export const rootCauseOf = (error: unknown): string | undefined => {
  const links: string[] = []
  let current: unknown = error instanceof Error ? error.cause : undefined

  // Chains are short, a loop stops at six
  for (let depth = 0; current && depth < 6; depth += 1) {
    links.push(messageOf(current))
    current = current instanceof Error ? current.cause : undefined
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) links.push(error.code)

  return links.length > 0
    ? links.join(' <- ').slice(0, FAILURE_SETTINGS.messageMaxLength * 2)
    : undefined
}
