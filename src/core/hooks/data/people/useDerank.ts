'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { DERANK_COPY } from '@/declarations/academy/derank'
import type { MemberDeparture } from '@/types/members'

/**
 * Gestures that put several departures under one announcement
 * @typedef {Object} Derank
 * @property {boolean} isSaving - Request in flight
 * @property {(ids: string[]) => Promise<MemberDeparture | null>} derank - Dismiss several members
 * @property {(ids: string[]) => Promise<MemberDeparture | null>} merge - Join announcements already written
 */

export interface Derank {
  isSaving: boolean
  derank: (ids: string[]) => Promise<MemberDeparture | null>
  merge: (ids: string[]) => Promise<MemberDeparture | null>
}

/**
 * Derank gestures
 * @return {Derank} - Gestures
 */

export const useDerank = (): Derank => {
  const router = useRouter()
  const { isSaving, run } = useMutation()

  const derank = useCallback(
    async (ids: string[]) => {
      const departure = await run(
        () => apiPost<MemberDeparture>(API_ROUTES.membersDerank, { ids }),
        DERANK_COPY.done
      )
      if (departure) router.refresh()

      return departure
    },
    [run, router]
  )

  const merge = useCallback(
    async (ids: string[]) => {
      const departure = await run(
        () => apiPost<MemberDeparture>(API_ROUTES.departuresMerge, { ids }),
        DERANK_COPY.merged
      )
      if (departure) router.refresh()

      return departure
    },
    [run, router]
  )

  return { isSaving, derank, merge }
}
