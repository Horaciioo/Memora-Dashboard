'use client'

import { useCallback } from 'react'

import { apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'

/**
 * Sit in on an interview
 * @return {(candidateId: string, joined: boolean) => Promise<boolean>} - Sit in or leave
 */

export const useObserving = () => {
  const { run } = useMutation()

  return useCallback(
    async (candidateId: string, joined: boolean) => {
      const saved = await run(() =>
        apiPut<{ joined: boolean }>(API_ROUTES.candidateObservation(candidateId), { joined })
      )

      return saved !== null
    },
    [run]
  )
}
