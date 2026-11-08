'use client'

import { create } from 'zustand'

import { GOLF_SCENE } from '@/declarations/play/golf/scene'

/**
 * Golf hand store, the nudge of an orb met with a full hand
 * @typedef {Object} GolfHandStore
 * @property {number | null} fullAt - Local ms of the nudge on screen
 * @property {() => void} bump - Nudge the hand
 */

interface GolfHandStore {
  fullAt: number | null
  bump: () => void
}

export const useGolfHandStore = create<GolfHandStore>()((set, get) => ({
  fullAt: null,
  bump: () => {
    const at = performance.now()
    set({ fullAt: at })
    // Word fades unless nudged again
    setTimeout(() => {
      if (get().fullAt === at) set({ fullAt: null })
    }, GOLF_SCENE.orb.handFullMs)
  },
}))
