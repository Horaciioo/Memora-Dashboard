'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PlayAdminLogPage } from '@/types/play'

// Journal refreshes now and then
const STALE_MS = 15000

/**
 * One page of the Play journal for the filters chosen, the previous page shown while the next loads
 * @param {Record<string, string>} filters - q, period, type, player, page
 * @return {{ data: PlayAdminLogPage | undefined, isLoading: boolean, isError: boolean }} - Page and state
 */

export const usePlayAdminLogs = (filters: Record<string, string>) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.playAdminLogs(filters),
    queryFn: ({ signal }) =>
      apiGet<PlayAdminLogPage>(
        `${API_ROUTES.playAdminLogs}?${new URLSearchParams(filters).toString()}`,
        signal
      ),
    staleTime: STALE_MS,
    placeholderData: keepPreviousData,
    retry: false,
  })

  return { data, isLoading, isError }
}
