'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiGet, apiPatch } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PlayActivityView } from '@/types/play'

// Refresh rate of the bell
const REFRESH_MS = 30000

interface PlayActivities {
  entries: PlayActivityView[]
  unread: number
}

/**
 * Personal Play events and the way to read them
 * @return {{ entries: PlayActivityView[]; unread: number; markRead: () => void }} - Bell state
 */

export const usePlayActivities = () => {
  const client = useQueryClient()
  const { data } = useQuery({
    queryKey: QUERY_KEYS.playActivities,
    queryFn: ({ signal }) => apiGet<PlayActivities>(API_ROUTES.playActivities, signal),
    staleTime: REFRESH_MS,
    refetchInterval: REFRESH_MS,
    retry: false,
  })
  const { mutate } = useMutation({
    mutationFn: () => apiPatch<{ unread: number }>(API_ROUTES.playActivities, {}),
    onSuccess: () => void client.invalidateQueries({ queryKey: QUERY_KEYS.playActivities }),
  })

  return { entries: data?.entries ?? [], unread: data?.unread ?? 0, markRead: () => mutate() }
}
