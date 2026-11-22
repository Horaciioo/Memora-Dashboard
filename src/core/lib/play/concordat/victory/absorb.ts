import { botViewOf } from '@/core/lib/play/concordat/bots/view'
import { eliminate } from '@/core/lib/play/concordat/sim/fall'
import { transferTile } from '@/core/lib/play/concordat/sim/tiles'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { rampOf } from '@/core/lib/play/concordat/victory/ramp'
import { landOf } from '@/core/lib/play/concordat/victory/land'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatPowers } from '@/utils/constants/concordat'

const { annex } = CONCORDAT.victory

// Tick since which a nation stays a dwarf, per game
const dwarves = new WeakMap<ConcordatState, Map<number, number>>()

// Strongest neighbour able to swallow a dwarf, zero when none
const absorberOf = (state: ConcordatState, dwarfId: number): number => {
  const dwarf = state.players[dwarfId - 1]
  let best = 0
  let bestTiles = 0
  for (const { id } of botViewOf(state, dwarfId).neighbours) {
    const other = state.players[id - 1]
    if (!other.alive || other.kind === ConcordatPowers.Tribe) continue
    if (other.tiles >= dwarf.tiles * annex.ratio && other.tiles > bestTiles) {
      best = id
      bestTiles = other.tiles
    }
  }

  return best
}

// All the land of the dwarves passes to their absorbers in one walk of the map, then they fall
const swallow = (state: ConcordatState, pairs: Map<number, number>): void => {
  for (let tile = 0; tile < state.owner.length; tile++) {
    const absorber = pairs.get(state.owner[tile])
    if (absorber) transferTile(state, tile, absorber)
  }
  for (const [dwarf, absorber] of pairs) eliminate(state, state.players[dwarf - 1], absorber)
}

/**
 * Small states that stay small are absorbed by the giant next door, the map keeps shrinking toward fewer actors
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runAbsorption = (state: ConcordatState): void => {
  const step = annex.everySeconds * CONCORDAT_TICKS_PER_SECOND
  if (state.tick % step !== 0 || state.tick < ticksOf(annex.startMinutes * 60)) return

  const since = dwarves.get(state) ?? new Map<number, number>()
  dwarves.set(state, since)
  // The line to stay a state rises with the age of the game: the circle closes
  const line =
    landOf(state) * (annex.dwarfShare + (annex.dwarfEndShare - annex.dwarfShare) * rampOf(state))
  const pairs = new Map<number, number>()

  for (const player of state.players) {
    const isDwarf =
      player.alive &&
      player.kind !== ConcordatPowers.Human &&
      player.tiles > 0 &&
      player.tiles < line &&
      state.tick >= player.protectedUntil
    if (!isDwarf) {
      since.delete(player.id)
      continue
    }

    const first = since.get(player.id) ?? state.tick
    since.set(player.id, first)
    if (state.tick - first < ticksOf(annex.seconds)) continue

    // A few at a time, the map walk is the dear part
    const absorber = pairs.size < annex.maxPerPass ? absorberOf(state, player.id) : 0
    // No chains: one nation is never absorber and absorbed in the same pass
    if (!absorber || pairs.has(absorber) || [...pairs.values()].includes(player.id)) continue

    pairs.set(player.id, absorber)
    since.delete(player.id)
  }
  if (pairs.size) swallow(state, pairs)
}
