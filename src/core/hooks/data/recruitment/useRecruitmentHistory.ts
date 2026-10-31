'use client'

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useDebouncedValue } from '@/core/hooks/interaction/state/useDebouncedValue'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import type { HistoryEntry, HistoryPage } from '@/types/recruitment'

/**
 * Pages of the history read so far
 * @typedef {Object} RecruitmentHistory
 * @property {HistoryEntry[]} entries - Identities loaded
 * @property {boolean} isLoading - First page in flight
 * @property {boolean} hasMore - Another page follows
 * @property {boolean} isFetchingMore - Next page in flight
 * @property {() => void} loadMore - Read the next page
 */

export interface RecruitmentHistory {
  entries: HistoryEntry[]
  isLoading: boolean
  hasMore: boolean
  isFetchingMore: boolean
  loadMore: () => void
}

/**
 * Read the history of the candidates, page after page
 * @param {string} search - Raw search term
 * @param {boolean} bannedOnly - Keep the blacklisted only
 * @return {RecruitmentHistory} - Pages and loader
 */

export const useRecruitmentHistory = (search: string, bannedOnly: boolean): RecruitmentHistory => {
  const term = useDebouncedValue(search.trim(), SEARCH_SETTINGS.debounceMs)

  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.recruitmentHistory(term, bannedOnly),
    queryFn: ({ pageParam, signal }) =>
      apiGet<HistoryPage>(
        `${API_ROUTES.recruitmentHistory}?${new URLSearchParams({
          q: term,
          banned: bannedOnly ? '1' : '0',
          page: String(pageParam),
        })}`,
        signal
      ),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length : undefined),
    placeholderData: keepPreviousData,
  })

  return {
    entries: query.data?.pages.flatMap((page) => page.entries) ?? [],
    isLoading: query.isPending,
    hasMore: query.hasNextPage,
    isFetchingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
  }
}
