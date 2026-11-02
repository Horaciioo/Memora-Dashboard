'use client'

import { create } from 'zustand'

/**
 * How far the screen has played each Ludo game, so the feed tells a line when its beat comes
 * @typedef {Object} LudoPlayedStore
 * @property {Record<string, number>} revs - Newest line played, by game
 */

interface LudoPlayedStore {
  revs: Record<string, number>
  setPlayed: (sessionId: string, rev: number) => void
}

export const useLudoPlayedStore = create<LudoPlayedStore>()((set) => ({
  revs: {},
  setPlayed: (sessionId, rev) =>
    set((state) =>
      state.revs[sessionId] === rev ? state : { revs: { ...state.revs, [sessionId]: rev } }
    ),
}))
