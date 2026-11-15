'use client'

import { create } from 'zustand'

/**
 * Play gestures waiting on the server
 * @typedef {Object} PlayBusyStore
 * @property {string[]} labels - Running gestures, latest last
 * @property {(label: string) => () => void} begin - Start one, returns its end
 */

interface PlayBusyStore {
  labels: string[]
  begin: (label: string) => () => void
}

export const usePlayBusyStore = create<PlayBusyStore>((set) => ({
  labels: [],
  begin: (label) => {
    set((state) => ({ labels: [...state.labels, label] }))
    let isDone = false

    return () => {
      if (isDone) return
      isDone = true
      set((state) => {
        const index = state.labels.lastIndexOf(label)

        return { labels: state.labels.filter((_, at) => at !== index) }
      })
    }
  },
}))
