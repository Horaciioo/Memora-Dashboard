'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PlayCardView } from '@/types/play'

// Card stays fresh a short while
const STALE_MS = 15000

/**
 * Card of a player, read when opened
 * @param {string | null} accountId - Player, none keeps it closed
 * @return {{ card: PlayCardView | undefined, isFailed: boolean }} - Card and failure
 */

export const usePlayCard = (accountId: string | null) => {
  const { data, isError } = useQuery({
    queryKey: QUERY_KEYS.playCard(accountId ?? ''),
    queryFn: ({ signal }) => apiGet<PlayCardView>(API_ROUTES.playCard(accountId ?? ''), signal),
    enabled: accountId !== null,
    staleTime: STALE_MS,
    retry: false,
  })

  return { card: data, isFailed: isError }
}
