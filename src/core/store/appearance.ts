'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FontScale = 'sm' | 'md' | 'lg'

/**
 * Appearance store
 * @typedef {Object} AppearanceStore
 * @property {FontScale} fontScale - Scale
 * @property {(fontScale: FontScale) => void} setFontScale - Set scale
 */

interface AppearanceStore {
  fontScale: FontScale
  setFontScale: (fontScale: FontScale) => void
}

export const useAppearanceStore = create<AppearanceStore>()(
  persist(
    (set) => ({
      fontScale: 'md',
      setFontScale: (fontScale) => set({ fontScale }),
    }),
    { name: 'appearance' }
  )
)
