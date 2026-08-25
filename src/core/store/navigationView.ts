'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { NavigationViews } from '@/declarations/navigation'
import type { NavigationViewName } from '@/declarations/navigation'

/**
 * Rail view store
 * @typedef {Object} NavigationViewStore
 * @property {NavigationViewName} view - Selected view
 * @property {(view: NavigationViewName) => void} setView - Set view
 */

interface NavigationViewStore {
  view: NavigationViewName
  setView: (view: NavigationViewName) => void
}

export const useNavigationViewStore = create<NavigationViewStore>()(
  persist(
    (set) => ({
      view: NavigationViews.Moderation,
      setView: (view) => set({ view }),
    }),
    // The rail renders on the server, so rehydration waits for an effect
    { name: 'navigation-view', skipHydration: true }
  )
)
