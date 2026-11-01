'use client'

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { apiDelete, apiPost, messageOf } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_MENU_COPY } from '@/declarations/pages/copy'
import type { PageTemplateName } from '@/declarations/pages/templates'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { PageSummary } from '@/types/pages'

/**
 * Tree gestures
 * @typedef {Object} PageActions
 */

export interface PageActions {
  create: (input?: { parentId?: string | null; template?: PageTemplateName; open?: boolean }) => Promise<PageSummary | null>
  move: (pageId: string, parentId: string | null, position: number) => Promise<void>
  trash: (pageId: string) => Promise<void>
  restore: (pageId: string) => Promise<void>
  purge: (pageId: string) => Promise<void>
}

/**
 * Create, move and remove pages
 * @return {PageActions} - Gestures
 */

export const usePageActions = (): PageActions => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { notify, notifyError } = useNotifications()

  // Every page list reloads
  const refresh = useCallback(() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pages }), [queryClient])

  const attempt = useCallback(
    async <T>(action: () => Promise<T>, success?: string): Promise<T | null> => {
      try {
        const result = await action()
        if (success) notify({ tone: 'success', title: success })
        await refresh()

        return result
      } catch (error) {
        notifyError(error, messageOf(error))

        return null
      }
    },
    [notify, notifyError, refresh]
  )

  const create: PageActions['create'] = useCallback(
    async (input = {}) => {
      const page = await attempt(() =>
        apiPost<PageSummary>(API_ROUTES.pages, { parentId: input.parentId ?? null, template: input.template ?? null })
      )
      if (page && input.open !== false) router.push(ROUTES.page(page.id))

      return page
    },
    [attempt, router]
  )

  const move: PageActions['move'] = useCallback(
    async (pageId, parentId, position) => {
      await attempt(() => apiPost(API_ROUTES.pageMove(pageId), { parentId, position }))
    },
    [attempt]
  )

  const trash: PageActions['trash'] = useCallback(
    async (pageId) => {
      await attempt(() => apiDelete(API_ROUTES.page(pageId)), PAGE_MENU_COPY.trashed)
    },
    [attempt]
  )

  const restore: PageActions['restore'] = useCallback(
    async (pageId) => {
      await attempt(() => apiPost(API_ROUTES.pageRestore(pageId), {}), PAGE_MENU_COPY.restored)
    },
    [attempt]
  )

  const purge: PageActions['purge'] = useCallback(
    async (pageId) => {
      await attempt(() => apiDelete(API_ROUTES.pagePurge(pageId)), PAGE_MENU_COPY.purged)
    },
    [attempt]
  )

  return { create, move, trash, restore, purge }
}
