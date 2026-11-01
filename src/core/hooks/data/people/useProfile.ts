'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { entityFeedback } from '@/declarations/ui/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { ProfileDetail } from '@/types/preferences'

/**
 * Own file state and its single mutation
 * @typedef {Object} ProfileState
 * @property {ProfileDetail} profile - File on screen
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {(values: FormValues) => Promise<boolean>} save - Write the editable fields
 * @property {() => Promise<boolean>} eraseDetails - Drop the volunteered details
 */

export interface ProfileState {
  profile: ProfileDetail
  isSaving: boolean
  issues: FieldIssue[]
  save: (values: FormValues) => Promise<boolean>
  eraseDetails: () => Promise<boolean>
}

/**
 * Drive the fields a member owns on their own file
 * @param {ProfileDetail} initialProfile - File resolved server-side
 * @return {ProfileState} - State and mutation
 */

export const useProfile = (initialProfile: ProfileDetail): ProfileState => {
  const [profile, setProfile] = useState(initialProfile)
  const { isSaving, issues, run } = useMutation()

  const save = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPatch<ProfileDetail>(API_ROUTES.profile, values),
        entityFeedback('profile', 'saved')
      )

      if (next) setProfile(next)

      return next !== null
    },
    [run]
  )

  const eraseDetails = useCallback(async () => {
    const next = await run(
      () => apiDelete<ProfileDetail>(API_ROUTES.profile),
      PREFERENCES_COPY.eraseDone
    )

    if (next) setProfile(next)

    return next !== null
  }, [run])

  return { profile, isSaving, issues, save, eraseDetails }
}
