'use client'

import { useInfiniteQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { UnbanRequestItem, UnbanRequestPage } from '@/types/unban'

/**
 * Requests read page after page
 * @typedef {Object} UnbanRequestList
 * @property {UnbanRequestItem[]} items - Requests loaded so far
 * @property {boolean} isLoading - First page on its way
 * @property {boolean} hasMore - Another page exists
 * @property {boolean} isFetchingMore - Next page on its way
 * @property {() => void} loadMore - Read the next page
 */

export interface UnbanRequestList {
  items: UnbanRequestItem[]
  isLoading: boolean
  hasMore: boolean
  isFetchingMore: boolean
  loadMore: () => void
}

/**
 * Requests of the perimeter narrowed by the filters
 * @param {Record<string, string>} filters - Query parameters, empty values left out
 * @return {UnbanRequestList} - List state
 */

export const useUnbanRequests = (filters: Record<string, string>): UnbanRequestList => {
  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.unbanRequests(filters),
    initialPageParam: '',
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams(filters)
      if (pageParam) params.set('cursor', pageParam)

      return apiGet<UnbanRequestPage>(`${API_ROUTES.unbanRequests}?${params}`)
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })

  return {
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    isLoading: query.isLoading,
    hasMore: query.hasNextPage,
    isFetchingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
  }
}
