'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { entityFeedback } from '@/declarations/ui/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { ObserverView } from '@/types/recruitment'

/**
 * Observers of one session
 * @typedef {Object} Observers
 * @property {ObserverView[]} observers - Members sitting in on interviews
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} add - Give a seat
 * @property {(id: string, values: FormValues) => Promise<boolean>} update - Change a quota
 * @property {(id: string) => Promise<void>} remove - Take a seat back
 * @property {(candidateId: string, joined: boolean) => Promise<boolean>} observe - Sit in or leave
 */

export interface Observers {
  observers: ObserverView[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  add: (values: FormValues) => Promise<boolean>
  update: (id: string, values: FormValues) => Promise<boolean>
  remove: (id: string) => Promise<void>
  observe: (candidateId: string, joined: boolean) => Promise<boolean>
}

/**
 * Drive the observers of one session
 * @param {string} sessionId - Session identifier
 * @param {ObserverView[]} initial - Observers resolved server-side
 * @return {Observers} - State and mutations
 */

export const useObservers = (sessionId: string, initial: ObserverView[]): Observers => {
  const [observers, setObservers] = useState(initial)
  // A refreshed page hands over the seats as the server now holds them
  const [served, setServed] = useState(initial)
  if (served !== initial) {
    setServed(initial)
    setObservers(initial)
  }
  const { isSaving, issues, clearIssues, run } = useMutation()

  const add = useCallback(
    async (values: FormValues) => {
      const saved = await run(
        () => apiPost<ObserverView[]>(API_ROUTES.recruitmentObservers(sessionId), values),
        entityFeedback('observer', 'created')
      )

      if (saved) setObservers(saved)

      return saved !== null
    },
    [run, sessionId]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const saved = await run(
        () => apiPatch<ObserverView[]>(API_ROUTES.observer(id), values),
        entityFeedback('observer', 'saved')
      )

      if (saved) setObservers(saved)

      return saved !== null
    },
    [run]
  )

  const remove = useCallback(
    async (id: string) => {
      const saved = await run(
        () => apiDelete<ObserverView[]>(API_ROUTES.observer(id)),
        entityFeedback('observer', 'deleted')
      )

      if (saved) setObservers(saved)
    },
    [run]
  )

  const observe = useCallback(
    async (candidateId: string, joined: boolean) => {
      const saved = await run(() =>
        apiPut<{ joined: boolean }>(API_ROUTES.candidateObservation(candidateId), { joined })
      )

      return saved !== null
    },
    [run]
  )

  return { observers, isSaving, issues, clearIssues, add, update, remove, observe }
}
