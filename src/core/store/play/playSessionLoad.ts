'use client'

import { create } from 'zustand'

/**
 * Heavy parts of a table still loading
 * @typedef {Object} PlaySessionLoadStore
 * @property {string[]} holds - Names of the parts not ready yet
 * @property {boolean} isCovered - Loading screen still over the table
 * @property {(isCovered: boolean) => void} setCover - Set by the room
 * @property {(name: string) => () => void} hold - Mark one as loading, returns its release
 */

interface PlaySessionLoadStore {
  holds: string[]
  isCovered: boolean
  setCover: (isCovered: boolean) => void
  hold: (name: string) => () => void
}

export const usePlaySessionLoadStore = create<PlaySessionLoadStore>((set) => ({
  holds: [],
  isCovered: false,
  setCover: (isCovered) => set({ isCovered }),
  hold: (name) => {
    set((state) => ({ holds: [...state.holds, name] }))
    let isDone = false

    return () => {
      if (isDone) return
      isDone = true
      set((state) => {
        const index = state.holds.lastIndexOf(name)

        return { holds: state.holds.filter((_, at) => at !== index) }
      })
    }
  },
}))
