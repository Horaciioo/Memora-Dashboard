import { distanceBetween } from '@/core/lib/play/concordat/map'
import { seaAround, seaPath } from '@/core/lib/play/concordat/navy/path'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

const { navy } = CONCORDAT

// Own coasts tried as a start
const STARTS = 16

/**
 * Sea way from the own coast nearest to a landing, no building needed
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Sender
 * @param {number} tile - Landing tile
 * @return {{ way: number[]; distance: number } | null} - Way and straight distance, null when none
 */

export const sailRoute = (
  state: ConcordatState,
  playerId: number,
  tile: number
): { way: number[]; distance: number } | null => {
  const { width, terrain } = state.map
  const goals = seaAround(state.map, tile)
  if (!goals.length) return null

  // Nearest own land that touches water
  const near: { tile: number; distance: number }[] = []
  for (let index = 0; index < state.owner.length; index++) {
    if (state.owner[index] !== playerId || terrain[index] === ConcordatTerrains.Sea) continue
    near.push({ tile: index, distance: distanceBetween(index, tile, width) })
  }
  near.sort((first, second) => first.distance - second.distance)

  const starts: number[] = []
  let coasts = 0
  let distance = 0
  for (const item of near) {
    if (item.distance > navy.sailRange) break

    const sea = seaAround(state.map, item.tile)
    if (!sea.length) continue
    if (!coasts) distance = item.distance
    starts.push(...sea)
    if (++coasts >= STARTS) break
  }

  const way = seaPath(state.map, starts, goals)

  return way ? { way, distance } : null
}
