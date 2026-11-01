'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiDelete, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { browserSnapshot } from '@/core/lib/pwa/browserSnapshot'
import { decodeKey, readPushSupport } from '@/core/lib/pwa/platform'
import { readSubscriptionBody } from '@/core/lib/pwa/subscription'
import { PUSH_COPY } from '@/declarations/pwa/copy'
import type { PushDeviceView } from '@/types/push'
import type { PushSupport } from '@/types/pwa'

/**
 * This browser as a push device
 * @typedef {Object} PushDeviceState
 * @property {PushSupport | null} support - Unknown until mounted
 * @property {string | null} endpoint - Subscription of this browser
 * @property {boolean} isBusy - Request in flight
 * @property {() => Promise<PushDeviceView | null>} enable - Asks, subscribes, records
 * @property {() => Promise<boolean>} disable - Unsubscribes, forgets
 */

export interface PushDeviceState {
  support: PushSupport | null
  endpoint: string | null
  isBusy: boolean
  enable: () => Promise<PushDeviceView | null>
  disable: () => Promise<boolean>
}

/**
 * Turn pushes on or off for this browser
 * @param {string | null} publicKey - Server key, null when pushes are not set up
 * @return {PushDeviceState} - State and gestures
 */

export const usePushDevice = (publicKey: string | null): PushDeviceState => {
  const initial = useSyncExternalStore(...browserSnapshot(readPushSupport))
  // A refused prompt changes the answer
  const [answered, setAnswered] = useState<PushSupport | null>(null)
  const [endpoint, setEndpoint] = useState<string | null>(null)
  const { isSaving, run } = useMutation()
  const support = answered ?? initial

  // This browser may already be subscribed
  useEffect(() => {
    if (readPushSupport() !== 'available') return

    void navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setEndpoint(subscription?.endpoint ?? null))
      .catch(() => undefined)
  }, [])

  // Permission is asked inside the tap, iOS refuses it otherwise
  const enable = useCallback(async () => {
    if (!publicKey) return null

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setAnswered(readPushSupport())

      return null
    }

    return run(async () => {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeKey(publicKey),
      })
      const device = await apiPost<PushDeviceView>(
        API_ROUTES.pushSubscription,
        readSubscriptionBody(subscription)
      )
      setEndpoint(subscription.endpoint)

      return device
    }, PUSH_COPY.enabledToast)
  }, [publicKey, run])

  const disable = useCallback(async () => {
    const done = await run(async () => {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) return true

      await apiDelete(API_ROUTES.pushSubscription, { endpoint: subscription.endpoint })
      await subscription.unsubscribe()

      return true
    }, PUSH_COPY.disabledToast)
    if (done) setEndpoint(null)

    return Boolean(done)
  }, [run])

  return { support, endpoint, isBusy: isSaving, enable, disable }
}
