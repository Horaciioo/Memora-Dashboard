'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Naval sound choices
 * @typedef {Object} NavalAudioStore
 * @property {boolean} hasEffects - Shots and blasts on
 * @property {boolean} hasAmbience - Sea and tension on
 * @property {() => void} toggleEffects - Flip the effects
 * @property {() => void} toggleAmbience - Flip the ambience
 */

interface NavalAudioStore {
  hasEffects: boolean
  hasAmbience: boolean
  toggleEffects: () => void
  toggleAmbience: () => void
}

export const useNavalAudioStore = create<NavalAudioStore>()(
  persist(
    (set) => ({
      hasEffects: true,
      hasAmbience: true,
      toggleEffects: () => set((state) => ({ hasEffects: !state.hasEffects })),
      toggleAmbience: () => set((state) => ({ hasAmbience: !state.hasAmbience })),
    }),
    { name: 'naval-audio', version: 1 }
  )
)
