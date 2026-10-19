'use client'

import { useCallback, useSyncExternalStore } from 'react'

import type { ModPreferences } from '@/types/modview'

// One save per browser
const STORAGE_KEY = 'memora:modview:preferences:v1'

// Every display choice starts on, the chat stands still on hover
const DEFAULTS: ModPreferences = {
  timestamps: true,
  badges: true,
  deleted: true,
  firstMessages: true,
  colouredNames: true,
  pauseMode: 'hover',
  toolsPosition: 'left',
  keepResolved: false,
}

const listeners = new Set<() => void>()
let cached: ModPreferences | null = null

/**
 * Read the save of this browser
 * @return {ModPreferences} - Preferences, the defaults for what the save lacks
 */

const read = (): ModPreferences => {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')

    return saved && typeof saved === 'object'
      ? { ...DEFAULTS, ...(saved as Partial<ModPreferences>) }
      : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

const snapshot = (): ModPreferences => (cached ??= read())

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener)

  // Another tab changed the save
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return
    cached = read()
    listener()
  }
  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

/**
 * Moderator preferences, shared by every window and kept in the browser
 * @return {{ preferences: ModPreferences, update: (patch: Partial<ModPreferences>) => void }} - Preferences and their change
 */

export const useModPreferences = () => {
  const preferences = useSyncExternalStore(subscribe, snapshot, () => DEFAULTS)

  const update = useCallback((patch: Partial<ModPreferences>) => {
    cached = { ...snapshot(), ...patch }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cached))
    } catch {
      // The choice lasts for the visit
    }
    listeners.forEach((listener) => listener())
  }, [])

  return { preferences, update }
}
