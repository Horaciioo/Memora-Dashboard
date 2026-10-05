'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { WipNotice } from '@/components/structures/WipNotice'
import { MOBILE_HELD_ROUTES } from '@/declarations/ui/responsive'

export interface MobileHoldProps {
  children: ReactNode
}

/**
 * Shows the held areas as in development on mobile, whole on larger screens
 * @param {ReactNode} children - Routed page
 * @return {JSX.Element}
 */

export const MobileHold = ({ children }: MobileHoldProps) => {
  const pathname = usePathname()
  const isHeld = MOBILE_HELD_ROUTES.some(
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
