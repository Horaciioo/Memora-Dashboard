'use client'

import { useCallback, useRef, useState } from 'react'

import { apiGet, apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import type { NotificationEntry, NotificationFeed } from '@/types/notifications'

/**
 * Notification state and gestures
 * @typedef {Object} NotificationCollection
 * @property {NotificationEntry[]} entries - Newest first
 * @property {number} unread - Unopened count
 * @property {boolean} isLoading - First page still in flight
 * @property {() => void} load - Fetch the page, skipped while fresh
 * @property {(id: string) => void} open - Mark one as read
 * @property {() => void} readAll - Mark every one as read
 */

export interface NotificationCollection {
  entries: NotificationEntry[]
  unread: number
  isLoading: boolean
  load: () => void
  open: (id: string) => void
  readAll: () => void
}

/**
 * Drive the personal notifications, the page being fetched on demand rather than polled
 * @param {NotificationFeed} initial - Feed resolved server-side
 * @param {number} [size] - Entry count asked for, defaults to the full page
 * @return {NotificationCollection} - State and gestures
 */

export const useNotificationFeed = (
  initial: NotificationFeed,
  size: number = NOTIFICATION_SETTINGS.pageSize
): NotificationCollection => {
  const [feed, setFeed] = useState(initial)
  const [isLoading, setLoading] = useState(false)
  const { run } = useMutation()

  // Stamp of the last fetch, zero until one lands, so the first opening always travels
  const loadedAt = useRef(0)

  const load = useCallback(() => {
    if (Date.now() - loadedAt.current < NOTIFICATION_SETTINGS.staleMs) return

    setLoading(true)

    void run(() => apiGet<NotificationFeed>(API_ROUTES.notifications(size))).then((next) => {
      if (next) {
        loadedAt.current = Date.now()
        setFeed(next)
      }

      setLoading(false)
    })
  }, [run, size])

  const open = useCallback(
    (id: string) => {
      // The row settles at once, the write only confirms it
      setFeed((current) => {
        const entry = current.entries.find((row) => row.id === id)
        if (!entry || entry.isRead) return current

        return {
          entries: current.entries.map((row) => (row.id === id ? { ...row, isRead: true } : row)),
          unread: Math.max(0, current.unread - 1),
        }
      })

      void run(() => apiPatch<{ id: string }>(API_ROUTES.notification(id), {}))
    },
    [run]
  )

  const readAll = useCallback(() => {
    setFeed((current) => ({
      entries: current.entries.map((entry) => ({ ...entry, isRead: true })),
      unread: 0,
    }))

    void run(() => apiPatch<{ unread: number }>(API_ROUTES.notifications(), {}))
  }, [run])

  return {
    entries: feed.entries,
    unread: feed.unread,
    isLoading: isLoading && feed.entries.length === 0,
    load,
    open,
    readAll,
  }
}
