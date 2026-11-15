'use client'

import { create } from 'zustand'

/**
 * Lobby gestures shared between the table and the feed
 * @typedef {Object} PlayLobbyStore
 * @property {boolean} isSetupOpen - Rules drawer asked open
 * @property {(isOpen: boolean) => void} setSetupOpen - Open or close it
 */

interface PlayLobbyStore {
  isSetupOpen: boolean
  setSetupOpen: (isOpen: boolean) => void
}

export const usePlayLobbyStore = create<PlayLobbyStore>((set) => ({
  isSetupOpen: false,
  setSetupOpen: (isOpen) => set({ isSetupOpen: isOpen }),
}))
