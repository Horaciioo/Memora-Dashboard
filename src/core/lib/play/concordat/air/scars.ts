import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import type { ConcordatScarKind } from '@/utils/constants/concordat'

const { scars } = CONCORDAT.air

/**
 * Leave a scar on the ground, the oldest fade from the record
 * @param {ConcordatState} state - Game
 * @param {number} tile - Centre
 * @param {number} radius - Radius in tiles
 * @param {ConcordatScarKind} kind - Kind
 * @return {void}
 */

export const addScar = (
  state: ConcordatState,
  tile: number,
  radius: number,
  kind: ConcordatScarKind
): void => {
  state.scars.push({ tile, radius: Math.max(1, Math.round(radius)), at: state.tick, kind })
  if (state.scars.length > scars.cap) state.scars.splice(0, state.scars.length - scars.cap)
  state.isSystemsDirty = true
}
