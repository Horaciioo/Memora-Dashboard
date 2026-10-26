'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { GOLF_MIX } from '@/declarations/play/golf/sounds'

/**
 * Play sound store
 * @typedef {Object} PlaySoundStore
 * @property {boolean} isMuted - Sound cut
 * @property {number} volume - Zero to one
 * @property {() => void} toggle - Cut or restore
 * @property {(volume: number) => void} setVolume - Master level
 */

interface PlaySoundStore {
  isMuted: boolean
  volume: number
  toggle: () => void
  setVolume: (volume: number) => void
}

export const usePlaySoundStore = create<PlaySoundStore>()(
  persist(
    (set) => ({
      isMuted: false,
      volume: GOLF_MIX.volume,
      toggle: () => set((state) => ({ isMuted: !state.isMuted })),
      setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)), isMuted: false }),
    }),
    { name: 'play-sound' }
  )
)
