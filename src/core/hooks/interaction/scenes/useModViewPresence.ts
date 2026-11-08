'use client'

import { useEffect } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { SECOND_MS } from '@/utils/constants/time'

// Gestures that prove someone is at the keyboard
const ACTIVITY_EVENTS = ['keydown', 'pointerdown', 'pointermove', 'wheel'] as const

/**
 * Tell the server
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
      active: Date.now() - lastActivity < LIVE_SETTINGS.idleSeconds * SECOND_MS,
    })

    // Beats while the page lives
    const beat = () => void apiPost(path, flags()).catch(() => null)
    beat()
    const timer = window.setInterval(beat, LIVE_SETTINGS.heartbeatSeconds * SECOND_MS)

    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, mark, { passive: true }))
    document.addEventListener('visibilitychange', beat)

    return () => {
      window.clearInterval(timer)
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, mark))
      document.removeEventListener('visibilitychange', beat)
    }
  }, [liveId])
}
