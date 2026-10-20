'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useDebouncedValue } from '@/core/hooks/interaction/state/useDebouncedValue'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import type { MentionOption } from '@/types/mentions'

/**
 * Members a remark can name
 * @param {string | null} term - Letters typed after the at sign, null while none is open
 * @return {MentionOption[]} - Members matching
 */

export const useMentionable = (term: string | null): MentionOption[] => {
  const settled = useDebouncedValue(term ?? '', SEARCH_SETTINGS.debounceMs)

  const { data } = useQuery({
    queryKey: QUERY_KEYS.mentionable(settled),
    queryFn: ({ signal }) =>
      apiGet<MentionOption[]>(`${API_ROUTES.mentionable}?q=${encodeURIComponent(settled)}`, signal),
    enabled: term !== null,
    placeholderData: keepPreviousData,
  })

  return term === null ? [] : (data ?? [])
}
