'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { apiDelete, apiGet, apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { useNotificationsStore } from '@/core/store/notifications'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import type { NotificationEntry, NotificationFeed } from '@/types/notifications'

/**
 * Notification state and gestures
 * @typedef {Object} NotificationCollection
 * @property {NotificationEntry[]} entries - Newest first
 * @property {number} unread - Unopened count
 * @property {boolean} hasMore - Older entries wait
 * @property {boolean} isLoading - First page still in flight
 * @property {() => void} load - Fetch the page, skipped while fresh
 * @property {() => void} loadMore - Fetch the page after the last one held
 * @property {(id: string) => void} open - Mark one as read
 * @property {() => void} readAll - Mark every one as read
 * @property {(id: string) => void} remove - Delete one
 * @property {() => void} clearRead - Delete every one already read
 */

export interface NotificationCollection {
  entries: NotificationEntry[]
  unread: number
  hasMore: boolean
  isLoading: boolean
  load: () => void
  loadMore: () => void
  open: (id: string) => void
  readAll: () => void
  remove: (id: string) => void
  clearRead: () => void
}

/**
 * Drive the personal notifications, shared by every surface that shows them
 * @param {NotificationFeed} initial - Feed resolved server-side
 * @param {number} [size] - Entry count asked for
 * @return {NotificationCollection} - State and gestures
 */

export const useNotificationFeed = (
  initial: NotificationFeed,
  size: number = NOTIFICATION_SETTINGS.pageSize
): NotificationCollection => {
  const store = useNotificationsStore()
  const [isLoading, setLoading] = useState(false)
  const { run } = useMutation()

  // Stamp of the last fetch
  const loadedAt = useRef(0)

  // The first surface to mount hands the server state over
  useEffect(() => {
    useNotificationsStore.getState().seed(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = useCallback(() => {
    if (Date.now() - loadedAt.current < NOTIFICATION_SETTINGS.staleMs) return

    setLoading(true)

    void run(() => apiGet<NotificationFeed>(API_ROUTES.notifications(size))).then((next) => {
      if (next) {
        loadedAt.current = Date.now()
        useNotificationsStore.getState().replace(next)
      }

      setLoading(false)
    })
  }, [run, size])

  const loadMore = useCallback(() => {
    const last = useNotificationsStore.getState().feed.entries.at(-1)
    if (!last) return

    void run(() => apiGet<NotificationFeed>(API_ROUTES.notifications(size, last.id))).then(
      (page) => {
        if (page) useNotificationsStore.getState().extend(page)
      }
    )
  }, [run, size])

  // Each gesture settles on screen at once, the server follows
  const open = useCallback(
    (id: string) => {
      useNotificationsStore.getState().settle(id)
      void run(() => apiPatch<{ id: string }>(API_ROUTES.notification(id), {}))
    },
    [run]
  )

  const readAll = useCallback(() => {
    useNotificationsStore.getState().settleEvery()
    void run(() => apiPatch<{ unread: number }>(API_ROUTES.notifications(), {}))
  }, [run])

  const remove = useCallback(
    (id: string) => {
      useNotificationsStore.getState().drop(id)
      void run(() => apiDelete(API_ROUTES.notification(id)))
    },
    [run]
  )

  const clearRead = useCallback(() => {
    useNotificationsStore.getState().dropOpened()
    void run(() => apiDelete(API_ROUTES.notifications()))
  }, [run])

  return {
    entries: store.feed.entries,
    unread: store.feed.unread,
    hasMore: store.feed.hasMore ?? false,
    isLoading: isLoading && store.feed.entries.length === 0,
    load,
    loadMore,
    open,
    readAll,
    remove,
    clearRead,
  }
}
