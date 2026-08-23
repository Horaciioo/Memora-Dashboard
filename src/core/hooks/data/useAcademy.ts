'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import type { AcademyStepView, JuniorView, SessionSummary } from '@/types/academy'
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
        feedbackTitle('Session', 'created', 'feminine')
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
        feedbackTitle('Session', 'saved', 'feminine')
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
        feedbackTitle('Session', 'deleted', 'feminine')
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
 * @property {AcademyStepView[]} steps - Session thread
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} addJunior - Take a moderator in
 * @property {(id: string, values: FormValues) => Promise<boolean>} editJunior - Edit a junior
 * @property {(id: string) => Promise<void>} dropJunior - Take a junior out
 * @property {(values: FormValues) => Promise<boolean>} addStep - Note a moment
 * @property {(id: string, values: FormValues) => Promise<boolean>} editStep - Edit a moment
 * @property {(id: string, done: boolean) => Promise<void>} setStepDone - Flip a moment
 * @property {(id: string) => Promise<void>} dropStep - Drop a moment
 */

export interface SessionState {
  juniors: JuniorView[]
  steps: AcademyStepView[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  addJunior: (values: FormValues) => Promise<boolean>
  editJunior: (id: string, values: FormValues) => Promise<boolean>
  dropJunior: (id: string) => Promise<void>
  addStep: (values: FormValues) => Promise<boolean>
  editStep: (id: string, values: FormValues) => Promise<boolean>
  setStepDone: (id: string, done: boolean) => Promise<void>
  dropStep: (id: string) => Promise<void>
}

/**
 * Drive one academy session
 * @param {string} sessionId - Session identifier
 * @param {JuniorView[]} initialJuniors - Juniors resolved server-side
 * @param {AcademyStepView[]} initialSteps - Thread resolved server-side
 * @return {SessionState} - State and mutations
 */

export const useSession = (
  sessionId: string,
  initialJuniors: JuniorView[],
  initialSteps: AcademyStepView[]
): SessionState => {
  const [juniors, setJuniors] = useState(initialJuniors)
  const [steps, setSteps] = useState(initialSteps)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const addJunior = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPost<JuniorView[]>(API_ROUTES.sessionJuniors(sessionId), values),
        feedbackTitle('Junior', 'created', 'masculine')
      )

      if (next) setJuniors(next)

      return next !== null
    },
    [run, sessionId]
  )

  const editJunior = useCallback(
    async (id: string, values: FormValues) => {
      const name = juniors.find((junior) => junior.id === id)?.displayName
      const next = await run(
        () => apiPatch<JuniorView[]>(API_ROUTES.junior(id), values),
        feedbackTitle('Junior', 'saved', 'masculine', name)
      )

      if (next) setJuniors(next)

      return next !== null
    },
    [run, juniors]
  )

  const dropJunior = useCallback(
    async (id: string) => {
      const name = juniors.find((junior) => junior.id === id)?.displayName
      const next = await run(
        () => apiDelete<JuniorView[]>(API_ROUTES.junior(id)),
        feedbackTitle('Junior', 'deleted', 'masculine', name)
      )

      if (next) setJuniors(next)
    },
    [run, juniors]
  )

  const addStep = useCallback(
    async (values: FormValues) => {
      const name = typeof values.title === 'string' ? values.title : undefined
      const next = await run(
        () => apiPost<AcademyStepView[]>(API_ROUTES.sessionSteps(sessionId), values),
        feedbackTitle('Moment', 'created', 'masculine', name)
      )

      if (next) setSteps(next)

      return next !== null
    },
    [run, sessionId]
  )

  const editStep = useCallback(
    async (id: string, values: FormValues) => {
      const name = steps.find((step) => step.id === id)?.title
      const next = await run(
        () => apiPatch<AcademyStepView[]>(API_ROUTES.step(id), values),
        feedbackTitle('Moment', 'saved', 'masculine', name)
      )

      if (next) setSteps(next)

      return next !== null
    },
    [run, steps]
  )

  const setStepDone = useCallback(
    async (id: string, done: boolean) => {
      const next = await run(() => apiPatch<AcademyStepView[]>(API_ROUTES.step(id), { done }))

      if (next) setSteps(next)
    },
    [run]
  )

  const dropStep = useCallback(
    async (id: string) => {
      const name = steps.find((step) => step.id === id)?.title
      const next = await run(
        () => apiDelete<AcademyStepView[]>(API_ROUTES.step(id)),
        feedbackTitle('Moment', 'deleted', 'masculine', name)
      )

      if (next) setSteps(next)
    },
    [run, steps]
  )

  return {
    juniors,
    steps,
    isSaving,
    issues,
    clearIssues,
    addJunior,
    editJunior,
    dropJunior,
    addStep,
    editStep,
    setStepDone,
    dropStep,
  }
}
