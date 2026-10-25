'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Play sound store
 * @typedef {Object} PlaySoundStore
 * @property {boolean} isMuted - Sound cut
 * @property {() => void} toggle - Cut or restore
 */

interface PlaySoundStore {
  isMuted: boolean
  toggle: () => void
}

export const usePlaySoundStore = create<PlaySoundStore>()(
  persist(
    (set) => ({
      isMuted: false,
      toggle: () => set((state) => ({ isMuted: !state.isMuted })),
    }),
    { name: 'play-sound' }
  )
)
