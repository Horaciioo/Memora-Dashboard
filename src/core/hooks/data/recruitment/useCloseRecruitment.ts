'use client'

import { useCallback } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { entityFeedback } from '@/declarations/ui/copy'
import type { RecruitmentSummary } from '@/types/recruitment'

/**
 * Close a session and admit its accepted
 * @return {Object} - Saving flag and closer
 */

export const useCloseRecruitment = () => {
  const { isSaving, run } = useMutation()

  const close = useCallback(
    (id: string) =>
      run(
        () => apiPost<RecruitmentSummary>(API_ROUTES.recruitmentClosure(id), {}),
        entityFeedback('recruitment', 'saved')
      ),
    [run]
  )

  return { isSaving, close }
}
