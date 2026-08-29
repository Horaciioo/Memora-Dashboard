'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import { MEETING_TOPIC_ENTITY } from '@/declarations/work/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { MeetingTopicEntry } from '@/types/work'

/**
 * Topic state and mutations of one meeting
 * @typedef {Object} MeetingTopicCollection
 * @property {MeetingTopicEntry[]} entries - Current topics
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} create - Open a topic
 * @property {(id: string, values: FormValues) => Promise<boolean>} update - Edit a topic
 * @property {(id: string) => Promise<void>} remove - Drop a topic
 */

export interface MeetingTopicCollection {
  entries: MeetingTopicEntry[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  create: (values: FormValues) => Promise<boolean>
  update: (id: string, values: FormValues) => Promise<boolean>
  remove: (id: string) => Promise<void>
}

/**
 * Drive the topics of one meeting
 * @param {string} meetingId - Meeting identifier
 * @param {MeetingTopicEntry[]} initialEntries - Topics resolved server-side
 * @return {MeetingTopicCollection} - State and mutations
 */

export const useMeetingTopics = (
  meetingId: string,
  initialEntries: MeetingTopicEntry[]
): MeetingTopicCollection => {
  const router = useRouter()
  const [entries, setEntries] = useState(initialEntries)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const create = useCallback(
    async (values: FormValues) => {
      const name = typeof values.title === 'string' ? values.title : undefined
      const entry = await run(
        () => apiPost<MeetingTopicEntry>(API_ROUTES.meetingTopics(meetingId), values),
        feedbackTitle(MEETING_TOPIC_ENTITY.label, 'created', MEETING_TOPIC_ENTITY.gender, name)
      )

      // Every write lands in the journal, so the logs tab needs the refresh
      if (entry) {
        setEntries((current) => [...current, entry])
        router.refresh()
      }

      return entry !== null
    },
    [meetingId, run, router]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const name = typeof values.title === 'string' ? values.title : undefined
      const entry = await run(
        () => apiPatch<MeetingTopicEntry>(API_ROUTES.meetingTopic(id), values),
        feedbackTitle(MEETING_TOPIC_ENTITY.label, 'saved', MEETING_TOPIC_ENTITY.gender, name)
      )

      if (entry) {
        setEntries((current) => current.map((row) => (row.id === id ? entry : row)))
        router.refresh()
      }

      return entry !== null
    },
    [run, router]
  )

  const remove = useCallback(
    async (id: string) => {
      const name = entries.find((row) => row.id === id)?.title
      const done = await run(
        () => apiDelete<{ id: string }>(API_ROUTES.meetingTopic(id)),
        feedbackTitle(MEETING_TOPIC_ENTITY.label, 'deleted', MEETING_TOPIC_ENTITY.gender, name)
      )

      if (done) {
        setEntries((current) => current.filter((row) => row.id !== id))
        router.refresh()
      }
    },
    [run, router, entries]
  )

  return { entries, isSaving, issues, clearIssues, create, update, remove }
}
