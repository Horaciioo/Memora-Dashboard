'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Play motion store
 * @typedef {Object} PlayMotionStore
 * @property {boolean} isLight - Heavy decor animations cut
 * @property {() => void} toggle - Cut or restore
 */

interface PlayMotionStore {
  isLight: boolean
  toggle: () => void
}

export const usePlayMotionStore = create<PlayMotionStore>()(
  persist(
    (set) => ({
      isLight: false,
      toggle: () => set((state) => ({ isLight: !state.isLight })),
    }),
    { name: 'play-motion' }
  )
)
