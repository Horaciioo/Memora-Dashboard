'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import type { HeldRoutes } from '@/declarations/ui/responsive'
import { WipNotice } from '@/components/structures/page/WipNotice'

export interface MobileHoldProps {
  routes: HeldRoutes
  children: ReactNode
}

// Classes showing the page from one width up, the notice below it
const HOLD_CLASSES = {
  phone: { page: 'hidden md:contents', notice: 'md:hidden' },
  laptop: { page: 'hidden 2xl:contents', notice: '2xl:hidden' },
} as const

/**
 * Shows the held areas as in development on a screen too small for them, whole above
 * @param {HeldRoutes} routes - Held areas per screen class
 * @param {ReactNode} children - Routed page
 * @return {JSX.Element}
 */

export const MobileHold = ({ routes, children }: MobileHoldProps) => {
  const pathname = usePathname()
  const isIn = (list: readonly string[]) =>
    list.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // The wider hold wins when both name the route
  const kind = isIn(routes.laptop) ? 'laptop' : isIn(routes.phone) ? 'phone' : null

  if (!kind) return <>{children}</>

  return (
    <>
      <div className={HOLD_CLASSES[kind].page}>{children}</div>
      <div className={HOLD_CLASSES[kind].notice}>
        <WipNotice />
      </div>
    </>
  )
}
