import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { signalPlay } from '@/core/lib/play/signal'
import { undo } from '@/core/services/nexus/handlers/db/rollback'
import { assertCapable, gameOf } from '@/core/services/nexus/handlers/game/shared'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { kickPlayer } from '@/core/services/play/LobbyService'
import { GAME_COPY } from '@/declarations/nexus/modulesCopy'

// Seat of a player at a game
const seatOf = async (sessionId: string, accountId: string) => {
  const seat = await prisma.playSeat.findUnique({
    where: { sessionId_accountId: { sessionId, accountId } },
  })
  if (!seat) throw conflict(GAME_COPY.notInGame)

  return seat
}

const kick: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  assertCapable(game, 'kick')
  const player = String(context.args.player)
  const seat = await seatOf(game.id, player)
  const output = { game: game.id, player, seat: seat.id }
  if (context.dryRun) return { output, level: 'warning' }

  // The host's own identifier opens the gate
  await kickPlayer(game.id, game.hostId, player)

  return { output, target: `playSeat:${seat.id}`, level: 'warning' }
}

const score: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  assertCapable(game, 'setScore')
  const seat = await seatOf(game.id, String(context.args.player))
  const before = { score: seat.score }
  const after = { score: Number(context.args.score) }
  const target = `playSeat:${seat.id}`
  if (context.dryRun) return { output: { before, after }, target }

  await (context.tx ?? prisma).playSeat.update({ where: { id: seat.id }, data: after })
  await signalPlay(game.id, true)

  return { output: { before, after }, target, before, after, reversible: true }
}

// Lines of a game that can still be undone
const reversibleLines = (gameId: string, accountId: string) =>
  prisma.nexusAudit.findMany({
    where: {
      accountId,
      status: 'OK',
      reversible: true,
      revertedById: null,
      commandId: { startsWith: 'game.override.' },
      input: { contains: gameId },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, commandId: true, input: true, createdAt: true },
  })

const list: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  const lines = await prisma.nexusAudit.findMany({
    where: {
      status: 'OK',
      commandId: { startsWith: 'game.override.' },
      input: { contains: game.id },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      commandId: true,
      input: true,
      createdAt: true,
      revertedById: true,
      reversible: true,
    },
  })

  return { output: lines }
}

const clear: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  const only = context.args.id ? String(context.args.id) : null
  const lines = (await reversibleLines(game.id, context.accountId)).filter(
    (line) => !only || line.id === only
  )
  if (lines.length === 0) throw conflict(GAME_COPY.nothingToClear)
  if (context.dryRun)
    return { output: lines.map((line) => ({ audit: line.id, command: line.commandId })) }

  // Newest first, each one undone in the same transaction
  for (const line of lines) await undo(context, true, line.id)
  await signalPlay(game.id, true)

  return {
    output: lines.map((line) => ({ audit: line.id, command: line.commandId, undone: true })),
  }
}

/**
 * Interventions in a running game
 * @type {Record<string, NexusHandler>}
 */

export const GAME_OVERRIDE_HANDLERS: Record<string, NexusHandler> = {
  'game.overrideKick': kick,
  'game.overrideScore': score,
  'game.overrideList': list,
  'game.overrideClear': clear,
}
