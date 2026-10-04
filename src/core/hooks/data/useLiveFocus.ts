'use client'

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { apiDelete, apiGet, apiPost } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { MODVIEW_INSPECT_COPY } from '@/declarations/modview/copy'
import type { LiveFocusView } from '@/types/lives'

/**
 * Focus open on a live and the two gestures
 * @typedef {Object} LiveFocusState
 * @property {LiveFocusView[]} focuses - Focus the viewer may see
 * @property {(targetId: string) => Promise<void>} start - Follow a moderator
 * @property {() => Promise<void>} stop - Stop following
 */

export interface LiveFocusState {
  focuses: LiveFocusView[]
  start: (targetId: string) => Promise<void>
  stop: () => Promise<void>
}

/**
 * Drive the Focus of one live, reread on a short beat
 * @param {string | null} liveId - Live, none in a course
 * @return {LiveFocusState} - State and gestures
 */

export const useLiveFocus = (liveId: string | null): LiveFocusState => {
  const client = useQueryClient()
  const { run } = useMutation()
  const { data } = useQuery({
    queryKey: QUERY_KEYS.liveFocus(liveId ?? ''),
    queryFn: ({ signal }) => apiGet<LiveFocusView[]>(API_ROUTES.liveFocus(liveId ?? ''), signal),
    enabled: liveId !== null,
    refetchInterval: LIVE_SETTINGS.focusPollSeconds * 1000,
  })

  const start = useCallback(
    async (targetId: string) => {
      if (!liveId) return
      const next = await run(
        () => apiPost<LiveFocusView[]>(API_ROUTES.liveFocus(liveId), { targetId }),
        MODVIEW_INSPECT_COPY.started
      )
      if (next) client.setQueryData(QUERY_KEYS.liveFocus(liveId), next)
    },
    [client, liveId, run]
  )

  const stop = useCallback(async () => {
    if (!liveId) return
    const next = await run(
      () => apiDelete<LiveFocusView[]>(API_ROUTES.liveFocus(liveId)),
      MODVIEW_INSPECT_COPY.stopped
    )
    if (next) client.setQueryData(QUERY_KEYS.liveFocus(liveId), next)
  }, [client, liveId, run])

  return { focuses: data ?? [], start, stop }
}
