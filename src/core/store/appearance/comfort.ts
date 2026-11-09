'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { COMFORT_DEFAULTS, isComfortValue } from '@/declarations/preferences/comfort'
import type { ComfortKey, ComfortValues } from '@/declarations/preferences/comfort'

/**
 * Comfort store
 * @typedef {Object} ComfortStore
 * @property {ComfortValues} values - Value of every setting
 * @property {(key: ComfortKey, value: string) => void} setValue - Set one setting
 * @property {() => void} reset - Back to the defaults
 */

interface ComfortStore {
  values: ComfortValues
  setValue: (key: ComfortKey, value: string) => void
  reset: () => void
}

export const useComfortStore = create<ComfortStore>()(
  persist(
    (set) => ({
      values: COMFORT_DEFAULTS,
      setValue: (key, value) =>
        set((state) =>
          isComfortValue(key, value) ? { values: { ...state.values, [key]: value } } : state
        ),
      reset: () => set({ values: COMFORT_DEFAULTS }),
    }),
    {
      name: 'comfort',
      // A value dropped from its setting falls back to the default
      merge: (stored, current) => {
        const saved = (stored as Partial<ComfortStore> | undefined)?.values ?? {}
        const values = { ...COMFORT_DEFAULTS }

        for (const key of Object.keys(COMFORT_DEFAULTS) as ComfortKey[]) {
          const value = (saved as Record<string, unknown>)[key]
          if (isComfortValue(key, value)) (values as Record<string, unknown>)[key] = value
        }

        return { ...current, values }
      },
    }
  )
)
