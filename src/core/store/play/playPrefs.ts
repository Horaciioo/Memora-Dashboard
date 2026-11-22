'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { PLAY_COLUMNS } from '@/declarations/play/columns'
import { playPrefId, playPrefInitial } from '@/declarations/play/prefs'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Play display switches, kept on the device
 * @typedef {Object} PlayPrefsStore
 * @property {boolean} isHudHidden - HUD blocks hidden, keys stay
 * @property {boolean} isInviteHidden - Invitation bubbles hidden
 * @property {boolean} isCountdownOff - Count tick and start sound cut
 * @property {number} friendsWidth - Friends column width, px
 * @property {Record<string, boolean>} flags - Game switches the player changed
 * @property {() => void} toggleHud - Show or hide the HUD
 * @property {() => void} toggleInvites - Hide or show the invitation bubbles
 * @property {() => void} toggleCountdown - Cut or restore the count sounds
 * @property {() => void} reset - Back to the starting choices
 * @property {(width: number) => void} setFriendsWidth - Resize the friends column
 * @property {(game: PlayGameName, key: string) => void} flip - Flip a game switch
 */

interface PlayPrefsStore {
  isHudHidden: boolean
  isInviteHidden: boolean
  isCountdownOff: boolean
  friendsWidth: number
  flags: Record<string, boolean>
  toggleHud: () => void
  toggleInvites: () => void
  toggleCountdown: () => void
  reset: () => void
  setFriendsWidth: (width: number) => void
  flip: (game: PlayGameName, key: string) => void
}

export const usePlayPrefsStore = create<PlayPrefsStore>()(
  persist(
    (set) => ({
      isHudHidden: false,
      isInviteHidden: false,
      isCountdownOff: false,
      friendsWidth: PLAY_COLUMNS.friends.initial,
      flags: {},
      toggleHud: () => set((state) => ({ isHudHidden: !state.isHudHidden })),
      toggleInvites: () => set((state) => ({ isInviteHidden: !state.isInviteHidden })),
      toggleCountdown: () => set((state) => ({ isCountdownOff: !state.isCountdownOff })),
      reset: () =>
        set({
          isHudHidden: false,
          isInviteHidden: false,
          isCountdownOff: false,
          friendsWidth: PLAY_COLUMNS.friends.initial,
          flags: {},
        }),
      setFriendsWidth: (width) => set({ friendsWidth: width }),
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
