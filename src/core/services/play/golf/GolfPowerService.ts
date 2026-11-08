import 'server-only'

import { randomUUID } from 'node:crypto'

import type { GolfPlayer } from '@prisma/client'

import { conflict, invalidInput } from '@/core/lib/errors'
import {
  addToHand,
  armingOf,
  canPlaceAt,
  canTeleportTo,
  drawPool,
  drawPower,
  handSize,
  standingShare,
  isEffectKept,
  isHoleDone,
  malusWeight,
  scatterSpot,
  withEffect,
  strokeCeiling,
} from '@/core/lib/play/golf'
import type { GolfArming, GolfEffect, GolfHazard, GolfShotResult } from '@/core/lib/play/golf'
import { replayRolling } from '@/core/services/play/golf/GolfReplayService'
import { boardStep, closeHole } from '@/core/services/play/golf/GolfTableService'
import {
  asJson,
  effectsOf,
  hazardsOf,
  isEveryoneDone,
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
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Lasting part of a power, from the settings
 * @param {GolfPowerName} power - Power
 * @param {number} at - Server ms
 * @return {Pick<GolfEffect, 'until' | 'shots'> & { lives?: number }} - Duration
 */

const lastingOf = (power: GolfPowerName, at: number) => {
  const tuning = GOLF_SETTINGS.powers[power] as Partial<
    Record<'seconds' | 'shots' | 'lives' | 'bounces', number>
  >

  return {
    until: tuning.seconds === undefined ? undefined : at + tuning.seconds * SECOND_MS,
    shots: tuning.shots,
    // Boing Boing shares its bounces as lives
    lives: tuning.lives ?? tuning.bounces,
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
  const pool = drawPool(table.settings)
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
                player.powers.filter((power) => GOLF_POWERS.has(power)),
                drawPower(
                  pool,
                  standingShare(totals, totalOf(player)),
                  Math.random(),
                  malusWeight(table.settings)
                ),
                handSize(table.settings)
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
 * Ball moved to a spot near it, no stroke counted
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer} player - Player
 * @param {Record<string, unknown>} raw - Body
 * @return {Promise<void>} - Moved
 */

const teleport = async (table: GolfTable, player: GolfPlayer, raw: Record<string, unknown>) => {
  if (player.restsAt.getTime() > table.now.getTime()) throw conflict(PLAY_ERRORS.ballRolling)
  const spot = { x: Number(raw.x), z: Number(raw.z) }
  if (!canTeleportTo(table.hole, player, spot)) {
    throw invalidInput([{ field: 'x', message: PLAY_ERRORS.badTeleport }], PLAY_ERRORS.badTeleport)
  }
  await table.tx.golfPlayer.update({ where: { id: player.id }, data: spot })
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
 * @param {Object} laid - Power laid
 * @param {GolfPowerName} laid.power - Power
 * @param {{ x: number, z: number }} laid.spot - Where it lands
 * @param {GolfArming} [laid.armsOn] - Waits for the ball to stop
 * @return {Promise<void>} - Laid
 */

const layPower = async (
  table: GolfTable,
  player: GolfPlayer,
  {
    power,
    spot,
    armsOn,
  }: { power: GolfPowerName; spot: { x: number; z: number }; armsOn?: GolfArming }
): Promise<void> => {
  const at = table.now.getTime()
  const startsAt = armsOn && 'at' in armsOn ? armsOn.at : at
  const hazards: GolfHazard[] = [
    ...hazardsOf(table.game.hazards).filter(
      (hazard) => isEffectKept(hazard, at) && (power !== GolfPowers.Ice || hazard.power !== power)
    ),
    {
      id: randomUUID(),
      power,
      ownerId: player.accountId,
      ...spot,
      ...lastingOf(power, startsAt),
      laidAt: startsAt,
      ...motionOf(player, power, spot),
      ...(armsOn && { armsOn }),
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
 * Balls a rolling malus reaches, a cloud pushing them aside
 * @param {GolfTable} table - Locked course
 * @param {string} casterId - Power played by
 * @param {GolfPowerName} power - Power
 * @return {Parameters<typeof replayRolling>[2]} - Reach
 */

const rollingReach = (
  table: GolfTable,
  casterId: string,
  power: GolfPowerName
): Parameters<typeof replayRolling>[2] => {
  const isOther = (player: GolfPlayer) => player.accountId !== casterId
  if (power === GolfPowers.Fart) {
    return { isTouched: isOther, moveTo: (player) => scatterSpot(table.hole, player.x, player.z) }
  }
  const spares = power === GolfPowers.Tornado || power === GolfPowers.Gust

  return { isTouched: spares ? isOther : () => true }
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
 * Cast context of the player, refused on the last hole for a bonus
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer} player - Player
 * @param {GolfPowerName} power - Power
 * @return {GolfArming | undefined} - Arming, none when it acts now
 */

const armingFor = (table: GolfTable, player: GolfPlayer, power: GolfPowerName) => {
  const isDone = isHoleDone(player, strokeCeiling(table.settings))
  const outcome = armingOf(power, {
    at: table.now.getTime(),
    restsAt: player.restsAt.getTime(),
    isDone,
    hole: table.game.hole,
    holes: table.holes,
  })
  if (outcome.kind === 'refused') throw conflict(PLAY_ERRORS.lastHoleBonus)
  const armsOn = outcome.kind === 'armed' ? outcome.armsOn : undefined
  // A spot belongs to this hole
  if (armsOn && 'hole' in armsOn && GOLF_POWERS.get(power).target === GolfPowerTargets.Place) {
    throw conflict(PLAY_ERRORS.laidBonusDone)
  }

  return armsOn
}

// Malus that change a rolling ball's course
const ROLLING_POWERS = new Set<GolfPowerName>([
  GolfPowers.Tornado,
  GolfPowers.Sticky,
  GolfPowers.Ice,
  GolfPowers.Gust,
  GolfPowers.Fart,
])

/**
 * Apply a power to the course or the balls
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer} player - Player
 * @param {GolfPowerName} power - Power
 * @param {Record<string, unknown>} raw - Body
 * @return {Promise<void>} - Applied
 */

const applyPower = async (
  table: GolfTable,
  player: GolfPlayer,
  power: GolfPowerName,
  raw: Record<string, unknown>
): Promise<void> => {
  const at = table.now.getTime()
  const armsOn = armingFor(table, player, power)
  const startsAt = armsOn && 'at' in armsOn ? armsOn.at : at
  const { target } = GOLF_POWERS.get(power)
  const effect: GolfEffect = {
    power,
    from: player.accountId,
    ...lastingOf(power, startsAt),
    castAt: startsAt,
    ...(armsOn && { armsOn }),
  }
  // Others still playing the hole
  const others = presentPlayers(table).filter(
    (other) => other.id !== player.id && !isHoleDone(other, strokeCeiling(table.settings))
  )

  if (power === GolfPowers.Teleport) return teleport(table, player, raw)
  // The whole course freezes from the ball
  if (power === GolfPowers.Ice) {
    return layPower(table, player, { power, spot: { x: player.x, z: player.z } })
  }
  if (target === GolfPowerTargets.Place) {
    return layPower(table, player, { power, spot: readSpot(table, raw), armsOn })
  }
  if (power === GolfPowers.Fart) return scatter(table, others)
  const touched = { self: [player], others, all: [player, ...others] }[target]
  await castOn(table, touched, effect)
}

/**
 * Play a power from the hand
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body: slot, point for a laid power
 * @return {Promise<EngineStep>} - Step
 */

export const playPower = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withGolf(session, async (table) => {
    const player = requireBall(table, accountId, true)
    const slot = slotOf(player, raw)
    const power = player.powers[slot] as GolfPowerName
    await applyPower(table, player, power, raw)

    // Hand, journal, then rolling balls replayed
    await table.tx.golfPlayer.update({
      where: { id: player.id },
      data: { powers: player.powers.filter((_, index) => index !== slot) },
    })
    await table.tx.golfMove.create({
      data: { sessionId: session.id, accountId, kind: 'POWER', hole: table.game.hole, power },
    })
    const players = ROLLING_POWERS.has(power)
      ? await replayRolling(table, accountId, rollingReach(table, accountId, power))
      : table.players
    await table.tx.golfGame.update({
      where: { sessionId: table.game.sessionId },
      data: { rev: { increment: 1 } },
    })
    const after = { ...table, players }

    return isEveryoneDone(after) ? closeHole(after) : boardStep(table.game.endsAt)
  })
