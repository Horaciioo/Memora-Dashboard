'use client'

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { apiPatch, apiUpload, messageOf } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { PAGE_EDITOR_COPY } from '@/declarations/pages/copy'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'

/**
 * Title, icon, cover and pictures of a page
 * @param {string} pageId - Page id
 * @return {Object} - Gestures
 */

export const usePageMeta = (pageId: string) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { notifyError } = useNotifications()

  // Rail and banner follow
  const patch = useCallback(
    async (fields: Record<string, unknown>): Promise<boolean> => {
      try {
        await apiPatch(API_ROUTES.page(pageId), fields)
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pages, exact: true })
        router.refresh()

        return true
      } catch (error) {
        notifyError(error, messageOf(error))

        return false
      }
    },
    [notifyError, pageId, queryClient, router]
  )

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      const form = new FormData()
      form.append('file', file)

      try {
        return (await apiUpload<{ url: string }>(API_ROUTES.pageMediaUpload(pageId), form)).url
      } catch (error) {
        notifyError(error, PAGE_EDITOR_COPY.imageFailed)

        return null
      }
    },
    [notifyError, pageId]
  )

  return {
    rename: (title: string) => patch({ title }),
    setIcon: (icon: string | null) => patch({ icon }),
    setCover: (coverUrl: string | null) => patch({ coverUrl }),
    upload,
  }
}
