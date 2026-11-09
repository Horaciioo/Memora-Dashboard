'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Golf display settings
 * @typedef {Object} GolfPrefs
 * @property {boolean} showPlayers - Other balls drawn
 * @property {boolean} hasTrails - Ball trails drawn
 * @property {boolean} hasMist - Mist under the course
 * @property {boolean} hasSpecks - Floating specks
 * @property {boolean} isLight - Lighter drawing, forced
 */

export interface GolfPrefs {
  showPlayers: boolean
  hasTrails: boolean
  hasMist: boolean
  hasSpecks: boolean
  isLight: boolean
}

interface GolfPrefsStore extends GolfPrefs {
  flip: (key: keyof GolfPrefs) => void
}

export const useGolfPrefsStore = create<GolfPrefsStore>()(
  persist(
    (set) => ({
      showPlayers: true,
      hasTrails: true,
      hasMist: true,
      hasSpecks: true,
      isLight: false,
      flip: (key) => set((state) => ({ [key]: !state[key] })),
    }),
    { name: 'golf-prefs' }
  )
)
