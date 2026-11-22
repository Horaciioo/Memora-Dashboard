import { INCOME_SCALE, TICK_SECONDS } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatEffects, ConcordatPlayerState, ConcordatState } from '@/types/concordat'

const { sim } = CONCORDAT

/**
 * Troop ceiling of a nation, sublinear in its size so a giant stays attackable
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
 * Gold per second from a flat base and the land, before buildings and trade
 * @param {ConcordatPlayerState} player - Nation
 * @return {number} - Gold per second
 */

export const grossOf = (player: ConcordatPlayerState): number =>
  sim.baseGold + sim.landGold * (player.income / INCOME_SCALE) ** sim.goldExponent

/**
 * Net troops per second, negative when over the ceiling
 * @param {ConcordatPlayerState} player - Nation
 * @param {ConcordatEffects} effects - Bonuses
 * @param {number} committed - Troops out in the field
 * @return {number} - Troops per second
 */

export const troopRateOf = (
  player: ConcordatPlayerState,
  effects: ConcordatEffects,
  committed: number
): number => {
  const cap = troopCap(player, effects.cap)
  const total = player.troops + committed
  if (total > cap) return -total * sim.overCapDecay

  const rate =
    (sim.growthBase + sim.growthRate * player.troops ** sim.growthPower) *
    (1 + effects.growth) *
    player.growthShare
  return rate * (1 - total / cap) * calmFactor(player)
}

// One nation for one tick, troops out in the field count against the ceiling
const grow = (
  player: ConcordatPlayerState,
  effects: ConcordatEffects,
  dt: number,
  committed: number
): void => {
  // Troops climb to the ceiling, then melt back
  player.troops = Math.max(0, player.troops + troopRateOf(player, effects, committed) * dt)

  const calm = calmFactor(player)

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
