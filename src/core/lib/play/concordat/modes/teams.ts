import { disband } from '@/core/lib/play/concordat/sim/attack'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { nextRandom } from '@/core/lib/play/concordat/sim/rng'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { hasTeams, modeRules } from '@/core/lib/play/concordat/modes/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatPowers } from '@/utils/constants/concordat'

/**
 * Share the living nations out in teams, uneven sizes differ by one
 * @param {ConcordatState} state - Game
 * @param {number} count - Team count
 * @return {void}
 */

export const drawTeams = (state: ConcordatState, count: number): void => {
  const order = state.players.filter(
    (player) => player.alive && player.kind === ConcordatPowers.Human
  )
  for (let index = order.length - 1; index > 0; index--) {
    const swap = Math.floor(nextRandom(state) * (index + 1))
    ;[order[index], order[swap]] = [order[swap], order[index]]
  }

  const teams = Math.max(1, Math.min(count, order.length))
  state.teams = state.players.map(() => 0)
  order.forEach((player, index) => {
    state.teams[player.id - 1] = (index % teams) + 1
  })

  // Troops pushing a new team mate go home
  for (const corps of [...state.corps]) {
    if (corps.target && state.teams[corps.owner - 1] === state.teams[corps.target - 1]) {
      disband(state, corps, 0)
    }
  }
  state.isSystemsDirty = true
  emit(state, { tick: state.tick, kind: 'teamsDrawn', actor: 0, victim: 0, tile: teams })
}

/**
 * Open the format at the start of play
 * @param {ConcordatState} state - Game
 * @param {number} count - Team count asked
 * @return {void}
 */

export const openMode = (state: ConcordatState, count: number): void => {
  if (!hasTeams(state.mode)) return

  drawTeams(state, count)
  const rotate = modeRules(state.mode).rotateMinutes
  state.nextDrawAt = rotate ? state.tick + ticksOf(rotate * 60) : 0
}

/**
 * Redraw temporary teams when their time is up
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runRotation = (state: ConcordatState): void => {
  if (!state.nextDrawAt || state.tick < state.nextDrawAt) return

  const count = Math.max(...state.teams, 1)
  drawTeams(state, count)
  state.nextDrawAt = state.tick + ticksOf(modeRules(state.mode).rotateMinutes * 60)
}
