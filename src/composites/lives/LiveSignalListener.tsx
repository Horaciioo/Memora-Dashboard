'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { API_ROUTES } from '@/core/lib/api/routes'
import { LIVE_STREAM_EVENTS } from '@/declarations/lives/topics'

/**
 * Re-render the server views when a live changes status
 * @return {null}
 */

export const LiveSignalListener = () => {
  const router = useRouter()

  useEffect(() => {
    // The browser reconnects on its own after a drop
    const source = new EventSource(API_ROUTES.livesStream)
    const refresh = () => router.refresh()

    source.addEventListener(LIVE_STREAM_EVENTS.status, refresh)

    return () => {
      source.removeEventListener(LIVE_STREAM_EVENTS.status, refresh)
      source.close()
    }
  }, [router])

  return null
}
