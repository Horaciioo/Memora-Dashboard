import 'server-only'

import type { LudoMove } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { isBoardOver, legalMoves, ludoSettingsOf, progressOf } from '@/core/lib/play/ludo'
import { YARD_STEP } from '@/core/lib/play/ludo/track'
import { ludoPlaceLabel } from '@/declarations/play/ludo/copy'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import type { EngineSession } from '@/types/play'

// Lines shown in the feed
const FEED_KINDS = ['CAPTURE', 'HOME', 'SKIP', 'PENALTY', 'FINISH'] as const

/**
 * Feed line of a board line
 * @param {LudoMove} move - Line
 * @return {object} - Feed line
 */

const feedLineOf = (move: LudoMove) => ({
  id: move.id,
  // A move out of the yard is an exit
  kind: move.kind === 'MOVE' ? 'EXIT' : move.kind,
  accountId: move.accountId,
  at: move.createdAt,
  values: {
    victimId: move.victimId ?? '',
    place: move.to ? ludoPlaceLabel(move.to) : '',
    // Told once the screen reaches this line
    rev: move.rev,
  },
})

/**
 * Boards of a Ludo game read once
 * @param {EngineSession} session - Game
 * @return {Promise<(viewerId: string) => object>} - Board of each reader
 */

export const ludoBoards = async (session: EngineSession) => {
  const where = { sessionId: session.id }
  const newest = { orderBy: { rev: 'desc' as const }, take: LUDO_SETTINGS.feedSize }
  const [table, seats, lines, feed] = await Promise.all([
    prisma.ludoGame.findUnique({ where }),
    prisma.ludoPlayer.findMany({ where, orderBy: { corner: 'asc' } }),
    prisma.ludoMove.findMany({ where, ...newest }),
    prisma.ludoMove.findMany({
      where: {
        ...where,
        OR: [{ kind: { in: [...FEED_KINDS] } }, { kind: 'MOVE', from: { lte: YARD_STEP } }],
      },
      ...newest,
    }),
  ])
  const settings = ludoSettingsOf(session.settings)
  const present = new Set(session.players)
  const board = seats
    .filter((seat) => present.has(seat.accountId))
    .map(({ accountId, corner, pawns }) => ({ accountId, corner, pawns }))
  const base = {
    settings,
    rev: table?.rev ?? 0,
    startsAt: table?.startsAt ?? new Date(),
    turnEndsAt: table?.turnEndsAt ?? new Date(),
    turnId: table?.turnId ?? null,
    dice: table?.dice ?? null,
    isOver: isBoardOver({ seats, players: session.players, ending: settings.ending }),
    players: seats.map((seat) => ({
      accountId: seat.accountId,
      corner: seat.corner,
      pawns: seat.pawns,
      place: seat.place,
      progress: progressOf(seat.pawns),
      hasLeft: !present.has(seat.accountId),
    })),
    // Newest first, replayed oldest first
    lines: lines.map(({ id, kind, rev, accountId, dice, pawn, from, to, victimId }) => ({
      id,
      kind,
      rev,
      accountId,
      dice,
      pawn,
      from,
      to,
      victimId,
    })),
    feed: feed.map(feedLineOf),
    serverTime: new Date(),
  }

  return (viewerId: string) => {
    const isMyTurn = table?.turnId === viewerId

    return {
      ...base,
      isMyTurn,
      // Pawns the viewer may move with the die on the table
      movable:
        isMyTurn && table?.dice
          ? legalMoves(board, viewerId, table.dice, settings).map(({ pawn, to }) => ({ pawn, to }))
          : [],
    }
  }
}

/**
 * Board of a Ludo game for one reader
 * @param {EngineSession} session - Game
 * @param {string} viewerId - Reader
 * @return {Promise<object>} - Board
 */

export const ludoView = async (session: EngineSession, viewerId: string) =>
  (await ludoBoards(session))(viewerId)
