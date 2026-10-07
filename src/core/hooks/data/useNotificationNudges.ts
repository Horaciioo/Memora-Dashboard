'use client'

import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useNotificationsStore } from '@/core/store/notifications'
import { NOTIFICATION_SETTINGS, NUDGE_SETTINGS } from '@/declarations/configurations/settings'
import { NOTIFICATION_KIND_REGISTRY } from '@/declarations/notifications/registries'
import { NOTIFICATION_STREAM_EVENTS } from '@/declarations/notifications/topics'
import type { NotificationEntry, NotificationFeed } from '@/types/notifications'

/**
 * Nudge queue
 * @typedef {Object} NotificationNudges
 * @property {NotificationEntry[]} queue - Oldest first
 * @property {() => void} shift - Drop the first
 */

export interface NotificationNudges {
  queue: NotificationEntry[]
  shift: () => void
}

// Readable kinds only
const isReadable = (entry: NotificationEntry): boolean =>
  entry.kind !== null && NOTIFICATION_KIND_REGISTRY.has(entry.kind)

/**
 * Notifications landing during the visit: pushed by the stream the moment they are written, and
 * caught by a slow poll when the stream is down
 * @param {boolean} isArmed - Bubbles allowed
 * @return {NotificationNudges} - Queue and consumer
 */

export const useNotificationNudges = (isArmed: boolean): NotificationNudges => {
  const queue = useNotificationsStore((state) => state.nudges)
  const shift = useNotificationsStore((state) => state.shiftNudge)
  const size = NOTIFICATION_SETTINGS.panelSize

  // Stream
  useEffect(() => {
    if (!isArmed) return

    // The browser reconnects on its own after a drop
    const source = new EventSource(API_ROUTES.notificationsStream)
    const onFresh = (event: MessageEvent<string>) => {
      const entry = JSON.parse(event.data) as NotificationEntry
      useNotificationsStore.getState().receive(entry, isReadable(entry))
    }

    source.addEventListener(NOTIFICATION_STREAM_EVENTS.fresh, onFresh as EventListener)

    return () => {
      source.removeEventListener(NOTIFICATION_STREAM_EVENTS.fresh, onFresh as EventListener)
      source.close()
    }
  }, [isArmed])

  // Poll
  const { data } = useQuery({
    queryKey: QUERY_KEYS.notifications(size),
    queryFn: ({ signal }) => apiGet<NotificationFeed>(API_ROUTES.notifications(size), signal),
    enabled: isArmed,
    refetchInterval: NUDGE_SETTINGS.pollMs,
    refetchIntervalInBackground: false,
  })
  const known = useRef<Set<string> | null>(null)

  useEffect(() => {
    if (!data) return

    // First page is the backlog
    if (!known.current) {
      known.current = new Set(data.entries.map((entry) => entry.id))
      return
    }

    // Feed is newest first, bubbles come oldest first
    for (const entry of [...data.entries].reverse()) {
      if (known.current.has(entry.id)) continue

      known.current.add(entry.id)
      useNotificationsStore.getState().receive(entry, isReadable(entry))
    }
  }, [data])

  return { queue, shift }
}
