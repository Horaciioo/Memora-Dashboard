'use client'

import { useCallback, useState, useSyncExternalStore } from 'react'

import { applyUpdate } from '@/core/hooks/pwa/useServiceWorker'
import { browserSnapshot } from '@/core/lib/pwa/browserSnapshot'
import { isStandalone } from '@/core/lib/pwa/platform'
import { usePwaStore } from '@/core/store/pwa'
import { ICON_REVISION, ICON_REVISION_KEY } from '@/declarations/pwa/update'

/**
 * Revision this device last saw
 * @return {string | null} - Revision, null when unknown or storage is blocked
 */

const readSeen = (): string | null => {
  try {
    return window.localStorage.getItem(ICON_REVISION_KEY)
  } catch {
    return null
  }
}

/**
 * Update on offer: a new version waiting, or a new icon an installed app can only show once reinstalled
 * @return {{ isOffered: boolean, isIconNew: boolean, apply: () => void, acknowledge: () => void }}
 */

export const useUpdateOffer = () => {
  const waiting = usePwaStore((state) => state.waiting)
  const [isDone, setDone] = useState(false)
  // Storage and display mode only exist in the browser
  const isPending = useSyncExternalStore(
    ...browserSnapshot(() => isStandalone() && readSeen() !== ICON_REVISION)
  )
  const isIconNew = isPending === true && !isDone

  const acknowledge = useCallback(() => {
    try {
      window.localStorage.setItem(ICON_REVISION_KEY, ICON_REVISION)
    } catch {
      // Offered again next visit
    }
    setDone(true)
  }, [])

  const apply = useCallback(() => {
    if (usePwaStore.getState().waiting) applyUpdate()
  }, [])

  return { isOffered: waiting !== null || isIconNew, isIconNew, apply, acknowledge }
}
