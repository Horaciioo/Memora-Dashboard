import 'server-only'

import { latest, noise, pauseAfter } from '@/core/bots/play/random'
import {
  canTeleportTo,
  cupPoints,
  holeFor,
  holesOf,
  simulateShot,
  teleportReach,
} from '@/core/lib/play/golf'
import type { GolfHole, GolfShotInput } from '@/core/lib/play/golf'
import type { golfBotView } from '@/core/services/play/golf/GolfViewService'
import { PLAY_BOT_SETTINGS } from '@/declarations/play/bots'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPhases, GolfPowers } from '@/utils/constants/play'
import type { PlayBotKindName } from '@/utils/constants/play'
import type { PlayBotStrategy } from '@/types/play'

type GolfBoardView = Awaited<ReturnType<typeof golfBotView>>

// Aim searched around the cup line
const SPREAD = Math.PI / 2

// Cost of a ball lost
const FALL_COST = 1000

/**
 * Give the event loop back
 * @return {Promise<void>} - Resumed
 */

const breathe = (): Promise<void> => new Promise((resolve) => setImmediate(resolve))

// Shot tried by the bot
interface GolfAim {
  angle: number
  power: number
}

/**
 * Distance left after a shot
 * @param {Omit<GolfShotInput, 'angle' | 'power'>} input - Shot without aim
 * @param {GolfAim} aim - Aim tried
 * @return {number} - Cost, lower is better
 */

const costOf = (input: Omit<GolfShotInput, 'angle' | 'power'>, aim: GolfAim): number => {
  const outcome = simulateShot({ ...input, ...aim, isProbe: true }).outcomes[input.shooterId]
  if (!outcome) return FALL_COST
  // Richer holes first on a scoring hole
  if (outcome.isHoled) return -1 - cupPoints(input.hole, outcome.x, outcome.z)
  if (outcome.hasFallen) return FALL_COST
  const [targetX, targetZ] = targetOf(input.hole)

  return Math.hypot(outcome.x - targetX, outcome.z - targetZ)
}

/**
 * Spot a bot aims for: the richest hole, the cup otherwise
 * @param {GolfHole} hole - Hole
 * @return {[number, number]} - Spot
 */

const targetOf = (hole: GolfHole): [number, number] => {
  const best = hole.cups.reduce((top, spot) => (spot.points > top.points ? spot : top))

  return hole.isScoring ? [best.x, best.z] : [hole.cup[0], hole.cup[1]]
}

// Best aim so far and its cost
interface GolfPick {
  aim: GolfAim
  cost: number
}

/**
 * Aims of a coarse grid toward the cup, the straight line included
 * @param {number} straight - Angle to the target
 * @return {GolfAim[][]} - Rows of aims
 */

const coarseGrid = (straight: number): GolfAim[][] => {
  const { candidates } = PLAY_BOT_SETTINGS.golf
  // Odd count, the straight line included
  const side = Math.max(1, Math.round(Math.sqrt(candidates) / 2))
  const powers = Math.max(2, Math.round(candidates / (side * 2 + 1)))
  // Straight row first, the likeliest
  const rows = Array.from({ length: side * 2 + 1 }, (_, index) => index - side).sort(
    (left, right) => Math.abs(left) - Math.abs(right)
  )

  return rows.map((row) =>
    Array.from({ length: powers }, (_, column) => ({
      angle: straight + (SPREAD * row) / side,
      power: (column + 1) / powers,
    }))
  )
}

/**
 * Finer aims around the best coarse one
 * @param {GolfAim} aim - Best coarse aim
 * @return {GolfAim[]} - Aims
 */

const fineAround = (aim: GolfAim): GolfAim[] => {
  const { candidates, refine } = PLAY_BOT_SETTINGS.golf
  const side = Math.max(1, Math.round(Math.sqrt(candidates) / 2))
  // Half a coarse step each way
  const angleStep = SPREAD / side / 2
  const powerStep = 1 / Math.max(2, Math.round(candidates / (side * 2 + 1))) / 2

  return Array.from({ length: refine }, (_, index) => {
    const turn = (index / Math.max(1, refine)) * 2 * Math.PI
    const reach = index % 2 === 0 ? 1 : 0.5

    return {
      angle: aim.angle + Math.cos(turn) * angleStep * reach,
      power: Math.min(1, Math.max(0.02, aim.power + Math.sin(turn) * powerStep * reach)),
    }
  })
}

/**
 * Keep the cheaper of an aim and the best so far
 * @param {Omit<GolfShotInput, 'angle' | 'power'>} input - Shot without aim
 * @param {GolfPick} best - Best so far
 * @param {GolfAim} aim - Aim tried
 * @return {GolfPick} - Best afterwards
 */

const tryAim = (
  input: Omit<GolfShotInput, 'angle' | 'power'>,
  best: GolfPick,
  aim: GolfAim
): GolfPick => {
  const cost = costOf(input, aim)

  return cost < best.cost ? { aim, cost } : best
}

/**
 * Best aim toward the cup: a coarse grid, then finer around the best, within a time cap
 * @param {Omit<GolfShotInput, 'angle' | 'power'>} input - Shot without aim
 * @param {[number, number]} from - Ball spot
 * @return {Promise<GolfAim>} - Aim
 */

const searchAim = async (
  input: Omit<GolfShotInput, 'angle' | 'power'>,
  [x, z]: [number, number]
): Promise<GolfAim> => {
  const { searchMs } = PLAY_BOT_SETTINGS.golf
  const [targetX, targetZ] = targetOf(input.hole)
  const straight = Math.atan2(targetX - x, targetZ - z)
  const stopAt = performance.now() + searchMs
  // Any cup ends a plain hole
  const isDone = (pick: GolfPick) => pick.cost < 0 && !input.hole.isScoring

  let best: GolfPick = { aim: { angle: straight, power: 0.5 }, cost: Infinity }
  for (const row of coarseGrid(straight)) {
    // Other requests between rows
    await breathe()
    for (const aim of row) {
      best = tryAim(input, best, aim)
      if (isDone(best)) return best.aim
    }
    if (performance.now() > stopAt) return best.aim
  }

  await breathe()
  for (const aim of fineAround(best.aim)) {
    best = tryAim(input, best, aim)
    if (isDone(best) || performance.now() > stopAt) break
  }

  return best.aim
}

/**
 * Shot of a ball on the course it sees
 * @param {GolfBoardView} board - Board
 * @param {GolfBoardView['players'][number]} me - Bot ball
 * @return {Promise<GolfAim>} - Clean aim
 */

const aimFor = (board: GolfBoardView, me: GolfBoardView['players'][number]): Promise<GolfAim> => {
  const hole: GolfHole = holeFor(holesOf(board.settings)[board.hole], board.settings)

  return searchAim(
    {
      hole,
      at: Date.now(),
      holeStart: new Date(board.startsAt).getTime(),
      shooterId: me.accountId,
      balls: [{ id: me.accountId, x: me.x, z: me.z, effects: me.effects, canPick: false }],
      hazards: board.hazards,
      orbs: board.orbs,
      collisions: board.settings.collisions,
    },
    [me.x, me.z]
  )
}

// Steps tried along the line to the cup
const TELEPORT_STEPS = 12

// Other ball this close makes a bumper ball worth it
const BUMPER_NEAR = 1.5

/**
 * Teleport spot nearest the cup within the square
 * @param {GolfHole} hole - Hole
 * @param {{ x: number, z: number }} me - Bot ball
 * @return {{ x: number, z: number } | null} - Spot
 */

const teleportSpot = (hole: GolfHole, me: { x: number; z: number }) => {
  const reach = teleportReach()
  const [cx, cz] = targetOf(hole)
  for (let step = TELEPORT_STEPS; step > 0; step -= 1) {
    const share = step / TELEPORT_STEPS
    const spot = {
      x: me.x + Math.max(-reach, Math.min(reach, (cx - me.x) * share)),
      z: me.z + Math.max(-reach, Math.min(reach, (cz - me.z) * share)),
    }
    if (canTeleportTo(hole, me, spot)) return spot
  }

  return null
}

/**
 * Power worth playing now: teleport toward the cup, bumper ball with balls around
 * @param {GolfBoardView} board - Board
 * @param {GolfBoardView['players'][number]} me - Bot ball
 * @return {Record<string, unknown> | null} - Power action
 */

const powerFor = (board: GolfBoardView, me: GolfBoardView['players'][number]) => {
  if (!me.hand?.length) return null
  const hole: GolfHole = holeFor(holesOf(board.settings)[board.hole], board.settings)
  const teleport = me.hand.indexOf(GolfPowers.Teleport)
  if (teleport >= 0) {
    const spot = teleportSpot(hole, me)
    if (spot) return { type: 'power', slot: teleport, ...spot }
  }
  const bumper = me.hand.findIndex(
    (power) => power === GolfPowers.BumperMan || power === GolfPowers.BoingBoing
  )
  const isCrowded = board.players.some(
    (other) =>
      other.accountId !== me.accountId &&
      !other.isDone &&
      Math.hypot(other.x - me.x, other.z - me.z) < BUMPER_NEAR
  )
  if (bumper >= 0 && isCrowded && board.settings.collisions) return { type: 'power', slot: bumper }

  return null
}

/**
 * Stroke body, searched when played
 * @param {GolfBoardView} board - Board
 * @param {GolfBoardView['players'][number]} me - Bot ball
 * @param {PlayBotKindName} level - Bot level
 * @return {Promise<Record<string, unknown>>} - Action body
 */

const shotBody = async (
  board: GolfBoardView,
  me: GolfBoardView['players'][number],
  level: PlayBotKindName
) => {
  const { angleNoise, powerNoise } = PLAY_BOT_SETTINGS.golf
  const aim = await aimFor(board, me)
  // Hand noise by level
  const power = aim.power * (1 + noise(powerNoise[level]))

  return {
    type: 'shot',
    angle: aim.angle + noise(angleNoise[level]),
    power: Math.min(1, Math.max(GOLF_SETTINGS.physics.minPower * 2, power)),
  }
}

/**
 * Golf bot, aim with a shaky hand
 * @type {PlayBotStrategy}
 */

export const GOLF_BOT: PlayBotStrategy = {
  decide: async ({ botId, level, view, now }) => {
    const board = view as GolfBoardView
    if (board.phase !== GolfPhases.Countdown && board.phase !== GolfPhases.Playing) return null
    const me = board.players.find((player) => player.accountId === botId)
    if (!me || me.isDone) return null
    const { thinkMs } = PLAY_BOT_SETTINGS.golf
    const at = latest(now, new Date(board.startsAt), new Date(me.restsAt))
    // Powers before the stroke, ball at rest
    const cast = board.phase === GolfPhases.Playing ? powerFor(board, me) : null
    if (cast) {
      return {
        key: `power:${board.hole}:${me.strokes}:${me.hand.join()}:${me.restsAt}`,
        raw: cast,
        at: pauseAfter(at, thinkMs),
      }
    }
    return {
      key: `shot:${board.hole}:${me.strokes}:${me.restsAt}`,
      raw: () => shotBody(board, me, level),
      at: pauseAfter(at, thinkMs),
    }
  },
}
