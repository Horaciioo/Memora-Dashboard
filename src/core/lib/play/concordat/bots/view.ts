import { alliesOf, hasTreaty } from '@/core/lib/play/concordat/diplomacy'
import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import type { ConcordatBotProfile, ConcordatPlayerState, ConcordatState } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

const near = new Int32Array(NEIGHBOR_SLOTS)

/**
 * What a bot may know: public figures of the nations it touches
 * @typedef {Object} ConcordatBotView
 */

export interface ConcordatBotView {
  me: ConcordatPlayerState
  // Free land touches the border
  freeContact: boolean
  // Nations on the border, with their border tile count
  neighbours: { id: number; contact: number }[]
  allies: number
  corpsOut: number
}

/**
 * What a bot decides with
 * @typedef {Object} ConcordatBotContext
 */

export interface ConcordatBotContext {
  state: ConcordatState
  profile: ConcordatBotProfile
  view: ConcordatBotView
  // Human away from the game, played prudently
  isCaretaker: boolean
  // Stable noise of this decision, 0 to 1
  roll: (salt: number) => number
}

/**
 * Light view of a nation from its front
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @return {ConcordatBotView} - View
 */

export const botViewOf = (state: ConcordatState, playerId: number): ConcordatBotView => {
  const { width, height, terrain } = state.map
  const me = state.players[playerId - 1]
  const contact = new Map<number, number>()
  let freeContact = false

  for (const edge of me.front) {
    const count = neighborsOf(edge, width, height, near)
    for (let slot = 0; slot < count; slot++) {
      const next = near[slot]
      if (terrain[next] === ConcordatTerrains.Sea) continue

      const holder = state.owner[next]
      if (holder === 0) freeContact = true
      else if (holder !== playerId) contact.set(holder, (contact.get(holder) ?? 0) + 1)
    }
  }

  return {
    me,
    freeContact,
    neighbours: [...contact].map(([id, tiles]) => ({ id, contact: tiles })),
    allies: alliesOf(state, playerId).length,
    corpsOut: state.corps.filter((corps) => corps.owner === playerId).length,
  }
}

/**
 * A rival can be attacked: alive, bound by no treaty
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Attacker
 * @param {number} target - Rival
 * @return {boolean} - Open to attack
 */

export const isOpenTarget = (state: ConcordatState, playerId: number, target: number): boolean =>
  Boolean(state.players[target - 1]?.alive) && !hasTreaty(state, playerId, target)
