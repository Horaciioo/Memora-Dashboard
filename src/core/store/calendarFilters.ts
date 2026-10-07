'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { CalendarLayers } from '@/utils/constants/workflow'
import type { CalendarLayerName } from '@/utils/constants/workflow'
import type { CalendarUnit } from '@/utils/format/calendar'

/**
 * Calendar filter store
 * @typedef {Object} CalendarFiltersStore
 * @property {CalendarLayerName[]} hiddenLayers - Calendars switched off
 * @property {string[]} hiddenCreators - Creators switched off
 * @property {CalendarUnit} unit - Span the grid was left on
 * @property {(unit: CalendarUnit) => void} setUnit - Change the span
 * @property {(layers: CalendarLayerName[]) => void} setHiddenLayers - Replace the switched off calendars
 * @property {(layer: CalendarLayerName) => void} toggleLayer - Flip a calendar
 * @property {(creatorId: string) => void} toggleCreator - Flip a creator
 */

interface CalendarFiltersStore {
  hiddenLayers: CalendarLayerName[]
  hiddenCreators: string[]
  unit: CalendarUnit
  setUnit: (unit: CalendarUnit) => void
  setHiddenLayers: (layers: CalendarLayerName[]) => void
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
      unit: 'month',
      setUnit: (unit) => set({ unit }),
      setHiddenLayers: (layers) => set({ hiddenLayers: layers }),
      toggleLayer: (layer) => set((state) => ({ hiddenLayers: flip(state.hiddenLayers, layer) })),
      toggleCreator: (creatorId) =>
        set((state) => ({ hiddenCreators: flip(state.hiddenCreators, creatorId) })),
    }),
    // Read after mount
    { name: 'calendarFilters', skipHydration: true }
  )
)
