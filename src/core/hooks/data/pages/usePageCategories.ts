'use client'

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { apiDelete, apiGet, apiPatch, apiPost, messageOf } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { PageCategoryView } from '@/types/pages'

/**
 * Categories and their gestures
 * @typedef {Object} PageCategories
 * @property {PageCategoryView[]} categories - Categories in order
 */

export interface PageCategories {
  categories: PageCategoryView[]
  create: (name: string) => Promise<void>
  rename: (categoryId: string, name: string) => Promise<boolean>
  reorder: (categoryId: string, position: number) => Promise<void>
  remove: (categoryId: string) => Promise<void>
}

/**
 * Categories of the private rail
 * @param {boolean} [enabled] - Load at all
 * @return {PageCategories} - Categories and gestures
 */

export const usePageCategories = (enabled = true): PageCategories => {
  const queryClient = useQueryClient()
  const { notifyError } = useNotifications()
  const { data } = useQuery({
    queryKey: QUERY_KEYS.pageCategories,
    queryFn: ({ signal }) => apiGet<PageCategoryView[]>(API_ROUTES.pageCategories, signal),
    enabled,
  })

  // Pages carry their category, both reload
  const attempt = useCallback(
    async (action: () => Promise<unknown>): Promise<boolean> => {
      try {
        await action()
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pages })

        return true
      } catch (error) {
        notifyError(error, messageOf(error))

        return false
      }
    },
    [notifyError, queryClient]
  )

  const create = useCallback(
    async (name: string) =>
      void (await attempt(() => apiPost(API_ROUTES.pageCategories, { name }))),
    [attempt]
  )
  const rename = useCallback(
    (categoryId: string, name: string) =>
      attempt(() => apiPatch(API_ROUTES.pageCategory(categoryId), { name })),
    [attempt]
  )
  const reorder = useCallback(
    async (categoryId: string, position: number) =>
      void (await attempt(() => apiPatch(API_ROUTES.pageCategory(categoryId), { position }))),
    [attempt]
  )
  const remove = useCallback(
    async (categoryId: string) =>
      void (await attempt(() => apiDelete(API_ROUTES.pageCategory(categoryId)))),
    [attempt]
  )

  return { categories: data ?? [], create, rename, reorder, remove }
}
