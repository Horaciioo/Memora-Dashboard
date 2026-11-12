'use client'

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useDebouncedValue } from '@/core/hooks/interaction/state/useDebouncedValue'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import type { HistoryOptions, HistoryOrphan, HistoryPage, HistorySession } from '@/types/recruitment'

/**
 * Filters of the history
 * @typedef {Object} HistoryFilters
 * @property {string} search - Raw search term
 * @property {boolean} bannedOnly - Keep the blacklisted only
 * @property {string} outcomeId - Issue wanted, empty for all
 * @property {string} recruiterId - Recruiter wanted, empty for all
 * @property {string} status - Session phase wanted, empty for all
 */

export interface HistoryFilters {
  search: string
  bannedOnly: boolean
  outcomeId: string
  recruiterId: string
  status: string
}

/**
 * Pages of the history read so far
 * @typedef {Object} RecruitmentHistory
 * @property {HistorySession[]} sessions - Sessions loaded
 * @property {HistoryOrphan[]} orphans - Blacklisted identities without a candidacy
 * @property {HistoryOptions} options - Filter values
 * @property {boolean} isLoading - First page in flight
 * @property {boolean} hasMore - Another page follows
 * @property {boolean} isFetchingMore - Next page in flight
 * @property {() => void} loadMore - Read the next page
 */

export interface RecruitmentHistory {
  sessions: HistorySession[]
  orphans: HistoryOrphan[]
  options: HistoryOptions
  isLoading: boolean
  hasMore: boolean
  isFetchingMore: boolean
  loadMore: () => void
}

const NO_OPTIONS: HistoryOptions = { outcomes: [], recruiters: [] }

/**
 * Read the history of the sessions, page after page
 * @param {HistoryFilters} filters - Search and filters
 * @return {RecruitmentHistory} - Pages and loader
 */

export const useRecruitmentHistory = (filters: HistoryFilters): RecruitmentHistory => {
  const term = useDebouncedValue(filters.search.trim(), SEARCH_SETTINGS.debounceMs)
  const { bannedOnly, outcomeId, recruiterId, status } = filters

  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.recruitmentHistory({ term, bannedOnly, outcomeId, recruiterId, status }),
    queryFn: ({ pageParam, signal }) =>
      apiGet<HistoryPage>(
        `${API_ROUTES.recruitmentHistory}?${new URLSearchParams({
          q: term,
          banned: bannedOnly ? '1' : '0',
          outcome: outcomeId,
          recruiter: recruiterId,
          status,
          page: String(pageParam),
        })}`,
        signal
      ),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length : undefined),
    placeholderData: keepPreviousData,
  })

  const first = query.data?.pages[0]

  return {
    sessions: query.data?.pages.flatMap((page) => page.sessions) ?? [],
    orphans: first?.orphans ?? [],
    options: first?.options ?? NO_OPTIONS,
    isLoading: query.isPending,
    hasMore: query.hasNextPage,
    isFetchingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
  }
}
