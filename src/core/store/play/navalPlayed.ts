'use client'

import { create } from 'zustand'

import type { NavalShotView } from '@/core/lib/play/naval/state'

/**
 * What the screen has played of each Naval game, so the chat feed tells a strike once it landed
 * @typedef {Object} NavalPlayed
 * @property {number} match - Match on screen
 * @property {NavalShotView[]} shots - Shots fully played
 */

export interface NavalPlayed {
  match: number
  shots: NavalShotView[]
}

interface NavalPlayedStore {
  played: Record<string, NavalPlayed>
  setPlayed: (sessionId: string, match: number, shots: NavalShotView[]) => void
}

export const useNavalPlayedStore = create<NavalPlayedStore>()((set) => ({
  played: {},
  setPlayed: (sessionId, match, shots) =>
    set((state) => {
      const last = state.played[sessionId]
      const isSame =
        last?.match === match &&
        last.shots.length === shots.length &&
        last.shots.at(-1)?.rev === shots.at(-1)?.rev

      return isSame ? state : { played: { ...state.played, [sessionId]: { match, shots } } }
    }),
}))
