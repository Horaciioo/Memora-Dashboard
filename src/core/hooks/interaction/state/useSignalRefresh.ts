'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { listenStream } from '@/core/lib/api/eventStreams'

/**
 * Re-render the server views each time a stream raises an event
 * @param {string} url - Stream route
 * @param {string} event - Event name
 * @return {void}
 */

export const useSignalRefresh = (url: string, event: string): void => {
  const router = useRouter()

  useEffect(() => listenStream(url, event, () => router.refresh()), [router, url, event])
}
