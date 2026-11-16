'use client'

import { create } from 'zustand'

import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import type { ConcordatBuildingKind } from '@/utils/constants/concordat'

/**
 * Tool armed on the map: a building to set down or a missile to aim
 * @typedef {Object} ConcordatTool
 */

export type ConcordatTool =
  { kind: 'build'; building: ConcordatBuildingKind } | { kind: 'launch'; isHeavy: boolean }

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
  marks: ConcordatMark[]
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
  marks: [],
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
