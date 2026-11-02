'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/core/lib/api/keys'
import { TAB_ID } from '@/core/lib/api/tab'
import { queueRefresh } from '@/core/lib/realtime/refresh'
import { listenRealtime } from '@/core/lib/realtime/socket'
import { PAGE_STREAM_EVENTS, PAGE_TOPICS } from '@/declarations/pages/topics'
import { REALTIME_EVENTS } from '@/declarations/system/realtime'

/**
 * What a page signal carries
 * @typedef {Object} PageSignal
 */

interface PageSignal {
  tab?: string | null
  contentAt?: string
}

/**
 * Follow a page: titles, discussion and save times land without a reload
 * @param {string} pageId - Page id
 * @param {(contentAt: string) => void} onSaved - Content written
 * @return {void}
 */

export const usePageLive = (pageId: string, onSaved: (contentAt: string) => void): void => {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const comments = () =>
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pageComments(pageId) })
    const meta = () => queueRefresh(() => router.refresh())

    // Back from a drop, anything may have moved
    const handlers: Record<string, (signal: PageSignal) => void> = {
      [REALTIME_EVENTS.resync]: () => [comments, meta].forEach((handler) => handler()),
      [PAGE_STREAM_EVENTS.comments]: comments,
      [PAGE_STREAM_EVENTS.saved]: ({ contentAt }) => contentAt && onSaved(contentAt),
      [PAGE_STREAM_EVENTS.meta]: meta,
      // Rights gone, the page reads again
      [PAGE_STREAM_EVENTS.access]: meta,
    }

    return listenRealtime(PAGE_TOPICS.page(pageId), (event, data) => {
      const signal = (data ?? {}) as PageSignal
      // What this tab wrote is on screen already
      if (signal.tab === TAB_ID) return
      handlers[event]?.(signal)
    })
  }, [pageId, onSaved, queryClient, router])
}
