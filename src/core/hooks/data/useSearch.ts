'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useDebouncedValue } from '@/core/hooks/interaction/useDebouncedValue'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import type { SearchSection } from '@/types/search'

/**
 * Search state
 * @typedef {Object} SearchResult
 * @property {SearchSection[]} sections - Grouped results
 * @property {boolean} isLoading - Request in flight
 */

interface SearchResult {
  sections: SearchSection[]
  isLoading: boolean
}

/**
 * Query the global search
 * @param {string} term - Raw search term
 * @return {SearchResult} - Results and loading state
 */

export const useSearch = (term: string): SearchResult => {
  const query = term.trim()
  const settled = useDebouncedValue(query, SEARCH_SETTINGS.debounceMs)
  const isActive = query.length >= SEARCH_SETTINGS.minLength

  const { data, isFetching } = useQuery({
    queryKey: QUERY_KEYS.search(settled),
    queryFn: ({ signal }) =>
      apiGet<SearchSection[]>(`${API_ROUTES.search}?q=${encodeURIComponent(settled)}`, signal),
    enabled: settled.length >= SEARCH_SETTINGS.minLength,
    placeholderData: keepPreviousData,
  })

  // Typing counts as loading
  const isSettled = settled === query && !isFetching

  return {
    sections: isActive && isSettled ? (data ?? []) : [],
    isLoading: isActive && !isSettled,
  }
}
