import { QueryClient } from '@tanstack/react-query'

import { ApiClientError } from '@/core/lib/api/client'
import { CACHE_SETTINGS } from '@/declarations/configurations/settings'

/**
 * Browser query client
 * @return {QueryClient} - Configured client
 */

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE_SETTINGS.staleMs,
        gcTime: CACHE_SETTINGS.gcMs,
        refetchOnWindowFocus: false,
        // Refused reads never retry
        retry: (failures, error) =>
          !(error instanceof ApiClientError) && failures < CACHE_SETTINGS.readRetries,
      },
      // Writes never retry
      mutations: { retry: false },
    },
  })
