'use client'

import { useEffect } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { readSubscriptionBody } from '@/core/lib/pwa/subscription'

/**
 * Hand the browser subscription back to the server on each start, a new sign-in relinks it
 * @param {boolean} isEnabled - Pushes configured on the server
 * @return {void}
 */

export const usePushResync = (isEnabled: boolean): void => {
  useEffect(() => {
    if (!isEnabled || !('serviceWorker' in navigator) || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    void navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) =>
        subscription
          ? apiPost(API_ROUTES.pushSubscription, readSubscriptionBody(subscription))
          : null
      )
      .catch(() => undefined)
  }, [isEnabled])
}
