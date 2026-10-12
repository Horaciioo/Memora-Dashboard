'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { WipNotice } from '@/components/structures/WipNotice'

export interface MobileHoldProps {
  routes: readonly string[]
  children: ReactNode
}

/**
 * Shows the held areas as in development on mobile, whole on larger screens
 * @param {readonly string[]} routes - Held areas
 * @param {ReactNode} children - Routed page
 * @return {JSX.Element}
 */

export const MobileHold = ({ routes, children }: MobileHoldProps) => {
  const pathname = usePathname()
  const isHeld = routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (!isHeld) return <>{children}</>

  return (
    <>
      <div className="hidden md:contents">{children}</div>
      <div className="md:hidden">
        <WipNotice />
      </div>
    </>
  )
}
