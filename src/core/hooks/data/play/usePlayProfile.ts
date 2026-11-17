'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PlayProfileView } from '@/types/play'

// Refresh rate of the profile
const STALE_MS = 60000

/**
 * Play profile of the signed-in member, none without Play access
 * @return {PlayProfileView | null} - Profile
 */

export const usePlayProfile = (): PlayProfileView | null => {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.playProfile,
    queryFn: ({ signal }) => apiGet<PlayProfileView>(API_ROUTES.playProfile, signal),
    staleTime: STALE_MS,
    retry: false,
  })

  return data ?? null
}
