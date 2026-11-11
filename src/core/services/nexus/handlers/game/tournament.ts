import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { takeOf } from '@/core/services/nexus/bounds'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { tournamentStandings } from '@/core/services/play/TournamentService'
import { GAME_COPY } from '@/declarations/nexus/modulesCopy'

const tournaments: NexusHandler = async (context) => {
  if (!context.args.id) {
    return {
      output: await prisma.playTournament.findMany({
        orderBy: { createdAt: 'desc' },
        take: takeOf(context.args.take),
      }),
    }
  }

  const id = String(context.args.id)
  const row = await prisma.playTournament.findUnique({
    where: { id },
    include: { sessions: { select: { id: true, status: true, tournamentIndex: true } } },
  })
  if (!row) throw notFound(GAME_COPY.tournamentMissing)

  return { output: { ...row, standings: await tournamentStandings(id) } }
}

const groups: NexusHandler = async (context) => {
  if (!context.args.id) {
    return {
      output: await prisma.playGroup.findMany({
        orderBy: { createdAt: 'desc' },
        take: takeOf(context.args.take),
        select: { id: true, name: true, hostId: true, createdAt: true },
      }),
    }
  }

  const row = await prisma.playGroup.findUnique({
    where: { id: String(context.args.id) },
    select: { id: true, name: true, hostId: true, members: { select: { accountId: true } } },
  })
  if (!row) throw notFound(GAME_COPY.groupMissing)

  return { output: row }
}

/**
 * Tournaments and groups, read only
 * @type {Record<string, NexusHandler>}
 */

export const GAME_GROUP_HANDLERS: Record<string, NexusHandler> = {
  'game.tournament': tournaments,
  'game.group': groups,
}
