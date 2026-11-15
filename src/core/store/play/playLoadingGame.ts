'use client'

import { create } from 'zustand'

import type { PlayGameName } from '@/utils/constants/play'

/**
 * Game the next loading screen dresses up as
 * @typedef {Object} PlayLoadingGameStore
 * @property {PlayGameName | null} game - Game being opened, null when unknown
 * @property {(game: PlayGameName | null) => void} aim - Remember it before navigating
 */

interface PlayLoadingGameStore {
  game: PlayGameName | null
  aim: (game: PlayGameName | null) => void
}

export const usePlayLoadingGameStore = create<PlayLoadingGameStore>((set) => ({
  game: null,
  aim: (game) => set({ game }),
}))
