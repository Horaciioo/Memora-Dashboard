import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { buildBoards, stopGoSettingsOf } from '@/core/lib/play/stopgo'
import type {
  StopGoCard,
  StopGoGameState,
  StopGoHandCard,
  StopGoLogLine,
  StopGoSeatState,
} from '@/core/lib/play/stopgo'
import { PLAY_ERRORS } from '@/declarations/play/copy'
import type { StopGoCardKey, StopGoHazard, StopGoSafety } from '@/declarations/play/stopgo/cards'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import type { EngineSession } from '@/types/play'

/**
 * One read of a race, then the board of each reader
 * @param {EngineSession} session - Game
 * @return {Promise<(viewerId: string) => object>} - Board of a reader
 */

export const stopGoBoards = async (session: EngineSession) => {
  const where = { sessionId: session.id }
  const [row, rows, moves] = await Promise.all([
    prisma.stopGoGame.findUnique({ where }),
    prisma.stopGoPlayer.findMany({ where, orderBy: { slot: 'asc' } }),
    prisma.stopGoMove.findMany({
      where,
      orderBy: [{ rev: 'desc' }, { createdAt: 'desc' }],
      take: STOPGO_SETTINGS.feedSize,
    }),
  ])
  if (!row) throw notFound(PLAY_ERRORS.roundMissing)
  const game: StopGoGameState = {
    ...row,
    drawPile: row.drawPile as unknown as StopGoCard[],
    discard: row.discard as unknown as StopGoCard[],
  }
  const seats: StopGoSeatState[] = rows.map((seat) => ({
    ...seat,
    hand: seat.hand as unknown as StopGoHandCard[],
    hazards: seat.hazards as StopGoHazard[],
    shields: seat.shields as StopGoSafety[],
    lastHazard: seat.lastHazard as StopGoHazard | null,
  }))
  const log: StopGoLogLine[] = moves.toReversed().map((move) => ({
    ...move,
    card: move.card as StopGoCardKey | null,
  }))

  return buildBoards({
    settings: stopGoSettingsOf(session.settings),
    game,
    seats,
    log,
    present: new Set(session.players),
    now: new Date(),
  })
}

/**
 * Board of a race as one viewer may see it
 * @param {EngineSession} session - Game
 * @param {string} viewerId - Reader
 * @return {Promise<object>} - Board
 */

export const stopGoView = async (session: EngineSession, viewerId: string) =>
  (await stopGoBoards(session))(viewerId)
