'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

// Held in memory too so a refused storage only costs the reload, not the typing
const memory = new Map<string, string>()
const listeners = new Set<() => void>()

const notify = () => listeners.forEach((listener) => listener())

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => void listeners.delete(listener)
}

// Text kept under a key, none when nothing is kept
const readRaw = (key: string): string | null => {
  try {
    return memory.get(key) ?? window.sessionStorage.getItem(key)
  } catch {
    return memory.get(key) ?? null
  }
}

const writeRaw = (key: string, text: string): void => {
  memory.set(key, text)

  try {
    window.sessionStorage.setItem(key, text)
  } catch {
    // The memory copy is enough for this page
  }
}

const eraseRaw = (key: string): void => {
  memory.delete(key)

  try {
    window.sessionStorage.removeItem(key)
  } catch {
    // Nothing more to clear
  }
}

// Value read back, none when unreadable
const parse = <T>(text: string | null): T | null => {
  try {
    return text ? (JSON.parse(text) as T) : null
  } catch {
    return null
  }
}

/**
 * Value kept in the tab's session storage so a reload loses nothing
 * @param {string} key - Storage key
 * @param {T} initial - Value when nothing is kept, a stable reference
 * @return {[T, (next: T | ((current: T) => T)) => void, () => void]} - Value, setter and eraser
 */

export const useSessionDraft = <T extends object>(
  key: string,
  initial: T
): [T, (next: T | ((current: T) => T)) => void, () => void] => {
  const text = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null
  )
  const value = useMemo(() => parse<T>(text) ?? initial, [text, initial])

  const setValue = useCallback(
    (next: T | ((current: T) => T)) => {
      const current = parse<T>(readRaw(key)) ?? initial

      writeRaw(key, JSON.stringify(typeof next === 'function' ? next(current) : next))
      notify()
    },
    [key, initial]
  )

  const erase = useCallback(() => {
    eraseRaw(key)
    notify()
  }, [key])

  return [value, setValue, erase]
}
