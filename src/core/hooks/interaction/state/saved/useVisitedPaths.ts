'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

import { HOME_FAVORITES } from '@/declarations/ui/favorites'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { subscribeTo } from '@/utils/subscribeTo'
import { parseStringList } from '@/utils/format/arrays'

// One entry per account
const STORAGE_PREFIX = 'memora:visited-paths'
const EMPTY = '[]'
const listeners = new Set<() => void>()

const subscribe = subscribeTo(listeners)

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
  const visited = useMemo(() => (session ? parseStringList(raw) : []), [raw, session])

  const remember = useCallback(
    (path: string) => {
      if (!session) return

      // Newest first, no duplicates
      const next = [path, ...parseStringList(readRaw()).filter((item) => item !== path)]

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
