'use client'

import Link from '@/components/elements/navigation/AppLink'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { useBeaconRect } from '@/core/hooks/interaction/useBeaconRect'
import { routeBeacon } from '@/declarations/ui/beacons'
import { DEADLINE_BUBBLE } from '@/declarations/ui/variants'

// Room between the entry and the bubble
const BUBBLE_GAP = 12

// Time before the pill leaves
const BUBBLE_LIFETIME = 5000

export interface RailDeadlineBubbleProps {
  href: string
  message: string
}

/**
 * Pill beside a rail entry warning of a late item
 * @param {string} href - Entry the pill points at
 * @param {string} message - Words of the pill
 * @return {JSX.Element | null}
 */

export const RailDeadlineBubble = ({ href, message }: RailDeadlineBubbleProps) => {
  const pathname = usePathname()
  const isOpen = pathname === href || pathname.startsWith(`${href}/`)

  // The pill leaves after a few seconds
  const [expired, setExpired] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setExpired(true), BUBBLE_LIFETIME)
    return () => clearTimeout(timer)
  }, [])

  // The pill leaves once the page is open
  const { rect } = useBeaconRect(isOpen || expired ? null : routeBeacon(href))
  if (!rect) return null

  return createPortal(
    <Link
      href={href}
      role="status"
      className={DEADLINE_BUBBLE.root}
      style={{ left: rect.left + rect.width + BUBBLE_GAP, top: rect.top + rect.height / 2 }}
    >
      <svg
        viewBox="0 0 12 18"
        className={DEADLINE_BUBBLE.tail}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 0.5C8.6 3 4.6 6.4 1.3 8.1a1.05 1.05 0 0 0 0 1.8C4.6 11.6 8.6 15 12 17.5Z"
          fill="currentColor"
        />
      </svg>
      {message}
    </Link>,
    document.body
  )
}
