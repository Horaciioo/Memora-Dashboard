'use client'

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { apiDelete, apiGet, apiPatch, apiPut, messageOf } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { GrantableLevelName, PageShareScopeName } from '@/declarations/pages/access'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { PageSharing } from '@/types/pages'
import type { MemberRoleName } from '@/utils/constants/hierarchy'

/**
 * Audience of a new share
 * @typedef {Object} ShareTarget
 */

export interface ShareTarget {
  scope: PageShareScopeName
  accountId?: string
  role?: MemberRoleName
}

/**
 * Sharing state and gestures
 * @typedef {Object} PageSharingState
 */

export interface PageSharingState {
  sharing: PageSharing | null
  isLoading: boolean
  share: (target: ShareTarget, level: GrantableLevelName) => Promise<void>
  unshare: (shareId: string) => Promise<void>
  setInherit: (inherit: boolean) => Promise<void>
}

/**
 * Who reaches a page, and the gestures to change it
 * @param {string} pageId - Page id
 * @param {boolean} enabled - Panel open
 * @return {PageSharingState} - Sharing
 */

export const usePageSharing = (pageId: string, enabled: boolean): PageSharingState => {
  const queryClient = useQueryClient()
  const { notifyError } = useNotifications()
  const key = QUERY_KEYS.pageSharing(pageId)

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => apiGet<PageSharing>(API_ROUTES.pageSharing(pageId), signal),
    enabled,
  })

  // Answer replaces the panel state
  const apply = useCallback(
    async (action: () => Promise<PageSharing>) => {
      try {
        queryClient.setQueryData(key, await action())
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pages, exact: true })
      } catch (error) {
        notifyError(error, messageOf(error))
      }
    },
    [key, notifyError, queryClient]
  )

  return {
    sharing: data ?? null,
    isLoading,
    share: (target, level) =>
      apply(() => apiPut<PageSharing>(API_ROUTES.pageSharing(pageId), { ...target, level })),
    unshare: (shareId) =>
      apply(() => apiDelete<PageSharing>(API_ROUTES.pageShare(pageId, shareId))),
    setInherit: (inherit) =>
      apply(() =>
        apiPatch<PageSharing>(API_ROUTES.pageSharing(pageId), { inheritAccess: inherit })
      ),
  }
}
