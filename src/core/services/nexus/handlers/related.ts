import 'server-only'

import { prisma } from '@/core/lib/db'
import { NEXUS_COMMANDS } from '@/declarations/nexus/settings'
import { MINUTE_MS } from '@/utils/constants/time'
import type { ErrorEvent } from '@prisma/client'

// Moves of a game shown beside its error
const PLAY_MOVES = 20

/**
 * Everything that happened around an error
 * @param {ErrorEvent} row - Error
 * @return {Promise<Record<string, unknown>>} - Related lines
 */

export const relatedEvents = async (row: ErrorEvent): Promise<Record<string, unknown>> => {
  const take = NEXUS_COMMANDS.pageSize
  const window = {
    gte: new Date(row.lastAt.getTime() - 2 * MINUTE_MS),
    lte: new Date(row.lastAt.getTime() + 2 * MINUTE_MS),
  }

  // Same request first, same member in the window as a fallback
  const byRequest = row.requestId
    ? await prisma.activityLog.findMany({ where: { requestId: row.requestId }, take })
    : []
  const journal =
    byRequest.length > 0 || !row.accountId
      ? byRequest
      : await prisma.activityLog.findMany({
          where: { actorId: row.accountId, createdAt: window },
          orderBy: { createdAt: 'asc' },
          take,
        })

  const [audits, slow] = await Promise.all([
    row.requestId
      ? prisma.nexusAudit.findMany({ where: { requestId: row.requestId }, take })
      : Promise.resolve([]),
    row.requestId
      ? prisma.errorEvent.findMany({
          where: { requestId: row.requestId, source: 'PRISMA', id: { not: row.id } },
          take,
        })
      : Promise.resolve([]),
  ])

  // A game error brings its last moves
  const sessionId = (row.context as { sessionId?: string } | null)?.sessionId
  const moves = sessionId ? await recentMoves(sessionId) : []

  return {
    journal: journal.map((line) => ({ at: line.createdAt, label: line.summary })),
    audit: audits.map((line) => ({
      at: line.createdAt,
      label: `${line.commandId} ${line.status}`,
    })),
    slow_queries: slow.map((line) => ({ at: line.lastAt, label: line.message })),
    play_moves: moves,
  }
}

// Latest moves of a game
const recentMoves = async (sessionId: string): Promise<unknown[]> => {
  const rows = await prisma.activityLog.findMany({
    where: { targetType: 'PlaySession', targetId: sessionId },
    orderBy: { createdAt: 'desc' },
    take: PLAY_MOVES,
  })

  return rows.map((line) => ({ at: line.createdAt, label: line.summary }))
}
