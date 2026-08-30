'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiGet, apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { feedbackTitle } from '@/declarations/ui/copy'
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
 * @property {() => Promise<void>} download - Save the whole dossier to a file
 */

export interface ProfileState {
  profile: ProfileDetail
  isSaving: boolean
  issues: FieldIssue[]
  save: (values: FormValues) => Promise<boolean>
  eraseDetails: () => Promise<boolean>
  download: () => Promise<void>
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
        feedbackTitle('Profil', 'saved', 'masculine')
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

  const download = useCallback(async () => {
    const dossier = await run(() => apiGet<unknown>(API_ROUTES.personalExport))
    if (!dossier) return

    // The file is built in the page, the route only ever answers with the envelope
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = PREFERENCES_COPY.exportFileName
    link.click()

    URL.revokeObjectURL(url)
  }, [run])

  return { profile, isSaving, issues, save, eraseDetails, download }
}
