'use client'

import Link from 'next/link'
import { useState, type ComponentProps } from 'react'

/**
 * Link that prefetches on intent only
 * @param {ComponentProps<typeof Link>} props - Next link props
 * @return {JSX.Element} - Anchor
 */

export default function AppLink({
  prefetch,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: ComponentProps<typeof Link>) {
  const [isIntent, setIsIntent] = useState(false)

  // Viewport links stay idle
  const resolved = prefetch ?? (isIntent ? null : false)

  return (
    <Link
      {...props}
      prefetch={resolved}
      onMouseEnter={(event) => {
        setIsIntent(true)
        onMouseEnter?.(event)
      }}
      onFocus={(event) => {
        setIsIntent(true)
        onFocus?.(event)
      }}
      onTouchStart={(event) => {
        setIsIntent(true)
        onTouchStart?.(event)
      }}
    />
  )
}
