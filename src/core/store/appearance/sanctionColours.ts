'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { SanctionColourKind } from '@/declarations/preferences/sanctionColours'

/**
 * Sanction colours store
 * @typedef {Object} SanctionColoursStore
 * @property {Partial<Record<SanctionColourKind, string>>} colours - Chosen colour by kind
 * @property {(kind: SanctionColourKind, colour: string | null) => void} setColour - Set or reset
 */

interface SanctionColoursStore {
  colours: Partial<Record<SanctionColourKind, string>>
  setColour: (kind: SanctionColourKind, colour: string | null) => void
}

export const useSanctionColoursStore = create<SanctionColoursStore>()(
  persist(
    (set) => ({
      colours: {},
      setColour: (kind, colour) =>
        set((state) => {
          const colours = { ...state.colours }
          if (colour) colours[kind] = colour
          else delete colours[kind]

          return { colours }
        }),
    }),
    { name: 'sanction-colours' }
  )
)
