'use client'

import { useSyncExternalStore } from 'react'

import type { CalendarSidebarProps } from '@/composites/calendar/CalendarSidebar'

let rail: CalendarSidebarProps | null = null
const listeners = new Set<() => void>()

/**
 * Hands the calendar's month and switches to the sidebar
 * @param {CalendarSidebarProps | null} next - Rail state
 * @return {void}
 */

export const publishCalendarRail = (next: CalendarSidebarProps | null): void => {
  rail = next
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

/**
 * Calendar open in the page
 * @return {CalendarSidebarProps | null} - Rail state
 */

export const useCalendarRail = (): CalendarSidebarProps | null =>
  useSyncExternalStore(
    subscribe,
    () => rail,
    () => null
  )
