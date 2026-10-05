'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { apiPatch, apiPost, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { LEGACY_COPY } from '@/declarations/academy/legacy/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { LegacyTrackDetail } from '@/types/legacy'
import type { LegacyStatusName } from '@/utils/constants/hierarchy'

/**
 * Mutations of the Legacy pages
 * @typedef {Object} LegacyActions
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} open - Open a track
 * @property {(trackId: string, moduleKey: string, score: number) => Promise<boolean>} grade - Give a note
 * @property {(trackId: string, decision: LegacyStatusName) => Promise<boolean>} decide - Close a track
 */

export interface LegacyActions {
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  open: (values: FormValues) => Promise<boolean>
  grade: (trackId: string, moduleKey: string, score: number) => Promise<boolean>
  decide: (trackId: string, decision: LegacyStatusName) => Promise<boolean>
}

/**
 * Drive the Legacy pages
 * @return {LegacyActions} - State and mutations
 */

export const useLegacy = (): LegacyActions => {
  const router = useRouter()
  const { isSaving, issues, clearIssues, run } = useMutation()

  const open = useCallback(
    async (values: FormValues) => {
      const track = await run(
        () => apiPost<LegacyTrackDetail>(API_ROUTES.legacyTracks, values),
        LEGACY_COPY.opened
      )
      if (track) router.refresh()

      return track !== null
    },
    [router, run]
  )

  const grade = useCallback(
    async (trackId: string, moduleKey: string, score: number) => {
      const track = await run(
        () => apiPut<LegacyTrackDetail>(API_ROUTES.legacyGrade(trackId, moduleKey), { score }),
        LEGACY_COPY.graded
      )
      if (track) router.refresh()

      return track !== null
    },
    [router, run]
  )

  const decide = useCallback(
    async (trackId: string, decision: LegacyStatusName) => {
      const track = await run(
        () => apiPatch<LegacyTrackDetail>(API_ROUTES.legacyTrack(trackId), { decision }),
        LEGACY_COPY.decided
      )
      if (track) router.refresh()

      return track !== null
    },
    [router, run]
  )

  return { isSaving, issues, clearIssues, open, grade, decide }
}
