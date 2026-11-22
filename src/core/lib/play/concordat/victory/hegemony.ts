import { landOf } from '@/core/lib/play/concordat/victory/land'
import { rampOf } from '@/core/lib/play/concordat/victory/ramp'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatPowers } from '@/utils/constants/concordat'

const { hegemon } = CONCORDAT.victory

// Hegemon of the game, found once a second
const found = new WeakMap<ConcordatState, { second: number; id: number }>()

// Share of the land a nation must hold to be a hegemon, lower as the game ages
const shareNeeded = (state: ConcordatState): number =>
  hegemon.share - (hegemon.share - hegemon.endShare) * rampOf(state)

/**
 * The nation far ahead of everyone else, zero when none: the world turns on it
 * @param {ConcordatState} state - Game
 * @return {number} - Nation, zero for none
 */

export const hegemonOf = (state: ConcordatState): number => {
  const second = Math.floor(state.tick / CONCORDAT_TICKS_PER_SECOND)
  const known = found.get(state)
  if (known && known.second === second) return known.id

  let first = 0
  let best = 0
  let next = 0
  if (state.tick >= hegemon.startMinutes * 60 * CONCORDAT_TICKS_PER_SECOND) {
    for (const player of state.players) {
      if (!player.alive || player.kind === ConcordatPowers.Tribe) continue
      if (player.tiles > best) {
        next = best
        best = player.tiles
        first = player.id
      } else if (player.tiles > next) next = player.tiles
    }
  }
  const land = landOf(state)
  const isHegemon = land > 0 && best / land >= shareNeeded(state) && best >= next * hegemon.lead
  const id = isHegemon ? first : 0
  found.set(state, { second, id })

  return id
}

/**
 * A hegemon wears down: overreach costs it calm, in proportion to its lead over the line
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runHegemony = (state: ConcordatState): void => {
  if (state.tick % CONCORDAT_TICKS_PER_SECOND !== 0) return

  const id = hegemonOf(state)
  if (!id) return

  const player = state.players[id - 1]
  const excess = player.tiles / landOf(state) / shareNeeded(state)
  player.stability = Math.max(hegemon.floor, player.stability - hegemon.drain * excess)
  state.isSystemsDirty = true
}
