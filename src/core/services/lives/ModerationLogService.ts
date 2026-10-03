import 'server-only'

import type { ModerationKind } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import type { PlatformLogEntry } from '@/core/lib/platforms/twitch/logEntry'
import { RETENTION_SETTINGS } from '@/declarations/configurations/settings'
import type { ModViewIntent } from '@/types/modview'
import type { LivePlatformName } from '@/utils/constants/lives'

// Seconds a Memora gesture waits for its echo from the platform
const ECHO_WINDOW_SECONDS = 90

// Longest message excerpt kept
const EXCERPT_LENGTH = 160

/**
 * Kind of a gesture, as the log names it
 * @param {ModViewIntent} intent - Gesture
 * @return {ModerationKind} - Kind
 */

export const kindOfIntent = (intent: ModViewIntent): ModerationKind => {
  switch (intent.kind) {
    case 'delete':
      return 'DELETE'
    case 'warn':
      return 'WARN'
    case 'timeout':
      return 'TIMEOUT'
    case 'ban':
      return 'BAN'
    case 'unban':
      return 'UNBAN'
    case 'automod':
      return intent.approve ? 'AUTOMOD_APPROVE' : 'AUTOMOD_DENY'
    case 'unbanRequest':
      return intent.approve ? 'UNBAN_REQUEST_APPROVE' : 'UNBAN_REQUEST_DENY'
    case 'mode':
      return 'MODE_CHANGE'
    case 'term':
      return intent.remove ? 'TERM_REMOVE' : 'TERM_ADD'
    case 'say':
      return 'MESSAGE_SEND'
  }
}

/**
 * Who a gesture aims at, when it aims at someone
 * @param {ModViewIntent} intent - Gesture
 * @return {string | null} - Platform user identifier
 */

const targetOf = (intent: ModViewIntent): string | null =>
  'chatterId' in intent ? intent.chatterId : null

/**
 * Write a gesture sent from Memora, pending until the platform answers
 * @param {Object} input - Gesture
 * @param {string} input.liveId - Live
 * @param {LivePlatformName} input.platform - Platform
 * @param {string} input.actorAccountId - Member who clicked
 * @param {string} input.actorPlatformUserId - Their platform account
 * @param {string} input.actorLogin - Their login
 * @param {ModViewIntent} input.intent - Gesture
 * @param {string} input.idempotencyKey - Gesture key
 * @param {number | null} input.liveconLevel - Level in force
 * @return {Promise<string | null>} - Line identifier, none when the log is unavailable
 */

export const logMemoraGesture = async (input: {
  liveId: string
  platform: LivePlatformName
  actorAccountId: string
  actorPlatformUserId: string
  actorLogin: string
  intent: ModViewIntent
  idempotencyKey: string
  liveconLevel: number | null
}): Promise<string | null> => {
  const { intent } = input

  try {
    const row = await prisma.moderationAction.create({
      data: {
        liveId: input.liveId,
        platform: input.platform,
        actorAccountId: input.actorAccountId,
        actorPlatformUserId: input.actorPlatformUserId,
        actorLogin: input.actorLogin,
        targetPlatformUserId: targetOf(intent),
        kind: kindOfIntent(intent),
        durationSeconds: intent.kind === 'timeout' ? intent.seconds : null,
        reason: 'reason' in intent ? intent.reason : null,
        liveconLevel: input.liveconLevel,
        messageExcerpt:
          intent.kind === 'say'
            ? intent.text.slice(0, EXCERPT_LENGTH)
            : intent.kind === 'term'
              ? intent.term
              : null,
        origin: 'MEMORA',
        idempotencyKey: input.idempotencyKey,
      },
      select: { id: true },
    })

    return row.id
  } catch (error) {
    // The log never stops a gesture
    logger.warn('[moderation] gesture not logged', error instanceof Error ? error.message : '')
    return null
  }
}

/**
 * Record how the platform answered a gesture
 * @param {string | null} id - Line identifier
 * @param {boolean} succeeded - Platform accepted it
 * @param {string} [errorCode] - Platform status on failure
 * @return {Promise<void>} - Settled
 */

export const settleGesture = async (
  id: string | null,
  succeeded: boolean,
  errorCode?: string
): Promise<void> => {
  if (!id) return

  await prisma.moderationAction
    .update({
      where: { id },
      data: { status: succeeded ? 'SUCCEEDED' : 'FAILED', errorCode: errorCode ?? null },
    })
    .catch(() => null)
}

/**
 * Record a gesture the platform reported: the echo of a Memora gesture joins its line, any
 * other one becomes a platform line, tied to the member whose account made it
 * @param {Object} input - Report
 * @param {string} input.liveId - Live
 * @param {LivePlatformName} input.platform - Platform
 * @param {PlatformLogEntry} input.entry - What happened
 * @param {number | null} input.liveconLevel - Level in force
 * @return {Promise<void>} - Recorded
 */

export const logPlatformGesture = async (input: {
  liveId: string
  platform: LivePlatformName
  entry: PlatformLogEntry
  liveconLevel: number | null
}): Promise<void> => {
  const { entry } = input

  try {
    // Already recorded, a redelivery
    const known = await prisma.moderationAction.findUnique({
      where: {
        platform_externalEventId: {
          platform: input.platform,
          externalEventId: entry.externalEventId,
        },
      },
      select: { id: true },
    })
    if (known) return

    // The echo of a gesture sent from Memora a moment ago
    const echo = await prisma.moderationAction.findFirst({
      where: {
        liveId: input.liveId,
        origin: 'MEMORA',
        kind: entry.kind,
        externalEventId: null,
        actorPlatformUserId: entry.actorPlatformUserId,
        targetPlatformUserId: entry.targetPlatformUserId,
        occurredAt: { gte: new Date(Date.parse(entry.occurredAt) - ECHO_WINDOW_SECONDS * 1000) },
      },
      orderBy: { occurredAt: 'desc' },
      select: { id: true },
    })
    if (echo) {
      await prisma.moderationAction.update({
        where: { id: echo.id },
        data: {
          externalEventId: entry.externalEventId,
          status: 'SUCCEEDED',
          targetLogin: entry.targetLogin,
          messageExcerpt: entry.messageExcerpt?.slice(0, EXCERPT_LENGTH) ?? undefined,
        },
      })
      return
    }

    // A linked account names the member behind a platform gesture
    const linked = entry.actorPlatformUserId
      ? await prisma.platformAccount.findUnique({
          where: {
            platform_externalUserId: {
              platform: input.platform,
              externalUserId: entry.actorPlatformUserId,
            },
          },
          select: { accountId: true },
        })
      : null

    await prisma.moderationAction.create({
      data: {
        liveId: input.liveId,
        platform: input.platform,
        actorAccountId: linked?.accountId ?? null,
        actorPlatformUserId: entry.actorPlatformUserId,
        actorLogin: entry.actorLogin,
        targetPlatformUserId: entry.targetPlatformUserId,
        targetLogin: entry.targetLogin,
        kind: entry.kind,
        durationSeconds: entry.durationSeconds,
        reason: entry.reason,
        liveconLevel: input.liveconLevel,
        messageExcerpt: entry.messageExcerpt?.slice(0, EXCERPT_LENGTH) ?? null,
        origin: 'PLATFORM',
        status: 'SUCCEEDED',
        externalEventId: entry.externalEventId,
        occurredAt: new Date(entry.occurredAt),
      },
    })
  } catch (error) {
    logger.warn(
      '[moderation] platform gesture not logged',
      error instanceof Error ? error.message : ''
    )
  }
}

/**
 * Drop log lines and presences past their keeping time: viewer names and excerpts are personal data
 * @return {Promise<number>} - Rows dropped
 */

export const purgeModerationLog = async (): Promise<number> => {
  const before = new Date(Date.now() - RETENTION_SETTINGS.moderationLogDays * 24 * 60 * 60 * 1000)
  const [actions, presences] = await Promise.all([
    prisma.moderationAction.deleteMany({ where: { occurredAt: { lt: before } } }),
    prisma.modViewPresence.deleteMany({ where: { openedAt: { lt: before } } }),
  ])

  return actions.count + presences.count
}

/**
 * Livecon level in force for a creator right now, the shared one otherwise
 * @param {string} youtuberId - Creator
 * @return {Promise<number | null>} - Level number
 */

export const liveconLevelOf = async (youtuberId: string): Promise<number | null> => {
  const entries = await prisma.liveconEntry.findMany({
    where: { endedAt: null, OR: [{ youtuberId }, { youtuberId: null }] },
    orderBy: { startedAt: 'desc' },
    select: { youtuberId: true, level: { select: { level: true } } },
    take: 4,
  })
  const own = entries.find((entry) => entry.youtuberId === youtuberId) ?? entries[0]

  return own?.level.level ?? null
}
