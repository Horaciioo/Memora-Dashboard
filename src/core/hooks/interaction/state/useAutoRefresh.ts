'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { CACHE_SETTINGS } from '@/declarations/configurations/settings'

// Open panel or typing
const BUSY_SELECTOR =
  '[role="dialog"], input:focus, textarea:focus, select:focus, [contenteditable="true"]:focus'

/**
 * Keep server views fresh
 * @return {void}
 */

export const useAutoRefresh = (): void => {
  const router = useRouter()
  const refreshedAt = useRef(0)

  useEffect(() => {
    const { refreshMs } = CACHE_SETTINGS

    // Zero turns it off
    if (refreshMs === 0) return

    refreshedAt.current = Date.now()

    const refresh = () => {
      // Never under a hand
      if (document.hidden || document.querySelector(BUSY_SELECTOR)) return

      refreshedAt.current = Date.now()
      router.refresh()
    }

    // Back on the tab
    const onVisible = () => {
      if (Date.now() - refreshedAt.current >= refreshMs) refresh()
    }

    const timer = window.setInterval(refresh, refreshMs)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [router])
}
