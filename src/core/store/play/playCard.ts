'use client'

import { create } from 'zustand'

/**
 * Player whose card is open
 * @typedef {Object} PlayCardStore
 * @property {string | null} openId - Player, none when closed
 */

interface PlayCardStore {
  openId: string | null
  open: (accountId: string) => void
  close: () => void
}

export const usePlayCardStore = create<PlayCardStore>()((set) => ({
  openId: null,
  open: (accountId) => set({ openId: accountId }),
  close: () => set({ openId: null }),
}))
