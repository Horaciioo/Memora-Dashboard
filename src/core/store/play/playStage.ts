'use client'

import { create } from 'zustand'

import { MEDIA } from '@/declarations/ui/responsive'

/**
 * Play stage store, a table always filling the page with its chat laid over it
 * @typedef {Object} PlayStageStore
 * @property {boolean} isFullscreen - Table fills the page, always on while a room is mounted
 * @property {boolean} isScreen - Browser screen taken, window chrome hidden
 * @property {boolean} isChatOpen - Chat shown over the table
 * @property {() => void} toggleScreen - Take or hand back the browser screen
 * @property {() => void} toggleChat - Show or hide the chat
 * @property {(isScreen: boolean) => void} setScreen - Follow the browser
 * @property {() => void} enter - Room opens, chat shown on wide screens
 */

interface PlayStageStore {
  isFullscreen: boolean
  isScreen: boolean
  isChatOpen: boolean
  toggleScreen: () => void
  toggleChat: () => void
  setScreen: (isScreen: boolean) => void
  enter: () => void
}

export const usePlayStageStore = create<PlayStageStore>()((set) => ({
  isFullscreen: true,
  isScreen: false,
  isChatOpen: false,
  toggleScreen: () => {
    if (document.fullscreenElement) return void document.exitFullscreen()
    void document.documentElement.requestFullscreen?.().catch(() => {})
  },
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  setScreen: (isScreen) => set({ isScreen }),
  enter: () => set({ isChatOpen: window.matchMedia(MEDIA.lg).matches }),
}))
