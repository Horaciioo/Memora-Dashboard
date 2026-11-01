'use client'

import { useCallback } from 'react'

import { apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import type { CandidateView } from '@/types/recruitment'

/**
 * Sit in on an interview
 * @return {(candidateId: string, joined: boolean) => Promise<CandidateView | null>} - Sit in or leave
 */

export const useObserving = () => {
  const { run } = useMutation()

  return useCallback(
    async (candidateId: string, joined: boolean) => {
      return run(() =>
        apiPut<CandidateView>(API_ROUTES.candidateObservation(candidateId), { joined })
      )
    },
    [run]
  )
}
