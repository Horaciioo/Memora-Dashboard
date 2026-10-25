'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useSyncedState } from '@/core/hooks/interaction/state/useSyncedState'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { entityFeedback } from '@/declarations/ui/copy'
import type { JuniorView, MyTrainingAction, MyTrainingView, SessionSummary } from '@/types/academy'
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
        entityFeedback('session', 'created')
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
        entityFeedback('session', 'saved')
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
        entityFeedback('session', 'deleted')
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
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} addJunior - Take a moderator in
 * @property {(id: string, values: FormValues) => Promise<boolean>} editJunior - Edit a junior
 * @property {(id: string) => Promise<void>} dropJunior - Take a junior out
 */

export interface SessionState {
  juniors: JuniorView[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  addJunior: (values: FormValues) => Promise<boolean>
  editJunior: (id: string, values: FormValues) => Promise<boolean>
  dropJunior: (id: string) => Promise<void>
}

/**
 * Drive one academy session
 * @param {string} sessionId - Session identifier
 * @param {JuniorView[]} initialJuniors - Juniors resolved server-side
 * @return {SessionState} - State and mutations
 */

export const useSession = (sessionId: string, initialJuniors: JuniorView[]): SessionState => {
  const [juniors, setJuniors] = useSyncedState(initialJuniors)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const addJunior = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPost<JuniorView[]>(API_ROUTES.sessionJuniors(sessionId), values),
        entityFeedback('junior', 'created')
      )

      if (next) setJuniors(next)

      return next !== null
    },
    [run, sessionId, setJuniors]
  )

  const editJunior = useCallback(
    async (id: string, values: FormValues) => {
      const name = juniors.find((junior) => junior.id === id)?.displayName
      const next = await run(
        () => apiPatch<JuniorView[]>(API_ROUTES.junior(id), values),
        entityFeedback('junior', 'saved', name)
      )

      if (next) setJuniors(next)

      return next !== null
    },
    [run, juniors, setJuniors]
  )

  const dropJunior = useCallback(
    async (id: string) => {
      const name = juniors.find((junior) => junior.id === id)?.displayName
      const next = await run(
        () => apiDelete<JuniorView[]>(API_ROUTES.junior(id)),
        entityFeedback('junior', 'deleted', name)
      )

      if (next) setJuniors(next)
    },
    [run, juniors, setJuniors]
  )

  return {
    juniors,
    isSaving,
    issues,
    clearIssues,
    addJunior,
    editJunior,
    dropJunior,
  }
}

/**
 * Junior's own training progression state and mutations
 * @typedef {Object} MyTrainingsState
 * @property {MyTrainingView[]} trainings - Trainings open to the junior
 * @property {boolean} isSaving - Mutation in flight
 * @property {(id: string, action: MyTrainingAction) => Promise<void>} move - Apply a move
 */

export interface MyTrainingsState {
  trainings: MyTrainingView[]
  isSaving: boolean
  move: (id: string, action: MyTrainingAction) => Promise<void>
}

/**
 * Drive a junior's own training progression page
 * @param {MyTrainingView[]} initialTrainings - Trainings resolved server-side
 * @return {MyTrainingsState} - State and mutations
 */

export const useMyTrainings = (initialTrainings: MyTrainingView[]): MyTrainingsState => {
  const [trainings, setTrainings] = useState(initialTrainings)
  const { isSaving, run } = useMutation()

  const move = useCallback(
    async (id: string, action: MyTrainingAction) => {
      const name = trainings.find((training) => training.id === id)?.name
      const next = await run(
        () => apiPatch<MyTrainingView[]>(API_ROUTES.myTrainingProgress(id), { action }),
        action === 'complete' ? entityFeedback('training', 'saved', name) : undefined
      )

      if (next) setTrainings(next)
    },
    [run, trainings]
  )

  return { trainings, isSaving, move }
}
