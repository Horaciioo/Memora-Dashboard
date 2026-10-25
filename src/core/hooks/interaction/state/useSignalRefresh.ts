'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Re-render the server views each time a stream raises an event
 * @param {string} url - Stream route
 * @param {string} event - Event name
 * @return {void}
 */

export const useSignalRefresh = (url: string, event: string): void => {
  const router = useRouter()

  useEffect(() => {
    // The browser reconnects on its own after a drop
    const source = new EventSource(url)
    const refresh = () => router.refresh()

    source.addEventListener(event, refresh)

    return () => {
      source.removeEventListener(event, refresh)
      source.close()
    }
  }, [router, url, event])
}
