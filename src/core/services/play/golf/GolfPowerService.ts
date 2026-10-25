import 'server-only'

import { randomUUID } from 'node:crypto'

import type { GolfPlayer } from '@prisma/client'

import { conflict, invalidInput } from '@/core/lib/errors'
import { canPlaceAt, isEffectActive, isHoleDone, withEffect } from '@/core/lib/play/golf'
import type { GolfEffect, GolfShotResult } from '@/core/lib/play/golf'
import { boardStep } from '@/core/services/play/golf/GolfTableService'
import {
  asJson,
  effectsOf,
  hazardsOf,
  presentPlayers,
  requireBall,
  withGolf,
} from '@/core/services/play/golf/lookups'
import type { GolfTable } from '@/core/services/play/golf/lookups'
import { PLAY_ERRORS } from '@/declarations/play'
import { GOLF_POWERS, GolfPowerTargets } from '@/declarations/play/golf/powers'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import type { EngineSession, EngineStep } from '@/types/play'
import type { GolfPowerName } from '@/utils/constants/play'

/**
 * Lasting part of a power, from the settings
 * @param {GolfPowerName} power - Power
 * @param {number} at - Server ms
 * @return {Pick<GolfEffect, 'until' | 'shots'> & { lives?: number }} - Duration
 */

const lastingOf = (power: GolfPowerName, at: number) => {
  const tuning = GOLF_SETTINGS.powers[power] as Partial<
    Record<'seconds' | 'shots' | 'lives', number>
  >

  return {
    until: tuning.seconds === undefined ? undefined : at + tuning.seconds * 1000,
    shots: tuning.shots,
    lives: tuning.lives,
  }
}

/**
 * Orbs picked during a stroke turn into powers in hand
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer[]} players - Players after the stroke
 * @param {GolfShotResult} result - Played stroke
 * @return {Promise<GolfPlayer[]>} - Players afterwards
 */

export const grantPickups = async (
  table: GolfTable,
  players: GolfPlayer[],
  result: GolfShotResult
): Promise<GolfPlayer[]> => {
  const pool = table.settings.powers
  if (!pool.length || !result.pickups.length) return players
  const pickers = new Set(result.pickups.map((pickup) => pickup.id))

  return Promise.all(
    players.map((player) =>
      pickers.has(player.accountId) && !player.power
        ? table.tx.golfPlayer.update({
            where: { id: player.id },
            data: { power: pool[Math.floor(Math.random() * pool.length)] },
          })
        : player
    )
  )
}

/**
 * Point asked for a laid power
 * @param {GolfTable} table - Locked course
 * @param {Record<string, unknown>} raw - Body
 * @return {{ x: number, z: number }} - Point
 */

const readSpot = (table: GolfTable, raw: Record<string, unknown>) => {
  const x = typeof raw.x === 'number' ? raw.x : NaN
  const z = typeof raw.z === 'number' ? raw.z : NaN
  if (!canPlaceAt(table.hole, x, z)) {
    throw invalidInput([{ field: 'x', message: PLAY_ERRORS.badSpot }], PLAY_ERRORS.badSpot)
  }

  return { x, z }
}

/**
 * Lay a power on the course
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer} player - Player
 * @param {GolfPowerName} power - Power
 * @param {Record<string, unknown>} raw - Body
 * @return {Promise<void>} - Laid
 */

const layPower = async (
  table: GolfTable,
  player: GolfPlayer,
  power: GolfPowerName,
  raw: Record<string, unknown>
): Promise<void> => {
  const at = table.now.getTime()
  const hazards = [
    ...hazardsOf(table.game.hazards).filter((hazard) => isEffectActive(hazard, at)),
    {
      id: randomUUID(),
      power,
      ownerId: player.accountId,
      ...readSpot(table, raw),
      ...lastingOf(power, at),
    },
  ]
  await table.tx.golfGame.update({
    where: { sessionId: table.game.sessionId },
    data: { hazards: asJson(hazards) },
  })
}

/**
 * Put a power on balls, the player's or the others'
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer[]} targets - Balls touched
 * @param {GolfEffect} effect - Effect
 * @return {Promise<void>} - Applied
 */

const castOn = async (table: GolfTable, targets: GolfPlayer[], effect: GolfEffect) => {
  const at = table.now.getTime()
  for (const target of targets) {
    await table.tx.golfPlayer.update({
      where: { id: target.id },
      data: { effects: asJson(withEffect(effectsOf(target.effects), effect, at)) },
    })
  }
}

/**
 * Play the power in hand
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body, the point for a laid power
 * @return {Promise<EngineStep>} - Step
 */

export const playPower = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withGolf(session, async (table) => {
    const player = requireBall(table, accountId)
    const power = player.power
    if (!power || !GOLF_POWERS.has(power)) throw conflict(PLAY_ERRORS.noPower)
    const { target } = GOLF_POWERS.get(power)
    const { until, shots } = lastingOf(power, table.now.getTime())
    const effect = { power, from: accountId, until, shots }

    // Others still playing the hole
    const others = presentPlayers(table).filter(
      (other) => other.id !== player.id && !isHoleDone(other, table.settings.maxStrokes)
    )
    if (target === GolfPowerTargets.Place) await layPower(table, player, power, raw)
    else await castOn(table, target === GolfPowerTargets.Self ? [player] : others, effect)

    await table.tx.golfPlayer.update({ where: { id: player.id }, data: { power: null } })
    await table.tx.golfMove.create({
      data: { sessionId: session.id, accountId, kind: 'POWER', hole: table.game.hole, power },
    })
    await table.tx.golfGame.update({
      where: { sessionId: table.game.sessionId },
      data: { rev: { increment: 1 } },
    })

    return boardStep(table.game.endsAt)
  })
