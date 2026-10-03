'use client'

import { useEffect } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'

// Gestures that prove someone is at the keyboard
const ACTIVITY_EVENTS = ['keydown', 'pointerdown', 'pointermove', 'wheel'] as const

/**
 * Tell the server, every few seconds, that this Mod View is open, shown and used
 * @param {string} liveId - Live
 * @return {void}
 */

export const useModViewPresence = (liveId: string): void => {
  useEffect(() => {
    let lastActivity = Date.now()
    const path = API_ROUTES.livePresence(liveId)
    const mark = () => {
      lastActivity = Date.now()
    }
    const flags = () => ({
      visible: document.visibilityState === 'visible',
      active: Date.now() - lastActivity < LIVE_SETTINGS.idleSeconds * 1000,
    })

    // Beats while the page lives, failures ignored
    const beat = () => void apiPost(path, { ...flags(), closing: false }).catch(() => null)
    beat()
    const timer = window.setInterval(beat, LIVE_SETTINGS.heartbeatSeconds * 1000)

    // The last beat survives the tab closing
    const leave = () =>
      navigator.sendBeacon(
        path,
        new Blob([JSON.stringify({ ...flags(), closing: true })], { type: 'application/json' })
      )

    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, mark, { passive: true }))
    document.addEventListener('visibilitychange', beat)
    window.addEventListener('pagehide', leave)

    return () => {
      window.clearInterval(timer)
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, mark))
      document.removeEventListener('visibilitychange', beat)
      window.removeEventListener('pagehide', leave)
      leave()
    }
  }, [liveId])
}
