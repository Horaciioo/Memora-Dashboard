'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { LiveEmotes } from '@/types/modview'

// Emotes hardly ever change during a live
const STALE_MS = 600_000

/**
 * Emotes of Twitch and of the live's channel
 * @param {string | null} liveId - Live, none off a real live
 * @return {{ emotes: LiveEmotes | null }} - Emotes, null while loading or unavailable
 */

export const useLiveEmotes = (liveId: string | null) => {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.liveEmotes(liveId ?? ''),
    queryFn: ({ signal }) => apiGet<LiveEmotes>(API_ROUTES.liveEmotes(liveId ?? ''), signal),
    enabled: liveId !== null,
    staleTime: STALE_MS,
    retry: false,
  })

  return { emotes: data ?? null }
}
