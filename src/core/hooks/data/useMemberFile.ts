'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import type { MemberOverride } from '@/core/services/members/MemberFileService'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { MemberDetail, MemberNote, MemberSocial } from '@/types/members'

/**
 * Moderator file state and mutations
 * @typedef {Object} MemberFile
 * @property {MemberNote[]} notes - Private remarks
 * @property {MemberSocial[]} socials - Social profiles
 * @property {MemberOverride[]} overrides - Permission overrides
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} addNote - Add a remark
 * @property {(id: string, pinned: boolean) => Promise<void>} pinNote - Pin a remark
 * @property {(id: string) => Promise<void>} removeNote - Drop a remark
 * @property {(values: FormValues) => Promise<boolean>} addSocial - Add a profile
 * @property {(id: string, values: FormValues) => Promise<boolean>} updateSocial - Edit a profile
 * @property {(id: string) => Promise<void>} removeSocial - Drop a profile
 * @property {(next: MemberOverride[]) => Promise<boolean>} saveOverrides - Replace the overrides
 * @property {(values: FormValues) => Promise<boolean>} saveIdentity - Edit the file itself
 */

export interface MemberFile {
  notes: MemberNote[]
  socials: MemberSocial[]
  overrides: MemberOverride[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  addNote: (values: FormValues) => Promise<boolean>
  pinNote: (id: string, pinned: boolean) => Promise<void>
  removeNote: (id: string) => Promise<void>
  addSocial: (values: FormValues) => Promise<boolean>
  updateSocial: (id: string, values: FormValues) => Promise<boolean>
  removeSocial: (id: string) => Promise<void>
  saveOverrides: (next: MemberOverride[]) => Promise<boolean>
  saveIdentity: (values: FormValues) => Promise<boolean>
}

/**
 * Drive one moderator file
 * @param {MemberDetail} detail - File resolved server-side
 * @param {MemberOverride[]} initialOverrides - Permission overrides resolved server-side
 * @return {MemberFile} - State and mutations
 */

export const useMemberFile = (
  detail: MemberDetail,
  initialOverrides: MemberOverride[]
): MemberFile => {
  const memberId = detail.summary.id
  const [notes, setNotes] = useState(detail.notes)
  const [socials, setSocials] = useState(detail.socials)
  const [overrides, setOverrides] = useState(initialOverrides)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const addNote = useCallback(
    async (values: FormValues) => {
      const note = await run(
        () => apiPost<MemberNote>(API_ROUTES.memberNotes(memberId), values),
        feedbackTitle('Note', 'created', 'feminine')
      )

      // Pinned remarks always stay on top of the list
      if (note) setNotes((current) => sortNotes([note, ...current]))

      return note !== null
    },
    [memberId, run]
  )

  const pinNote = useCallback(
    async (id: string, pinned: boolean) => {
      const note = await run(() => apiPatch<MemberNote>(API_ROUTES.note(id), { pinned }))

      if (note) {
        setNotes((current) => sortNotes(current.map((entry) => (entry.id === id ? note : entry))))
      }
    },
    [run]
  )

  const removeNote = useCallback(
    async (id: string) => {
      const done = await run(
        () => apiDelete<{ id: string }>(API_ROUTES.note(id)),
        feedbackTitle('Note', 'deleted', 'feminine')
      )

      if (done) setNotes((current) => current.filter((entry) => entry.id !== id))
    },
    [run]
  )

  const addSocial = useCallback(
    async (values: FormValues) => {
      const name = typeof values.handle === 'string' ? values.handle : undefined
      const social = await run(
        () => apiPost<MemberSocial>(API_ROUTES.memberSocials(memberId), values),
        feedbackTitle('Réseau', 'created', 'masculine', name)
      )

      if (social) setSocials((current) => [...current, social])

      return social !== null
    },
    [memberId, run]
  )

  const updateSocial = useCallback(
    async (id: string, values: FormValues) => {
      const name = typeof values.handle === 'string' ? values.handle : undefined
      const social = await run(
        () => apiPatch<MemberSocial>(API_ROUTES.social(id), values),
        feedbackTitle('Réseau', 'saved', 'masculine', name)
      )

      if (social) {
        setSocials((current) => current.map((entry) => (entry.id === id ? social : entry)))
      }

      return social !== null
    },
    [run]
  )

  const removeSocial = useCallback(
    async (id: string) => {
      const name = socials.find((entry) => entry.id === id)?.handle
      const done = await run(
        () => apiDelete<{ id: string }>(API_ROUTES.social(id)),
        feedbackTitle('Réseau', 'deleted', 'masculine', name)
      )

      if (done) setSocials((current) => current.filter((entry) => entry.id !== id))
    },
    [run, socials]
  )

  const saveOverrides = useCallback(
    async (next: MemberOverride[]) => {
      const stored = await run(
        () => apiPut<MemberOverride[]>(API_ROUTES.memberAccess(memberId), { overrides: next }),
        feedbackTitle('Permissions', 'saved', 'feminine', undefined, true)
      )

      if (stored) setOverrides(stored)

      return stored !== null
    },
    [memberId, run]
  )

  const saveIdentity = useCallback(
    async (values: FormValues) => {
      const saved = await run(
        () => apiPatch(API_ROUTES.member(memberId), values),
        feedbackTitle('Fiche', 'saved', 'feminine', detail.summary.displayName)
      )

      return saved !== null
    },
    [memberId, run, detail.summary.displayName]
  )

  return {
    notes,
    socials,
    overrides,
    isSaving,
    issues,
    clearIssues,
    addNote,
    pinNote,
    removeNote,
    addSocial,
    updateSocial,
    removeSocial,
    saveOverrides,
    saveIdentity,
  }
}

/**
 * Keep pinned remarks first, then the newest
 * @param {MemberNote[]} notes - Remarks to order
 * @return {MemberNote[]} - Ordered remarks
 */

const sortNotes = (notes: MemberNote[]): MemberNote[] =>
  [...notes].sort((left, right) => {
    if (left.pinned !== right.pinned) return left.pinned ? -1 : 1

    return right.createdAt.localeCompare(left.createdAt)
  })
