'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { FEEDBACK_COPY } from '@/declarations/ui/copy'
import type { AcademyEventView, JuniorView, SessionSummary } from '@/types/academy'
import type { FieldIssue, FormValues } from '@/types/forms'

/**
 * Session list state and mutations
 * @typedef {Object} SessionCollection
 * @property {SessionSummary[]} sessions - Declared sessions
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} create - Open a session
 * @property {(id: string, values: FormValues) => Promise<boolean>} update - Edit a session
 * @property {(id: string) => Promise<void>} remove - Drop a session
 */

export interface SessionCollection {
  sessions: SessionSummary[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  create: (values: FormValues) => Promise<boolean>
  update: (id: string, values: FormValues) => Promise<boolean>
  remove: (id: string) => Promise<void>
}

/**
 * Drive the academy session list
 * @param {SessionSummary[]} initialSessions - Sessions resolved server-side
 * @return {SessionCollection} - State and mutations
 */

export const useSessions = (initialSessions: SessionSummary[]): SessionCollection => {
  const [sessions, setSessions] = useState(initialSessions)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const create = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPost<SessionSummary[]>(API_ROUTES.academy, values),
        FEEDBACK_COPY.created
      )

      if (next) setSessions(next)

      return next !== null
    },
    [run]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const next = await run(
        () => apiPatch<SessionSummary[]>(API_ROUTES.session(id), values),
        FEEDBACK_COPY.saved
      )

      if (next) setSessions(next)

      return next !== null
    },
    [run]
  )

  const remove = useCallback(
    async (id: string) => {
      const next = await run(
        () => apiDelete<SessionSummary[]>(API_ROUTES.session(id)),
        FEEDBACK_COPY.deleted
      )

      if (next) setSessions(next)
    },
    [run]
  )

  return { sessions, isSaving, issues, clearIssues, create, update, remove }
}

/**
 * One session state and mutations
 * @typedef {Object} SessionState
 * @property {JuniorView[]} juniors - Juniors inside
 * @property {AcademyEventView[]} events - Session thread
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} addJunior - Take a moderator in
 * @property {(id: string, values: FormValues) => Promise<boolean>} editJunior - Edit a junior
 * @property {(id: string) => Promise<void>} dropJunior - Take a junior out
 * @property {(values: FormValues) => Promise<boolean>} addEvent - Note a moment
 * @property {(id: string, values: FormValues) => Promise<boolean>} editEvent - Edit a moment
 * @property {(id: string, done: boolean) => Promise<void>} setEventDone - Flip a moment
 * @property {(id: string) => Promise<void>} dropEvent - Drop a moment
 */

export interface SessionState {
  juniors: JuniorView[]
  events: AcademyEventView[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  addJunior: (values: FormValues) => Promise<boolean>
  editJunior: (id: string, values: FormValues) => Promise<boolean>
  dropJunior: (id: string) => Promise<void>
  addEvent: (values: FormValues) => Promise<boolean>
  editEvent: (id: string, values: FormValues) => Promise<boolean>
  setEventDone: (id: string, done: boolean) => Promise<void>
  dropEvent: (id: string) => Promise<void>
}

/**
 * Drive one academy session
 * @param {string} sessionId - Session identifier
 * @param {JuniorView[]} initialJuniors - Juniors resolved server-side
 * @param {AcademyEventView[]} initialEvents - Thread resolved server-side
 * @return {SessionState} - State and mutations
 */

export const useSession = (
  sessionId: string,
  initialJuniors: JuniorView[],
  initialEvents: AcademyEventView[]
): SessionState => {
  const [juniors, setJuniors] = useState(initialJuniors)
  const [events, setEvents] = useState(initialEvents)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const addJunior = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPost<JuniorView[]>(API_ROUTES.sessionJuniors(sessionId), values),
        FEEDBACK_COPY.created
      )

      if (next) setJuniors(next)

      return next !== null
    },
    [run, sessionId]
  )

  const editJunior = useCallback(
    async (id: string, values: FormValues) => {
      const next = await run(
        () => apiPatch<JuniorView[]>(API_ROUTES.junior(id), values),
        FEEDBACK_COPY.saved
      )

      if (next) setJuniors(next)

      return next !== null
    },
    [run]
  )

  const dropJunior = useCallback(
    async (id: string) => {
      const next = await run(
        () => apiDelete<JuniorView[]>(API_ROUTES.junior(id)),
        FEEDBACK_COPY.deleted
      )

      if (next) setJuniors(next)
    },
    [run]
  )

  const addEvent = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPost<AcademyEventView[]>(API_ROUTES.sessionMoments(sessionId), values),
        FEEDBACK_COPY.created
      )

      if (next) setEvents(next)

      return next !== null
    },
    [run, sessionId]
  )

  const editEvent = useCallback(
    async (id: string, values: FormValues) => {
      const next = await run(
        () => apiPatch<AcademyEventView[]>(API_ROUTES.moment(id), values),
        FEEDBACK_COPY.saved
      )

      if (next) setEvents(next)

      return next !== null
    },
    [run]
  )

  const setEventDone = useCallback(
    async (id: string, done: boolean) => {
      const next = await run(() => apiPatch<AcademyEventView[]>(API_ROUTES.moment(id), { done }))

      if (next) setEvents(next)
    },
    [run]
  )

  const dropEvent = useCallback(
    async (id: string) => {
      const next = await run(
        () => apiDelete<AcademyEventView[]>(API_ROUTES.moment(id)),
        FEEDBACK_COPY.deleted
      )

      if (next) setEvents(next)
    },
    [run]
  )

  return {
    juniors,
    events,
    isSaving,
    issues,
    clearIssues,
    addJunior,
    editJunior,
    dropJunior,
    addEvent,
    editEvent,
    setEventDone,
    dropEvent,
  }
}
