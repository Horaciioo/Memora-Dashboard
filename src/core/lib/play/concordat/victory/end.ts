import { sideOf } from '@/core/lib/play/concordat/modes/rules'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatEnds, ConcordatPowers, ConcordatTerrains } from '@/utils/constants/concordat'
import type { ConcordatEndName } from '@/utils/constants/concordat'

const { victory } = CONCORDAT

/**
 * Sides still in play
 * @param {ConcordatState} state - Game
 * @return {Set<number>} - Side keys
 */

export const livingSides = (state: ConcordatState): Set<number> =>
  new Set(state.players.filter((player) => player.alive).map((player) => sideOf(state, player.id)))

// Land tiles of a map, counted once
const landTotals = new WeakMap<ConcordatState['map'], number>()

const landOf = (state: ConcordatState): number => {
  const known = landTotals.get(state.map)
  if (known !== undefined) return known

  const total = state.map.terrain.reduce(
    (sum, kind) => sum + (kind === ConcordatTerrains.Sea ? 0 : 1),
    0
  )
  landTotals.set(state.map, total)

  return total
}

/**
 * Share of the land a side holds
 * @param {ConcordatState} state - Game
 * @param {number} side - Side key
 * @return {number} - Share, 0 to 1
 */

export const landShare = (state: ConcordatState, side: number): number => {
  const total = landOf(state)
  const held = state.players
    .filter((player) => player.alive && sideOf(state, player.id) === side)
    .reduce((sum, player) => sum + player.tiles, 0)

  return total ? held / total : 0
}

// Leader of the land, with its first nation for the journal
const dominantSide = (state: ConcordatState): { side: number; first: number } | null => {
  for (const side of livingSides(state)) {
    if (landShare(state, side) >= victory.dominationShare) {
      return {
        side,
        first:
          state.players.find((player) => player.alive && sideOf(state, player.id) === side)?.id ??
          0,
      }
    }
  }

  return null
}

/**
 * Follow the domination count down, once a second
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runDomination = (state: ConcordatState): void => {
  if (!CONCORDAT.features.victory || state.tick % CONCORDAT_TICKS_PER_SECOND !== 0) return

  const lead = dominantSide(state)
  const side = lead?.side ?? 0
  if (side === state.domination.side) return

  // A side that lets go loses its count
  if (state.domination.side) {
    emit(state, { tick: state.tick, kind: 'dominationLost', actor: 0, victim: 0, tile: -1 })
  }
  state.domination = { side, since: state.tick }
  state.isSystemsDirty = true
  if (lead)
    emit(state, { tick: state.tick, kind: 'domination', actor: lead.first, victim: 0, tile: -1 })
}

/**
 * Side that held the map long enough, zero when none
 * @param {ConcordatState} state - Game
 * @return {number} - Side key
 */

export const dominantWinner = (state: ConcordatState): number =>
  CONCORDAT.features.victory &&
  state.domination.side &&
  state.tick - state.domination.since >= ticksOf(victory.dominationSeconds)
    ? state.domination.side
    : 0

// One seat left, or none for a solo game, while countries and tribes play on
const isSeatsOver = (state: ConcordatState): boolean => {
  const seats = state.players.filter((player) => player.kind === ConcordatPowers.Human)
  const sides = new Set(
    seats.filter((player) => player.alive).map((player) => sideOf(state, player.id))
  )

  return sides.size <= (seats.length > 1 ? 1 : 0) || (!seats.length && livingSides(state).size <= 1)
}

/**
 * Why the game ends now, null while it goes on
 * @param {ConcordatState} state - Game
 * @return {ConcordatEndName | null} - Reason
 */

export const endReason = (state: ConcordatState): ConcordatEndName | null => {
  if (isSeatsOver(state)) return ConcordatEnds.Last
  if (dominantWinner(state)) return ConcordatEnds.Domination

  return state.endTick > 0 && state.tick >= state.endTick ? ConcordatEnds.Time : null
}
