'use client'

import { useEffect } from 'react'

import type { CalendarUnit } from '@/utils/format/calendar'

export interface CalendarShortcutHandlers {
  onToday: () => void
  onStep: (amount: number) => void
  onUnit: (unit: CalendarUnit) => void
  // Missing when the viewer may not post entries
  onCreate?: () => void
}

// Key to span
const UNIT_KEYS: Record<string, CalendarUnit> = {
  d: 'day',
  w: 'week',
  m: 'month',
  a: 'agenda',
}

/**
 * Read a key press aimed at a field or an open overlay
 * @param {EventTarget | null} target - Element that took the key
 * @return {boolean} - Typing or inside an overlay
 */

const isTyping = (target: EventTarget | null): boolean => {
  const element = target as HTMLElement | null
  if (!element?.closest) return false

  return (
    element.isContentEditable ||
    element.closest('input, textarea, select, [role="dialog"], [role="listbox"]') !== null
  )
}

/**
 * Calendar keyboard shortcuts, the Google Agenda ones
 * @param {CalendarShortcutHandlers} handlers - What each key does
 * @return {void}
 */

export const useCalendarShortcuts = ({
  onToday,
  onStep,
  onUnit,
  onCreate,
}: CalendarShortcutHandlers): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return

      const key = event.key.toLowerCase()

      if (key === 't') onToday()
      else if (key === 'j' || key === 'p') onStep(-1)
      else if (key === 'k' || key === 'n') onStep(1)
      else if (key === 'c' && onCreate) onCreate()
      else if (UNIT_KEYS[key]) onUnit(UNIT_KEYS[key])
      else return

      event.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onToday, onStep, onUnit, onCreate])
}
