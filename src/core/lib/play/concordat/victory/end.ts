import { alliesOf } from '@/core/lib/play/concordat/diplomacy/ties'
import { sideOf } from '@/core/lib/play/concordat/modes/rules'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { landOf } from '@/core/lib/play/concordat/victory/land'
import { dominationHold, dominationNeed } from '@/core/lib/play/concordat/victory/ramp'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatEnds, ConcordatPowers } from '@/utils/constants/concordat'
import type { ConcordatEndName } from '@/utils/constants/concordat'

/**
 * A nation with every nation its alliances reach, living ones only
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @return {number[]} - Nations of the bloc, the first one included
 */

export const blocOf = (state: ConcordatState, playerId: number): number[] => {
  const bloc = [playerId]
  for (let index = 0; index < bloc.length; index++) {
    for (const id of alliesOf(state, bloc[index])) {
      if (!bloc.includes(id) && state.players[id - 1].alive) bloc.push(id)
    }
  }

  return bloc
}

/**
 * Sides still in play
 * @param {ConcordatState} state - Game
 * @return {Set<number>} - Side keys
 */

export const livingSides = (state: ConcordatState): Set<number> =>
  new Set(state.players.filter((player) => player.alive).map((player) => sideOf(state, player.id)))

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

// Strongest side or alliance bloc over the needed share, with its first nation for the journal
const dominantSide = (state: ConcordatState): { side: number; first: number } | null => {
  // One pass: land and first nation of every living side
  const held = new Map<number, { tiles: number; first: number }>()
  for (const player of state.players) {
    if (!player.alive) continue

    const side = sideOf(state, player.id)
    const entry = held.get(side)
    if (entry) entry.tiles += player.tiles
    else held.set(side, { tiles: player.tiles, first: player.id })
  }

  // A chain of alliances counts as one bloc, outside the team modes
  const candidates = [...held].map(([side, entry]) => ({ side, ...entry }))
  if (!state.teams.some(Boolean)) {
    const seen = new Set<number>()
    for (const player of state.players) {
      if (!player.alive || player.kind === ConcordatPowers.Tribe || seen.has(player.id)) continue

      const bloc = blocOf(state, player.id)
      for (const id of bloc) seen.add(id)
      if (bloc.length < 2) continue

      const tiles = bloc.reduce((sum, id) => sum + state.players[id - 1].tiles, 0)
      candidates.push({ side: sideOf(state, player.id), tiles, first: player.id })
    }
  }

  const total = landOf(state)
  const need = dominationNeed(state)
  let best: { side: number; first: number; tiles: number } | null = null
  for (const entry of candidates) {
    if (total && entry.tiles / total >= need && (!best || entry.tiles > best.tiles)) best = entry
  }

  return best
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
  state.tick - state.domination.since >= ticksOf(dominationHold(state))
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

/**
 * Sides that won by domination: the leading side and, outside the team modes, its allies
 * @param {ConcordatState} state - Game
 * @return {Set<number>} - Side keys, empty when none
 */

export const winningSides = (state: ConcordatState): Set<number> => {
  const side = dominantWinner(state)
  if (!side) return new Set()

  const sides = new Set([side])
  const leader = state.players.find((player) => player.alive && sideOf(state, player.id) === side)
  if (leader && !state.teams.some(Boolean)) {
    for (const id of blocOf(state, leader.id)) sides.add(sideOf(state, id))
  }

  return sides
}
