'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PlayProfileView } from '@/types/play'

// Refresh rate of the level
const STALE_MS = 60000

/**
 * Global Play level of the signed-in member, none without Play access
 * @return {number | null} - Level
 */

export const usePlayLevel = (): number | null => {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.playProfile,
    queryFn: ({ signal }) => apiGet<PlayProfileView>(API_ROUTES.playProfile, signal),
    staleTime: STALE_MS,
    retry: false,
  })

  return data?.global.level.level ?? null
}
