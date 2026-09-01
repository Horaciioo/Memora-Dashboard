'use client'

import { useSyncExternalStore } from 'react'
import { MOBILE_SHELL_QUERY } from '@/declarations/ui/responsive'

/**
 * Subscribe to a media query
 * @param {string} query - matchMedia query
 * @return {boolean} - Query currently matches
 */

export const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)

      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    // Server and first paint assume the wide layout, avoids a mobile flash of desktop chrome
    () => false
  )

/**
 * True while the mobile shell (top bar, nav pill) is the one on screen
 * @return {boolean} - Mobile shell active
 */

export const useIsMobileShell = (): boolean => useMediaQuery(MOBILE_SHELL_QUERY)
