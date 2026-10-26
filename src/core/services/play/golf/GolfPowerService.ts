import 'server-only'

import { randomUUID } from 'node:crypto'

import type { GolfPlayer } from '@prisma/client'

import { conflict, invalidInput } from '@/core/lib/errors'
import {
  addToHand,
  canPlaceAt,
  drawPower,
  standingShare,
  isEffectActive,
  isHoleDone,
  malusWeight,
  scatterSpot,
  withEffect,
  strokeCeiling,
} from '@/core/lib/play/golf'
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
import { GolfPowers } from '@/utils/constants/play'
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
 * Orbs picked during a stroke turn into powers in hand, a full hand takes none
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
  const totalOf = (player: GolfPlayer) =>
    player.card.reduce((sum, hole) => sum + hole, 0) + player.strokes
  const totals = players.map(totalOf)

  return Promise.all(
    players.map((player) =>
      pickers.has(player.accountId)
        ? table.tx.golfPlayer.update({
            where: { id: player.id },
            data: {
              powers: addToHand(
                player.powers,
                drawPower(
                  pool,
                  standingShare(totals, totalOf(player)),
                  Math.random(),
                  malusWeight(table.settings)
                )
              ),
            },
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
 * Drift of a tornado or blow of a gust
 * @param {GolfPlayer} player - Player laying it
 * @param {GolfPowerName} power - Power
 * @param {{ x: number, z: number }} spot - Point touched
 * @return {{ vx?: number, vz?: number }} - Motion
 */

const motionOf = (player: GolfPlayer, power: GolfPowerName, spot: { x: number; z: number }) => {
  if (power === GolfPowers.Tornado) {
    const angle = Math.random() * 2 * Math.PI
    const drift = GOLF_SETTINGS.powers.tornado.drift

    return { vx: Math.sin(angle) * drift, vz: Math.cos(angle) * drift }
  }
  if (power !== GolfPowers.Gust) return {}
  // Blows from the ball toward the point
  const dx = spot.x - player.x
  const dz = spot.z - player.z
  const length = Math.hypot(dx, dz) || 1

  return { vx: dx / length, vz: dz / length }
}

/**
 * Lay a power on the course, a frozen course renewing the one running
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer} player - Player
 * @param {GolfPowerName} power - Power
 * @param {{ x: number, z: number }} spot - Where it lands
 * @return {Promise<void>} - Laid
 */

const layPower = async (
  table: GolfTable,
  player: GolfPlayer,
  power: GolfPowerName,
  spot: { x: number; z: number }
): Promise<void> => {
  const at = table.now.getTime()
  const hazards = [
    ...hazardsOf(table.game.hazards).filter(
      (hazard) => isEffectActive(hazard, at) && (power !== GolfPowers.Ice || hazard.power !== power)
    ),
    {
      id: randomUUID(),
      power,
      ownerId: player.accountId,
      ...spot,
      ...lastingOf(power, at),
      laidAt: at,
      ...motionOf(player, power, spot),
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
 * Push every other ball at rest to a spot nearby
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer[]} targets - Balls touched
 * @return {Promise<void>} - Pushed
 */

const scatter = async (table: GolfTable, targets: GolfPlayer[]): Promise<void> => {
  const now = table.now.getTime()
  for (const target of targets) {
    if (target.restsAt.getTime() > now) continue
    await table.tx.golfPlayer.update({
      where: { id: target.id },
      data: scatterSpot(table.hole, target.x, target.z),
    })
  }
}

/**
 * Trade places with the player picked, both balls at rest
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer} player - Player
 * @param {GolfPlayer[]} others - Players still on the hole
 * @param {Record<string, unknown>} raw - Body, the target account
 * @return {Promise<void>} - Swapped
 */

const swap = async (
  table: GolfTable,
  player: GolfPlayer,
  others: GolfPlayer[],
  raw: Record<string, unknown>
): Promise<void> => {
  const now = table.now.getTime()
  const target = others.find((other) => other.accountId === raw.targetId)
  if (!target || target.restsAt.getTime() > now || player.restsAt.getTime() > now) {
    throw invalidInput(
      [{ field: 'targetId', message: PLAY_ERRORS.badTarget }],
      PLAY_ERRORS.badTarget
    )
  }
  await table.tx.golfPlayer.update({
    where: { id: player.id },
    data: { x: target.x, z: target.z },
  })
  await table.tx.golfPlayer.update({
    where: { id: target.id },
    data: { x: player.x, z: player.z },
  })
}

/**
 * Slot of the hand asked, the oldest by default
 * @param {GolfPlayer} player - Player
 * @param {Record<string, unknown>} raw - Body
 * @return {number} - Slot
 */

const slotOf = (player: GolfPlayer, raw: Record<string, unknown>): number => {
  const slot = typeof raw.slot === 'number' && Number.isInteger(raw.slot) ? raw.slot : 0
  const power = player.powers[slot]
  if (!power || !GOLF_POWERS.has(power)) throw conflict(PLAY_ERRORS.noPower)

  return slot
}

/**
 * Play a power from the hand
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body: slot, point for a laid power, target for a swap
 * @return {Promise<EngineStep>} - Step
 */

export const playPower = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withGolf(session, async (table) => {
    const player = requireBall(table, accountId)
    const slot = slotOf(player, raw)
    const power = player.powers[slot] as GolfPowerName
    const { target } = GOLF_POWERS.get(power)
    const { until, shots } = lastingOf(power, table.now.getTime())
    const effect = { power, from: accountId, until, shots }

    // Others still playing the hole
    const others = presentPlayers(table).filter(
      (other) => other.id !== player.id && !isHoleDone(other, strokeCeiling(table.settings))
    )
    // The whole course freezes from the ball
    if (power === GolfPowers.Ice) await layPower(table, player, power, { x: player.x, z: player.z })
    else if (target === GolfPowerTargets.Place) {
      await layPower(table, player, power, readSpot(table, raw))
    } else if (target === GolfPowerTargets.Player) await swap(table, player, others, raw)
    else if (power === GolfPowers.Fart) await scatter(table, others)
    else {
      const touched = { self: [player], others, all: [player, ...others] }[target]
      await castOn(table, touched, effect)
    }

    // Hand only, the swap wrote the spot
    await table.tx.golfPlayer.update({
      where: { id: player.id },
      data: { powers: player.powers.filter((_, index) => index !== slot) },
    })
    await table.tx.golfMove.create({
      data: { sessionId: session.id, accountId, kind: 'POWER', hole: table.game.hole, power },
    })
    await table.tx.golfGame.update({
      where: { sessionId: table.game.sessionId },
      data: { rev: { increment: 1 } },
    })

    return boardStep(table.game.endsAt)
  })
