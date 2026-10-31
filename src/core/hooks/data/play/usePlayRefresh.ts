'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { queueRefresh } from '@/core/lib/realtime/refresh'
import { listenRealtime } from '@/core/lib/realtime/socket'
import { PLAY_STREAM_EVENTS } from '@/declarations/play/topics'
import { REALTIME_EVENTS } from '@/declarations/system/realtime'

// Events that move more than the board
const PAGE_EVENTS: string[] = [PLAY_STREAM_EVENTS.changed, REALTIME_EVENTS.resync]

/**
 * Read the page again when a Play topic says seats, stage or crowd moved
 * @param {string} topic - Topic
 * @return {void}
 */

export const usePlayRefresh = (topic: string): void => {
  const router = useRouter()

  useEffect(
    () =>
      listenRealtime(topic, (event) => {
        if (PAGE_EVENTS.includes(event)) queueRefresh(() => router.refresh())
      }),
    [router, topic]
  )
}
