'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'

import { apiDelete, apiGet, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import { ANNUAL_REVIEW_COPY, CALENDAR_COPY } from '@/declarations/calendar/copy'
import { entityFeedback } from '@/declarations/ui/copy'
import type { AttendanceRoster, CalendarEntry } from '@/types/calendar'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

// What a slot gesture hands back: entries changed, open slots that went
interface SlotResult {
  entries: CalendarEntry[]
  removed: string[]
}

/**
 * Calendar state and mutations
 * @typedef {Object} CalendarCollection
 * @property {CalendarEntry[]} entries - Entries of the current window
 * @property {boolean} isSaving - Mutation in flight
 * @property {boolean} isLoading - Window being pulled
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} create - Post an entry
 * @property {(id: string, values: FormValues) => Promise<boolean>} update - Edit an entry
 * @property {(id: string, startsAt: Date) => Promise<void>} move - Drag an entry elsewhere
 * @property {(id: string, endsAt: Date) => Promise<void>} resize - Stretch an entry
 * @property {(id: string) => Promise<void>} remove - Drop an entry
 * @property {(id: string) => Promise<void>} takeSlot - Take an open slot of the annual reviews
 * @property {(id: string) => Promise<void>} clearOpenSlots - Remove the slots of a series nobody took
 * @property {(id: string, accountId: string) => Promise<void>} placeSlot - Place a Moderator on an open slot
 * @property {(id: string, moveTo: string | null) => Promise<void>} cancelSlot - Cancel a taken slot, or move it
 * @property {(ids: string[], values: FormValues) => Promise<boolean>} updateMany - Edit a selection
 * @property {(ids: string[]) => Promise<void>} removeMany - Drop a selection
 * @property {(from: string, to: string) => Promise<void>} load - Pull another window
 * @property {(id: string, status: AttendanceStatusName, hours?: { from: string, to: string }) => Promise<void>} respond - Answer a roll-call
 * @property {(id: string, accountId: string, status: AttendanceStatusName) => Promise<void>} moveAttendee - Move a member on a roll-call
 * @property {(id: string) => Promise<void>} remind - Ping the no-answers now
 */

export interface CalendarCollection {
  entries: CalendarEntry[]
  isSaving: boolean
  isLoading: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  create: (values: FormValues) => Promise<CalendarEntry | null>
  update: (id: string, values: FormValues) => Promise<boolean>
  move: (id: string, startsAt: Date) => Promise<void>
  resize: (id: string, endsAt: Date) => Promise<void>
  remove: (id: string) => Promise<void>
  takeSlot: (id: string) => Promise<void>
  clearOpenSlots: (id: string) => Promise<void>
  placeSlot: (id: string, accountId: string) => Promise<void>
  cancelSlot: (id: string, moveTo: string | null) => Promise<void>
  updateMany: (ids: string[], values: FormValues) => Promise<boolean>
  removeMany: (ids: string[]) => Promise<void>
  load: (from: string, to: string) => Promise<void>
  respond: (
    id: string,
    status: AttendanceStatusName,
    hours?: { from: string; to: string }
  ) => Promise<void>
  moveAttendee: (id: string, accountId: string, status: AttendanceStatusName) => Promise<void>
  remind: (id: string) => Promise<void>
}

/**
 * Drive the shared calendar
 * @param {CalendarEntry[]} initialEntries - Entries resolved server-side
 * @param {string} [sessionId] - Bounds every window read to one academy session
 * @return {CalendarCollection} - State and mutations
 */

export const useCalendar = (
  initialEntries: CalendarEntry[],
  sessionId?: string
): CalendarCollection => {
  const [entries, setEntries] = useState(initialEntries)
  const queryClient = useQueryClient()
  const { isSaving, issues, clearIssues, run: runMutation } = useMutation()
  const { notify } = useNotifications()
  const [isLoading, setLoading] = useState(false)
  // Latest window asked
  const loadTicket = useRef(0)
  // Writes sent so far
  const writeCount = useRef(0)

  // Every write is counted
  const run = useCallback<typeof runMutation>(
    (action, successTitle) => {
      writeCount.current++
      return runMutation(action, successTitle)
    },
    [runMutation]
  )

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
        entityFeedback('event', 'created', name)
      )

      if (entry) {
        replace(entry)
        // A model that opens several entries brings them along, with a message
        entry.siblings?.forEach(replace)
        if (entry.notice) notify({ tone: 'success', title: entry.notice })
      }

      return entry
    },
    [notify, replace, run]
  )

  // Entries a slot gesture changed, and the open slots it made useless
  const applySlots = useCallback(
    (result: SlotResult | null) => {
      if (!result) return
      result.entries.forEach(replace)
      if (result.removed.length > 0) {
        setEntries((current) => current.filter((row) => !result.removed.includes(row.id)))
      }
    },
    [replace]
  )

  const clearOpenSlots = useCallback(
    async (id: string) => {
      const result = await run(
        () => apiPost<{ removed: string[] }>(API_ROUTES.calendarSlotClear(id), {}),
        ANNUAL_REVIEW_COPY.clearOpenDone
      )
      if (result) setEntries((current) => current.filter((row) => !result.removed.includes(row.id)))
    },
    [run]
  )

  const takeSlot = useCallback(
    async (id: string) => {
      const result = await run(
        () => apiPost<SlotResult>(API_ROUTES.calendarSlot(id), {}),
        ANNUAL_REVIEW_COPY.slotTakenToast
      )
      applySlots(result)
    },
    [applySlots, run]
  )

  const placeSlot = useCallback(
    async (id: string, accountId: string) => {
      const result = await run(
        () => apiPost<SlotResult>(API_ROUTES.calendarSlot(id), { accountId }),
        ANNUAL_REVIEW_COPY.placed
      )
      applySlots(result)
    },
    [applySlots, run]
  )

  const cancelSlot = useCallback(
    async (id: string, moveTo: string | null) => {
      const changed = await run(
        () => apiPost<CalendarEntry[]>(API_ROUTES.calendarSlotCancel(id), { moveTo }),
        moveTo ? ANNUAL_REVIEW_COPY.postponed : ANNUAL_REVIEW_COPY.cancelled
      )
      changed?.forEach(replace)
    },
    [replace, run]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const name = typeof values.title === 'string' ? values.title : undefined
      const entry = await run(
        () => apiPatch<CalendarEntry>(API_ROUTES.calendarEntry(id), values),
        entityFeedback('event', 'saved', name)
      )

      if (entry) {
        replace(entry)
        // Reshaping a series makes and drops slots with it
        entry.siblings?.forEach(replace)
        if (entry.dropped?.length) {
          setEntries((current) => current.filter((row) => !entry.dropped?.includes(row.id)))
        }
      }

      return entry !== null
    },
    [replace, run]
  )

  const move = useCallback(
    async (id: string, startsAt: Date) => {
      // Optimistic
      const original = entries.find((row) => row.id === id)
      // Length kept
      setEntries((current) =>
        current.map((row) => {
          if (row.id !== id) return row

          const shift = startsAt.getTime() - new Date(row.startsAt).getTime()
          const endsAt = row.endsAt ? new Date(new Date(row.endsAt).getTime() + shift) : null

          return { ...row, startsAt: startsAt.toISOString(), endsAt: endsAt?.toISOString() ?? null }
        })
      )

      const entry = await run(() =>
        apiPatch<CalendarEntry>(API_ROUTES.calendarEntry(id), {
          startsAt: startsAt.toISOString(),
        })
      )

      if (entry) replace(entry)
      // Undo this row only
      else if (original) {
        setEntries((current) => current.map((row) => (row.id === id ? original : row)))
      }
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
        entityFeedback('event', 'saved')
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
        entityFeedback('event', 'deleted')
      )

      if (done) setEntries((current) => current.filter((row) => !ids.includes(row.id)))
    },
    [run]
  )

  const load = useCallback(
    async (from: string, to: string) => {
      // A window read never raises a toast
      const ticket = ++loadTicket.current
      setLoading(true)
      let next: CalendarEntry[] | null
      let writes: number

      // Read again after a write
      do {
        writes = writeCount.current
        next = await queryClient
          .fetchQuery({
            queryKey: QUERY_KEYS.calendar(from, to, sessionId),
            queryFn: ({ signal }) =>
              apiGet<CalendarEntry[]>(API_ROUTES.calendar(from, to, sessionId), signal),
            // Local writes outdate it
            staleTime: 0,
          })
          .catch(() => null)
        // A newer window wins
        if (ticket !== loadTicket.current) return
      } while (writes !== writeCount.current)

      setLoading(false)
      if (next) setEntries(next)
    },
    [sessionId, queryClient]
  )

  const remove = useCallback(
    async (id: string) => {
      const name = entries.find((row) => row.id === id)?.title
      const done = await run(
        () => apiDelete<{ id: string }>(API_ROUTES.calendarEntry(id)),
        entityFeedback('event', 'deleted', name)
      )

      if (done) setEntries((current) => current.filter((row) => row.id !== id))
    },
    [run, entries]
  )

  const setRoster = useCallback((id: string, roster: AttendanceRoster) => {
    setEntries((current) =>
      current.map((row) => (row.id === id ? { ...row, attendance: roster } : row))
    )
  }, [])

  const respond = useCallback(
    async (id: string, status: AttendanceStatusName, hours?: { from: string; to: string }) => {
      const roster = await run(
        () =>
          apiPost<AttendanceRoster>(API_ROUTES.calendarEntryAttendance(id), { status, ...hours }),
        entityFeedback('event', 'saved')
      )

      if (roster) setRoster(id, roster)
    },
    [run, setRoster]
  )

  const moveAttendee = useCallback(
    async (id: string, accountId: string, status: AttendanceStatusName) => {
      const roster = await run(
        () =>
          apiPatch<AttendanceRoster>(API_ROUTES.calendarEntryAttendance(id), { accountId, status }),
        entityFeedback('event', 'saved')
      )

      if (roster) setRoster(id, roster)
    },
    [run, setRoster]
  )

  const remind = useCallback(
    async (id: string) => {
      const roster = await run(
        () => apiPost<AttendanceRoster>(API_ROUTES.calendarEntryReminder(id), {}),
        CALENDAR_COPY.reminderSent
      )

      if (roster) setRoster(id, roster)
    },
    [run, setRoster]
  )

  return {
    entries,
    isSaving,
    isLoading,
    issues,
    clearIssues,
    create,
    takeSlot,
    clearOpenSlots,
    placeSlot,
    cancelSlot,
    update,
    move,
    resize,
    remove,
    updateMany,
    removeMany,
    load,
    respond,
    moveAttendee,
    remind,
  }
}
