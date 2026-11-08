'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { subscribeTo } from '@/utils/subscribeTo'
import { readStoredFlag } from '@/utils/storedFlag'

const STORAGE_KEY = 'memora:play-notice'
const listeners = new Set<() => void>()

const subscribe = subscribeTo(listeners)

const readDismissed = () => readStoredFlag(STORAGE_KEY)

/**
 * Play invitation under the rail, kept dismissed in the browser
 * @return {[boolean, () => void]} - Dismissed flag and its handler
 */

export const usePlayNotice = (): [boolean, () => void] => {
  // Hidden until the browser answers
  const isDismissed = useSyncExternalStore(subscribe, readDismissed, () => true)

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Storage blocked
    }
    listeners.forEach((listener) => listener())
  }, [])

  return [isDismissed, dismiss]
}
