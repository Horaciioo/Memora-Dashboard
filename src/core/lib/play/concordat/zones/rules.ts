import { forEachInDisc } from '@/core/lib/play/concordat/sim/area'
import { INCOME_SCALE, TERRAIN_INCOME } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import type { ConcordatZoneKind } from '@/utils/constants/concordat'

/**
 * Mark ground for a while
 * @param {ConcordatState} state - Game
 * @param {Object} zone - Zone
 * @param {ConcordatZoneKind} zone.kind - Kind
 * @param {number} zone.tile - Centre
 * @param {number} zone.radius - Radius in tiles
 * @param {number} zone.until - End tick
 * @return {void}
 */

export const addZone = (
  state: ConcordatState,
  zone: { kind: ConcordatZoneKind; tile: number; radius: number; until: number }
): void => {
  state.zones.push({ id: state.nextId++, ...zone })
  state.isSystemsDirty = true
}

/**
 * Drop the zones that ended
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const pruneZones = (state: ConcordatState): void => {
  const live = state.zones.filter((zone) => zone.until > state.tick)
  if (live.length === state.zones.length) return

  state.zones = live
  state.isSystemsDirty = true
}

/**
 * A live zone with this trait covers a tile
 * @param {ConcordatState} state - Game
 * @param {number} tile - Tile
 * @param {'blocksBuilding' | 'blocksSea'} trait - Trait asked
 * @return {boolean} - Covered
 */

export const isTileBlocked = (
  state: ConcordatState,
  tile: number,
  trait: 'blocksBuilding' | 'blocksSea'
): boolean => {
  const { width } = state.map

  return state.zones.some((zone) => {
    if (!CONCORDAT.zones[zone.kind][trait] || zone.until <= state.tick) return false
    const dx = (zone.tile % width) - (tile % width)
    const dy = Math.floor(zone.tile / width) - Math.floor(tile / width)

    return dx * dx + dy * dy <= zone.radius * zone.radius
  })
}

/**
 * Gold per second marked ground costs each nation, worst zone wins on a tile
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const applyZoneMalus = (state: ConcordatState): void => {
  if (!state.zones.length) return

  const { width, height, terrain } = state.map
  const cut = new Map<number, number>()
  for (const zone of state.zones) {
    if (zone.until <= state.tick) continue

    const share = CONCORDAT.zones[zone.kind].cut
    forEachInDisc({ width, height, tile: zone.tile, radius: zone.radius }, (tile) => {
      cut.set(tile, Math.max(cut.get(tile) ?? 0, share))
    })
  }

  for (const [tile, share] of cut) {
    const holder = state.owner[tile]
    if (holder) {
      state.effects[holder - 1].malus += (TERRAIN_INCOME[terrain[tile]] / INCOME_SCALE) * share
    }
  }
}
