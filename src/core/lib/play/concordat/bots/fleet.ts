import { fleetOf, seaPath } from '@/core/lib/play/concordat/navy'
import { intentRefusal } from '@/core/lib/play/concordat/sim/intents'
import { isOpenTarget } from '@/core/lib/play/concordat/bots/view'
import type { ConcordatBotContext } from '@/core/lib/play/concordat/bots/view'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import { ConcordatShipKinds, ConcordatTerrains } from '@/utils/constants/concordat'

const { bots, navy } = CONCORDAT

// Reach of a patrol around a nation's start
const PATROL_RANGE = 30

// One leg of a patrol: reach and tries
const LEG_RANGE = 14
const LEG_SAMPLES = 4
const LEG_SEARCH = 600

// Share of decisions that look at the fleet
const FLEET_CHANCE = 0.3

// Sea tile near a start, -1 when none was found
const seaNear = (
  state: ConcordatState,
  start: number,
  roll: (salt: number) => number,
  range = PATROL_RANGE
): number => {
  const { width, height, terrain } = state.map
  const cx = start % width
  const cy = Math.floor(start / width)

  for (let sample = 0; sample < bots.samples; sample++) {
    const x = Math.min(
      width - 1,
      Math.max(0, cx + Math.round((roll(41 + sample) - 0.5) * 2 * range))
    )
    const y = Math.min(
      height - 1,
      Math.max(0, cy + Math.round((roll(97 + sample) - 0.5) * 2 * range))
    )
    if (terrain[y * width + x] === ConcordatTerrains.Sea) return y * width + x
  }

  return -1
}

// Start of a rival worth hunting, else the own start
const huntStart = (context: ConcordatBotContext): number => {
  const { state, view, roll } = context
  const rivals = state.players.filter(
    (player) => player.id !== view.me.id && isOpenTarget(state, view.me.id, player.id)
  )
  const rival = rivals[Math.floor(roll(7) * rivals.length)]

  return rival ? rival.start : view.me.start
}

/**
 * Fleet of a bot: buys a warship when rich, sends idle ones to patrol near rivals
 * @param {ConcordatBotContext} context - Decision
 * @return {ConcordatIntent[]} - Commands
 */

export const fleetMoves = (context: ConcordatBotContext): ConcordatIntent[] => {
  const { state, profile, view, isCaretaker, roll } = context
  // Sea searches are dear, a bot only thinks of its fleet now and then
  if (isCaretaker || !profile.warships || !CONCORDAT.features.navy) return []
  if (roll(61) > FLEET_CHANCE) return []

  const playerId = view.me.id
  const own = state.ships.filter(
    (ship) => ship.owner === playerId && ship.kind === ConcordatShipKinds.War
  )

  // Buy near a rival's coast, the ship takes the nearest own shore
  if (
    fleetOf(state, playerId) < profile.warships &&
    view.me.gold >= navy.warCost * (1 + bots.gold.spareShare)
  ) {
    const tile = seaNear(state, view.me.start, roll)
    const buy: ConcordatIntent = { kind: 'buildShip', playerId, tile }
    if (tile >= 0 && !intentRefusal(state, buy)) return [buy]
  }

  // An idle ship drifts toward a rival's waters, one short leg at a time
  const idle = own.find((ship) => !ship.path.length)
  if (!idle) return []

  const aim = huntStart(context)
  const { width } = state.map
  let tile = -1
  let best = Infinity
  for (let leg = 0; leg < LEG_SAMPLES; leg++) {
    const candidate = seaNear(state, idle.tile, (salt) => roll(salt + leg * 7), LEG_RANGE)
    // A bounded look first, a far lake would make the real search flood the ocean
    if (candidate >= 0 && !seaPath(state.map, [idle.tile], [candidate], LEG_SEARCH)) continue
    const distance =
      candidate < 0
        ? Infinity
        : Math.hypot(
            (candidate % width) - (aim % width),
            Math.floor(candidate / width) - Math.floor(aim / width)
          )
    if (distance < best) {
      best = distance
      tile = candidate
    }
  }
  const move: ConcordatIntent = { kind: 'moveShip', playerId, ship: idle.id, tile }

  return tile >= 0 && !intentRefusal(state, move) ? [move] : []
}
