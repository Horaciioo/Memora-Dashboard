import 'server-only'

import type { GolfPlayer } from '@prisma/client'

import { conflict, invalidInput } from '@/core/lib/errors'
import {
  activePowers,
  handSize,
  isEffectKept,
  isHoleDone,
  releaseArmed,
  shotDuration,
  simulateShot,
  spendShot,
  wearBounces,
  strokeBalls,
  strokeCeiling,
} from '@/core/lib/play/golf'
import type { GolfEffect, GolfShotInput, GolfShotResult } from '@/core/lib/play/golf'
import { boardStep, closeHole } from '@/core/services/play/golf/GolfTableService'
import { grantPickups } from '@/core/services/play/golf/GolfPowerService'
import {
  asJson,
  effectsOf,
  hazardsOf,
  isEveryoneDone,
  orbsOf,
  presentPlayers,
  requireBall,
  withGolf,
} from '@/core/services/play/golf/lookups'
import type { GolfTable, GolfTrack } from '@/core/services/play/golf/lookups'
import { PLAY_ERRORS } from '@/declarations/play'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import type { EngineSession, EngineStep } from '@/types/play'
import { GolfPowers } from '@/utils/constants/play'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Number field of a stroke
 * @param {Record<string, unknown>} raw - Body
 * @param {string} field - Field
 * @return {number} - Value
 */

const readStroke = (raw: Record<string, unknown>, field: string): number => {
  const value = raw[field]
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw invalidInput([{ field, message: PLAY_ERRORS.badStroke }], PLAY_ERRORS.badStroke)
  }

  return value
}

/**
 * Effects of a ball, armed ones released when it stopped
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer} player - Ball
 * @return {GolfEffect[]} - Effects
 */

const effectsAtShot = (table: GolfTable, player: GolfPlayer): GolfEffect[] =>
  releaseArmed(effectsOf(player.effects), {
    at: Math.max(table.now.getTime(), player.restsAt.getTime()),
    hole: table.game.hole,
  })

/**
 * Balls a stroke can meet
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer} shooter - Ball hit
 * @return {GolfShotInput['balls']} - Balls
 */

const ballsOf = (table: GolfTable, shooter: GolfPlayer): GolfShotInput['balls'] =>
  strokeBalls(
    presentPlayers(table).map((player) => ({
      ...player,
      hand: player.powers,
      isDone: isHoleDone(player, strokeCeiling(table.settings)),
      restsAt: player.restsAt.getTime(),
      effects: effectsAtShot(table, player),
    })),
    shooter.accountId,
    table.now.getTime(),
    table.settings.powers.length ? handSize(table.settings) : 0
  )

/**
 * Write where every moved ball ends
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer} shooter - Ball hit
 * @param {GolfShotResult} result - Played stroke
 * @return {Promise<GolfPlayer[]>} - Players afterwards
 */

const writeBalls = async (table: GolfTable, shooter: GolfPlayer, result: GolfShotResult) => {
  const { tx, now } = table
  const restsAt = new Date(now.getTime() + shotDuration(result))
  const shooterEffects = effectsAtShot(table, shooter)
  const wasGhost = activePowers(shooterEffects, now.getTime()).has(GolfPowers.Ghost)

  return Promise.all(
    table.players.map(async (player) => {
      const outcome = result.outcomes[player.accountId]
      const isShooter = player.id === shooter.id
      const hits = result.bumperHits[player.accountId] ?? 0
      if (!outcome && !isShooter && !hits) return player
      const fallPenalty =
        outcome?.hasFallen && isShooter && !wasGhost ? GOLF_SETTINGS.voidPenalty : 0
      const strokes = player.strokes + (isShooter ? 1 + fallPenalty : 0)

      return tx.golfPlayer.update({
        where: { id: player.id },
        data: {
          x: outcome?.x ?? player.x,
          z: outcome?.z ?? player.z,
          restsAt: outcome ? restsAt : player.restsAt,
          strokes,
          holedAt: outcome?.isHoled ? restsAt : player.holedAt,
          effects: asJson(
            wearBounces(
              isShooter ? spendShot(shooterEffects, now.getTime()) : effectsOf(player.effects),
              hits,
              Boolean(outcome?.isHoled)
            )
          ),
        },
      })
    })
  )
}

/**
 * Feed lines of a stroke: the track, then holes and falls
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer} shooter - Ball hit
 * @param {GolfShotResult} result - Played stroke
 * @param {GolfPlayer[]} players - Players afterwards
 * @return {Promise<void>} - Written
 */

const writeMoves = async (
  table: GolfTable,
  shooter: GolfPlayer,
  result: GolfShotResult,
  players: GolfPlayer[]
): Promise<void> => {
  const { tx, session, game, now } = table
  const track: GolfTrack = {
    frameMs: result.frameMs,
    frames: result.frames,
    paths: result.paths,
    events: result.events,
    flashId: result.flashId,
  }
  const base = { sessionId: session.id, hole: game.hole, createdAt: now }
  // Holes and falls told once the ball stops
  const landed = { ...base, createdAt: new Date(now.getTime() + shotDuration(result)) }
  const outcomes = Object.entries(result.outcomes)

  await tx.golfMove.createMany({
    data: [
      { ...base, accountId: shooter.accountId, kind: 'SHOT' as const, path: asJson(track) },
      ...outcomes
        .filter(([, outcome]) => outcome.isHoled)
        .map(([accountId]) => ({
          ...landed,
          accountId,
          kind: 'HOLED' as const,
          strokes: players.find((player) => player.accountId === accountId)?.strokes ?? null,
        })),
      ...outcomes
        .filter(([, outcome]) => outcome.hasFallen)
        .map(([accountId]) => ({ ...landed, accountId, kind: 'FALL' as const })),
    ],
  })
}

/**
 * Course state worn by the stroke: bumpers hit, orbs taken
 * @param {GolfTable} table - Locked course
 * @param {GolfShotResult} result - Played stroke
 * @return {Promise<void>} - Written
 */

const writeCourse = async ({ tx, game, hole, now }: GolfTable, result: GolfShotResult) => {
  const hazards = hazardsOf(game.hazards)
    .map((hazard) =>
      result.bumperHits[hazard.id]
        ? { ...hazard, lives: (hazard.lives ?? 0) - result.bumperHits[hazard.id] }
        : hazard
    )
    .filter((hazard) => isEffectKept(hazard, now.getTime()))
  const orbs = hole.orbs.map((_, index) => orbsOf(game.orbs)[index] ?? 0)
  for (const pickup of result.pickups) {
    orbs[pickup.orb] = pickup.at + GOLF_SETTINGS.orbs.respawnSeconds * SECOND_MS
  }

  await tx.golfGame.update({
    where: { sessionId: game.sessionId },
    data: { hazards: asJson(hazards), orbs, rev: { increment: 1 } },
  })
}

/**
 * Hit the ball
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Angle and power
 * @return {Promise<EngineStep>} - Step
 */

export const playShot = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> => {
  const angle = readStroke(raw, 'angle')
  const power = Math.min(1, readStroke(raw, 'power'))
  if (power < GOLF_SETTINGS.physics.minPower) throw conflict(PLAY_ERRORS.badStroke)

  return withGolf(session, async (table) => {
    const shooter = requireBall(table, accountId)
    if (shooter.restsAt.getTime() - GOLF_SETTINGS.restToleranceMs > table.now.getTime()) {
      throw conflict(PLAY_ERRORS.ballRolling)
    }

    const result = simulateShot({
      hole: table.hole,
      at: table.now.getTime(),
      holeStart: table.game.startsAt.getTime(),
      shooterId: accountId,
      angle,
      power,
      balls: ballsOf(table, shooter),
      hazards: hazardsOf(table.game.hazards),
      orbs: orbsOf(table.game.orbs),
      collisions: table.settings.collisions,
    })
    const players = await grantPickups(table, await writeBalls(table, shooter, result), result)
    await writeMoves(table, shooter, result, players)
    await writeCourse(table, result)

    const after = { ...table, players }
    return isEveryoneDone(after) ? closeHole(after) : boardStep(table.game.endsAt)
  })
}
