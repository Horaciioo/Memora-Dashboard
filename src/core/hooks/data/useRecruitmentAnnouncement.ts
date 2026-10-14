'use client'

import { useCallback } from 'react'

import { useMutation } from '@/core/hooks/data/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ANNOUNCEMENT_COPY } from '@/declarations/work/announcements'

/**
 * Record the announcement of one session
 * @param {string} sessionId - Session identifier
 * @return {{ isSaving: boolean, announce: (text: string) => Promise<boolean> }} - State and mutation
 */

export const useRecruitmentAnnouncement = (sessionId: string) => {
  const { isSaving, run } = useMutation()

  const announce = useCallback(
    async (text: string) => {
      const done = await run(
        () =>
          apiPost<{ id: string }>(API_ROUTES.recruitmentAnnouncement(sessionId), {
            announcement: text,
          }),
        ANNOUNCEMENT_COPY.announced
      )

      return done !== null
    },
    [run, sessionId]
  )

  return { isSaving, announce }
}
