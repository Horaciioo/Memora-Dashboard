import 'server-only'

import { nextRacer, placesOf, raceOf, scoreOf, turnSecondsOf } from '@/core/lib/play/stopgo'
import { after } from '@/core/lib/play/clock'
import {
  movedStep,
  racing,
  saveSeat,
  seatOf,
  writeMoves,
} from '@/core/services/play/stopgo/StopGoTable'
import type { StopGoLockedTable, StopGoMoveInput } from '@/core/services/play/stopgo/StopGoTable'
import type { EngineStep } from '@/types/play'
import { StopGoMoveKinds, StopGoPhases } from '@/utils/constants/play'

/**
 * Race over: places, scores and the closing line
 * @param {StopGoLockedTable} table - Table
 * @param {string | null} winnerId - Player who won, null to rank by distance
 * @param {StopGoMoveInput[]} lines - Lines of the closing move
 * @return {Promise<EngineStep>} - Finished step
 */

export const closeRace = async (
  table: StopGoLockedTable,
  winnerId: string | null,
  lines: StopGoMoveInput[] = []
): Promise<EngineStep> => {
  const { tx, session, seats } = table
  const places = placesOf(raceOf(seats, table.settings.target), winnerId)
  table.game.phase = StopGoPhases.Over

  for (const seat of seats) {
    const place = places[seat.accountId]
    await saveSeat(table, seat.accountId, {
      place,
      finishedAt: seat.accountId === winnerId ? table.now : seat.finishedAt,
    })
    await tx.playSeat.update({
      where: { sessionId_accountId: { sessionId: session.id, accountId: seat.accountId } },
      data: { score: scoreOf(place, seats.length, seat.km) },
    })
  }
  const leaderId = winnerId ?? Object.keys(places).find((id) => places[id] === 1)!
  await writeMoves(table, [...lines, { kind: StopGoMoveKinds.Finish, accountId: leaderId }])

  return { changed: true, finished: true, deadline: null }
}

/**
 * Hand the turn to the next racer
 * @param {StopGoLockedTable} table - Table
 * @param {string} fromId - Player whose turn ends
 * @param {StopGoMoveInput[]} lines - Lines of the move that ended it
 * @return {Promise<EngineStep>} - Step
 */

export const passTurn = async (
  table: StopGoLockedTable,
  fromId: string,
  lines: StopGoMoveInput[]
): Promise<EngineStep> => {
  const road = racing(table).map((seat) => seat.accountId)
  const nextId = nextRacer(
    table.seats.map((seat) => seat.accountId),
    road,
    fromId
  )

  // A lone racer wins
  if (!nextId) return closeRace(table, null, lines)
  if (road.length < 2) return closeRace(table, nextId, lines)

  return giveTurn(table, nextId, lines)
}

/**
 * Give the turn to a racer, who takes their card from the pile, the same one again after a safety
 * @param {StopGoLockedTable} table - Table
 * @param {string} nextId - Player who plays next
 * @param {StopGoMoveInput[]} lines - Lines of the move that ended the last turn
 * @return {Promise<EngineStep>} - Step
 */

export const giveTurn = async (
  table: StopGoLockedTable,
  nextId: string,
  lines: StopGoMoveInput[]
): Promise<EngineStep> => {
  const { game, settings } = table
  const next = seatOf(table, nextId)!
  game.turnId = nextId
  game.turnNo += 1
  game.turnEndsAt = after(table.now, turnSecondsOf(next.strikes, settings.turnSeconds))
  await writeMoves(table, lines)

  return movedStep(table)
}
