'use client'

import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { NOTIFICATION_SETTINGS, NUDGE_SETTINGS } from '@/declarations/configurations/settings'
import { NOTIFICATION_KIND_REGISTRY } from '@/declarations/notifications/registries'
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

/**
 * Notifications landing during the visit
 * @param {boolean} isArmed - Bubbles allowed
 * @return {NotificationNudges} - Queue and consumer
 */

export const useNotificationNudges = (isArmed: boolean): NotificationNudges => {
  const size = NOTIFICATION_SETTINGS.panelSize
  const { data } = useQuery({
    queryKey: QUERY_KEYS.notifications(size),
    queryFn: ({ signal }) => apiGet<NotificationFeed>(API_ROUTES.notifications(size), signal),
    enabled: isArmed,
    refetchInterval: NUDGE_SETTINGS.pollMs,
    refetchIntervalInBackground: false,
  })
  const entries = data?.entries

  const [seenEntries, setSeenEntries] = useState<NotificationEntry[] | undefined>(undefined)
  const [seenIds, setSeenIds] = useState<Set<string> | null>(null)
  const [queue, setQueue] = useState<NotificationEntry[]>([])

  // First page is the backlog
  if (entries && entries !== seenEntries) {
    setSeenEntries(entries)
    setSeenIds(new Set([...(seenIds ?? []), ...entries.map((entry) => entry.id)]))

    if (seenIds) {
      // Readable kinds only
      const fresh = entries.filter(
        (entry) =>
          !seenIds.has(entry.id) &&
          !entry.isRead &&
          entry.kind !== null &&
          NOTIFICATION_KIND_REGISTRY.has(entry.kind)
      )

      // Feed is newest first
      if (fresh.length > 0) setQueue([...queue, ...fresh.reverse()])
    }
  }

  // Stable for the bubble timer
  const shift = useCallback(() => setQueue((current) => current.slice(1)), [])

  return { queue, shift }
}
