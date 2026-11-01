'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { useDebouncedValue } from '@/core/hooks/interaction/state/useDebouncedValue'
import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import type { PageSearchHit } from '@/types/pages'

/**
 * Search among the pages the member may open
 * @param {string} term - Typed words
 * @return {{ hits: PageSearchHit[], isSearching: boolean }} - Hits
 */

export const usePageSearch = (term: string): { hits: PageSearchHit[]; isSearching: boolean } => {
  const settled = useDebouncedValue(term.trim(), SEARCH_SETTINGS.debounceMs)
  const enabled = settled.length >= SEARCH_SETTINGS.minLength

  const { data, isFetching } = useQuery({
    queryKey: QUERY_KEYS.pageSearch(settled),
    queryFn: ({ signal }) => apiGet<PageSearchHit[]>(API_ROUTES.pageSearch(settled), signal),
    enabled,
    placeholderData: keepPreviousData,
  })

  return { hits: enabled ? (data ?? []) : [], isSearching: enabled && isFetching }
}
