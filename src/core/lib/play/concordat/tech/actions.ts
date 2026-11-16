import { noteAttack } from '@/core/lib/play/concordat/diplomacy/actions'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { disband } from '@/core/lib/play/concordat/sim/attack'
import { researchCost, tiersOf, levelOf } from '@/core/lib/play/concordat/tech/rules'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { CONCORDAT_TECH_ORDER } from '@/utils/constants/concordat'
import type { ConcordatTechPath } from '@/utils/constants/concordat'

const { tech } = CONCORDAT

/**
 * Pay and start a research, one at a time
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @param {ConcordatTechPath} path - Path
 * @return {void}
 */

export const startResearch = (
  state: ConcordatState,
  playerId: number,
  path: ConcordatTechPath
): void => {
  const level = levelOf(state, playerId, path)
  state.players[playerId - 1].gold -= researchCost(state, playerId, path)
  state.techs[playerId - 1].path = CONCORDAT_TECH_ORDER.indexOf(path)
  state.techs[playerId - 1].readyAt = state.tick + ticksOf(tiersOf(path)[level].seconds)
  state.isSystemsDirty = true
}

/**
 * Close the research that ran its time
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const finishResearch = (state: ConcordatState): void => {
  for (const player of state.players) {
    const mine = state.techs[player.id - 1]
    if (mine.path < 0 || mine.readyAt > state.tick) continue

    mine.levels[mine.path]++
    emit(state, {
      tick: state.tick,
      kind: 'researched',
      actor: player.id,
      victim: 0,
      tile: mine.path,
    })
    mine.path = -1
    mine.readyAt = 0
    state.isSystemsDirty = true
  }
}

/**
 * Bring a feint home when its time is up
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const endFeints = (state: ConcordatState): void => {
  for (const corps of [...state.corps]) {
    if (corps.feint && corps.feint <= state.tick) disband(state, corps, 0)
  }
}

/**
 * Send a feint: a push that costs less and returns whole
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @param {number} target - Target nation
 * @param {number} percent - Share of the troops
 * @return {void}
 */

export const sendFeint = (
  state: ConcordatState,
  playerId: number,
  target: number,
  percent: number
): void => {
  const me = state.players[playerId - 1]
  const amount = Math.floor((me.troops * percent) / 100)
  me.troops -= amount
  noteAttack(state, playerId, target)
  state.corps.push({
    id: state.nextCorpsId++,
    owner: playerId,
    target,
    troops: amount,
    progress: 0,
    feint: state.tick + ticksOf(tech.feintSeconds),
  })
}
