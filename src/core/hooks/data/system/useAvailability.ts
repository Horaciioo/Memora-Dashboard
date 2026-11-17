'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { AVAILABILITY_COPY } from '@/declarations/system/availability'
import type { AvailabilityName } from '@/utils/constants/availability'

/**
 * Pick online, offline or do not disturb, the session read again
 * @return {{ isSaving: boolean, choose: (value: AvailabilityName) => Promise<void> }} - State and pick
 */

export const useAvailability = () => {
  const router = useRouter()
  const { isSaving, run } = useMutation()

  const choose = useCallback(
    async (availability: AvailabilityName) => {
      const done = await run(
        () => apiPatch(API_ROUTES.availability, { availability }),
        AVAILABILITY_COPY.saved
      )
      if (done) router.refresh()
    },
    [run, router]
  )

  return { isSaving, choose }
}
