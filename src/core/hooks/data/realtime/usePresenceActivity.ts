'use client'

import { useEffect, useState } from 'react'

import { REALTIME_SETTINGS } from '@/declarations/system/realtime'
import type { PresenceActivity } from '@/types/presence'
import { SECOND_MS } from '@/utils/constants/time'

// Gestures that prove someone is there
const GESTURES = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'] as const

/**
 * Active while touched, idle after a quiet spell or a hidden tab
 * @return {PresenceActivity} - Activity
 */

export const usePresenceActivity = (): PresenceActivity => {
  const [activity, setActivity] = useState<PresenceActivity>('active')

  useEffect(() => {
    let timer = 0
    const doze = () => setActivity('idle')

    // Any gesture wakes, quiet spell dozes
    const wake = () => {
      window.clearTimeout(timer)
      if (document.visibilityState === 'hidden') return doze()
      setActivity('active')
      timer = window.setTimeout(doze, REALTIME_SETTINGS.presenceIdleSeconds * SECOND_MS)
    }

    wake()
    for (const gesture of GESTURES) window.addEventListener(gesture, wake, { passive: true })
    document.addEventListener('visibilitychange', wake)

    return () => {
      window.clearTimeout(timer)
      for (const gesture of GESTURES) window.removeEventListener(gesture, wake)
      document.removeEventListener('visibilitychange', wake)
    }
  }, [])

  return activity
}
