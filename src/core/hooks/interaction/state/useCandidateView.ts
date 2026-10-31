'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

export interface CandidateViewState {
  recruiterId: string
  outcomeId: string
  sort: string
  order: string
}

const STORAGE_KEY = 'memora:candidate-view'
const BLANK = '{}'
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

const readRaw = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? BLANK
  } catch {
    return BLANK
  }
}

/**
 * Candidate filters and sort, kept in the browser
 * @return {[CandidateViewState, (name: keyof CandidateViewState, value: string) => void, () => void]} - View, setter, reset
 */

export const useCandidateView = (): [
  CandidateViewState,
  (name: keyof CandidateViewState, value: string) => void,
  () => void,
] => {
  const raw = useSyncExternalStore(subscribe, readRaw, () => BLANK)

  const view = useMemo<CandidateViewState>(() => {
    try {
      return { recruiterId: '', outcomeId: '', sort: '', order: '', ...JSON.parse(raw) }
    } catch {
      return { recruiterId: '', outcomeId: '', sort: '', order: '' }
    }
  }, [raw])

  const write = useCallback((value: string) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Storage blocked
    }
    listeners.forEach((listener) => listener())
  }, [])

  const set = useCallback(
    (name: keyof CandidateViewState, value: string) =>
      write(JSON.stringify({ ...view, [name]: value })),
    [view, write]
  )
  const reset = useCallback(() => write(BLANK), [write])

  return [view, set, reset]
}
