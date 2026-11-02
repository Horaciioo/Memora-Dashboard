'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { useVisitedPaths } from '@/core/hooks/interaction/state/useVisitedPaths'
import { ROUTES } from '@/declarations/navigation'

/**
 * Records each page opened, the home excepted
 * @return {null}
 */

export const VisitTracker = () => {
  const pathname = usePathname()
  const { remember } = useVisitedPaths()

  useEffect(() => {
    if (pathname !== ROUTES.dashboard) remember(pathname)
  }, [pathname, remember])

  return null
}
