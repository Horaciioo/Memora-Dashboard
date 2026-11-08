'use client'

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'memora:rail-compact'
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

const readCompact = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Compact state of the rail, kept in the browser
 * @return {[boolean, () => void]} - Compact flag and its toggle
 */

export const useRailCompact = (): [boolean, () => void] => {
  const isCompact = useSyncExternalStore(subscribe, readCompact, () => false)

  const toggle = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, readCompact() ? '0' : '1')
    } catch {
      // Storage blocked
    }
    listeners.forEach((listener) => listener())
  }, [])

  return [isCompact, toggle]
}
