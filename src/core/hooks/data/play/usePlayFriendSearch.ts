'use client'

import { useQuery } from '@tanstack/react-query'
import { useDeferredValue } from 'react'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { PLAY_SETTINGS } from '@/declarations/play'
import type { PlayFriendFound } from '@/types/play'

/**
 * Players matching the words typed
 * @param {string} term - Words typed
 * @return {{ found: PlayFriendFound[], isReady: boolean }} - Matches
 */

export const usePlayFriendSearch = (term: string) => {
  const words = useDeferredValue(term.trim())
  const isReady = words.length >= PLAY_SETTINGS.friends.searchMin
  const { data, isFetching } = useQuery({
    queryKey: QUERY_KEYS.playFriendSearch(words),
    queryFn: ({ signal }) => apiGet<PlayFriendFound[]>(API_ROUTES.playFriendSearch(words), signal),
    enabled: isReady,
    staleTime: 0,
  })

  return { found: isReady ? (data ?? []) : [], isReady, isLoading: isFetching }
}
