'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { SHARE_COPY } from '@/declarations/share/copy'

export interface ShareRedirectProps {
  to: string
}

/**
 * Sends a member on to the real page, robots read the card above it
 * @param {string} to - Destination path
 * @return {JSX.Element}
 */

export const ShareRedirect = ({ to }: ShareRedirectProps) => {
  const router = useRouter()

  useEffect(() => {
    router.replace(to)
  }, [router, to])

  return (
    <>
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=${to}`} />
      </noscript>
      <p>{SHARE_COPY.redirecting}</p>
    </>
  )
}
