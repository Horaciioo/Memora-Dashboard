import 'server-only'

import { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { stopGoSettingsOf } from '@/core/lib/play/stopgo'
import type {
  StopGoCard,
  StopGoTable,
  StopGoGameSettings,
  StopGoGameState,
  StopGoHandCard,
  StopGoSeatState,
} from '@/core/lib/play/stopgo'
import { holdSession } from '@/core/services/play/PlaySessionService'
import { PLAY_ERRORS } from '@/declarations/play/copy'
import type { StopGoHazard, StopGoSafety } from '@/declarations/play/stopgo/cards'
import type { EngineSession, EngineStep } from '@/types/play'
import type { StopGoMoveKindName } from '@/utils/constants/play'

/**
 * Locked table of a race
 * @typedef {Object} StopGoLockedTable
 */

export interface StopGoLockedTable {
  tx: Prisma.TransactionClient
  session: EngineSession
  settings: StopGoGameSettings
  game: StopGoGameState
  // Every seat in turn order
  seats: StopGoSeatState[]
  now: Date
  // Something to push
  isDirty: boolean
  // Revision on load
  startRev: number
}

/**
 * Move to write in the public log
 * @typedef {Object} StopGoMoveInput
 */

export interface StopGoMoveInput {
  kind: StopGoMoveKindName
  accountId: string
  targetIds?: string[]
  card?: string
  km?: number
  value?: number
}

/**
 * Run work on the locked table
 * @param {EngineSession} session - Game
 * @param {(table: StopGoLockedTable) => Promise<T>} work - Table work
 * @return {Promise<T>} - Result
 */

export const withTable = <T>(
  session: EngineSession,
  work: (table: StopGoLockedTable) => Promise<T>
): Promise<T> =>
  prisma.$transaction(async (tx) => {
    await holdSession(tx, session.id)
    const where = { sessionId: session.id }
    const [row, rows] = await Promise.all([
      tx.stopGoGame.findUnique({ where }),
      tx.stopGoPlayer.findMany({ where, orderBy: { slot: 'asc' } }),
    ])
    if (!row) throw notFound(PLAY_ERRORS.roundMissing)
    const game: StopGoGameState = {
      ...row,
      drawPile: row.drawPile as unknown as StopGoCard[],
      discard: row.discard as unknown as StopGoCard[],
    }
    const table: StopGoLockedTable = {
      tx,
      session,
      settings: stopGoSettingsOf(session.settings),
      game,
      seats: rows.map((seat) => ({
        ...seat,
        hand: seat.hand as unknown as StopGoHandCard[],
        hazards: seat.hazards as StopGoHazard[],
        shields: seat.shields as StopGoSafety[],
      })),
      now: new Date(),
      isDirty: false,
      startRev: row.rev,
    }
    const result = await work(table)

    // One write of the clock and the piles
    if (table.isDirty) {
      const { phase, turnId, turnNo, turnEndsAt, drawPile, discard, reshuffles } = table.game
      const { pending, pendingEndsAt } = table.game
      await tx.stopGoGame.update({
        where,
        data: {
          phase,
          turnId,
          turnNo,
          turnEndsAt,
          reshuffles,
          pendingEndsAt,
          drawPile: drawPile as unknown as Prisma.InputJsonValue,
          discard: discard as unknown as Prisma.InputJsonValue,
          pending: pending == null ? Prisma.DbNull : (pending as Prisma.InputJsonValue),
          rev: table.startRev + 1,
        },
      })
    }

    return result
  })

/**
 * Seat of an account
 * @param {StopGoLockedTable} table - Table
 * @param {string} accountId - Account
 * @return {StopGoSeatState | undefined} - Seat
 */

export const seatOf = (table: StopGoLockedTable, accountId: string): StopGoSeatState | undefined =>
  table.seats.find((seat) => seat.accountId === accountId)

/**
 * Seats still on the road: present and not arrived
 * @param {StopGoLockedTable} table - Table
 * @return {StopGoSeatState[]} - Seats in turn order
 */

export const racing = (table: StopGoLockedTable): StopGoSeatState[] =>
  table.seats.filter((seat) => table.session.players.includes(seat.accountId) && !seat.finishedAt)

/**
 * Write a seat and keep the table in step
 * @param {StopGoLockedTable} table - Table
 * @param {string} accountId - Player
 * @param {Partial<StopGoSeatState>} patch - Changes
 * @return {Promise<void>} - Written
 */

export const saveSeat = async (
  table: StopGoLockedTable,
  accountId: string,
  patch: Partial<Omit<StopGoSeatState, 'id' | 'accountId' | 'slot'>>
): Promise<void> => {
  const seat = seatOf(table, accountId)
  if (!seat) return
  Object.assign(seat, patch)
  const { hand, sealed, ...rest } = patch
  await table.tx.stopGoPlayer.update({
    where: { id: seat.id },
    data: {
      ...rest,
      ...(hand !== undefined && { hand: hand as unknown as Prisma.InputJsonValue }),
      ...(sealed !== undefined && { sealed: sealed as Prisma.InputJsonValue }),
    },
  })
  table.isDirty = true
}

/**
 * Write the cars a play changed
 * @param {StopGoLockedTable} table - Table
 * @param {StopGoTable} before - Race before
 * @param {StopGoTable} after - Race after
 * @return {Promise<void>} - Written
 */

export const saveCars = async (
  table: StopGoLockedTable,
  before: StopGoTable,
  after: StopGoTable
): Promise<void> => {
  for (const [id, car] of Object.entries(after.cars)) {
    if (car === before.cars[id]) continue
    await saveSeat(table, id, {
      km: car.km,
      isGreen: car.isGreen,
      hazards: car.hazards,
      shields: car.shields,
    })
  }
}

/**
 * Write moves in the public log
 * @param {StopGoLockedTable} table - Table
 * @param {StopGoMoveInput[]} moves - Moves in order
 * @return {Promise<number>} - Revision they belong to
 */

export const writeMoves = async (
  table: StopGoLockedTable,
  moves: StopGoMoveInput[]
): Promise<number> => {
  const rev = table.startRev + 1
  await table.tx.stopGoMove.createMany({
    data: moves.map((move) => ({
      sessionId: table.session.id,
      rev,
      targetIds: [],
      ...move,
    })),
  })
  table.isDirty = true

  return rev
}

/**
 * Step after a move that left the table running
 * @param {StopGoLockedTable} table - Table after the move
 * @return {EngineStep} - Step
 */

export const movedStep = (table: StopGoLockedTable): EngineStep => ({
  changed: true,
  finished: false,
  deadline: table.game.turnEndsAt,
})
