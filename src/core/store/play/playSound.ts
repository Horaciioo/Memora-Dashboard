'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { PLAY_VOLUME } from '@/declarations/play/sounds'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Play sound store
 * @typedef {Object} PlaySoundStore
 * @property {boolean} isMuted - Sound cut
 * @property {number} master - Global level, zero to one
 * @property {Partial<Record<PlayGameName, number>>} games - Levels set game by game
 * @property {() => void} toggle - Cut or restore
 * @property {(volume: number) => void} setMaster - Global level
 * @property {(game: PlayGameName, volume: number) => void} setGame - Level of one game
 * @property {(game: PlayGameName) => void} followMaster - Drop the level of one game
 */

interface PlaySoundStore {
  isMuted: boolean
  master: number
  games: Partial<Record<PlayGameName, number>>
  toggle: () => void
  setMaster: (volume: number) => void
  setGame: (game: PlayGameName, volume: number) => void
  followMaster: (game: PlayGameName) => void
}

// Zero to one
const clamp = (volume: number): number => Math.min(1, Math.max(0, volume))

/**
 * Level of a game, its own or the global one
 * @param {Pick<PlaySoundStore, 'master' | 'games'>} state - Store
 * @param {PlayGameName} game - Game
 * @return {number} - Zero to one
 */

export const volumeOf = (
  { master, games }: Pick<PlaySoundStore, 'master' | 'games'>,
  game: PlayGameName
): number => games[game] ?? master

export const usePlaySoundStore = create<PlaySoundStore>()(
  persist(
    (set) => ({
      isMuted: false,
      master: PLAY_VOLUME.master,
      games: {},
      toggle: () => set((state) => ({ isMuted: !state.isMuted })),
      setMaster: (volume) => set({ master: clamp(volume), isMuted: false }),
      setGame: (game, volume) =>
        set((state) => ({ games: { ...state.games, [game]: clamp(volume) }, isMuted: false })),
      followMaster: (game) =>
        set((state) => {
          const games = { ...state.games }
          delete games[game]

          return { games }
        }),
    }),
    // Version 1 left the single old level behind
    {
      name: 'play-sound',
      version: 1,
      migrate: () => ({ isMuted: false, master: PLAY_VOLUME.master, games: {} }),
    }
  )
)

/**
 * Level to play a game at, none while muted
 * @param {PlayGameName} game - Game
 * @return {number} - Zero to one, zero when muted
 */

export const playLevelOf = (game: PlayGameName): number => {
  const state = usePlaySoundStore.getState()

  return state.isMuted ? 0 : volumeOf(state, game)
}
