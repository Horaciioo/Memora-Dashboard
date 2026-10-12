'use client'

import { useCallback, useSyncExternalStore } from 'react'

export type CalendarRailView = 'calendar' | 'classic'

const STORAGE_KEY = 'memora:calendar-rail-view'
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

const readView = (): CalendarRailView => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'classic' ? 'classic' : 'calendar'
  } catch {
    return 'calendar'
  }
}

/**
 * Menu shown beside the calendar, kept in the browser
 * @return {[CalendarRailView, (view: CalendarRailView) => void]} - View and its setter
 */

export const useCalendarRailView = (): [CalendarRailView, (view: CalendarRailView) => void] => {
  const view = useSyncExternalStore(subscribe, readView, () => 'calendar' as const)

  const choose = useCallback((next: CalendarRailView) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage blocked
    }
    listeners.forEach((listener) => listener())
  }, [])

  return [view, choose]
}
