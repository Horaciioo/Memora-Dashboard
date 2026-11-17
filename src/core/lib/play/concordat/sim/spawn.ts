import { claimStart } from '@/core/lib/play/concordat/sim/create'
import type { ConcordatState } from '@/types/concordat'

/**
 * Tribes form their first land when their moment comes, a start taken meanwhile is lost
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runSpawns = (state: ConcordatState): void => {
  for (const player of state.players) {
    if (!player.spawnAt || player.spawnAt > state.tick) continue

    player.spawnAt = 0
    if (state.owner[player.start]) {
      player.alive = false
      player.eliminatedAt = state.tick
      continue
    }
    claimStart(state, player)
  }
}
