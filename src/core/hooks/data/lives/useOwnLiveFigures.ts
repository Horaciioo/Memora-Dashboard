'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { LiveHistoryFigures } from '@/core/lib/lives/hub'

/**
 * Moderation figures of the signed-in member
 * @return {LiveHistoryFigures | null} - Figures, none while loading
 */

export const useOwnLiveFigures = (): LiveHistoryFigures | null => {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.liveOwnFigures,
    queryFn: ({ signal }) => apiGet<LiveHistoryFigures>(API_ROUTES.liveOwnFigures, signal),
  })

  return data ?? null
}
