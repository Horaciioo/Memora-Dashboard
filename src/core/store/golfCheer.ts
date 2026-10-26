'use client'

import { create } from 'zustand'

/**
 * Golf cheer store, the banner of an own ball holed
 * @typedef {Object} GolfCheerStore
 * @property {{ strokes: number, at: number } | null} cheer - Strokes and local ms
 * @property {(strokes: number) => void} cheerHole - Show the banner
 * @property {() => void} clear - Hide it
 */

interface GolfCheerStore {
  cheer: { strokes: number; at: number } | null
  cheerHole: (strokes: number) => void
  clear: () => void
}

export const useGolfCheerStore = create<GolfCheerStore>()((set) => ({
  cheer: null,
  cheerHole: (strokes) => set({ cheer: { strokes, at: performance.now() } }),
  clear: () => set({ cheer: null }),
}))
