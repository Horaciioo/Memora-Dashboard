'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { NAVAL_SKIN_DEFAULT, NAVAL_SKINS } from '@/declarations/play/naval/skins'
import type { NavalSkinName } from '@/declarations/play/naval/skins'

/**
 * Naval skin of this viewer
 * @typedef {Object} NavalSkinStore
 * @property {NavalSkinName} skin - Ships and shells
 * @property {(skin: NavalSkinName) => void} setSkin - Pick a skin
 */

interface NavalSkinStore {
  skin: NavalSkinName
  setSkin: (skin: NavalSkinName) => void
}

export const useNavalSkinStore = create<NavalSkinStore>()(
  persist(
    (set) => ({
      skin: NAVAL_SKIN_DEFAULT,
      setSkin: (skin) => set({ skin: skin in NAVAL_SKINS ? skin : NAVAL_SKIN_DEFAULT }),
    }),
    { name: 'naval-skin', version: 1 }
  )
)
