'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

import { HOME_FAVORITES } from '@/declarations/ui/favorites'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

// One entry per account
const STORAGE_PREFIX = 'memora:visited-paths'
const EMPTY = '[]'
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

/**
 * Paths stored in a raw entry
 * @param {string} raw - Stored text
 * @return {string[]} - Paths, none when corrupt
 */

const parsePaths = (raw: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(raw)

    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

/**
 * Last pages opened, kept in the browser per account
 * @return {{ visited: string[], remember: (path: string) => void }} - Paths, newest first, and recorder
 */

export const useVisitedPaths = () => {
  const { session } = useAuthContext()
  const storageKey = `${STORAGE_PREFIX}:${session?.id ?? ''}`

  const readRaw = useCallback(() => {
    try {
      return window.localStorage.getItem(storageKey) ?? EMPTY
    } catch {
      return EMPTY
    }
  }, [storageKey])

  const raw = useSyncExternalStore(subscribe, readRaw, () => EMPTY)
  const visited = useMemo(() => (session ? parsePaths(raw) : []), [raw, session])

  const remember = useCallback(
    (path: string) => {
      if (!session) return

      // Newest first, no duplicates
      const next = [path, ...parsePaths(readRaw()).filter((item) => item !== path)]

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next.slice(0, HOME_FAVORITES.kept)))
      } catch {
        // Storage blocked
      }
      listeners.forEach((listener) => listener())
    },
    [readRaw, session, storageKey]
  )

  return { visited, remember }
}
