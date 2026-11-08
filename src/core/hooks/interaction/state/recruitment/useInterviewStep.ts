'use client'

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_PREFIX = 'memora:interview-step:'
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

/**
 * Step of an interview, kept in the browser per candidate
 * @param {string} candidateId - Applicant interviewed
 * @return {[number, (step: number) => void]} - Step and setter
 */

export const useInterviewStep = (candidateId: string): [number, (step: number) => void] => {
  const key = `${STORAGE_PREFIX}${candidateId}`

  const read = useCallback(() => {
    try {
      return window.localStorage.getItem(key) ?? '0'
    } catch {
      return '0'
    }
  }, [key])

  const raw = useSyncExternalStore(subscribe, read, () => '0')

  const write = useCallback(
    (step: number) => {
      try {
        window.localStorage.setItem(key, String(step))
      } catch {
        // Storage blocked
      }
      listeners.forEach((listener) => listener())
    },
    [key]
  )

  return [Number.parseInt(raw, 10) || 0, write]
}
