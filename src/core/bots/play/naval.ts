import 'server-only'

import { latest, pauseAfter } from '@/core/bots/play/random'
import { chooseSquare, indexOf, randomFleet } from '@/core/lib/play/naval'
import type { NavalKnowledge } from '@/core/lib/play/naval'
import type { NavalBoardView } from '@/core/lib/play/naval/state'
import { shotsToward, sunkToward } from '@/core/lib/play/naval/state'
import { PLAY_BOT_SETTINGS } from '@/declarations/play/bots'
import type { PlayBotStrategy } from '@/types/play'
import { NavalPhases } from '@/utils/constants/play'

/**
 * What a bot knows about one enemy sea
 * @param {NavalBoardView} board - Board seen by the bot
 * @param {number} matchIndex - Match
 * @param {number} target - Target captain
 * @return {NavalKnowledge} - Knowledge
 */

const knowledgeOf = (board: NavalBoardView, matchIndex: number, target: number): NavalKnowledge => {
  const { size, fleet } = board.sea
  const shots = shotsToward(board, matchIndex, target)
  const sunk = sunkToward(board, matchIndex, target)
  const sunkCells = new Set(
    sunk.flatMap((ship) =>
      Array.from({ length: ship.length }, (_, step) =>
        indexOf(
          ship.x + (ship.isHorizontal ? step : 0),
          ship.y + (ship.isHorizontal ? 0 : step),
          size
        )
      )
    )
  )
  const remaining = [...fleet]
  for (const ship of sunk) remaining.splice(remaining.indexOf(ship.length), 1)

  return {
    size,
    fired: new Set(shots.map(([x, y]) => indexOf(x, y, size))),
    wounds: new Set(
      shots
        .filter(([, , code]) => code > 0)
        .map(([x, y]) => indexOf(x, y, size))
        .filter((cell) => !sunkCells.has(cell))
    ),
    remaining,
  }
}

/**
 * Naval bot: lays a fleet, then fires
 * @type {PlayBotStrategy}
 */

export const NAVAL_BOT: PlayBotStrategy = {
  decide: async ({ botId, level, view, now }) => {
    const board = view as NavalBoardView
    const me = board.players.findIndex((player) => player.accountId === botId)
    if (me < 0 || board.phase === NavalPhases.Over) return null
    const think = PLAY_BOT_SETTINGS.naval.thinkMs

    // Placement
    if (board.phase === NavalPhases.Placement) {
      if (board.you?.isReady) return null

      return {
        key: 'fleet',
        raw: {
          type: 'fleet',
          ships: randomFleet({ ...board.sea, isSpaced: board.settings.rules.spacedShips }),
        },
        at: pauseAfter(now, think),
      }
    }

    // Battle, only on its own turn
    const match = board.matches.find((entry) => entry.status === 'LIVE' && entry.turn === me)
    if (!match) return null
    const matchIndex = board.matches.indexOf(match)
    const enemies = match.fighters.filter((index) => index !== me && !board.players[index].isOut)
    if (!enemies.length) return null

    // Enemy with a wound first, else the fewest ships
    const known = enemies.map((target) => ({
      target,
      knowledge: knowledgeOf(board, matchIndex, target),
    }))
    const pick = known.toSorted(
      (a, b) =>
        b.knowledge.wounds.size - a.knowledge.wounds.size ||
        a.knowledge.remaining.length - b.knowledge.remaining.length
    )[0]
    const square = chooseSquare({
      knowledge: pick.knowledge,
      level,
      mistakeRate: PLAY_BOT_SETTINGS.naval.mistakeRate[level],
    })
    if (square === null) return null
    const { size } = board.sea

    return {
      key: `fire:${board.rev}`,
      raw: {
        type: 'fire',
        target: board.players[pick.target].accountId,
        x: square % size,
        y: Math.floor(square / size),
      },
      at: pauseAfter(latest(now, new Date(match.readyAt), new Date(match.startsAt)), think),
    }
  },
}
