import 'server-only'

import { latest, noise, pauseAfter } from '@/core/bots/play/random'
import { holeFor, holesOf, simulateShot } from '@/core/lib/play/golf'
import type { GolfHole, GolfShotInput } from '@/core/lib/play/golf'
import type { golfView } from '@/core/services/play/golf/GolfViewService'
import { PLAY_BOT_SETTINGS } from '@/declarations/play/bots'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPhases } from '@/utils/constants/play'
import type { PlayBotStrategy } from '@/types/play'

type GolfBoardView = Awaited<ReturnType<typeof golfView>>

// Aim searched around the cup line
const SPREAD = Math.PI / 2

// Cost of a ball lost
const FALL_COST = 1000

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
  const outcome = simulateShot({ ...input, ...aim }).outcomes[input.shooterId]
  if (!outcome) return FALL_COST
  if (outcome.isHoled) return -1
  if (outcome.hasFallen) return FALL_COST

  return Math.hypot(outcome.x - input.hole.cup[0], outcome.z - input.hole.cup[1])
}

/**
 * Best aim of a grid toward the cup
 * @param {Omit<GolfShotInput, 'angle' | 'power'>} input - Shot without aim
 * @param {[number, number]} from - Ball spot
 * @return {GolfAim} - Aim
 */

const searchAim = (
  input: Omit<GolfShotInput, 'angle' | 'power'>,
  [x, z]: [number, number]
): GolfAim => {
  const { candidates } = PLAY_BOT_SETTINGS.golf
  const straight = Math.atan2(input.hole.cup[0] - x, input.hole.cup[1] - z)
  // Odd count, the straight line included
  const side = Math.max(1, Math.round(Math.sqrt(candidates) / 2))
  const powers = Math.max(2, Math.round(candidates / (side * 2 + 1)))

  // Grid of angles and pulls
  let best = { aim: { angle: straight, power: 0.5 }, cost: Infinity }
  for (let row = -side; row <= side; row += 1) {
    const angle = straight + (SPREAD * row) / side
    for (let column = 1; column <= powers; column += 1) {
      const aim = { angle, power: column / powers }
      const cost = costOf(input, aim)
      if (cost < best.cost) best = { aim, cost }
    }
  }

  return best.aim
}

/**
 * Shot of a ball on the course it sees
 * @param {GolfBoardView} board - Board
 * @param {string} botId - Bot
 * @param {Date} now - Clock
 * @return {GolfAim | null} - Clean aim
 */

const aimFor = (board: GolfBoardView, botId: string, now: Date): GolfAim | null => {
  const me = board.players.find((player) => player.accountId === botId)
  if (!me) return null
  const hole: GolfHole = holeFor(holesOf(board.settings)[board.hole], board.settings)

  return searchAim(
    {
      hole,
      at: now.getTime(),
      holeStart: new Date(board.startsAt).getTime(),
      shooterId: botId,
      balls: [{ id: botId, x: me.x, z: me.z, effects: me.effects, canPick: false }],
      hazards: board.hazards,
      orbs: board.orbs,
      collisions: board.settings.collisions,
    },
    [me.x, me.z]
  )
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
    const aim = aimFor(board, botId, now)
    if (!aim) return null

    // Hand noise by level
    const { angleNoise, powerNoise, thinkMs } = PLAY_BOT_SETTINGS.golf
    const power = aim.power * (1 + noise(powerNoise[level]))
    const at = latest(now, new Date(board.startsAt), new Date(me.restsAt))

    return {
      key: `shot:${board.hole}:${me.strokes}`,
      raw: {
        type: 'shot',
        angle: aim.angle + noise(angleNoise[level]),
        power: Math.min(1, Math.max(GOLF_SETTINGS.physics.minPower * 2, power)),
      },
      at: pauseAfter(at, thinkMs),
    }
  },
}
