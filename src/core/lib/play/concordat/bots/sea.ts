import { sailRefusal } from '@/core/lib/play/concordat/navy'
import { tileNoise } from '@/core/lib/play/concordat/sim/rng'
import { isOpenTarget } from '@/core/lib/play/concordat/bots/view'
import type { ConcordatBotContext } from '@/core/lib/play/concordat/bots/view'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

const { bots, navy } = CONCORDAT

// Share of the troops a landing carries
const LANDING_PERCENT = 40

/**
 * A landing for a nation with no land to take: free shore or an open rival, from any own coast
 * @param {ConcordatBotContext} context - Decision
 * @return {ConcordatIntent[]} - Commands
 */

export const seaMoves = (context: ConcordatBotContext): ConcordatIntent[] => {
  const { state, profile, view, isCaretaker } = context
  if (isCaretaker || !profile.sails || view.freeContact || view.neighbours.length) return []

  const playerId = view.me.id
  const [home] = state.players[playerId - 1].front
  if (home === undefined) return []

  const { width, height, terrain } = state.map
  const cx = home % width
  const cy = Math.floor(home / width)
  const range = navy.sailRange

  for (let sample = 0; sample < bots.samples; sample++) {
    const seed = playerId * 6007 + sample
    const x = Math.min(
      width - 1,
      Math.max(0, cx + Math.round((tileNoise(seed, state.tick) - 0.5) * 2 * range))
    )
    const y = Math.min(
      height - 1,
      Math.max(0, cy + Math.round((tileNoise(seed + 71, state.tick) - 0.5) * 2 * range))
    )
    const tile = y * width + x
    const holder = state.owner[tile]
    if (terrain[tile] === ConcordatTerrains.Sea || holder === playerId) continue
    if (holder && !isOpenTarget(state, playerId, holder)) continue

    const move: ConcordatIntent = {
      kind: 'sail',
      playerId,
      tile,
      percent: LANDING_PERCENT,
    }
    if (!sailRefusal(state, move)) return [move]
  }

  return []
}
