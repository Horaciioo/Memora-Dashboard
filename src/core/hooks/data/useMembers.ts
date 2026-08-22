'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { FEEDBACK_COPY } from '@/declarations/ui/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { MemberSummary } from '@/types/members'

/**
 * Moderator list state and mutations
 * @typedef {Object} MembersCollection
 * @property {MemberSummary[]} members - Current rows
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {(values: FormValues) => Promise<boolean>} create - Add a moderator
 * @property {(id: string, values: FormValues) => Promise<boolean>} update - Edit a moderator
 * @property {(id: string) => Promise<void>} remove - Drop a moderator
 * @property {() => void} clearIssues - Forget the rejections
 */

export interface MembersCollection {
  members: MemberSummary[]
  isSaving: boolean
  issues: FieldIssue[]
  create: (values: FormValues) => Promise<boolean>
  update: (id: string, values: FormValues) => Promise<boolean>
  remove: (id: string) => Promise<void>
  clearIssues: () => void
}

/**
 * Drive the moderator list
 * @param {MemberSummary[]} initialMembers - Rows resolved server-side
 * @return {MembersCollection} - State and mutations
 */

export const useMembers = (initialMembers: MemberSummary[]): MembersCollection => {
  const [members, setMembers] = useState(initialMembers)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const create = useCallback(
    async (values: FormValues) => {
      const member = await run(
        () => apiPost<MemberSummary>(API_ROUTES.members, values),
        FEEDBACK_COPY.created
      )

      if (member) setMembers((current) => [...current, member])

      return member !== null
    },
    [run]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const member = await run(
        () => apiPatch<MemberSummary>(API_ROUTES.member(id), values),
        FEEDBACK_COPY.saved
      )

      if (member) setMembers((current) => current.map((entry) => (entry.id === id ? member : entry)))

      return member !== null
    },
    [run]
  )

  const remove = useCallback(
    async (id: string) => {
      const done = await run(
        () => apiDelete<{ id: string }>(API_ROUTES.member(id)),
        FEEDBACK_COPY.deleted
      )

      if (done) setMembers((current) => current.filter((entry) => entry.id !== id))
    },
    [run]
  )

  return { members, isSaving, issues, create, update, remove, clearIssues }
}
