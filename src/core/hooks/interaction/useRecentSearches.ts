'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

// One entry per account
const STORAGE_PREFIX = 'memora:recent-searches'
const EMPTY = '[]'
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

/**
 * Terms stored in a raw entry
 * @param {string} raw - Stored text
 * @return {string[]} - Terms, none when corrupt
 */

const parseTerms = (raw: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(raw)

    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

/**
 * Last searches, kept in the browser per account
 * @return {{ recents: string[], remember: (term: string) => void }} - Terms and recorder
 */

export const useRecentSearches = () => {
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

  // Parse stored terms
  const recents = useMemo(() => (session ? parseTerms(raw) : []), [raw, session])

  const remember = useCallback(
    (term: string) => {
      const clean = term.trim()
      if (!session || clean.length < SEARCH_SETTINGS.minLength) return

      // Newest first, no duplicates
      const current = parseTerms(readRaw())
      const next = [clean, ...current.filter((item) => item.toLowerCase() !== clean.toLowerCase())]

      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify(next.slice(0, SEARCH_SETTINGS.recentLimit))
        )
      } catch {
        // Storage blocked
      }
      listeners.forEach((listener) => listener())
    },
    [readRaw, session, storageKey]
  )

  return { recents, remember }
}
