'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ColorVisionMode } from '@/declarations/access/preferences'

/**
 * Color vision store
 * @typedef {Object} ColorVisionStore
 * @property {ColorVisionMode} colorVisionMode - Mode
 * @property {(colorVisionMode: ColorVisionMode) => void} setColorVisionMode - Set mode
 */

interface ColorVisionStore {
  colorVisionMode: ColorVisionMode
  setColorVisionMode: (colorVisionMode: ColorVisionMode) => void
}

export const useColorVisionStore = create<ColorVisionStore>()(
  persist(
    (set) => ({
      colorVisionMode: 'NONE',
      setColorVisionMode: (colorVisionMode) => set({ colorVisionMode }),
    }),
    { name: 'color-vision' }
  )
)
