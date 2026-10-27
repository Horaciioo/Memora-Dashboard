'use client'

import { startTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { listenRealtime } from '@/core/lib/realtime/socket'
import { PLAY_STREAM_EVENTS } from '@/declarations/play/topics'
import { REALTIME_EVENTS, REALTIME_SETTINGS } from '@/declarations/system/realtime'

// Events that move more than the board
const PAGE_EVENTS: string[] = [PLAY_STREAM_EVENTS.changed, REALTIME_EVENTS.resync]

// One refresh for a burst of signals
let pending = 0

/**
 * Read the page again, signals close together merged into one read
 * @param {() => void} refresh - Page read
 * @return {void}
 */

export const queuePlayRefresh = (refresh: () => void): void => {
  if (pending) return
  pending = window.setTimeout(() => {
    pending = 0
    startTransition(refresh)
  }, REALTIME_SETTINGS.refreshCoalesceMs)
}

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
        if (PAGE_EVENTS.includes(event)) queuePlayRefresh(() => router.refresh())
      }),
    [router, topic]
  )
}
