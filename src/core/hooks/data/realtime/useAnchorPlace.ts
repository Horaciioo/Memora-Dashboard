'use client'

import { useEffect, useState } from 'react'

import { anchorOf, placeOfAnchor } from '@/core/lib/realtime/anchors'
import { PRESENCE_PICKER_SELECTOR } from '@/declarations/system/presence'

/**
 * Place of the last touched anchor
 * @param {string} pathname - Route on screen
 * @return {string} - Place
 */

export const useAnchorPlace = (pathname: string): string => {
  const [touched, setTouched] = useState<{ pathname: string; anchor: string | null } | null>(null)

  useEffect(() => {
    const follow = (event: Event) => {
      if (!(event.target instanceof Element)) return
      const anchor = anchorOf(event.target)
      // Pickers float outside their property
      if (!anchor && event.target.closest(PRESENCE_PICKER_SELECTOR)) return
      setTouched({ pathname, anchor })
    }

    document.addEventListener('pointerdown', follow, true)
    document.addEventListener('focusin', follow, true)

    return () => {
      document.removeEventListener('pointerdown', follow, true)
      document.removeEventListener('focusin', follow, true)
    }
  }, [pathname])

  return placeOfAnchor(pathname, touched?.pathname === pathname ? touched.anchor : null)
}
