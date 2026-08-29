'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiGet, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import type { CalendarEntry } from '@/types/calendar'
import type { FieldIssue, FormValues } from '@/types/forms'

// Toast entity label
const ENTITY = 'Évènement'
const GENDER = 'masculine'

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
 * @property {(id: string, endsAt: Date) => Promise<void>} resize - Stretch an entry
 * @property {(id: string) => Promise<void>} remove - Drop an entry
 * @property {(ids: string[], values: FormValues) => Promise<boolean>} updateMany - Edit a selection
 * @property {(ids: string[]) => Promise<void>} removeMany - Drop a selection
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
  resize: (id: string, endsAt: Date) => Promise<void>
  remove: (id: string) => Promise<void>
  updateMany: (ids: string[], values: FormValues) => Promise<boolean>
  removeMany: (ids: string[]) => Promise<void>
  load: (from: string, to: string) => Promise<void>
}

/**
 * Drive the shared calendar, or one session's own window
 * @param {CalendarEntry[]} initialEntries - Entries resolved server-side
 * @param {string} [sessionId] - Bounds every window read to one academy session
 * @return {CalendarCollection} - State and mutations
 */

export const useCalendar = (
  initialEntries: CalendarEntry[],
  sessionId?: string
): CalendarCollection => {
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
      const name = typeof values.title === 'string' ? values.title : undefined
      const entry = await run(
        () => apiPost<CalendarEntry>(API_ROUTES.calendarEntries, values),
        feedbackTitle(ENTITY, 'created', GENDER, name)
      )

      if (entry) replace(entry)

      return entry !== null
    },
    [replace, run]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const name = typeof values.title === 'string' ? values.title : undefined
      const entry = await run(
        () => apiPatch<CalendarEntry>(API_ROUTES.calendarEntry(id), values),
        feedbackTitle(ENTITY, 'saved', GENDER, name)
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

  const resize = useCallback(
    async (id: string, endsAt: Date) => {
      const entry = await run(() =>
        apiPatch<CalendarEntry>(API_ROUTES.calendarEntry(id), { endsAt: endsAt.toISOString() })
      )

      if (entry) replace(entry)
    },
    [replace, run]
  )

  const updateMany = useCallback(
    async (ids: string[], values: FormValues) => {
      const updated = await run(
        () => apiPatch<CalendarEntry[]>(API_ROUTES.calendarEntries, { ids, ...values }),
        feedbackTitle(ENTITY, 'saved', GENDER)
      )

      if (updated) {
        const byId = new Map(updated.map((entry) => [entry.id, entry]))
        setEntries((current) => current.map((row) => byId.get(row.id) ?? row))
      }

      return updated !== null
    },
    [run]
  )

  const removeMany = useCallback(
    async (ids: string[]) => {
      const done = await run(
        () => apiDelete<{ ids: string[] }>(API_ROUTES.calendarEntries, { ids }),
        feedbackTitle(ENTITY, 'deleted', GENDER)
      )

      if (done) setEntries((current) => current.filter((row) => !ids.includes(row.id)))
    },
    [run]
  )

  const load = useCallback(
    async (from: string, to: string) => {
      // A window read never raises a toast, the grid simply refills
      const next = await apiGet<CalendarEntry[]>(API_ROUTES.calendar(from, to, sessionId)).catch(
        () => null
      )
      if (next) setEntries(next)
    },
    [sessionId]
  )

  const remove = useCallback(
    async (id: string) => {
      const name = entries.find((row) => row.id === id)?.title
      const done = await run(
        () => apiDelete<{ id: string }>(API_ROUTES.calendarEntry(id)),
        feedbackTitle(ENTITY, 'deleted', GENDER, name)
      )

      if (done) setEntries((current) => current.filter((row) => row.id !== id))
    },
    [run, entries]
  )

  return {
    entries,
    isSaving,
    issues,
    clearIssues,
    create,
    update,
    move,
    resize,
    remove,
    updateMany,
    removeMany,
    load,
  }
}
