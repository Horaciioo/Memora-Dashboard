'use client'

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiGet, apiPost } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { ViewerComment } from '@/types/lives'

/**
 * Comments kept on a viewer, and the way to add one
 * @param {string | null} liveId - Live, none off a real live
 * @param {string} chatterId - Viewer
 * @param {string} login - Viewer login
 * @return {Object} - Comments, saving state and add
 */

export const useViewerComments = (liveId: string | null, chatterId: string, login: string) => {
  const client = useQueryClient()
  const { run, isSaving } = useMutation()
  const key = QUERY_KEYS.liveViewerComments(liveId ?? '', chatterId)

  const { data } = useQuery({
    queryKey: key,
    queryFn: ({ signal }) =>
      apiGet<ViewerComment[]>(API_ROUTES.liveViewerComments(liveId ?? '', chatterId), signal),
    enabled: liveId !== null,
  })

  const add = useCallback(
    async (body: string): Promise<boolean> => {
      if (!liveId) return false
      const created = await run(() =>
        apiPost<ViewerComment>(API_ROUTES.liveViewerComments(liveId, chatterId), { body, login })
      )
      if (!created) return false

      client.setQueryData<ViewerComment[]>(key, (current) => [created, ...(current ?? [])])

      return true
    },
    [liveId, chatterId, login, run, client, key]
  )

  return { comments: data ?? null, isSaving, add }
}
