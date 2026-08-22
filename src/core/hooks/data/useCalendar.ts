'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiGet, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { FEEDBACK_COPY } from '@/declarations/ui/copy'
import type { CalendarEntry } from '@/types/calendar'
import type { FieldIssue, FormValues } from '@/types/forms'

/**
 * Calendar state and mutations
 * @typedef {Object} CalendarCollection
 * @property {CalendarEntry[]} entries - Entries of the current window
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} create - Post an entry
 * @property {(id: string, values: FormValues) => Promise<boolean>} update - Edit an entry
 * @property {(id: string, startsAt: Date) => Promise<void>} move - Drag an entry elsewhere
 * @property {(id: string) => Promise<void>} remove - Drop an entry
 * @property {(from: string, to: string) => Promise<void>} load - Pull another window
 */

export interface CalendarCollection {
  entries: CalendarEntry[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  create: (values: FormValues) => Promise<boolean>
  update: (id: string, values: FormValues) => Promise<boolean>
  move: (id: string, startsAt: Date) => Promise<void>
  remove: (id: string) => Promise<void>
  load: (from: string, to: string) => Promise<void>
}

/**
 * Drive the shared calendar
 * @param {CalendarEntry[]} initialEntries - Entries resolved server-side
 * @return {CalendarCollection} - State and mutations
 */

export const useCalendar = (initialEntries: CalendarEntry[]): CalendarCollection => {
  const [entries, setEntries] = useState(initialEntries)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const replace = useCallback((entry: CalendarEntry) => {
    setEntries((current) => {
      const known = current.some((row) => row.id === entry.id)

      return known ? current.map((row) => (row.id === entry.id ? entry : row)) : [...current, entry]
    })
  }, [])

  const create = useCallback(
    async (values: FormValues) => {
      const entry = await run(
        () => apiPost<CalendarEntry>(API_ROUTES.calendarEntries, values),
        FEEDBACK_COPY.created
      )

      if (entry) replace(entry)

      return entry !== null
    },
    [replace, run]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const entry = await run(
        () => apiPatch<CalendarEntry>(API_ROUTES.calendarEntry(id), values),
        FEEDBACK_COPY.saved
      )

      if (entry) replace(entry)

      return entry !== null
    },
    [replace, run]
  )

  const move = useCallback(
    async (id: string, startsAt: Date) => {
      // Optimistic, so the card follows the pointer instead of waiting on the round trip
      const previous = entries
      setEntries((current) =>
        current.map((row) => (row.id === id ? { ...row, startsAt: startsAt.toISOString() } : row))
      )

      const entry = await run(() =>
        apiPatch<CalendarEntry>(API_ROUTES.calendarEntry(id), {
          startsAt: startsAt.toISOString(),
        })
      )

      if (entry) replace(entry)
      else setEntries(previous)
    },
    [entries, replace, run]
  )

  const load = useCallback(async (from: string, to: string) => {
    // A window read never raises a toast, the grid simply refills
    const next = await apiGet<CalendarEntry[]>(API_ROUTES.calendar(from, to)).catch(() => null)
    if (next) setEntries(next)
  }, [])

  const remove = useCallback(
    async (id: string) => {
      const done = await run(
        () => apiDelete<{ id: string }>(API_ROUTES.calendarEntry(id)),
        FEEDBACK_COPY.deleted
      )

      if (done) setEntries((current) => current.filter((row) => row.id !== id))
    },
    [run]
  )

  return { entries, isSaving, issues, clearIssues, create, update, move, remove, load }
}
