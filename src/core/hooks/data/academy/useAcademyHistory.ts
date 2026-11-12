'use client'

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useDebouncedValue } from '@/core/hooks/interaction/state/useDebouncedValue'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import type { AcademyHistoryPage, AcademyHistorySession } from '@/types/academy'

/**
 * Filters of the Academy history
 * @typedef {Object} AcademyHistoryFilters
 * @property {string} search - Raw search term
 * @property {string} status - Session phase wanted, empty for all
 * @property {string} juniorStatus - Junior outcome wanted, empty for all
 * @property {string} referentId - Referent wanted, empty for all
 */

export interface AcademyHistoryFilters {
  search: string
  status: string
  juniorStatus: string
  referentId: string
}

/**
 * Pages of the Academy history read so far
 * @typedef {Object} AcademyHistory
 * @property {AcademyHistorySession[]} sessions - Sessions loaded
 * @property {{ id: string, label: string }[]} referents - Referents the filter offers
 * @property {boolean} isLoading - First page in flight
 * @property {boolean} hasMore - Another page follows
 * @property {boolean} isFetchingMore - Next page in flight
 * @property {() => void} loadMore - Read the next page
 */

export interface AcademyHistory {
  sessions: AcademyHistorySession[]
  referents: { id: string; label: string }[]
  isLoading: boolean
  hasMore: boolean
  isFetchingMore: boolean
  loadMore: () => void
}

/**
 * Read the history of the promotions, page after page
 * @param {AcademyHistoryFilters} filters - Search and filters
 * @return {AcademyHistory} - Pages and loader
 */

export const useAcademyHistory = (filters: AcademyHistoryFilters): AcademyHistory => {
  const term = useDebouncedValue(filters.search.trim(), SEARCH_SETTINGS.debounceMs)
  const { status, juniorStatus, referentId } = filters

  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.academyHistory({ term, status, juniorStatus, referentId }),
    queryFn: ({ pageParam, signal }) =>
      apiGet<AcademyHistoryPage>(
        `${API_ROUTES.academyHistory}?${new URLSearchParams({
          q: term,
          status,
          junior: juniorStatus,
          referent: referentId,
          page: String(pageParam),
        })}`,
        signal
      ),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length : undefined),
    placeholderData: keepPreviousData,
  })

  return {
    sessions: query.data?.pages.flatMap((page) => page.sessions) ?? [],
    referents: query.data?.pages[0]?.referents ?? [],
    isLoading: query.isPending,
    hasMore: query.hasNextPage,
    isFetchingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
  }
}
