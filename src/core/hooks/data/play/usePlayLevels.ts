'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'

// Refresh rate of the levels
const STALE_MS = 30000

/**
 * Play level of every player by account, shared by all portraits
 * @return {Record<string, number>} - Level by account, empty while loading
 */

export const usePlayLevels = (): Record<string, number> => {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.playLevels,
    queryFn: ({ signal }) => apiGet<Record<string, number>>(API_ROUTES.playLevels, signal),
    staleTime: STALE_MS,
    retry: false,
  })

  return data ?? {}
}
