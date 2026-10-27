'use client'

import { flushSync } from 'react-dom'
import { create } from 'zustand'

/**
 * Play stage store, a table taking the whole screen with its chat laid over it
 * @typedef {Object} PlayStageStore
 * @property {boolean} isFullscreen - Table fills the screen
 * @property {boolean} isChatOpen - Chat column shown while full screen
 * @property {() => void} toggleFullscreen - Enter or leave
 * @property {() => void} toggleChat - Show or hide the chat
 * @property {() => void} leave - Back to the page
 */

let settled: Promise<unknown> = Promise.resolve()

/**
 * Resolves once the running morph is over, the browser mode waits for it so the viewport stays still
 * @return {Promise<unknown>}
 */

export const stageSettled = () => settled

/**
 * Run a stage change inside a view transition so the room morphs between sizes
 * @param {() => void} change - State change, applied to the DOM at once
 * @return {void}
 */

export const morphStage = (change: () => void) => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // A hidden tab never paints, the browser would time the transition out
  if (reduced || document.hidden || !document.startViewTransition) return change()
  let isApplied = false
  const apply = () => {
    if (isApplied) return
    isApplied = true
    flushSync(change)
  }
  const morph = document.startViewTransition(apply)
  settled = morph.finished.catch(() => {})
  morph.ready.catch(() => {})
  morph.updateCallbackDone.catch(() => {})
  // Callback never ran: change anyway
  window.setTimeout(apply, 1000)
}

interface PlayStageStore {
  isFullscreen: boolean
  isChatOpen: boolean
  toggleFullscreen: () => void
  toggleChat: () => void
  leave: () => void
}

export const usePlayStageStore = create<PlayStageStore>()((set) => ({
  isFullscreen: false,
  isChatOpen: false,
  toggleFullscreen: () =>
    morphStage(() => set((state) => ({ isFullscreen: !state.isFullscreen, isChatOpen: false }))),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  leave: () => set({ isFullscreen: false, isChatOpen: false }),
}))
