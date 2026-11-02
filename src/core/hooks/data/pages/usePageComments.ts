'use client'

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { apiDelete, apiGet, apiPatch, apiPost, messageOf } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { PageCommentView } from '@/types/pages'

/**
 * Comments and gestures
 * @typedef {Object} PageCommentsState
 */

export interface PageCommentsState {
  comments: PageCommentView[]
  add: (body: string, parentId?: string) => Promise<boolean>
  resolve: (commentId: string, resolved: boolean) => Promise<void>
  remove: (commentId: string) => Promise<void>
}

/**
 * Comments of a page
 * @param {string} pageId - Page id
 * @return {PageCommentsState} - Comments
 */

export const usePageComments = (pageId: string): PageCommentsState => {
  const queryClient = useQueryClient()
  const { notifyError } = useNotifications()
  const key = QUERY_KEYS.pageComments(pageId)

  const { data } = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => apiGet<PageCommentView[]>(API_ROUTES.pageComments(pageId), signal),
  })

  const attempt = useCallback(
    async (action: () => Promise<unknown>): Promise<boolean> => {
      try {
        await action()
        await queryClient.invalidateQueries({ queryKey: key })

        return true
      } catch (error) {
        notifyError(error, messageOf(error))

        return false
      }
    },
    [key, notifyError, queryClient]
  )

  return {
    comments: data ?? [],
    add: (body, parentId) =>
      attempt(() => apiPost(API_ROUTES.pageComments(pageId), { body, parentId })),
    resolve: async (commentId, resolved) => {
      await attempt(() => apiPatch(API_ROUTES.pageComment(commentId), { resolved }))
    },
    remove: async (commentId) => {
      await attempt(() => apiDelete(API_ROUTES.pageComment(commentId)))
    },
  }
}
