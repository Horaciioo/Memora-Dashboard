'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PageSummary } from '@/types/pages'

/**
 * Pages the member may open
 * @typedef {Object} PageTreeState
 * @property {PageSummary[]} pages - Reachable pages
 * @property {boolean} isLoading - Nothing loaded yet, server render included
 */

export interface PageTreeState {
  pages: PageSummary[]
  isLoading: boolean
}

/**
 * Pages of the rail and the index
 * @param {boolean} [enabled] - Load at all
 * @return {PageTreeState} - Pages
 */

export const usePageTree = (enabled = true): PageTreeState => {
  // Pending, not loading: the server render stays identical
  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.pages,
    queryFn: ({ signal }) => apiGet<PageSummary[]>(API_ROUTES.pages, signal),
    enabled,
  })

  return { pages: data ?? [], isLoading: isPending }
}
