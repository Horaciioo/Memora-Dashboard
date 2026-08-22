'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { FEEDBACK_COPY } from '@/declarations/ui/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { CommunicationEntry } from '@/types/work'

/**
 * Announcement state and mutations
 * @typedef {Object} CommunicationCollection
 * @property {CommunicationEntry[]} entries - Current announcements
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} create - Write an announcement
 * @property {(id: string, values: FormValues) => Promise<boolean>} update - Edit an announcement
 * @property {(id: string) => Promise<void>} remove - Drop an announcement
 */

export interface CommunicationCollection {
  entries: CommunicationEntry[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  create: (values: FormValues) => Promise<boolean>
  update: (id: string, values: FormValues) => Promise<boolean>
  remove: (id: string) => Promise<void>
}

/**
 * Drive the announcements of one project
 * @param {string} projectId - Project identifier
 * @param {CommunicationEntry[]} initialEntries - Announcements resolved server-side
 * @return {CommunicationCollection} - State and mutations
 */

export const useCommunications = (
  projectId: string,
  initialEntries: CommunicationEntry[]
): CommunicationCollection => {
  const [entries, setEntries] = useState(initialEntries)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const create = useCallback(
    async (values: FormValues) => {
      const entry = await run(
        () => apiPost<CommunicationEntry>(API_ROUTES.projectCommunications(projectId), values),
        FEEDBACK_COPY.created
      )

      if (entry) setEntries((current) => [entry, ...current])

      return entry !== null
    },
    [projectId, run]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const entry = await run(
        () => apiPatch<CommunicationEntry>(API_ROUTES.communication(id), values),
        FEEDBACK_COPY.saved
      )

      if (entry) setEntries((current) => current.map((row) => (row.id === id ? entry : row)))

      return entry !== null
    },
    [run]
  )

  const remove = useCallback(
    async (id: string) => {
      const done = await run(
        () => apiDelete<{ id: string }>(API_ROUTES.communication(id)),
        FEEDBACK_COPY.deleted
      )

      if (done) setEntries((current) => current.filter((row) => row.id !== id))
    },
    [run]
  )

  return { entries, isSaving, issues, clearIssues, create, update, remove }
}
