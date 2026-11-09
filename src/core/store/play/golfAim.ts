'use client'

import { create } from 'zustand'

/**
 * Golf aim store, read by the power gauge
 * @typedef {Object} GolfAimStore
 * @property {number | null} power - Pull, null when not aiming
 * @property {(power: number | null) => void} setPower - Set pull
 */

interface GolfAimStore {
  power: number | null
  setPower: (power: number | null) => void
}

export const useGolfAimStore = create<GolfAimStore>()((set) => ({
  power: null,
  setPower: (power) => set({ power }),
}))
