import 'server-only'

import { Prisma } from '@prisma/client'
import type { LudoGame, LudoPlayer } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { effectsOf, ludoSettingsOf, mapOf } from '@/core/lib/play/ludo'
import type {
  ChaosSeat,
  LudoEffects,
  LudoGameSettings,
  LudoLine,
  LudoMap,
} from '@/core/lib/play/ludo'
import { holdSession } from '@/core/services/play/PlaySessionService'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import { PLAY_ERRORS } from '@/declarations/play/copy'
import type { EngineSession, EngineStep } from '@/types/play'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Colour row with its effects read
 * @typedef {Object} LudoRow
 */

export type LudoRow = Omit<LudoPlayer, 'effects'> & { effects: LudoEffects }

/**
 * Locked board of a game
 * @typedef {Object} LudoTable
 */

export interface LudoTable {
  tx: Prisma.TransactionClient
  session: EngineSession
  settings: LudoGameSettings
  // Board the game is played on
  map: LudoMap
  table: LudoGame
  // Rows as stored
  rows: LudoRow[]
  // Rows as the gesture leaves them
  seats: LudoRow[]
  now: Date
}

/**
 * Colours still seated, as the rules read them
 * @param {LudoTable} table - Locked board
 * @return {ChaosSeat[]} - Board
 */

export const boardOf = ({ seats, session }: LudoTable): ChaosSeat[] =>
  seats
    .filter((seat) => session.players.includes(seat.accountId))
    .map(({ accountId, corner, pawns, joker, effects }) => ({
      accountId,
      corner,
      pawns,
      joker,
      effects,
    }))

/**
 * Colours still racing
 * @param {LudoTable} table - Locked board
 * @param {LudoRow[]} seats - Seats to read
 * @return {LudoRow[]} - Seated, not home
 */

export const racing = ({ session }: LudoTable, seats: LudoRow[]): LudoRow[] =>
  seats.filter((seat) => session.players.includes(seat.accountId) && !seat.finishedAt)

/**
 * Run work on the locked board
 * @param {EngineSession} session - Game
 * @param {(table: LudoTable) => Promise<EngineStep>} work - Board work
 * @return {Promise<EngineStep>} - Step
 */

export const withTable = (
  session: EngineSession,
  work: (table: LudoTable) => Promise<EngineStep>
): Promise<EngineStep> =>
  prisma.$transaction(async (tx) => {
    await holdSession(tx, session.id)
    const [table, rows] = await Promise.all([
      tx.ludoGame.findUnique({ where: { sessionId: session.id } }),
      tx.ludoPlayer.findMany({ where: { sessionId: session.id }, orderBy: { corner: 'asc' } }),
    ])
    if (!table) throw notFound(PLAY_ERRORS.roundMissing)
    const read = rows.map((row) => ({ ...row, effects: effectsOf(row.effects) }))

    const settings = ludoSettingsOf(session.settings)

    return work({
      tx,
      session,
      settings,
      map: mapOf(settings.rules.chaos),
      table,
      rows: read,
      seats: read,
      now: new Date(),
    })
  })

/**
 * Lines of one gesture written, a revision each
 * @param {LudoTable} table - Locked board
 * @param {LudoLine[]} lines - Lines in order
 * @param {number} [base] - Revision before them
 * @return {Promise<number>} - Last revision
 */

export const writeLines = async (
  { tx, session, table }: LudoTable,
  lines: LudoLine[],
  base = table.rev
): Promise<number> => {
  if (!lines.length) return base
  await tx.ludoMove.createMany({
    data: lines.map((line, index) => ({ sessionId: session.id, rev: base + index + 1, ...line })),
  })

  return base + lines.length
}

/**
 * Seats written where the gesture changed them
 * @param {LudoTable} table - Locked board
 * @param {LudoRow[]} seats - Seats afterwards
 * @return {Promise<void>} - Saved
 */

export const saveSeats = async ({ tx, rows }: LudoTable, seats: LudoRow[]): Promise<void> => {
  const key = (seat: LudoRow) =>
    JSON.stringify([seat.pawns, seat.place, seat.joker, seat.effects, seat.finishedAt])

  for (const seat of seats) {
    const old = rows.find((entry) => entry.id === seat.id)
    if (old && key(old) === key(seat)) continue
    await tx.ludoPlayer.update({
      where: { id: seat.id },
      data: {
        pawns: seat.pawns,
        finishedAt: seat.finishedAt,
        place: seat.place,
        joker: seat.joker,
        effects: seat.effects as unknown as Prisma.InputJsonObject,
      },
    })
  }
}

/**
 * Turn clock, the moves on screen left to play out first
 * @param {LudoTable} table - Locked board
 * @param {number} steps - Squares walked
 * @param {number} [extraMs] - Beats of effects
 * @return {Date} - End of the turn
 */

export const clockAfter = ({ settings, now }: LudoTable, steps: number, extraMs = 0): Date =>
  new Date(
    now.getTime() +
      (settings.turnSeconds + LUDO_SETTINGS.graceSeconds) * SECOND_MS +
      LUDO_SETTINGS.rollMs +
      steps * LUDO_SETTINGS.stepMs +
      extraMs
  )

/**
 * Value stored for a choice waiting, none when empty
 * @param {object | null} pending - Choice
 * @return {Prisma.InputJsonValue | typeof Prisma.DbNull} - Stored value
 */

export const storedPending = (pending: object | null) =>
  pending ? (pending as Prisma.InputJsonObject) : Prisma.DbNull
