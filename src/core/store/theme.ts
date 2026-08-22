'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemePreference = 'SYSTEM' | 'LIGHT' | 'DARK'

/**
 * Theme store
 * @typedef {Object} ThemeStore
 * @property {ThemePreference} theme - Preference
 * @property {(theme: ThemePreference) => void} setTheme - Set theme
 */

interface ThemeStore {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'SYSTEM',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme' }
  )
)

/**
 * Resolve theme
 * @param {ThemePreference} theme - Preference
 * @return {'light' | 'dark'} - Mode
 */

export const resolveTheme = (theme: ThemePreference): 'light' | 'dark' => {
  if (theme !== 'SYSTEM') return theme === 'DARK' ? 'dark' : 'light'
  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
