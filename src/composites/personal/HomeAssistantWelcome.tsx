'use client'

import { useEffect } from 'react'

import { pickForHour } from '@/core/lib/assistant/hello'
import { useAssistantDock } from '@/core/store/assistantDock'
import { ASSISTANT_WELCOMES } from '@/declarations/assistant/copy'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { instantToWall } from '@/utils/format/zone'

// Set once per page load, a refresh starts it again
let isWelcomed = false

/**
 * Memora says a welcome from her button each time the Home loads, then falls silent
 * @return {null}
 */

export const HomeAssistantWelcome = () => {
  const say = useAssistantDock((state) => state.say)
  const { session } = useAuthContext()
  const name = session?.displayName.split(' ')[0]

  useEffect(() => {
    if (isWelcomed || !name) return

    isWelcomed = true
    const hour = Number(instantToWall(new Date()).slice(11, 13))
    say(pickForHour(ASSISTANT_WELCOMES, hour).text.replace('{name}', name))
    // Not cleared on unmount, so a dev remount keeps the line
    setTimeout(() => say(null), ASSISTANT_SETTINGS.nudgeShowSeconds * 1000)
  }, [name, say])

  return null
}
