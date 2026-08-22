'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { FEEDBACK_COPY } from '@/declarations/ui/copy'
import type { MemberOverride } from '@/core/services/members/MemberFileService'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { MemberDetail, MemberNote, MemberPim, MemberSocial } from '@/types/members'

/**
 * Moderator file state and mutations
 * @typedef {Object} MemberFile
 * @property {MemberNote[]} notes - Private remarks
 * @property {MemberPim[]} pims - Individual reviews
 * @property {MemberSocial[]} socials - Social profiles
 * @property {MemberOverride[]} overrides - Permission overrides
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} addNote - Add a remark
 * @property {(id: string, pinned: boolean) => Promise<void>} pinNote - Pin a remark
 * @property {(id: string) => Promise<void>} removeNote - Drop a remark
 * @property {(values: FormValues) => Promise<boolean>} addPim - Record a review
 * @property {(id: string) => Promise<void>} removePim - Drop a review
 * @property {(values: FormValues) => Promise<boolean>} saveSocials - Replace the profiles
 * @property {(next: MemberOverride[]) => Promise<boolean>} saveOverrides - Replace the overrides
 * @property {(values: FormValues) => Promise<boolean>} saveIdentity - Edit the file itself
 */

export interface MemberFile {
  notes: MemberNote[]
  pims: MemberPim[]
  socials: MemberSocial[]
  overrides: MemberOverride[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  addNote: (values: FormValues) => Promise<boolean>
  pinNote: (id: string, pinned: boolean) => Promise<void>
  removeNote: (id: string) => Promise<void>
  addPim: (values: FormValues) => Promise<boolean>
  removePim: (id: string) => Promise<void>
  saveSocials: (values: FormValues) => Promise<boolean>
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
  const [pims, setPims] = useState(detail.pims)
  const [socials, setSocials] = useState(detail.socials)
  const [overrides, setOverrides] = useState(initialOverrides)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const addNote = useCallback(
    async (values: FormValues) => {
      const note = await run(
        () => apiPost<MemberNote>(API_ROUTES.memberNotes(memberId), values),
        FEEDBACK_COPY.created
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
        FEEDBACK_COPY.deleted
      )

      if (done) setNotes((current) => current.filter((entry) => entry.id !== id))
    },
    [run]
  )

  const addPim = useCallback(
    async (values: FormValues) => {
      const pim = await run(
        () => apiPost<MemberPim>(API_ROUTES.memberPims(memberId), values),
        FEEDBACK_COPY.created
      )

      if (pim) setPims((current) => [pim, ...current])

      return pim !== null
    },
    [memberId, run]
  )

  const removePim = useCallback(
    async (id: string) => {
      const done = await run(
        () => apiDelete<{ id: string }>(API_ROUTES.pim(id)),
        FEEDBACK_COPY.deleted
      )

      if (done) setPims((current) => current.filter((entry) => entry.id !== id))
    },
    [run]
  )

  const saveSocials = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPut<MemberSocial[]>(API_ROUTES.memberSocials(memberId), values),
        FEEDBACK_COPY.saved
      )

      if (next) setSocials(next)

      return next !== null
    },
    [memberId, run]
  )

  const saveOverrides = useCallback(
    async (next: MemberOverride[]) => {
      const stored = await run(
        () => apiPut<MemberOverride[]>(API_ROUTES.memberAccess(memberId), { overrides: next }),
        FEEDBACK_COPY.saved
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
        FEEDBACK_COPY.saved
      )

      return saved !== null
    },
    [memberId, run]
  )

  return {
    notes,
    pims,
    socials,
    overrides,
    isSaving,
    issues,
    clearIssues,
    addNote,
    pinNote,
    removeNote,
    addPim,
    removePim,
    saveSocials,
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
