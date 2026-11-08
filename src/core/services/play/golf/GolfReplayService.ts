import 'server-only'

import type { GolfPlayer } from '@prisma/client'

import {
  isHoleDone,
  motionAt,
  runningShotOf,
  shotDuration,
  simulateShot,
  strokeCeiling,
} from '@/core/lib/play/golf'
import type {
  GolfBallInput,
  GolfBallMotion,
  GolfBallOutcome,
  GolfRunningShot,
  GolfShotResult,
} from '@/core/lib/play/golf'
import {
  asJson,
  effectsOf,
  hazardsOf,
  orbsOf,
  presentPlayers,
} from '@/core/services/play/golf/lookups'
import type { GolfTable, GolfTrack } from '@/core/services/play/golf/lookups'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

/**
 * Rolling ball picked up mid course
 * @typedef {Object} GolfRolling
 */

interface GolfRolling {
  player: GolfPlayer
  shot: GolfRunningShot & { accountId: string }
  x: number
  z: number
  motion: GolfBallMotion
}

/**
 * Strokes that may still roll, newest first
 * @param {GolfTable} table - Locked course
 * @return {Promise<(GolfRunningShot & { accountId: string })[]>} - Strokes
 */

const runningShots = async (table: GolfTable) => {
  const since = new Date(table.now.getTime() - GOLF_SETTINGS.physics.maxSeconds * 1000)
  const moves = await table.tx.golfMove.findMany({
    where: {
      sessionId: table.session.id,
      hole: table.game.hole,
      kind: 'SHOT',
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'desc' },
    select: { accountId: true, createdAt: true, path: true },
  })

  return moves.map((move) => ({
    accountId: move.accountId,
    at: move.createdAt.getTime(),
    track: move.path as unknown as GolfTrack,
  }))
}

/**
 * Balls rolling now, read off their tracks
 * @param {GolfTable} table - Locked course
 * @param {GolfPlayer[]} players - Fresh players
 * @param {(player: GolfPlayer) => boolean} isTouched - Balls the power reaches
 * @return {Promise<GolfRolling[]>} - Rolling balls
 */

const rollingBalls = async (
  table: GolfTable,
  players: GolfPlayer[],
  isTouched: (player: GolfPlayer) => boolean
): Promise<GolfRolling[]> => {
  const at = table.now.getTime()
  const candidates = players.filter(
    (player) =>
      player.restsAt.getTime() > at &&
      !(player.holedAt && player.holedAt.getTime() <= at) &&
      isTouched(player)
  )
  if (!candidates.length) return []
  const shots = await runningShots(table)

  return candidates.flatMap((player) => {
    const shot = runningShotOf(shots, player.accountId)
    const state = shot && motionAt(shot, player.accountId, at)

    return shot && state ? [{ player, shot, ...state }] : []
  })
}

/**
 * End of one replayed ball, its void penalty following the new end
 * @param {GolfTable} table - Locked course
 * @param {GolfRolling} ball - Replayed ball
 * @param {GolfBallOutcome} outcome - New end
 * @param {Object} timing - Stop and old news
 * @param {Date} timing.restsAt - Ball stops
 * @param {boolean} timing.fellBefore - Fall told before
 * @return {Promise<void>} - Written
 */

const writeBallEnd = async (
  { tx, session, game }: GolfTable,
  { player, shot }: GolfRolling,
  outcome: GolfBallOutcome,
  { restsAt, fellBefore }: { restsAt: Date; fellBefore: boolean }
): Promise<void> => {
  const isShooter = shot.accountId === player.accountId
  const penalty = isShooter
    ? (Number(outcome.hasFallen) - Number(fellBefore)) * GOLF_SETTINGS.voidPenalty
    : 0
  const updated = await tx.golfPlayer.update({
    where: { id: player.id },
    data: {
      x: outcome.x,
      z: outcome.z,
      restsAt,
      strokes: player.strokes + penalty,
      holedAt: outcome.isHoled ? restsAt : null,
    },
  })

  // Hole and fall told when it stops
  const landed = { sessionId: session.id, hole: game.hole, createdAt: restsAt }
  const { accountId } = player
  if (outcome.isHoled) {
    await tx.golfMove.create({
      data: { ...landed, accountId, kind: 'HOLED', strokes: updated.strokes },
    })
  }
  if (outcome.hasFallen) await tx.golfMove.create({ data: { ...landed, accountId, kind: 'FALL' } })
}

/**
 * Write the replayed ends and the replay track
 * @param {GolfTable} table - Locked course
 * @param {GolfRolling[]} rolling - Replayed balls
 * @param {GolfShotResult} result - Replay
 * @param {string} casterId - Power played by
 * @return {Promise<void>} - Written
 */

const writeReplay = async (
  table: GolfTable,
  rolling: GolfRolling[],
  result: GolfShotResult,
  casterId: string
): Promise<void> => {
  const { tx, now, session, game } = table
  const restsAt = new Date(now.getTime() + shotDuration(result))
  // News still ahead are told again
  const ahead = await tx.golfMove.findMany({
    where: {
      sessionId: session.id,
      accountId: { in: Object.keys(result.outcomes) },
      kind: { in: ['HOLED', 'FALL'] },
      createdAt: { gt: now },
    },
  })
  await tx.golfMove.deleteMany({ where: { id: { in: ahead.map((move) => move.id) } } })
  for (const ball of rolling) {
    const outcome = result.outcomes[ball.player.accountId]
    if (!outcome) continue
    const fellBefore = ahead.some(
      (move) => move.kind === 'FALL' && move.accountId === ball.player.accountId
    )
    await writeBallEnd(table, ball, outcome, { restsAt, fellBefore })
  }

  const track: GolfTrack = {
    frameMs: result.frameMs,
    frames: result.frames,
    paths: result.paths,
    events: result.events,
    flashId: null,
    replay: true,
  }
  await tx.golfMove.create({
    data: {
      sessionId: session.id,
      hole: game.hole,
      createdAt: now,
      accountId: casterId,
      kind: 'SHOT',
      path: asJson(track),
    },
  })
}

/**
 * Replay every ball a malus reaches while it rolls, from where it is now
 * @param {GolfTable} table - Locked course
 * @param {string} casterId - Power played by
 * @param {Object} [reach] - Balls reached
 * @param {(player: GolfPlayer) => boolean} [reach.isTouched] - Ball reached
 * @param {(player: GolfPlayer) => { x: number, z: number }} [reach.moveTo] - Pushed spot
 * @return {Promise<GolfPlayer[]>} - Players afterwards
 */

export const replayRolling = async (
  table: GolfTable,
  casterId: string,
  {
    isTouched = () => true,
    moveTo,
  }: {
    isTouched?: (player: GolfPlayer) => boolean
    moveTo?: (player: GolfPlayer) => { x: number; z: number }
  } = {}
): Promise<GolfPlayer[]> => {
  const { tx, now, game, session } = table
  const at = now.getTime()
  const players = await tx.golfPlayer.findMany({ where: { sessionId: session.id } })
  const fresh = { ...table, players }
  const rolling = await rollingBalls(fresh, presentPlayers(fresh), isTouched)
  if (!rolling.length) return players
  const rollingIds = new Set(rolling.map((ball) => ball.player.accountId))
  const ceiling = strokeCeiling(table.settings)

  // Rolling balls from their spot, resting ones as obstacles
  const balls: GolfBallInput[] = [
    ...rolling.map((ball) => ({
      id: ball.player.accountId,
      ...(moveTo ? moveTo({ ...ball.player, x: ball.x, z: ball.z }) : { x: ball.x, z: ball.z }),
      effects: effectsOf(ball.player.effects),
      canPick: false,
    })),
    ...presentPlayers(fresh)
      .filter(
        (player) =>
          !rollingIds.has(player.accountId) &&
          player.strokes > 0 &&
          !isHoleDone(player, ceiling) &&
          player.restsAt.getTime() <= at
      )
      .map((player) => ({
        id: player.accountId,
        x: player.x,
        z: player.z,
        effects: effectsOf(player.effects),
        canPick: false,
      })),
  ]
  const fromGame = await tx.golfGame.findUnique({ where: { sessionId: session.id } })
  const result = simulateShot({
    hole: table.hole,
    at,
    holeStart: game.startsAt.getTime(),
    shooterId: '',
    angle: 0,
    power: 0,
    balls,
    hazards: hazardsOf(fromGame?.hazards ?? game.hazards),
    orbs: orbsOf(fromGame?.orbs ?? game.orbs),
    collisions: table.settings.collisions,
    motions: Object.fromEntries(rolling.map((ball) => [ball.player.accountId, ball.motion])),
  })
  await writeReplay(fresh, rolling, result, casterId)

  return tx.golfPlayer.findMany({ where: { sessionId: session.id }, orderBy: { id: 'asc' } })
}
