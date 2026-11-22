'use client'

import { create } from 'zustand'

import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_STANDING_DEFAULTS } from '@/core/lib/play/concordat/view/standings'
import type { ConcordatStandingColumn } from '@/core/lib/play/concordat/view/standings'
import type { ConcordatBuildingKind, ConcordatLaunchWeapon } from '@/utils/constants/concordat'

/**
 * Tool armed on the map: a building to set down or a missile to aim
 * @typedef {Object} ConcordatTool
 */

export type ConcordatTool =
  | { kind: 'build'; building: ConcordatBuildingKind }
  | { kind: 'launch'; isHeavy: boolean; weapon?: ConcordatLaunchWeapon }
  | { kind: 'sortie'; air: 'heli' | 'fighter' }
  | { kind: 'fleet' }

/**
 * Click echo on the map: a ripple, and for an expansion the tile it heads for
 * @typedef {Object} ConcordatMark
 */

export interface ConcordatMark {
  tile: number
  at: number
  kind: 'expand' | 'build' | 'refused'
}

/**
 * Concordat screen state shared by the board and its HUD
 * @typedef {Object} ConcordatViewStore
 * @property {number} percent - Share of troops engaged
 * @property {number} recenterTick - Counter bumped on each ask
 * @property {{ tile: number; tick: number }} jump - Tile the camera is asked to centre on
 * @property {(percent: number) => void} setPercent - Change the share
 * @property {() => void} recenter - Ask the camera back to the own nation
 */

interface ConcordatViewStore {
  percent: number
  tool: ConcordatTool | null
  fleetShip: number | null
  setFleetShip: (ship: number | null) => void
  marks: ConcordatMark[]
  standSort: ConcordatStandingColumn
  standDesc: boolean
  standColumns: ConcordatStandingColumn[]
  sortStandings: (column: ConcordatStandingColumn) => void
  toggleColumn: (column: ConcordatStandingColumn) => void
  mark: (tile: number, kind: ConcordatMark['kind']) => void
  setTool: (tool: ConcordatTool | null) => void
  recenterTick: number
  jump: { tile: number; tick: number }
  setPercent: (percent: number) => void
  recenter: () => void
  jumpTo: (tile: number) => void
}

export const useConcordatViewStore = create<ConcordatViewStore>()((set) => ({
  percent: CONCORDAT_ART.engage.initial,
  tool: null,
  fleetShip: null,
  setFleetShip: (fleetShip) => set({ fleetShip }),
  marks: [],
  standSort: 'tiles',
  standDesc: true,
  standColumns: CONCORDAT_STANDING_DEFAULTS,
  // Same column twice flips the order, a new one starts biggest first
  sortStandings: (column) =>
    set((state) =>
      state.standSort === column
        ? { standDesc: !state.standDesc }
        : { standSort: column, standDesc: true }
    ),
  toggleColumn: (column) =>
    set((state) => ({
      standColumns: state.standColumns.includes(column)
        ? state.standColumns.filter((item) => item !== column)
        : [...state.standColumns, column],
    })),
  mark: (tile, kind) =>
    set((state) => {
      const now = performance.now()
      const kept = state.marks.filter(
        (item) =>
          now - item.at < CONCORDAT_ART.mark.ms &&
          item.tile !== tile &&
          !(kind === 'expand' && item.kind === 'expand')
      )

      return { marks: [...kept, { tile, at: now, kind }] }
    }),
  setTool: (tool) => set({ tool }),
  recenterTick: 0,
  jump: { tile: -1, tick: 0 },
  setPercent: (percent) =>
    set({
      percent: Math.min(CONCORDAT_ART.engage.max, Math.max(CONCORDAT_ART.engage.min, percent)),
    }),
  recenter: () => set((state) => ({ recenterTick: state.recenterTick + 1 })),
  jumpTo: (tile) => set((state) => ({ jump: { tile, tick: state.jump.tick + 1 } })),
}))
