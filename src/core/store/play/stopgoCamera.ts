'use client'

import { create } from 'zustand'

/**
 * Stop and Go camera store, the HUD key asks the board to come back to the car
 * @typedef {Object} StopGoCameraStore
 * @property {number} recenterTick - Counter bumped on each ask
 * @property {() => void} recenter - Ask the camera back to the own car
 */

interface StopGoCameraStore {
  recenterTick: number
  recenter: () => void
}

export const useStopGoCameraStore = create<StopGoCameraStore>()((set) => ({
  recenterTick: 0,
  recenter: () => set((state) => ({ recenterTick: state.recenterTick + 1 })),
}))
