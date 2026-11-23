'use client'

import { useCallback, useEffect, useState } from 'react'

import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { LiveAsksPayload } from '@/types/liveAsks'

// Declarations the member already saw, kept in their browser only
const SEEN_KEY = 'memora.live-asks.seen'

const readSeen = (): string[] => {
  try {
    return JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

const writeSeen = (keys: string[]) => {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(keys.slice(-100)))
  } catch {
    // Seen only lasts as long as the page, nothing breaks
  }
}

/**
 * Lives that ask the member and news for the ones who run them, looked up while the tab is open
 * @return {{ payload: LiveAsksPayload, seen: string[], markSeen: (key: string) => void, reload: () => void }} - Lookup and gestures
 */

export const useLiveAsks = () => {
  const [payload, setPayload] = useState<LiveAsksPayload>({ asks: [], declared: [] })
  const [seen, setSeen] = useState<string[]>(() =>
    typeof window === 'undefined' ? [] : readSeen()
  )

  const reload = useCallback(() => {
    if (document.visibilityState !== 'visible') return

    void apiGet<LiveAsksPayload>(API_ROUTES.liveAsks)
      .then(setPayload)
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    reload()
    const timer = window.setInterval(reload, ASSISTANT_SETTINGS.liveAskEverySeconds * 1000)
    document.addEventListener('visibilitychange', reload)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', reload)
    }
  }, [reload])

  const markSeen = useCallback((key: string) => {
    setSeen((keys) => {
      const next = [...keys, key]
      writeSeen(next)

      return next
    })
  }, [])

  return { payload, seen, markSeen, reload }
}
