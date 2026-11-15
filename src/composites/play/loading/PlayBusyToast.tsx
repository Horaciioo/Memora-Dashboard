'use client'

import { useEffect, useRef } from 'react'

import { usePlayBusyStore } from '@/core/store/play/playBusy'
import { PLAY_BUSY } from '@/declarations/play'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'

/**
 * Ongoing toast while a Play gesture waits on the server
 * @return {null}
 */

export const PlayBusyToast = () => {
  const label = usePlayBusyStore((state) => state.labels.at(-1) ?? null)
  const { notify, dismiss } = useNotifications()
  const shown = useRef<string | null>(null)

  useEffect(() => {
    if (!label) return
    // Quick answers never flash the toast
    const timer = window.setTimeout(() => {
      shown.current = notify({ tone: 'brand', title: label, isOngoing: true })
    }, PLAY_BUSY.delayMs)

    return () => {
      window.clearTimeout(timer)
      if (shown.current) dismiss(shown.current)
      shown.current = null
    }
  }, [label, notify, dismiss])

  return null
}
