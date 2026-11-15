'use client'

import { create } from 'zustand'

/**
 * Stop and Go aim store, rivals a card may hit and the ones already picked
 * @typedef {Object} StopGoAimStore
 * @property {string[]} aimable - Rivals in reach
 * @property {string[]} picked - Rivals marked
 * @property {((id: string) => void) | null} tap - Answer to a touch on a rival
 * @property {(aimable: string[], picked: string[], tap: (id: string) => void) => void} open - Start aiming
 * @property {() => void} close - Stop aiming
 */

interface StopGoAimStore {
  aimable: string[]
  picked: string[]
  tap: ((id: string) => void) | null
  open: (aimable: string[], picked: string[], tap: (id: string) => void) => void
  close: () => void
}

export const useStopGoAimStore = create<StopGoAimStore>()((set) => ({
  aimable: [],
  picked: [],
  tap: null,
  open: (aimable, picked, tap) => set({ aimable, picked, tap }),
  close: () => set({ aimable: [], picked: [], tap: null }),
}))
