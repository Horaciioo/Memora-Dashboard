'use client'

import { create } from 'zustand'

/**
 * Score boxes of a game screen, hidden until the trophy key opens them
 * @typedef {Object} PlayScoreStore
 * @property {boolean} isOpen - Score boxes shown
 * @property {() => void} toggle - Open or close them
 * @property {() => void} close - Back to hidden, at each new game
 */

interface PlayScoreStore {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

export const usePlayScoreStore = create<PlayScoreStore>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}))
