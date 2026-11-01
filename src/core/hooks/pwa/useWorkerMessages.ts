'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useNotificationsStore } from '@/core/store/notifications'
import { WORKER_MESSAGES } from '@/declarations/pwa/worker'

/**
 * Follow a notification tapped while Memora was already open
 * @return {void}
 */

export const useWorkerMessages = (): void => {
  const router = useRouter()

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const receive = (event: MessageEvent) => {
      const data = event.data as { type?: string; url?: string; notificationId?: string | null }
      if (data?.type !== WORKER_MESSAGES.opened || !data.url) return

      // Read on the server already
      if (data.notificationId) useNotificationsStore.getState().settle(data.notificationId)

      const target = new URL(data.url)
      router.push(`${target.pathname}${target.search}${target.hash}`)
    }

    navigator.serviceWorker.addEventListener('message', receive)

    return () => navigator.serviceWorker.removeEventListener('message', receive)
  }, [router])
}
