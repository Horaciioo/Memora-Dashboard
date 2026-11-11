'use client'

import { useEffect } from 'react'

import { NEXUS_COPY } from '@/declarations/nexus/copy'

/**
 * Popup landing, tells the opener and closes
 * @param {Object} props - Props
 * @param {boolean} props.succeeded - Second factor passed
 * @return {JSX.Element} - Short status
 */

export const NexusReturn = ({ succeeded }: { succeeded: boolean }) => {
  useEffect(() => {
    // Same origin only
    window.opener?.postMessage(
      { nexus: succeeded ? 'unlocked' : 'refused' },
      window.location.origin
    )
    window.close()
  }, [succeeded])

  return <p>{succeeded ? NEXUS_COPY.unlocked : NEXUS_COPY.discordRefused}</p>
}
