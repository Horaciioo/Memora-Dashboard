import 'server-only'

import type { GolfGame, GolfPlayer, Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import {
  golfPhase,
  golfSettingsOf,
  holeFor,
  holesOf,
  isHoleDone,
  strokeCeiling,
} from '@/core/lib/play/golf'
import type {
  GolfEffect,
  GolfGameSettings,
  GolfHazard,
  GolfHole,
  GolfShotResult,
} from '@/core/lib/play/golf'
import { holdSession } from '@/core/services/play/PlaySessionService'
import { PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession } from '@/types/play'
import { GolfPhases } from '@/utils/constants/play'

/**
 * Tracks of a stroke as stored
 * @typedef {Object} GolfTrack
 */

export type GolfTrack = Pick<GolfShotResult, 'frameMs' | 'frames' | 'paths' | 'events' | 'flashId'>

/**
 * Locked course of a game
 * @typedef {Object} GolfTable
 */

export interface GolfTable {
  tx: Prisma.TransactionClient
  session: EngineSession
  settings: GolfGameSettings
  game: GolfGame
  players: GolfPlayer[]
  hole: GolfHole
  holes: number
  now: Date
}

/**
 * Orb return times
 * @param {Prisma.JsonValue} value - Stored orbs
 * @return {number[]} - Server ms per orb
 */

export const orbsOf = (value: Prisma.JsonValue): number[] =>
  Array.isArray(value) ? value.map((entry) => (typeof entry === 'number' ? entry : 0)) : []

/**
 * Laid powers
 * @param {Prisma.JsonValue} value - Stored hazards
 * @return {GolfHazard[]} - Hazards
 */

export const hazardsOf = (value: Prisma.JsonValue): GolfHazard[] =>
  Array.isArray(value) ? (value as unknown as GolfHazard[]) : []

/**
 * Powers on a ball
 * @param {Prisma.JsonValue} value - Stored effects
 * @return {GolfEffect[]} - Effects
 */

export const effectsOf = (value: Prisma.JsonValue): GolfEffect[] =>
  Array.isArray(value) ? (value as unknown as GolfEffect[]) : []

/**
 * Json column value
 * @param {unknown} value - Value
 * @return {Prisma.InputJsonValue} - Writable
 */

export const asJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue

/**
 * Players still seated
 * @param {GolfTable} table - Locked course
 * @return {GolfPlayer[]} - Present players
 */

export const presentPlayers = (table: Pick<GolfTable, 'players' | 'session'>): GolfPlayer[] => {
  const present = new Set(table.session.players)

  return table.players.filter((player) => present.has(player.accountId))
}

/**
 * Every present player finished the hole
 * @param {GolfTable} table - Locked course
 * @return {boolean} - Hole complete
 */

export const isEveryoneDone = (table: GolfTable): boolean =>
  presentPlayers(table).every((player) => isHoleDone(player, strokeCeiling(table.settings)))

/**
 * Ball the player may hit now
 * @param {GolfTable} table - Locked course
 * @param {string} accountId - Player
 * @param {boolean} [canBeDone] - Finished player allowed
 * @return {GolfPlayer} - Ball
 */

export const requireBall = (table: GolfTable, accountId: string, canBeDone = false): GolfPlayer => {
  const { game, now, settings } = table
  const isOpen =
    golfPhase(game, now.getTime(), table.holes) === GolfPhases.Playing &&
    !game.closedAt &&
    now < game.endsAt
  if (!isOpen) {
    throw conflict(PLAY_ERRORS.holeClosed)
  }
  const player = presentPlayers(table).find((entry) => entry.accountId === accountId)
  if (!player || (!canBeDone && isHoleDone(player, strokeCeiling(settings)))) {
    throw conflict(PLAY_ERRORS.holeDone)
  }

  return player
}

/**
 * Run work on the locked course
 * @param {EngineSession} session - Game
 * @param {(table: GolfTable) => Promise<T>} work - Course work
 * @return {Promise<T>} - Work result
 */

export const withGolf = <T>(
  session: EngineSession,
  work: (table: GolfTable) => Promise<T>
): Promise<T> =>
  prisma.$transaction(async (tx) => {
    await holdSession(tx, session.id)
    const [game, players] = await Promise.all([
      tx.golfGame.findUnique({ where: { sessionId: session.id } }),
      tx.golfPlayer.findMany({ where: { sessionId: session.id }, orderBy: { id: 'asc' } }),
    ])
    if (!game) throw notFound(PLAY_ERRORS.roundMissing)
    const settings = golfSettingsOf(session.settings)
    const layouts = holesOf(settings)

    return work({
      tx,
      session,
      settings,
      game,
      players,
      hole: holeFor(layouts[Math.min(game.hole, layouts.length - 1)], settings),
      holes: layouts.length,
      now: new Date(),
    })
  })
