'use client'

import { useEffect } from 'react'

import { useNotificationsStore } from '@/core/store/notifications'

/**
 * Mirror the unread count on the home screen icon
 * @return {void}
 */

export const useAppBadge = (): void => {
  const unread = useNotificationsStore((state) => state.feed.unread)

  useEffect(() => {
    if (!('setAppBadge' in navigator)) return

    const write = unread > 0 ? navigator.setAppBadge(unread) : navigator.clearAppBadge()
    void write.catch(() => undefined)
  }, [unread])
}
