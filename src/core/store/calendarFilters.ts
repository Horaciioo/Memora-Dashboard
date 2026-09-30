'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { CalendarLayers } from '@/utils/constants/workflow'
import type { CalendarLayerName } from '@/utils/constants/workflow'

/**
 * Calendar filter store
 * @typedef {Object} CalendarFiltersStore
 * @property {CalendarLayerName[]} hiddenLayers - Calendars switched off
 * @property {string[]} hiddenCreators - Creators switched off
 * @property {(layer: CalendarLayerName) => void} toggleLayer - Flip a calendar
 * @property {(creatorId: string) => void} toggleCreator - Flip a creator
 */

interface CalendarFiltersStore {
  hiddenLayers: CalendarLayerName[]
  hiddenCreators: string[]
  toggleLayer: (layer: CalendarLayerName) => void
  toggleCreator: (creatorId: string) => void
}

// Adds or drops one entry
const flip = <T extends string>(list: T[], item: T): T[] =>
  list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]

export const useCalendarFiltersStore = create<CalendarFiltersStore>()(
  persist(
    (set) => ({
      // Absences stay out of the way until asked for
      hiddenLayers: [CalendarLayers.Absences],
      hiddenCreators: [],
      toggleLayer: (layer) => set((state) => ({ hiddenLayers: flip(state.hiddenLayers, layer) })),
      toggleCreator: (creatorId) =>
        set((state) => ({ hiddenCreators: flip(state.hiddenCreators, creatorId) })),
    }),
    // Read after mount, so the server markup never disagrees with the browser
    { name: 'calendarFilters', skipHydration: true }
  )
)
