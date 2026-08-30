'use client'

import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { API_ROUTES } from '@/core/lib/api/routes'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'

/**
 * Hands the browser over to Discord, the exchange happening server side
 * @return {JSX.Element}
 */

export const DiscordSignInButton = () => {
  const [isLeaving, setLeaving] = useState(false)

  return (
    <Button
      variant="primary"
      icon="discord"
      disabled={isLeaving}
      onClick={() => {
        setLeaving(true)
        window.location.assign(API_ROUTES.signInWithDiscord)
      }}
    >
      {isLeaving ? AUTH_COPY.discordPending : AUTH_COPY.discordSubmit}
    </Button>
  )
}
