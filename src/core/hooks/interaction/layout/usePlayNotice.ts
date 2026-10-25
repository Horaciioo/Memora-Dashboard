'use client'

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'memora:play-notice'
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

const readDismissed = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

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
