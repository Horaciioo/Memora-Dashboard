'use client'

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { apiGet, apiPost, messageOf } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { PAGE_HISTORY_COPY } from '@/declarations/pages/copy'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { PageRevisionDetail, PageRevisionSummary } from '@/types/pages'

/**
 * Kept versions, the one looked at, the restore gesture
 * @param {string} pageId - Page id
 * @param {string | null} selectedId - Version looked at
 * @return {Object} - History state
 */

export const usePageHistory = (pageId: string, selectedId: string | null) => {
  const queryClient = useQueryClient()
  const { notify, notifyError } = useNotifications()

  const { data: versions } = useQuery({
    queryKey: QUERY_KEYS.pageRevisions(pageId),
    queryFn: ({ signal }) =>
      apiGet<PageRevisionSummary[]>(API_ROUTES.pageRevisions(pageId), signal),
  })

  const { data: selected } = useQuery({
    queryKey: QUERY_KEYS.pageRevision(pageId, selectedId ?? ''),
    queryFn: ({ signal }) =>
      apiGet<PageRevisionDetail>(API_ROUTES.pageRevision(pageId, selectedId ?? ''), signal),
    enabled: selectedId !== null,
  })

  const restore = useCallback(
    async (versionId: string): Promise<boolean> => {
      try {
        await apiPost(API_ROUTES.pageRevisionRestore(pageId, versionId), {})
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pageRevisions(pageId) })
        notify({ tone: 'success', title: PAGE_HISTORY_COPY.restored })

        return true
      } catch (error) {
        notifyError(error, messageOf(error))

        return false
      }
    },
    [notify, notifyError, pageId, queryClient]
  )

  return { versions: versions ?? null, selected: selected ?? null, restore }
}
