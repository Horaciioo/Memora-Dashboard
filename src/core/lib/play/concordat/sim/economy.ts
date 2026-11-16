import { INCOME_SCALE, TICK_SECONDS } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatEffects, ConcordatPlayerState, ConcordatState } from '@/types/concordat'

const { sim } = CONCORDAT

/**
 * Troop ceiling of a nation, sublinear in its size
 * @param {ConcordatPlayerState} player - Nation
 * @return {number} - Ceiling
 */

export const troopCap = (player: ConcordatPlayerState, bonus = 0): number =>
  (sim.capBase + sim.capPerTile * player.tiles ** sim.capExponent + bonus) * player.capShare

/**
 * Output factor from civil calm, 1 at full stability
 * @param {ConcordatPlayerState} player - Nation
 * @return {number} - Factor
 */

export const calmFactor = (player: ConcordatPlayerState): number =>
  sim.stabilityFloorEffect + (1 - sim.stabilityFloorEffect) * (player.stability / 100)

/**
 * Gold paid to hold the land
 * @param {ConcordatPlayerState} player - Nation
 * @return {number} - Gold per second
 */

export const upkeepOf = (player: ConcordatPlayerState, cut = 0): number =>
  sim.upkeepPerTile * player.tiles * (1 + player.tiles / sim.upkeepScale) * (1 - Math.min(1, cut))

/**
 * Gold per second from the land alone, before buildings and trade
 * @param {ConcordatPlayerState} player - Nation
 * @return {number} - Gold per second
 */

export const grossOf = (player: ConcordatPlayerState): number =>
  player.income / INCOME_SCALE + player.provincesHeld * sim.provinceGold

// One nation for one tick, troops out in the field count against the ceiling
const grow = (
  player: ConcordatPlayerState,
  effects: ConcordatEffects,
  dt: number,
  committed: number
): void => {
  const cap = troopCap(player, effects.cap)
  const calm = calmFactor(player)

  // Troops climb to the ceiling, then melt back
  const total = player.troops + committed
  if (total > cap) {
    player.troops -= Math.min(player.troops, total * sim.overCapDecay * dt)
  } else {
    const slack = 1 - total / cap
    const rate =
      (sim.growthBase + sim.growthRate * player.troops) * (1 + effects.growth) * player.growthShare
    player.troops += rate * slack * calm * dt
  }

  // Gold earned minus upkeep
  const earned =
    (grossOf(player) + effects.gold + effects.trade) *
      calm *
      Math.max(0, effects.income) *
      player.goldShare -
    effects.malus
  const spent = upkeepOf(player, effects.upkeepCut) + effects.upkeep
  player.gold = Math.max(0, player.gold + (earned - spent) * dt)
  player.stability = Math.min(100, player.stability + (sim.stabilityRecovery + effects.calm) * dt)
}

/**
 * Economy phase of a tick
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runEconomy = (state: ConcordatState): void => {
  const dt = TICK_SECONDS * state.speed
  const out = new Float64Array(state.players.length + 1)
  for (const corps of state.corps) out[corps.owner] += corps.troops
  for (const player of state.players) {
    if (player.alive) grow(player, state.effects[player.id - 1], dt, out[player.id])
  }
}
