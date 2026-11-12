import 'server-only'

import type { Prisma, SuspensGame } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { after } from '@/core/lib/play/clock'
import { nextGuesser, phaseOf, setterPoints, suspensSettingsOf } from '@/core/lib/play/suspens'
import type { SuspensGameSettings } from '@/core/lib/play/suspens'
import { holdSession } from '@/core/services/play/PlaySessionService'
import { PLAY_ERRORS, SUSPENS_SETTINGS } from '@/declarations/play'
import type { EngineSession, EngineStep } from '@/types/play'
import { SuspensPhases } from '@/utils/constants/play'

// Locked table of a game
export interface SuspensTable {
  tx: Prisma.TransactionClient
  session: EngineSession
  settings: SuspensGameSettings
  game: SuspensGame
  now: Date
}

/**
 * Next moment the table has to move
 * @param {SuspensGame} game - Table
 * @return {Date} - Deadline
 */

export const deadlineOf = (game: SuspensGame): Date => {
  const phase = phaseOf(game)
  if (phase === SuspensPhases.Reveal) return game.revealUntil!
  if (phase === SuspensPhases.Pick) return game.pickEndsAt

  return game.turnEndsAt ?? game.pickEndsAt
}

/**
 * Run work on the locked table
 * @param {EngineSession} session - Game
 * @param {(table: SuspensTable) => Promise<EngineStep>} work - Table work
 * @return {Promise<EngineStep>} - Step
 */

export const withTable = (
  session: EngineSession,
  work: (table: SuspensTable) => Promise<EngineStep>
): Promise<EngineStep> =>
  prisma.$transaction(async (tx) => {
    await holdSession(tx, session.id)
    const game = await tx.suspensGame.findUnique({ where: { sessionId: session.id } })
    if (!game) throw notFound(PLAY_ERRORS.roundMissing)

    return work({
      tx,
      session,
      settings: suspensSettingsOf(session.settings),
      game,
      now: new Date(),
    })
  })

/**
 * Table moved, the next deadline read back
 * @param {SuspensGame} game - Table after the change
 * @return {EngineStep} - Step
 */

export const movedStep = (game: SuspensGame): EngineStep => ({
  changed: true,
  finished: false,
  deadline: deadlineOf(game),
})

/**
 * Hand the turn to the next guesser
 * @param {SuspensTable} table - Locked table
 * @param {Prisma.SuspensGameUpdateInput} data - Table changes of the move
 * @return {Promise<EngineStep>} - Step
 */

export const passTurn = async (
  table: SuspensTable,
  data: Prisma.SuspensGameUpdateInput = {}
): Promise<EngineStep> => {
  const { tx, session, settings, game, now } = table
  const order = game.order as string[]
  const turnId = nextGuesser(order, game.setterId, session.players, game.turnId)
  if (!turnId)
    return endRound(table, { errors: game.errors, isSolved: false, solverId: null }, data)

  const updated = await tx.suspensGame.update({
    where: { sessionId: session.id },
    data: {
      ...data,
      turnId,
      turnEndsAt: after(now, settings.turnSeconds),
      turnNo: { increment: 1 },
    },
  })

  return movedStep(updated)
}

/**
 * Round over: its line is written, the word stays on screen for a while
 * @param {SuspensTable} table - Locked table
 * @param {{ errors: number, isSolved: boolean, solverId: string | null }} outcome - How it ended
 * @param {Prisma.SuspensGameUpdateInput} [data] - Table changes of the last move
 * @return {Promise<EngineStep>} - Step
 */

export const endRound = async (
  { tx, session, game, now }: SuspensTable,
  outcome: { errors: number; isSolved: boolean; solverId: string | null },
  data: Prisma.SuspensGameUpdateInput = {}
): Promise<EngineStep> => {
  await tx.suspensRound.create({
    data: {
      sessionId: session.id,
      round: game.round,
      setterId: game.setterId,
      word: game.display ?? '',
      errors: outcome.errors,
      isSolved: outcome.isSolved,
      solverId: outcome.solverId,
      points: setterPoints(outcome.errors, !outcome.isSolved),
    },
  })
  const updated = await tx.suspensGame.update({
    where: { sessionId: session.id },
    data: {
      ...data,
      errors: outcome.errors,
      turnId: null,
      turnEndsAt: null,
      revealUntil: after(now, SUSPENS_SETTINGS.revealSeconds),
    },
  })

  return movedStep(updated)
}
