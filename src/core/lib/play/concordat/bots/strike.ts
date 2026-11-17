import { intentRefusal } from '@/core/lib/play/concordat/sim/intents'
import { silosOf } from '@/core/lib/play/concordat/weapons/rules'
import { isOpenTarget } from '@/core/lib/play/concordat/bots/view'
import type { ConcordatBotContext } from '@/core/lib/play/concordat/bots/view'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent } from '@/types/concordat'
import { ConcordatBotLevels } from '@/utils/constants/concordat'

const { bots, weapons } = CONCORDAT

// Border tile of a rival picked by a roll between 0 and 1
const borderTileOf = (front: Set<number>, roll: number): number => {
  let remaining = Math.floor(roll * front.size)
  for (const tile of front) {
    if (remaining-- <= 0) return tile
  }

  return -1
}

/**
 * A missile on the border of the strongest rival, once the bot is rich and has a silo ready
 * @param {ConcordatBotContext} context - Decision
 * @return {ConcordatIntent[]} - Commands
 */

export const strikeMoves = (context: ConcordatBotContext): ConcordatIntent[] => {
  const { state, profile, view, isCaretaker, roll } = context
  if (isCaretaker || profile.level === ConcordatBotLevels.Recruit) return []
  if (view.me.gold < weapons.missileCost * bots.strike.goldRatio) return []
  if (state.arms[view.me.id - 1].missiles < 1) return []
  if (roll(17) > bots.strike.chance * Math.min(1.5, profile.aggression)) return []

  const silo = silosOf(state, view.me.id)[0]
  if (!silo) return []

  const rivals = view.neighbours
    .filter(({ id }) => isOpenTarget(state, view.me.id, id))
    .toSorted(
      (first, second) => state.players[second.id - 1].troops - state.players[first.id - 1].troops
    )
  for (const { id } of rivals.slice(0, 2)) {
    const front = state.players[id - 1].front
    if (!front.size) continue

    for (let sample = 0; sample < bots.strike.samples; sample++) {
      const tile = borderTileOf(front, roll(31 + sample))
      const move: ConcordatIntent = {
        kind: 'launch',
        playerId: view.me.id,
        silo: silo.id,
        tile,
        heavy: false,
      }
      if (tile >= 0 && !intentRefusal(state, move)) return [move]
    }
  }

  return []
}
