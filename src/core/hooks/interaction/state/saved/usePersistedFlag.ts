'use client'

import { useCallback, useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener)
  window.addEventListener('storage', listener)

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

/**
 * Yes/no kept per browser
 * @param {string} key - Storage key
 * @param {boolean} fallback - Value until one is saved
 * @return {[boolean, (value: boolean) => void]} - Value and setter
 */

export const usePersistedFlag = (
  key: string,
  fallback: boolean
): [boolean, (value: boolean) => void] => {
  const snapshot = useCallback((): boolean => {
    try {
      const saved = window.localStorage.getItem(key)

      return saved === null ? fallback : saved === '1'
    } catch {
      return fallback
    }
  }, [key, fallback])

  const value = useSyncExternalStore(subscribe, snapshot, () => fallback)

  const set = useCallback(
    (next: boolean) => {
      try {
        window.localStorage.setItem(key, next ? '1' : '0')
      } catch {
        // Storage blocked
      }
      listeners.forEach((listener) => listener())
    },
    [key]
  )

  return [value, set]
}
