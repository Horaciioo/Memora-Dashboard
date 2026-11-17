import { troopCap } from '@/core/lib/play/concordat/sim/economy'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatCorps, ConcordatPlayerState, ConcordatState } from '@/types/concordat'
import { ConcordatPowers } from '@/utils/constants/concordat'

const { sim } = CONCORDAT

/**
 * Corps removed, the guard against it goes home
 * @param {ConcordatState} state - Game
 * @param {ConcordatCorps} corps - Corps
 * @return {void}
 */

export const drop = (state: ConcordatState, corps: ConcordatCorps): void => {
  if (corps.guard && corps.target) state.players[corps.target - 1].troops += corps.guard
  state.corps = state.corps.filter((other) => other !== corps)
}

// Spoils of a fallen nation, paid to whoever took its last tile
const payKiller = (
  state: ConcordatState,
  fallen: ConcordatPlayerState,
  killer: ConcordatPlayerState
): void => {
  const troopShare = fallen.kind === ConcordatPowers.Tribe ? sim.tribeKillTroops : sim.killTroops
  const share = fallen.kind === ConcordatPowers.Human ? sim.killGoldHuman : sim.killGold
  const gold = Math.round(fallen.gold * share)
  killer.gold += gold
  killer.troops = Math.min(troopCap(killer) * 1.1, killer.troops + troopCap(killer) * troopShare)
  fallen.gold = 0
  // The gold taken rides in the tile slot of the line
  emit(state, {
    tick: state.tick,
    kind: 'eliminated',
    actor: killer.id,
    victim: fallen.id,
    tile: gold,
  })
}

/**
 * A nation without land falls, its last taker collects the spoils
 * @param {ConcordatState} state - Game
 * @param {ConcordatPlayerState} fallen - Nation
 * @param {number} killerId - Player who took the last tile, zero for none
 * @return {void}
 */

export const eliminate = (
  state: ConcordatState,
  fallen: ConcordatPlayerState,
  killerId: number
): void => {
  if (!fallen.alive) return

  fallen.alive = false
  fallen.troops = 0
  fallen.eliminatedAt = state.tick
  for (const corps of state.corps.filter((other) => other.owner === fallen.id)) drop(state, corps)

  const killer = killerId ? state.players[killerId - 1] : null
  if (killer?.alive) payKiller(state, fallen, killer)
  else emit(state, { tick: state.tick, kind: 'eliminated', actor: 0, victim: fallen.id, tile: -1 })
}
