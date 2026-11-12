import 'server-only'

import { conflict } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import {
  revokeAllNexusSessions,
  revokeNexusSession,
} from '@/core/services/nexus/NexusSessionService'
import type {
  HandlerContext,
  HandlerResult,
  NexusHandler,
} from '@/core/services/nexus/handlers/types'
import { NEXUS_COPY } from '@/declarations/nexus/copy'
import { NEXUS_MODES } from '@/declarations/nexus/settings'
import { MINUTE_MS } from '@/utils/constants/time'

// Current console session, always present after unlock
const current = (context: HandlerContext) => {
  if (!context.nexus) throw conflict(NEXUS_COPY.locked)

  return context.nexus
}

// Date as sent to the screen
const iso = (date: Date | null): string | null =>
  date && date > new Date() ? date.toISOString() : null

const ownerId: NexusHandler = async () => ({
  output: NEXUS_COPY.passwordPrompt,
  data: { next: 'password' },
})

const status: NexusHandler = async (context) => {
  const session = current(context)

  return {
    output: {
      stage: session.stage,
      expiresAt: session.expiresAt.toISOString(),
      reauthAt: session.reauthAt.toISOString(),
      write: iso(session.writeUntil),
      danger: iso(session.dangerUntil),
    },
  }
}

const lock: NexusHandler = async (context) => {
  await revokeNexusSession(current(context).id, 'locked')

  return { output: NEXUS_COPY.closed, data: { locked: true } }
}

const sessions: NexusHandler = async (context) => {
  const rows = await prisma.nexusSession.findMany({
    where: {
      accountId: context.accountId,
      stage: 'UNLOCKED',
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, createdAt: true, lastUsedAt: true, address: true, userAgent: true },
  })

  return {
    output: rows.map((row) => ({ ...row, current: row.id === context.nexus?.id })),
  }
}

const revoke: NexusHandler = async (context) => {
  await revokeNexusSession(String(context.args.id), 'revoked')

  return { output: NEXUS_COPY.closed, target: `nexusSession:${context.args.id}` }
}

const revokeAll: NexusHandler = async (context) => {
  const count = await revokeAllNexusSessions(context.accountId, 'revoked-all')

  return { output: `${count}`, data: { count } }
}

// Arm one mode for a bounded time
const arm = async (
  context: HandlerContext,
  mode: 'writeUntil' | 'dangerUntil',
  minutes: number | null
): Promise<HandlerResult> => {
  const until = minutes === null ? null : new Date(Date.now() + minutes * MINUTE_MS)

  await prisma.nexusSession.update({ where: { id: current(context).id }, data: { [mode]: until } })

  return { output: iso(until) ?? NEXUS_COPY.closed, data: { [mode]: until?.toISOString() ?? null } }
}

const writeEnable: NexusHandler = (context) =>
  arm(
    context,
    'writeUntil',
    Math.min(Number(context.args.minutes ?? NEXUS_MODES.writeMinutes), NEXUS_MODES.writeMaxMinutes)
  )

const writeDisable: NexusHandler = (context) => arm(context, 'writeUntil', null)

const dangerEnable: NexusHandler = (context) =>
  arm(context, 'dangerUntil', NEXUS_MODES.dangerMinutes)

const dangerDisable: NexusHandler = (context) => arm(context, 'dangerUntil', null)

/**
 * Handlers of the access family
 * @type {Record<string, NexusHandler>}
 */

export const ACCESS_HANDLERS: Record<string, NexusHandler> = {
  'access.ownerId': ownerId,
  'access.status': status,
  'access.lock': lock,
  'access.sessions': sessions,
  'access.revoke': revoke,
  'access.revokeAll': revokeAll,
  'access.writeEnable': writeEnable,
  'access.writeDisable': writeDisable,
  'access.dangerEnable': dangerEnable,
  'access.dangerDisable': dangerDisable,
}
