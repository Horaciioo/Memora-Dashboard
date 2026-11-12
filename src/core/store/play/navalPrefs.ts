'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Naval display settings
 * @typedef {Object} NavalPrefsStore
 * @property {boolean} hasAutoZoom - Camera leans toward strikes
 * @property {() => void} toggleAutoZoom - Switch it
 */

interface NavalPrefsStore {
  hasAutoZoom: boolean
  toggleAutoZoom: () => void
}

export const useNavalPrefsStore = create<NavalPrefsStore>()(
  persist(
    (set) => ({
      hasAutoZoom: true,
      toggleAutoZoom: () => set((state) => ({ hasAutoZoom: !state.hasAutoZoom })),
    }),
    { name: 'naval-prefs' }
  )
)
