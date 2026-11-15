'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { playPrefId, playPrefInitial } from '@/declarations/play/prefs'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Play display switches, kept on the device
 * @typedef {Object} PlayPrefsStore
 * @property {boolean} isHudHidden - HUD blocks hidden, keys stay
 * @property {Record<string, boolean>} flags - Game switches the player changed
 * @property {() => void} toggleHud - Show or hide the HUD
 * @property {(game: PlayGameName, key: string) => void} flip - Flip a game switch
 */

interface PlayPrefsStore {
  isHudHidden: boolean
  flags: Record<string, boolean>
  toggleHud: () => void
  flip: (game: PlayGameName, key: string) => void
}

export const usePlayPrefsStore = create<PlayPrefsStore>()(
  persist(
    (set) => ({
      isHudHidden: false,
      flags: {},
      toggleHud: () => set((state) => ({ isHudHidden: !state.isHudHidden })),
      flip: (game, key) =>
        set((state) => {
          const id = playPrefId(game, key)

          return {
            flags: { ...state.flags, [id]: !(state.flags[id] ?? playPrefInitial(game, key)) },
          }
        }),
    }),
    { name: 'play-prefs' }
  )
)

/**
 * One game switch, its initial value until the player flips it
 * @param {PlayGameName} game - Game
 * @param {string} key - Switch key
 * @return {boolean} - On or off
 */

export const usePlayPref = (game: PlayGameName, key: string): boolean =>
  usePlayPrefsStore((state) => state.flags[playPrefId(game, key)] ?? playPrefInitial(game, key))
